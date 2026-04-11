import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

const FEATURES = [
  {
    icon: '📋',
    title: 'Full-Length Practice Sets',
    desc: 'Each set follows the exact CELPIP format — same question types, same timing, same structure. 20 complete sets across all four skills.',
    cta: 'Start Mock Exam',
    path: '/exam',
  },
  {
    icon: '🤖',
    title: 'AI-Powered Writing Scores',
    desc: 'Submit your Writing responses and get instant CLB-level scoring. Our AI evaluates coherence, vocabulary, grammar, and task fulfillment.',
    cta: 'Try Writing Practice',
    path: '/writing',
  },
  {
    icon: '💡',
    title: 'Explanations for Every Question',
    desc: 'Understand why each answer is correct with detailed explanations. See sample responses at different CLB levels to calibrate your own answers.',
    cta: 'Try Reading Practice',
    path: '/reading',
  },
]

export default function FeatureShowcase() {
  const navigate = useNavigate()

  return (
    <section className="hp-features" id="features">
      <div className="section-inner">
        <motion.div className="section-label" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          Platform Features
        </motion.div>
        <motion.h2 className="section-title" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
          Built around the real{' '}
          <span className="highlight">CELPIP format</span>
        </motion.h2>

        <div className="hp-features-grid">
          {FEATURES.map((f, i) => (
            <motion.div
              className="hp-feature-card"
              key={f.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <div className="hp-feature-icon">{f.icon}</div>
              <h3 className="hp-feature-title">{f.title}</h3>
              <p className="hp-feature-desc">{f.desc}</p>
              <button className="hp-feature-cta" onClick={() => navigate(f.path)}>
                {f.cta} →
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
