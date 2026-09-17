import { motion } from 'framer-motion'

const MESSAGES = [
  { role: 'coach', text: 'Based on your last 3 mocks: Listening L3 detail traps are costing you ~1 CLB band.' },
  { role: 'user', text: 'What should I do this week?' },
  { role: 'coach', text: 'Mon–Wed: L3 Sets 2 & 4. Thu: timed mock. Your Writing coherence is already CLB 9 — maintain with one W1 email.' },
]

export default function CoachPreviewCard() {
  return (
    <motion.div
      className="hp-coach-card"
      initial={{ opacity: 0, y: 26, rotate: 1.5 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      transition={{ duration: 0.6, delay: 0.15 }}
      aria-hidden="true"
    >
      <div className="hp-coach-card-head">
        <span className="hp-coach-card-title">✨ AI Study Coach</span>
        <span className="hp-coach-card-live"><span className="hp-score-live-dot" /> reads your scores</span>
      </div>

      <div className="hp-coach-card-chips">
        <span className="hp-coach-card-chip hp-coach-card-chip--listen">Listening −2 CLB</span>
        <span className="hp-coach-card-chip hp-coach-card-chip--write">Writing on track</span>
      </div>

      <div className="hp-coach-card-msgs">
        {MESSAGES.map((m, i) => (
          <motion.div
            key={i}
            className={`hp-coach-card-msg hp-coach-card-msg--${m.role}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.35 + i * 0.15 }}
          >
            {m.text}
          </motion.div>
        ))}
      </div>

      <div className="hp-coach-card-foot">
        Personalized from your practice data — not a generic chatbot.
      </div>
    </motion.div>
  )
}
