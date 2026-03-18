import { motion } from 'framer-motion'

const reasons = [
  {
    icon: '🏛️',
    title: 'Accepted for Express Entry',
    desc: 'CELPIP is one of the two approved English tests for Canadian Express Entry. Your score directly converts to CLB levels used in the CRS calculation.',
  },
  {
    icon: '⚡',
    title: 'Faster Results',
    desc: 'CELPIP results are delivered in as few as 4–8 business days, making it the fastest option before an ITA deadline.',
  },
  {
    icon: '🇨🇦',
    title: 'Canadian Context',
    desc: 'All test scenarios are set in everyday Canadian life — no confusing British or American accents. Test takers consistently find it more natural.',
  },
  {
    icon: '🎯',
    title: 'One Day, All Sections',
    desc: 'Complete all four sections — Listening, Reading, Writing, and Speaking — in a single 3-hour sitting at a certified test centre.',
  },
  {
    icon: '💻',
    title: '100 % Computer-Based',
    desc: 'No handwriting, no waiting for a human examiner. CELPIP is fully computer-delivered, giving consistent and unbiased scoring.',
  },
  {
    icon: '🔄',
    title: 'Valid for 2 Years',
    desc: 'Your CELPIP scores are valid for two years, giving you plenty of time to build your Express Entry profile and wait for the right draw.',
  },
]

export default function WhyCELPIP() {
  return (
    <section className="why-section" id="why">
      <div className="section-inner">
        <motion.div
          className="section-label"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          Why CELPIP?
        </motion.div>
        <motion.h2
          className="section-title"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          The smart choice for<br />Canadian Permanent Residence
        </motion.h2>
        <motion.p
          className="section-sub"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          IRCC accepts CELPIP-General for all immigration programs that require
          proof of English proficiency.
        </motion.p>

        <div className="cards-grid">
          {reasons.map((r, i) => (
            <motion.div
              className="feature-card"
              key={r.title}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.07 }}
            >
              <div className="feature-icon">{r.icon}</div>
              <h3 className="feature-title">{r.title}</h3>
              <p className="feature-desc">{r.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
