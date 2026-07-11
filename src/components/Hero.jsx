import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { PRODUCT_STATS, SECTION_LIBRARY } from '../data/constants'
import { WEEKLY_PROMO, weeklyPromoSpotsLeft } from '../data/paymentPlans'
import CoachPreviewCard from './CoachPreviewCard'

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
  { value: PRODUCT_STATS.mockExams, label: 'Full Mock Exams' },
  { value: 'AI Coach', label: 'Personalized to you' },
  { value: 'CLB 4–12', label: 'Score Range' },
]

// Words the headline cycles through — outcome-focused for immigration prep.
const ROTATING = ['CLB gap', 'weak spots', 'study plan', 'CRS score']

// Illustrative output removed — hero now shows CoachPreviewCard instead.

function PromoBanner({ onClaim }) {
  const spotsLeft = weeklyPromoSpotsLeft()

  return (
    <motion.button
      type="button"
      className="hp-promo"
      onClick={onClaim}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      aria-label={`${WEEKLY_PROMO.headline}. Use code ${WEEKLY_PROMO.code}. ${spotsLeft} spots left.`}
    >
      <span className="hp-promo-shine" aria-hidden="true" />

      <span className="hp-promo-flag">
        <span className="hp-promo-pulse" aria-hidden="true" />
        50% OFF
      </span>

      <span className="hp-promo-body">
        <span className="hp-promo-head">{WEEKLY_PROMO.headline}</span>
        <span className="hp-promo-sub">
          Use code <span className="hp-promo-code">{WEEKLY_PROMO.code}</span> on the Weekly plan
        </span>
      </span>

      <span className="hp-promo-meta" aria-hidden="true">
        <span className="hp-promo-spots">
          🔥 Only <strong>{spotsLeft}</strong> of {WEEKLY_PROMO.totalSpots} left
        </span>
      </span>

      <span className="hp-promo-cta" aria-hidden="true">Claim →</span>
    </motion.button>
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
            <div className="hp-hero-badge hp-hero-badge--coach">
              <span aria-hidden="true">✨</span> New — AI Study Coach reads your practice scores
            </div>

            {!isPremium && WEEKLY_PROMO.active && (
              <PromoBanner
                onClaim={() => navigate(`/payment?plan=${WEEKLY_PROMO.planId}&coupon=${WEEKLY_PROMO.code}`)}
              />
            )}

            <h1 className="hp-hero-title">
              Know your{' '}
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
              <br className="hp-hero-br" /> — then fix it before test day.
            </h1>

            <p className="hp-hero-desc">
              Full-length CELPIP mocks, instant CLB scoring, and an AI coach that analyzes
              your mistakes to build a weekly study plan — {PRODUCT_STATS.questionItems} questions,
              {PRODUCT_STATS.mockExams} timed exams, built for Express Entry and PR.
            </p>

            <div className="hp-hero-ctas">
              <button className="btn btn-white btn-lg" onClick={() => navigate('/study-coach')}>
                Meet your AI coach
              </button>
              <button className="btn btn-ghost-white btn-lg" onClick={() => navigate('/practice')}>
                Start free practice
              </button>
            </div>

            <div className="hp-hero-trust">
              <span className="hp-hero-trust-stars" aria-hidden="true">★★★★★</span>
              <span>Built by CELPIP high-scorers · No credit card to start</span>
            </div>
          </div>

          {/* ── right: coach preview (primary differentiator) ── */}
          <div className="hp-hero-visual">
            <CoachPreviewCard />
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
