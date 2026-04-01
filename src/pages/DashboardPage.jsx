import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import SEO from '../components/SEO'

const SECTIONS = [
  { key: 'listening', label: 'Listening', icon: '🎧', color: '#4A90D9', colorLight: '#EEF4FF', done: 0, total: 71 },
  { key: 'reading',   label: 'Reading',   icon: '📖', color: '#2D8A56', colorLight: '#F0FDF4', done: 0, total: 88 },
  { key: 'writing',   label: 'Writing',   icon: '✍️',  color: '#C8972A', colorLight: '#FFFBEB', done: 0, total: 30 },
  { key: 'speaking',  label: 'Speaking',  icon: '🎙️', color: '#C8102E', colorLight: '#FEF2F2', done: 0, total: 120 },
]

const DashboardPage = () => {
  const navigate = useNavigate()
  const { user } = useAuth()

  const firstName = user?.user_metadata?.full_name?.split(' ')[0]
    ?? user?.email?.split('@')[0]
    ?? 'there'

  const isPremium = false
  const totalAvailable = SECTIONS.reduce((s, x) => s + x.total, 0)
  const totalDone      = SECTIONS.reduce((s, x) => s + x.done,  0)

  return (
    <main className="db-page">
      <SEO
        title="Dashboard"
        description="Your CELPIP practice dashboard. Track your progress, resume practice sets, and see your CLB score improvements."
        noindex={true}
      />
      <div className="db-welcome-bar">
        <div className="db-welcome-inner">
          <h1 className="db-welcome-title">Welcome back, {firstName}</h1>
          <p className="db-welcome-sub">Keep practicing — every question gets you closer to your goal</p>
        </div>
      </div>

      <div className="db-content">

        {/* ── Upgrade Banner ── */}
        {!isPremium && (
          <motion.div
            className="db-upgrade-banner"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="db-upgrade-banner-left">
              <span className="db-upgrade-plan-tag">Free Plan</span>
              <span className="db-upgrade-banner-text">
                Unlock all practice questions and AI scoring with Premium
              </span>
            </div>
            <button className="db-upgrade-btn" onClick={() => navigate('/pricing')}>
              Upgrade Now
            </button>
          </motion.div>
        )}

        {/* ── Stat Tiles ── */}
        <div className="db-stat-tiles">
          {[
            { value: totalDone,      label: 'Completed'  },
            { value: totalAvailable, label: 'Available'  },
            { value: '—',            label: 'Avg Score'  },
            { value: isPremium ? 'Premium' : 'Free', label: 'Plan', dim: !isPremium },
          ].map((tile, i) => (
            <motion.div
              key={tile.label}
              className="db-stat-tile"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.07 }}
            >
              <div className={`db-stat-tile-value${tile.dim ? ' db-stat-tile-value--dim' : ''}`}>
                {tile.value}
              </div>
              <div className="db-stat-tile-label">{tile.label}</div>
            </motion.div>
          ))}
        </div>

        {/* ── Practice by Section ── */}
        <section className="db-section">
          <h2 className="db-section-title">Practice by Section</h2>
          <div className="db-section-rows">
            {SECTIONS.map((s, i) => {
              const pct = s.total > 0 ? Math.round((s.done / s.total) * 100) : 0
              return (
                <motion.div
                  key={s.key}
                  className="db-section-row"
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 + i * 0.07 }}
                >
                  <div className="db-section-row-icon" style={{ background: s.colorLight }}>
                    {s.icon}
                  </div>
                  <div className="db-section-row-body">
                    <div className="db-section-row-top">
                      <span className="db-section-row-label">{s.label}</span>
                      <span className="db-section-row-count" style={{ color: s.color }}>
                        {s.done}/{s.total}
                      </span>
                    </div>
                    <div className="db-section-row-progress-track">
                      <motion.div
                        className="db-section-row-progress-fill"
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.7, delay: 0.3 + i * 0.07 }}
                        style={{ background: s.color }}
                      />
                    </div>
                    <span className="db-section-row-pct">{pct}% complete</span>
                  </div>
                  <button
                    className="db-section-row-btn"
                    style={{ color: s.color, borderColor: s.color + '50', background: s.colorLight }}
                    onClick={() => navigate('/' + s.key)}
                  >
                    Practice
                  </button>
                </motion.div>
              )
            })}
          </div>
        </section>

        {/* ── Recent Activity ── */}
        <section className="db-section">
          <h2 className="db-section-title">Recent Activity</h2>
          <div className="db-activity-empty">
            <span className="db-activity-empty-icon">📭</span>
            <p>No activity yet — start practising to see your history here.</p>
            <button className="db-activity-cta" onClick={() => navigate('/exam')}>
              Start a Mock Exam →
            </button>
          </div>
        </section>

      </div>
    </main>
  )
}

export default DashboardPage
