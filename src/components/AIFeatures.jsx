import { motion } from 'framer-motion'

const features = [
  {
    icon: '🎯',
    title: 'Practice That Mirrors the Real Test',
    desc: 'Questions designed to match official CELPIP format, timing, and difficulty so you walk into test day confident.',
    color: '#4A90D9',
    colorLight: '#EEF4FF',
  },
  {
    icon: '🤖',
    title: 'AI Feedback That Helps You Improve',
    desc: 'Detailed, personalized feedback on Writing and Speaking responses tied to CELPIP scoring criteria.',
    color: '#9B59B6',
    colorLight: '#F3EFFF',
  },
  {
    icon: '📈',
    title: 'Track Your Progress Over Time',
    desc: 'See where you stand across all four skills with your personal dashboard and score history.',
    color: '#2D8A56',
    colorLight: '#F0FDF4',
  },
  {
    icon: '💡',
    title: 'Detailed Explanations',
    desc: 'Understand why each answer is right or wrong with clear explanations and high-scoring sample answers.',
    color: '#C8972A',
    colorLight: '#FFFBEB',
  },
  {
    icon: '📚',
    title: 'Structured Study Guides',
    desc: 'Expert-designed courses covering strategies, vocabulary, scoring rubrics, and common mistakes.',
    color: '#C8102E',
    colorLight: '#FEF2F2',
  },
  {
    icon: '🍁',
    title: 'Built for Canadian Life',
    desc: 'All scenarios use authentic Canadian contexts — workplace, community, and everyday situations.',
    color: '#0F6B8A',
    colorLight: '#E0F7FA',
  },
]

export default function AIFeatures() {
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
          AI-Powered CELPIP Practice
        </motion.h2>
        <motion.p
          className="section-sub"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Everything you need to ace your CELPIP exam — in one place.
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
      </div>
    </section>
  )
}
