// celpip-audio: Go microservice for CELPIP Speaking practice.
// Accepts an audio upload, transcribes via OpenAI Whisper, and returns
// fluency metrics (WPM, pause ratio, filler words) computed from the
// word-level timestamps. Stateless — safe to scale horizontally.
//
// Endpoints:
//   GET  /health                  → liveness probe
//   POST /transcribe              → multipart audio → metrics JSON
//
// Auth: every request must carry X-CELPIP-Audio-Key matching the
// AUDIO_SHARED_SECRET env var. The Vercel proxy adds this header so the
// secret never reaches the browser.
package main

import (
	"bytes"
	"crypto/subtle"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"math"
	"mime/multipart"
	"net/http"
	"os"
	"regexp"
	"sort"
	"strings"
	"time"
)

const (
	maxUploadBytes = 25 << 20 // OpenAI Whisper hard cap is 25 MB
	whisperURL     = "https://api.openai.com/v1/audio/transcriptions"
	pauseThreshold = 0.5 // seconds — gaps ≥ this count as a pause
)

// Common CELPIP filler words/phrases. Matched as whole words, case-insensitive.
var fillerPattern = regexp.MustCompile(`(?i)\b(um+|uh+|er+|ah+|like|you know|i mean|sort of|kind of|basically|literally|actually|so+|well)\b`)

type whisperWord struct {
	Word  string  `json:"word"`
	Start float64 `json:"start"`
	End   float64 `json:"end"`
}

type whisperResponse struct {
	Text     string        `json:"text"`
	Language string        `json:"language"`
	Duration float64       `json:"duration"`
	Words    []whisperWord `json:"words"`
}

type metricsResponse struct {
	Transcript      string        `json:"transcript"`
	Language        string        `json:"language"`
	DurationSec     float64       `json:"duration_sec"`
	WordCount       int           `json:"word_count"`
	WordsPerMinute  float64       `json:"words_per_minute"`
	FillerCount     int           `json:"filler_count"`
	FillerWords     []string      `json:"filler_words"`
	PauseCount      int           `json:"pause_count"`
	LongestPauseSec float64       `json:"longest_pause_sec"`
	PauseRatio      float64       `json:"pause_ratio"`
	Pauses          []pauseRecord `json:"pauses"`
}

type pauseRecord struct {
	StartSec float64 `json:"start_sec"`
	EndSec   float64 `json:"end_sec"`
	Length   float64 `json:"length_sec"`
}

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	if os.Getenv("OPENAI_API_KEY") == "" {
		log.Fatal("OPENAI_API_KEY is required")
	}
	if os.Getenv("AUDIO_SHARED_SECRET") == "" {
		log.Fatal("AUDIO_SHARED_SECRET is required")
	}

	mux := http.NewServeMux()
	mux.HandleFunc("/health", handleHealth)
	mux.HandleFunc("/transcribe", requireAuth(handleTranscribe))

	srv := &http.Server{
		Addr:              ":" + port,
		Handler:           mux,
		ReadHeaderTimeout: 5 * time.Second,
		WriteTimeout:      120 * time.Second, // Whisper can take 30-60s on a 90s clip
	}
	log.Printf("celpip-audio listening on :%s", port)
	log.Fatal(srv.ListenAndServe())
}

func handleHealth(w http.ResponseWriter, _ *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	_, _ = w.Write([]byte(`{"ok":true,"service":"celpip-audio"}`))
}

func requireAuth(next http.HandlerFunc) http.HandlerFunc {
	expected := os.Getenv("AUDIO_SHARED_SECRET")
	return func(w http.ResponseWriter, r *http.Request) {
		got := r.Header.Get("X-CELPIP-Audio-Key")
		if subtle.ConstantTimeCompare([]byte(got), []byte(expected)) != 1 {
			writeError(w, http.StatusUnauthorized, "invalid or missing X-CELPIP-Audio-Key")
			return
		}
		next(w, r)
	}
}

