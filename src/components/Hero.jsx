import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

const SECTIONS = [
  {
    icon: '🎧',
    label: 'Listening',
    desc: '6 Parts · 120 Practice Sets',
    path: '/listening',
    accent: '#4A90D9',
  },
  {
    icon: '📖',
    label: 'Reading',
    desc: '4 Parts · 46 Practice Sets',
    path: '/reading',
    accent: '#2D8A56',
  },
  {
    icon: '✍️',
    label: 'Writing',
    desc: '2 Tasks · AI Scoring',
    path: '/writing',
    accent: '#C8972A',
  },
  {
    icon: '🎙️',
    label: 'Speaking',
    desc: '8 Tasks · 15 Practice Sets',
    path: '/speaking',
    accent: '#C8102E',
  },
]

const STATS = [
  { value: '1,190+', label: 'Questions' },
  { value: '220+', label: 'Practice Sets' },
  { value: '4', label: 'Skills Covered' },
  { value: 'CLB 4–12', label: 'Score Range' },
]

export default function Hero() {
  const navigate = useNavigate()

  return (
    <section className="hp-hero" id="hero">
      <div className="hp-hero-glow" />
      <div className="hp-hero-inner">
        <motion.div
          className="hp-hero-badge"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          🍁 Your CELPIP Score Booster
        </motion.div>

        <motion.h1
          className="hp-hero-title"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
        >
          Boost Your{' '}
          <span className="hp-hero-accent">CELPIP Score</span>
        </motion.h1>

        <motion.p
          className="hp-hero-desc"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          1,190+ real-format questions with AI scoring, targeted tips, and progress tracking.
          Built to help you hit your target CLB.
        </motion.p>

        <motion.div
          className="hp-hero-ctas"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <button className="btn btn-white btn-lg" onClick={() => navigate('/exam')}>
            Start Practicing
          </button>
          <button className="btn btn-ghost-white btn-lg" onClick={() => navigate('/calculator')}>
            CRS Calculator →
          </button>
        </motion.div>

        <motion.div
          className="hp-hero-sections"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {SECTIONS.map((s) => (
            <button
              key={s.label}
              className="hp-section-card"
              onClick={() => navigate(s.path)}
              style={{ '--section-accent': s.accent }}
            >
              <span className="hp-section-icon">{s.icon}</span>
              <span className="hp-section-label">{s.label}</span>
              <span className="hp-section-desc">{s.desc}</span>
            </button>
          ))}
        </motion.div>

        <motion.div
          className="hp-hero-stats"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
        >
          {STATS.map((stat) => (
            <div key={stat.label} className="hp-stat">
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
