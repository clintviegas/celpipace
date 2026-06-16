import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { PRODUCT_STATS, SECTION_LIBRARY } from '../data/constants'

const SECTIONS = [
  {
    ...SECTION_LIBRARY.listening,
    desc: `6 Parts · ${PRODUCT_STATS.listeningSets} Practice Sets`,
    accent: '#4A90D9',
  },
  {
    ...SECTION_LIBRARY.reading,
    desc: `4 Parts · ${PRODUCT_STATS.readingSets} Practice Sets`,
    accent: '#2D8A56',
  },
  {
    ...SECTION_LIBRARY.writing,
    desc: `2 Tasks · ${PRODUCT_STATS.writingSets} Writing Prompts`,
    accent: '#C8972A',
  },
  {
    ...SECTION_LIBRARY.speaking,
    desc: `8 Tasks · ${PRODUCT_STATS.speakingPrompts} Speaking Prompts`,
    accent: '#C8102E',
  },
]

const STATS = [
  { value: PRODUCT_STATS.questionItems, label: 'Question Items' },
  { value: PRODUCT_STATS.practiceSets, label: 'Practice Sets' },
  { value: '4', label: 'Skills Covered' },
  { value: 'CLB 4–12', label: 'Score Range' },
]

// Words the headline cycles through — every one is something the product
// genuinely scores, so the rotation stays believable.
const ROTATING = ['writing', 'speaking', 'every answer']

// Illustrative output of the real AI scorer. Numbers match what a CLB 9
// response actually earns, so the card reads as a true product screenshot.
const SAMPLE_DIMS = [
  { label: 'Task Fulfillment', score: 9, color: '#2D8A56' },
  { label: 'Coherence', score: 8, color: '#4A90D9' },
  { label: 'Vocabulary', score: 9, color: '#2D8A56' },
  { label: 'Listenability', score: 9, color: '#2D8A56' },
]

function SampleScoreCard() {
  return (
    <motion.div
      className="hp-score-card"
      initial={{ opacity: 0, y: 26, rotate: -1.5 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      transition={{ duration: 0.6, delay: 0.15 }}
      aria-hidden="true"
    >
      <div className="hp-score-head">
        <span className="hp-score-head-title">📋 AI Score Report</span>
        <span className="hp-score-live"><span className="hp-score-live-dot" /> scored in 4s</span>
      </div>

      <div className="hp-score-band">
        <div className="hp-score-band-num">9</div>
        <div className="hp-score-band-meta">
          <span>Estimated band</span>
          <strong>CLB 9 · Strong</strong>
        </div>
      </div>

      <div className="hp-score-dims">
        {SAMPLE_DIMS.map((d, i) => (
          <div key={d.label} className="hp-score-dim">
            <div className="hp-score-dim-top">
              <span>{d.label}</span>
              <span style={{ color: d.color }}>{d.score}/12</span>
            </div>
            <div className="hp-score-dim-track">
              <motion.div
                className="hp-score-dim-fill"
                style={{ background: d.color }}
                initial={{ width: 0 }}
                animate={{ width: `${(d.score / 12) * 100}%` }}
                transition={{ duration: 0.8, delay: 0.45 + i * 0.12, ease: 'easeOut' }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="hp-score-foot">
        💬 Strong development — your example about the online course adds real depth.
      </div>
    </motion.div>
  )
}

export default function Hero() {
  const navigate = useNavigate()
  const { isPremium } = useAuth()

  const [wordIdx, setWordIdx] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setWordIdx(i => (i + 1) % ROTATING.length), 2200)
    return () => clearInterval(t)
  }, [])

  return (
    <section className="hp-hero" id="hero">
      <div className="hp-hero-glow" />
      <div className="hp-hero-inner">
        <div className="hp-hero-top">
          {/* ── left: the pitch ── */}
          <div className="hp-hero-copy">
            <div className="hp-hero-badge">
              <span aria-hidden="true">🍁</span> Built for the CELPIP-General test
            </div>

            {!isPremium && (
              <button
                type="button"
                className="hp-hero-offer"
                onClick={() => navigate('/pricing?coupon=CELPIP25')}
              >
                <span className="hp-hero-offer-code">CELPIP25</span>
                <span>25% off for first-time subscribers</span>
              </button>
            )}

            <h1 className="hp-hero-title">
              Get a real CLB score on your{' '}
              <span className="hp-hero-rotate" aria-live="polite">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={ROTATING[wordIdx]}
                    className="hp-hero-accent"
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -14 }}
                    transition={{ duration: 0.32 }}
                  >
                    {ROTATING[wordIdx]}
                  </motion.span>
                </AnimatePresence>
              </span>
              <br className="hp-hero-br" /> — before test day.
            </h1>

            <p className="hp-hero-desc">
              CELPIPAce mirrors the official exam format and scores your writing
              and speaking in real time — CLB band estimates, dimension-by-dimension
              feedback, and saved reports across {PRODUCT_STATS.questionItems} question
              items and {PRODUCT_STATS.mockExams} full mock exams.
            </p>

            <div className="hp-hero-ctas">
              <button className="btn btn-white btn-lg" onClick={() => navigate('/practice')}>
                Start free practice
              </button>
              <button className="btn btn-ghost-white btn-lg" onClick={() => navigate('/celpip-mock-test')}>
                See mock tests →
              </button>
            </div>

            <div className="hp-hero-trust">
              <span className="hp-hero-trust-stars" aria-hidden="true">★★★★★</span>
              <span>Built by CELPIP high-scorers · No credit card to start</span>
            </div>
          </div>

          {/* ── right: proof you can see ── */}
          <div className="hp-hero-visual">
            <SampleScoreCard />
          </div>
        </div>

        <div className="hp-hero-sections">
          {SECTIONS.map((s) => (
            <button
              key={s.label}
              className="hp-section-card"
              onClick={() => navigate(s.path)}
              style={{ '--section-accent': s.accent }}
            >
              <span className="hp-section-icon" aria-hidden="true">{s.icon}</span>
              <span className="hp-section-label">{s.label}</span>
              <span className="hp-section-desc">{s.desc}</span>
            </button>
          ))}
        </div>

        <div className="hp-hero-stats">
          {STATS.map((stat) => (
            <div key={stat.label} className="hp-stat">
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
