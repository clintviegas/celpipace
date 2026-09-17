import scoreWriting from './_lib/score-writing.js'
import scoreSpeaking from './_lib/score-speaking.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const section = req.body?.section
  if (section === 'writing') return scoreWriting(req, res)
  if (section === 'speaking') return scoreSpeaking(req, res)

  return res.status(400).json({ error: 'Missing or invalid scoring section' })
}