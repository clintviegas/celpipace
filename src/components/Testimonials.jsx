import { motion } from 'framer-motion'

const testimonials = [
  {
    name: 'Amira K.',
    initials: 'AK',
    result: 'Scored 10 in Writing',
    quote: 'The practice tests were incredibly close to the real CELPIP format. The AI feedback on my writing helped me improve my score from 7 to 10 in just two weeks.',
    stars: 5,
    color: '#C8102E',
  },
  {
    name: 'Marcus R.',
    initials: 'MR',
    result: 'CLB 9 in all sections',
    quote: 'I was nervous about the speaking section, but after practicing here with timed prompts and sample answers, I felt completely ready on test day.',
    stars: 5,
    color: '#7C3AED',
  },
  {
    name: 'Sofia L.',
    initials: 'SL',
    result: 'PR application approved',
    quote: 'The detailed explanations for every question made the difference. Instead of just memorizing answers, I actually understood the reasoning.',
    stars: 5,
    color: '#059669',
  },
  {
    name: 'Priya S.',
    initials: 'PS',
    result: '+62 CRS · ITA Received',
    quote: 'My CRS was stuck at 468 for two draws. After 8 weeks on CELPIPace, I hit CLB 10 in all four sections and received my ITA the very next draw.',
    stars: 5,
    color: '#C8972A',
  },
  {
    name: 'Daniel F.',
    initials: 'DF',
    result: 'CLB 9 · +50 CRS',
    quote: 'I was scoring CLB 7 consistently. The AI feedback on my writing tasks showed exactly where I was losing points. Jumped to CLB 9 in six weeks.',
    stars: 5,
    color: '#0F6B8A',
  },
  {
    name: 'Ahmed R.',
    initials: 'AR',
    result: 'CLB 10 · PR Granted',
    quote: "The CRS points table was an eye-opener. I didn't realize a single CLB band jump could add 66 points. CELPIPace helped me achieve that in 10 weeks.",
    stars: 5,
    color: '#B91C1C',
  },
]

export default function Testimonials() {
  return (
    <section className="testimonials-section" id="testimonials">
      <div className="section-inner">
        {/* Social proof header */}
        <motion.div
          className="t-social-proof-bar"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="t-proof-item">
            <div className="t-proof-value">90,000+</div>
            <div className="t-proof-label">test takers trust us</div>
          </div>
          <div className="t-proof-divider" />
          <div className="t-proof-item">
            <div className="t-proof-value">⭐ 4.9</div>
            <div className="t-proof-label">Google rating</div>
          </div>
          <div className="t-proof-divider" />
          <div className="t-proof-item">
            <div className="t-proof-value">CLB 10</div>
            <div className="t-proof-label">avg. target achieved</div>
          </div>
        </motion.div>

        <motion.div
          className="section-label"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          Student Reviews
        </motion.div>
        <motion.h2
          className="section-title"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          What our students say
        </motion.h2>

        <div className="testimonials-grid">
          {testimonials.map((t, i) => (
            <motion.div
              className="testimonial-card"
              key={t.name}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.08 }}
              whileHover={{ y: -4 }}
            >
              <div className="t-stars">
                {'★'.repeat(t.stars)}
              </div>
              <p className="t-quote">"{t.quote}"</p>
              <div className="t-author">
                <div className="t-avatar" style={{ background: t.color }}>{t.initials}</div>
                <div>
                  <div className="t-name">{t.name}</div>
                  <div className="t-result">{t.result}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
