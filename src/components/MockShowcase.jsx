import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

export default function MockShowcase() {
  const navigate = useNavigate()
  return (
    <section className="mock-showcase-section">
      <div className="section-inner">
        <motion.div
          className="section-label"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          Practice & Feedback
        </motion.div>
        <motion.h2
          className="section-title"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          Full-Length Mock Exams
        </motion.h2>
        <motion.p
          className="section-sub"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          20 complete CELPIP simulations with real timing and detailed feedback.
        </motion.p>

        <motion.div
          className="mock-showcase-card"
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="mock-showcase-content">
            <div className="mock-showcase-icon">🏆</div>
            <h3>Master CELPIP with 20 Mock Tests</h3>
            <p>Practice with the same format, difficulty, and timing as the real exam. Get instant CLB scores and detailed performance analytics after each test.</p>
            <button
              className="btn btn-primary"
              onClick={() => navigate('/exam')}
            >
              Start Practicing →
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
