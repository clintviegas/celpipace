import { motion } from 'framer-motion'

const testimonials = [
  {
    name: 'Priya Sharma',
    origin: '🇮🇳 India → 🇨🇦 Canada',
    program: 'Federal Skilled Worker',
    quote:
      'My CRS was stuck at 468 for two draws. After 8 weeks on CELPIPace, I hit CLB 10 in all four sections, gained 62 CRS points, and received my ITA the very next draw.',
    score: 'CLB 10 ✓',
    crsGain: '+62 CRS',
    pr: 'PR Granted',
    avatar: 'PS',
  },
  {
    name: 'Daniel Ferreira',
    origin: '🇧🇷 Brazil → 🇨🇦 Canada',
    program: 'Canadian Experience Class',
    quote:
      'I was scoring CLB 7 consistently and couldn\'t understand why. The AI feedback on my writing tasks showed exactly where I was losing points. Jumped to CLB 9 in six weeks.',
    score: 'CLB 9 ✓',
    crsGain: '+50 CRS',
    pr: 'ITA Received',
    avatar: 'DF',
  },
  {
    name: 'Mei-Ling Chen',
    origin: '🇨🇳 China → 🇨🇦 Canada',
    program: 'Federal Skilled Trades',
    quote:
      'Speaking was my biggest fear. The mock speaking tasks with instant scoring made all the difference. My listening went from 7 to 10, reading 8 to 10.',
    score: 'CLB 10 ✓',
    crsGain: '+55 CRS',
    pr: 'PR Granted',
    avatar: 'MC',
  },
  {
    name: 'Ahmed Al-Rashidi',
    origin: '🇦🇪 UAE → 🇨🇦 Canada',
    program: 'Federal Skilled Worker',
    quote:
      'The CRS points table was an eye-opener. I didn\'t realize a single CLB band jump in all sections could add 66 points. CELPIPace helped me achieve that target in 10 weeks.',
    score: 'CLB 10 ✓',
    crsGain: '+66 CRS',
    pr: 'PR Granted',
    avatar: 'AA',
  },
  {
    name: 'Tomoko Ishida',
    origin: '🇯🇵 Japan → 🇨🇦 Canada',
    program: 'Canadian Experience Class',
    quote:
      'I took IELTS twice and struggled. Switched to CELPIP and used CELPIPace — the Canadian context made so much more sense. Scored 10 in every section on my first attempt.',
    score: 'CLB 10 ✓',
    crsGain: '+62 CRS',
    pr: 'ITA Received',
    avatar: 'TI',
  },
  {
    name: 'Carlos Mendez',
    origin: '🇲🇽 Mexico → 🇨🇦 Canada',
    program: 'Federal Skilled Worker',
    quote:
      'The personalized study plan saved me so much time. Instead of studying everything, I focused on Writing and Speaking — my weakest areas — and improved 3 CLB bands.',
    score: 'CLB 9 ✓',
    crsGain: '+46 CRS',
    pr: 'PR Granted',
    avatar: 'CM',
  },
]

export default function Testimonials() {
  return (
    <section className="testimonials-section" id="testimonials">
      <div className="section-inner">
        <motion.div
          className="section-label"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          Success Stories
        </motion.div>
        <motion.h2
          className="section-title"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          Real students.<br />
          <span className="highlight">Real Canadian PRs.</span>
        </motion.h2>
        <motion.p
          className="section-sub"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Over 2,400 students have used CELPIPace to boost their CRS score and receive their Invitation to Apply.
        </motion.p>

        <div className="testimonials-grid">
          {testimonials.map((t, i) => (
            <motion.div
              className="testimonial-card"
              key={t.name}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.08 }}
            >
              <div className="t-badges">
                <span className="t-badge t-badge-score">{t.score}</span>
                <span className="t-badge t-badge-crs">{t.crsGain}</span>
                <span className="t-badge t-badge-pr">{t.pr}</span>
              </div>
              <p className="t-quote">"{t.quote}"</p>
              <div className="t-author">
                <div className="t-avatar">{t.avatar}</div>
                <div>
                  <div className="t-name">{t.name}</div>
                  <div className="t-origin">{t.origin}</div>
                  <div className="t-program">{t.program}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
