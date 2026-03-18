import { motion } from 'framer-motion'

const stats = [
  { value: '50+', label: 'CRS Points Available' },
  { value: '67%', label: 'of PR Draws Use CRS' },
  { value: 'CLB 10', label: 'Earns Max Language Points' },
  { value: '2,400+', label: 'Students Got PR' },
]

export default function Hero({ setPage }) {
  return (
    <section className="hero-section" id="hero">
      <div className="hero-bg-grid" />
      <div className="hero-content">
        <motion.div
          className="hero-badge"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="badge-dot" />
          Canada Express Entry — CRS Score Booster
        </motion.div>

        <motion.h1
          className="hero-title"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          Ace CELPIP. <br />
          <span className="highlight">Boost Your CRS.</span> <br />
          Get Your Canadian PR.
        </motion.h1>

        <motion.p
          className="hero-sub"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          CELPIP is Canada's preferred English test for Express Entry. A higher
          CLB score can unlock <strong>up to 50 extra CRS points</strong> —
          enough to receive an Invitation to Apply for Permanent Residence.
        </motion.p>

        <motion.div
          className="hero-ctas"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <button className="btn btn-primary btn-lg" onClick={() => setPage('practice')}>
            Start Practicing Free
          </button>
          <button className="btn btn-ghost btn-lg" onClick={() => setPage('calculator')}>
            Calculate My CRS Score →
          </button>
        </motion.div>

        <motion.div
          className="hero-stats"
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.45 }}
        >
          {stats.map(s => (
            <div className="hero-stat" key={s.label}>
              <span className="stat-value">{s.value}</span>
              <span className="stat-label">{s.label}</span>
            </div>
          ))}
        </motion.div>
      </div>

      <motion.div
        className="hero-visual"
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <div className="score-card">
          <div className="score-card-header">
            <span className="score-card-flag">🇨🇦</span>
            <div>
              <div className="score-card-title">Express Entry Profile</div>
              <div className="score-card-sub">Comprehensive Ranking System</div>
            </div>
          </div>

          <div className="crs-dial-wrap">
            <div className="crs-dial">
              <span className="crs-score">492</span>
              <span className="crs-label">Current CRS</span>
            </div>
            <div className="crs-arrow-wrap">
              <div className="crs-boost">
                <span className="boost-arrow">↑ +50</span>
                <span className="boost-note">with CLB 10</span>
              </div>
              <div className="crs-dial crs-dial-target">
                <span className="crs-score">542</span>
                <span className="crs-label">Target CRS</span>
              </div>
            </div>
          </div>

          <div className="score-bars">
            {[
              { skill: 'Listening', before: 62, after: 100, clb: 'CLB 10' },
              { skill: 'Reading', before: 70, after: 100, clb: 'CLB 10' },
              { skill: 'Writing', before: 55, after: 100, clb: 'CLB 10' },
              { skill: 'Speaking', before: 60, after: 100, clb: 'CLB 10' },
            ].map(b => (
              <div className="score-bar-row" key={b.skill}>
                <span className="bar-label">{b.skill}</span>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: `${b.before}%` }} />
                  <div className="bar-fill bar-fill-target" style={{ width: `${b.after}%` }} />
                </div>
                <span className="bar-clb">{b.clb}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  )
}
