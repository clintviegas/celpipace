import { motion } from 'framer-motion'

const features = [
  {
    icon: '📋',
    title: 'Real Test Format',
    desc: 'Questions match official CELPIP format, timing, and difficulty.',
  },
  {
    icon: '✍️',
    title: 'Expert Writing Feedback',
    desc: 'Instant CLB-level scoring on Writing tasks with specific improvement areas.',
  },
  {
    icon: '📊',
    title: 'Progress Tracking',
    desc: 'Track your scores across all four skills and monitor your CLB growth.',
  },
  {
    icon: '💡',
    title: 'Detailed Explanations',
    desc: 'Understand why each answer is correct with sample responses at every CLB level.',
  },
  {
    icon: '📚',
    title: 'Study Guides',
    desc: 'Expert strategies, vocabulary lists, scoring rubrics, and common mistakes.',
  },
  {
    icon: '🍁',
    title: 'Canadian Context',
    desc: 'All scenarios use authentic Canadian workplace, community, and everyday settings.',
  },
]

export default function AIFeatures() {
  return (
    <section className="hp-why" id="why">
      <div className="section-inner">
        <motion.div className="section-label" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          Why CELPIPiQ
        </motion.div>
        <motion.h2 className="section-title" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
          Everything you need to{' '}
          <span className="highlight">score higher</span>
        </motion.h2>

        <div className="hp-why-grid">
          {features.map((f, i) => (
            <motion.div
              className="hp-why-card"
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
            >
              <div className="hp-why-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
