# celpip-audio

Go microservice that transcribes Speaking practice recordings and returns
fluency metrics. Deployed to Fly.io. Called from Vercel via
`/api/transcribe-audio` so the shared secret stays server-side.

## What it does

`POST /transcribe` with a multipart `audio` field →

```json
{
  "transcript": "Hello, my name is Clint and today I'd like to talk about...",
  "language": "english",
  "duration_sec": 58.4,
  "word_count": 142,
  "words_per_minute": 145.9,
  "filler_count": 7,
  "filler_words": ["um", "uh", "like", "you know", "um", "actually", "so"],
  "pause_count": 4,
  "longest_pause_sec": 1.8,
  "pause_ratio": 0.084,
  "pauses": [
    { "start_sec": 12.3, "end_sec": 13.5, "length_sec": 1.2 },
    { "start_sec": 24.1, "end_sec": 25.9, "length_sec": 1.8 }
  ]
}
```

`GET /health` → `{"ok":true,"service":"celpip-audio"}`

## Why a separate service?

- Vercel functions cap at 60s and ~10MB request bodies — Whisper needs longer
  for 90-second CELPIP responses and the audio can be larger.
- CPU-bound work (audio decoding, metric computation) belongs outside the
  request path that serves the React app.
- Scales to zero on Fly when idle — free until used.

## Local dev

```bash
export OPENAI_API_KEY="sk-..."
export AUDIO_SHARED_SECRET="dev-secret"
go run .

# In another terminal:
curl -X POST http://localhost:8080/transcribe \
  -H "X-CELPIP-Audio-Key: dev-secret" \
  -F "audio=@sample.webm" | jq
```

## First deploy

1. Install the Fly CLI: `brew install flyctl`
2. Sign in: `fly auth login`
3. From `celpip-audio/`:
   ```bash
   fly launch --no-deploy   # creates the app, accept defaults
   fly secrets set OPENAI_API_KEY="$OPENAI_API_KEY" AUDIO_SHARED_SECRET="$(openssl rand -hex 32)"
   fly deploy
   ```
4. Note the URL Fly prints (e.g. `https://celpip-audio.fly.dev`).
5. Copy the same `AUDIO_SHARED_SECRET` you set on Fly and add it to Vercel
   along with `AUDIO_SERVICE_URL`:
   ```
   AUDIO_SERVICE_URL=https://celpip-audio.fly.dev
   AUDIO_SHARED_SECRET=<same value as Fly>
   ```

## Subsequent deploys

```bash
cd celpip-audio
fly deploy
```

## Frontend integration (when you add audio recording)

```js
const fd = new FormData()
fd.append('audio', blob, 'response.webm')

const { data: { session } } = await supabase.auth.getSession()
const r = await fetch('/api/transcribe-audio', {
  method: 'POST',
  headers: { Authorization: `Bearer ${session.access_token}` },
  body: fd,
})
const metrics = await r.json()
// Pipe metrics.transcript into /api/score-speaking as usual,
// and surface WPM / filler count / pauses in the feedback UI.
```

## Cost

- Fly free tier: ~3 shared-cpu-1x VMs at 256MB, auto-stop when idle.
- Whisper API: $0.006 per minute of audio. A 90s CELPIP response = $0.009.
