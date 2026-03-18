import { motion } from 'framer-motion'

const steps = [
  {
    num: '01',
    icon: '🎯',
    title: 'Take a Free Diagnostic',
    desc: 'Start with a free mock test across all four sections. Our AI scores your responses instantly and maps them to your CLB level.',
  },
  {
    num: '02',
    icon: '📚',
    title: 'Follow Your Study Plan',
    desc: 'Get a personalized week-by-week plan targeting your weakest sections. Improve faster by focusing on what matters most for your CRS score.',
  },
  {
    num: '03',
    icon: '🤖',
    title: 'Practice with AI Feedback',
    desc: 'Write emails, essays, and speaking responses — get instant AI-powered feedback with band-level scoring and specific tips to improve.',
  },
  {
    num: '04',
    icon: '📈',
    title: 'Track Progress & Score Higher',
    desc: 'Monitor your CLB growth, simulate full CELPIP exams, and walk into test day confident. Higher CLB = higher CRS = closer to your PR.',
  },
]

export default function HowItWorks() {
  return (
    <section className="how-section" id="how">
      <div className="section-inner">
        <motion.div
          className="section-label"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          How It Works
        </motion.div>
        <motion.h2
          className="section-title"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          From practice to <span className="highlight">PR approval</span><br />
          in four focused steps
        </motion.h2>

        <div className="steps-grid">
          {steps.map((s, i) => (
            <motion.div
              className="step-card"
              key={s.num}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <div className="step-num">{s.num}</div>
              <div className="step-icon">{s.icon}</div>
              <h3 className="step-title">{s.title}</h3>
              <p className="step-desc">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
