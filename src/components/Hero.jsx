import { useNavigate } from 'react-router-dom'
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

export default function Hero() {
  const navigate = useNavigate()
  const { isPremium } = useAuth()

  return (
    <section className="hp-hero" id="hero">
      <div className="hp-hero-glow" />
      <div className="hp-hero-inner">
        <div className="hp-hero-badge">
          <span aria-hidden="true">🍁</span> Practice smarter for CELPIP
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
          CELPIP Practice Tests With{' '}
          <span className="hp-hero-accent">Real-Time Scoring</span>
        </h1>

        <p className="hp-hero-desc">
          {PRODUCT_STATS.questionItems} CELPIP-style question items, {PRODUCT_STATS.mockExams} full mock exams, real-time writing and speaking feedback, and saved CLB reports for your target score.
        </p>

        <div className="hp-hero-ctas">
          <button className="btn btn-white btn-lg" onClick={() => navigate('/calculator')}>
            Calculate CRS Score
          </button>
          <button className="btn btn-ghost-white btn-lg" onClick={() => navigate('/celpip-mock-test')}>
            See Mock Tests →
          </button>
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
