import { motion } from 'framer-motion'

const features = [
  {
    icon: '�',
    title: '20+ Full-Length Mock Exams',
    desc: 'Real CELPIP format, timing, and difficulty. Complete all 4 sections with instant scoring and detailed performance analytics.',
    color: '#C8102E',
    colorLight: '#FEF2F2',
  },
  {
    icon: '🤖',
    title: 'AI Feedback on Writing & Speaking',
    desc: 'Get instant CLB-level scoring with personalized tips on coherence, vocabulary, grammar, and task fulfillment.',
    color: '#9B59B6',
    colorLight: '#F3EFFF',
  },
  {
    icon: '�',
    title: 'Track Progress with Your Dashboard',
    desc: 'Monitor CLB growth across all 4 skills. See which sections need focus and adjust your study plan accordingly.',
    color: '#2D8A56',
    colorLight: '#F0FDF4',
  },
  {
    icon: '🇨�',
    title: 'Built for Canadian Contexts',
    desc: 'Authentic Canadian workplace, community, and everyday scenarios. Study with content that feels familiar on test day.',
    color: '#0F6B8A',
    colorLight: '#E0F7FA',
  },
]

export default function AIFeatures({ setPage }) {
  return (
    <section className="ai-features-section" id="features">
      <div className="section-inner">
        <motion.div
          className="section-label"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          Why CELPIPace?
        </motion.div>
        <motion.h2
          className="section-title"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          Everything You Need to Master CELPIP
        </motion.h2>
        <motion.p
          className="section-sub"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Practice with real exams, get AI feedback, track progress, and hit your CLB target.
        </motion.p>

        <div className="ai-features-grid">
          {features.map((f, i) => (
            <motion.div
              className="ai-feature-card"
              key={f.title}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.08 }}
            >
              <div
                className="ai-feature-icon-wrap"
                style={{ background: f.colorLight, color: f.color }}
              >
                <span className="ai-feature-icon">{f.icon}</span>
              </div>
              <h3 className="ai-feature-title">{f.title}</h3>
              <p className="ai-feature-desc">{f.desc}</p>
              <div
                className="ai-feature-accent"
                style={{ background: f.color }}
              />
            </motion.div>
          ))}
        </div>

        {/* Call-to-Action below features */}
        <motion.div
          className="ai-features-cta"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <button
            className="btn btn-primary btn-lg"
            onClick={() => setPage && setPage('exam')}
          >
            Start Free Practice →
          </button>
          <p className="cta-note">14 practice questions included free. No credit card needed.</p>
        </motion.div>
      </div>
    </section>
  )
}
