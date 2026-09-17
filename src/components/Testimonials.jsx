import { motion } from 'framer-motion'

const testimonials = [
  {
    name: 'Amira K.',
    initials: 'AK',
    result: 'Writing: 7 → 9',
    quote: 'The writing practice was the closest thing to the real test I found. The explanations for every question helped me understand what examiners look for.',
    stars: 5,
    color: '#4A90D9',
  },
  {
    name: 'Marcus R.',
    initials: 'MR',
    result: 'CLB 9 across all sections',
    quote: 'I struggled most with the Speaking timed format. Practicing with the structured prompts and reviewing sample answers made a real difference on test day.',
    stars: 5,
    color: '#2D8A56',
  },
  {
    name: 'Sofia L.',
    initials: 'SL',
    result: 'Reading improved by 2 bands',
    quote: 'I kept losing points on the inference questions. The detailed explanations showed me exactly how to approach them — my Reading score went from CLB 6 to CLB 8.',
    stars: 5,
    color: '#C8972A',
  },
  {
    name: 'Priya S.',
    initials: 'PS',
    result: 'CLB 9 → +46 CRS points',
    quote: 'I used the CRS calculator to understand exactly how much each CLB band was worth. Knowing the numbers gave me real motivation to keep practicing.',
    stars: 5,
    color: '#C8102E',
  },
  {
    name: 'Daniel F.',
    initials: 'DF',
    result: 'Listening: CLB 7 → CLB 9',
    quote: 'The Listening section breakdown by part was exactly what I needed. I focused on L5 and L6 where I was losing the most marks and brought my band up significantly.',
    stars: 5,
    color: '#4A90D9',
  },
  {
    name: 'Neha W.',
    initials: 'NW',
    result: 'Passed citizenship test: CLB 8',
    quote: 'I was aiming for CLB 7 for citizenship and ended up hitting CLB 8 in all four sections. The mock exam format really prepares you for the real thing.',
    stars: 5,
    color: '#2D8A56',
  },
]

export default function Testimonials() {
  return (
    <section className="hp-testimonials" id="testimonials">
      <div className="section-inner">
        <motion.div className="section-label" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          Student Results
        </motion.div>
        <motion.h2 className="section-title" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
          Real results from{' '}
          <span className="highlight">real test-takers</span>
        </motion.h2>

        <div className="hp-testimonials-grid">
          {testimonials.map((t, i) => (
            <motion.div
              className="hp-t-card"
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
            >
              <div className="hp-t-stars">{'★'.repeat(t.stars)}</div>
              <p className="hp-t-quote">"{t.quote}"</p>
              <div className="hp-t-author">
                <div className="hp-t-avatar" style={{ background: t.color }}>{t.initials}</div>
                <div>
                  <div className="hp-t-name">{t.name}</div>
                  <div className="hp-t-result">{t.result}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
