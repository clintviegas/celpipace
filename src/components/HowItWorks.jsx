import { motion } from 'framer-motion'

const steps = [
  { num: '01', title: 'Choose a Section', desc: 'Pick Listening, Reading, Writing, or Speaking to start practicing.' },
  { num: '02', title: 'Complete Practice Sets', desc: 'Work through questions that match the real CELPIP format and timing.' },
  { num: '03', title: 'Review Your Answers', desc: 'Read explanations for each question and compare against sample responses.' },
  { num: '04', title: 'Track Your Progress', desc: 'Monitor your CLB growth across all four skills on your dashboard.' },
]

export default function HowItWorks() {
  return (
    <section className="hp-how" id="how">
      <div className="section-inner">
        <motion.div className="section-label" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          How It Works
        </motion.div>
        <motion.h2 className="section-title" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
          Start practicing in{' '}
          <span className="highlight">four simple steps</span>
        </motion.h2>

        <div className="hp-steps">
          {steps.map((s, i) => (
            <motion.div
              className="hp-step"
              key={s.num}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <div className="hp-step-num">{s.num}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