func handleTranscribe(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		writeError(w, http.StatusMethodNotAllowed, "POST only")
		return
	}

	r.Body = http.MaxBytesReader(w, r.Body, maxUploadBytes)
	if err := r.ParseMultipartForm(maxUploadBytes); err != nil {
		writeError(w, http.StatusBadRequest, "audio file too large or malformed multipart")
		return
	}

	file, header, err := r.FormFile("audio")
	if err != nil {
		writeError(w, http.StatusBadRequest, "missing 'audio' form field")
		return
	}
	defer file.Close()

	resp, err := callWhisper(file, header.Filename)
	if err != nil {
		log.Printf("whisper error: %v", err)
		writeError(w, http.StatusBadGateway, "transcription failed: "+err.Error())
		return
	}

	metrics := buildMetrics(resp)
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(metrics)
}

func callWhisper(audio io.Reader, filename string) (*whisperResponse, error) {
	var body bytes.Buffer
	mw := multipart.NewWriter(&body)

	part, err := mw.CreateFormFile("file", filename)
	if err != nil {
		return nil, fmt.Errorf("create form file: %w", err)
	}
	if _, err := io.Copy(part, audio); err != nil {
		return nil, fmt.Errorf("copy audio: %w", err)
	}
	_ = mw.WriteField("model", "whisper-1")
	_ = mw.WriteField("response_format", "verbose_json")
	_ = mw.WriteField("timestamp_granularities[]", "word")
	if err := mw.Close(); err != nil {
		return nil, err
	}

	req, err := http.NewRequest("POST", whisperURL, &body)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Authorization", "Bearer "+os.Getenv("OPENAI_API_KEY"))
	req.Header.Set("Content-Type", mw.FormDataContentType())

	client := &http.Client{Timeout: 110 * time.Second}
	res, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer res.Body.Close()

	raw, _ := io.ReadAll(res.Body)
	if res.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("whisper %d: %s", res.StatusCode, truncate(string(raw), 200))
	}

	var out whisperResponse
	if err := json.Unmarshal(raw, &out); err != nil {
		return nil, fmt.Errorf("decode whisper response: %w", err)
	}
	return &out, nil
}

func buildMetrics(w *whisperResponse) metricsResponse {
	words := w.Words
	transcript := strings.TrimSpace(w.Text)

	out := metricsResponse{
		Transcript:  transcript,
		Language:    w.Language,
		DurationSec: round(w.Duration, 2),
		WordCount:   len(words),
		Pauses:      []pauseRecord{}, // never null in JSON
	}

	if out.DurationSec > 0 {
		out.WordsPerMinute = round(float64(out.WordCount)/(out.DurationSec/60.0), 1)
	}

	// Filler word detection
	matches := fillerPattern.FindAllString(transcript, -1)
	out.FillerCount = len(matches)
	out.FillerWords = make([]string, 0, len(matches))
	for _, m := range matches {
		out.FillerWords = append(out.FillerWords, strings.ToLower(m))
	}

	// Pause detection from gaps between word end → next word start
	if len(words) >= 2 {
		sort.Slice(words, func(i, j int) bool { return words[i].Start < words[j].Start })
		var totalPause, longest float64
		for i := 1; i < len(words); i++ {
			gap := words[i].Start - words[i-1].End
			if gap >= pauseThreshold {
				out.Pauses = append(out.Pauses, pauseRecord{
					StartSec: round(words[i-1].End, 2),
					EndSec:   round(words[i].Start, 2),
					Length:   round(gap, 2),
				})
				totalPause += gap
				if gap > longest {
					longest = gap
				}
			}
		}
		out.PauseCount = len(out.Pauses)
		out.LongestPauseSec = round(longest, 2)
		if out.DurationSec > 0 {
			out.PauseRatio = round(totalPause/out.DurationSec, 3)
		}
	}
	return out
}

func writeError(w http.ResponseWriter, code int, msg string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	_ = json.NewEncoder(w).Encode(map[string]string{"error": msg})
}

func round(v float64, dp int) float64 {
	shift := math.Pow(10, float64(dp))
	return math.Round(v*shift) / shift
}

func truncate(s string, n int) string {
	if len(s) <= n {
		return s
	}
	return s[:n] + "…"
}
