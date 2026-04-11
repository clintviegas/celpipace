import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useProgress } from '../hooks/useProgress'
import SEO from '../components/SEO'

/* ── section config ── */
const SECTIONS = [
  { key: 'listening', label: 'Listening', icon: '🎧', color: '#4A90D9', colorLight: '#EEF4FF', parts: ['L1','L2','L3','L4','L5','L6'] },
  { key: 'reading',   label: 'Reading',   icon: '📖', color: '#2D8A56', colorLight: '#F0FDF4', parts: ['R1','R2','R3','R4'] },
  { key: 'writing',   label: 'Writing',   icon: '✍️',  color: '#C8972A', colorLight: '#FFFBEB', parts: ['W1','W2'] },
  { key: 'speaking',  label: 'Speaking',  icon: '🎙️', color: '#C8102E', colorLight: '#FEF2F2', parts: ['S1','S2','S3','S4','S5','S6','S7','S8'] },
]

const MOTIVATIONAL = [
  'Every question you answer brings you closer to CLB 9+.',
  'Consistency beats intensity — keep the streak going!',
  'Focus on your weakest section today for maximum growth.',
  'Track your progress, not perfection.',
  'Small daily practice builds exam confidence.',
]

function timeAgo(ts) {
  const diff = Date.now() - ts
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days}d ago`
  return new Date(ts).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function getCLB(pct) {
  if (pct == null) return null
  if (pct >= 95) return 12
  if (pct >= 90) return 11
  if (pct >= 85) return 10
  if (pct >= 78) return 9
  if (pct >= 70) return 8
  if (pct >= 60) return 7
  if (pct >= 50) return 6
  if (pct >= 40) return 5
  if (pct >= 30) return 4
  return 3
}

const DashboardPage = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { stats, streak, activity } = useProgress()
  const [motivIdx] = useState(() => Math.floor(Math.random() * MOTIVATIONAL.length))

  const firstName = user?.user_metadata?.full_name?.split(' ')[0]
    ?? user?.email?.split('@')[0]
    ?? 'there'

  const isPremium = false
  const greeting = getGreeting()

  // Find weakest section for smart recommendation
  const weakest = SECTIONS.reduce((w, s) => {
    const ss = stats.sections[s.key]
    if (!w || (ss?.avgScore !== null && (w.avgScore === null || ss.avgScore < w.avgScore))) {
      return { ...s, ...ss }
    }
    return w
  }, null)

  // Next recommended action
  const getNextAction = () => {
    if (stats.totalCompleted === 0) return { text: 'Start your first practice set', route: '/listening', icon: '🚀' }
    if (weakest?.key) return { text: `Practice ${weakest.label} — your weakest section`, route: '/' + weakest.key, icon: '🎯' }
    return { text: 'Continue practising', route: '/exam', icon: '📝' }
  }
  const nextAction = getNextAction()

  return (
    <main className="db-page">
      <SEO
        title="Dashboard"
        description="Your CELPIP practice dashboard. Track your progress, resume practice sets, and see your CLB score improvements."
        noindex={true}
      />

      {/* ── Welcome Bar ── */}
      <div className="db-welcome-bar">
        <div className="db-welcome-inner">
          <div className="db-welcome-top">
            <div>
              <h1 className="db-welcome-title">{greeting}, {firstName}</h1>
              <p className="db-welcome-sub">{MOTIVATIONAL[motivIdx]}</p>
            </div>
            {streak.current > 0 && (
              <motion.div
                className="db-streak-badge"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              >
                <span className="db-streak-fire">🔥</span>
                <div className="db-streak-info">
                  <span className="db-streak-count">{streak.current}</span>
                  <span className="db-streak-label">day streak</span>
                </div>
              </motion.div>
            )}
          </div>
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
            { value: stats.totalCompleted, label: 'Sets Completed', sub: `of ${stats.totalSets}` },
            { value: stats.avgScore !== null ? `CLB ${getCLB(stats.avgScore)}` : '—', label: 'Avg CLB', sub: stats.avgScore !== null && getCLB(stats.avgScore) >= 7 ? 'On track for PR' : 'Keep practising' },
            { value: `${stats.totalPct}%`, label: 'Progress', sub: stats.totalPct >= 50 ? 'Halfway there' : 'Getting started' },
            { value: streak.current || 0, label: 'Day Streak', sub: `Best: ${streak.best}` },
          ].map((tile, i) => (
            <motion.div
              key={tile.label}
              className="db-stat-tile"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.07 }}
            >
              <div className="db-stat-tile-value">{tile.value}</div>
              <div className="db-stat-tile-label">{tile.label}</div>
              <div className="db-stat-tile-sub">{tile.sub}</div>
            </motion.div>
          ))}
        </div>

        {/* ── Smart Next Action ── */}
        <motion.div
          className="db-next-action"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <div className="db-next-action-left">
            <span className="db-next-action-icon">{nextAction.icon}</span>
            <div>
              <span className="db-next-action-label">Recommended Next</span>
              <span className="db-next-action-text">{nextAction.text}</span>
            </div>
          </div>
          <button className="db-next-action-btn" onClick={() => navigate(nextAction.route)}>
            Go →
          </button>
        </motion.div>

        {/* ── Practice by Section (LIVE) ── */}
        <section className="db-section">
          <h2 className="db-section-title">Practice by Section</h2>
          <div className="db-section-rows">
            {SECTIONS.map((s, i) => {
              const ss = stats.sections[s.key] || { done: 0, total: 0, pct: 0, avgScore: null }
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
                        {ss.done}/{ss.total} sets
                      </span>
                    </div>
                    <div className="db-section-row-progress-track">
                      <motion.div
                        className="db-section-row-progress-fill"
                        initial={{ width: 0 }}
                        animate={{ width: `${ss.pct}%` }}
                        transition={{ duration: 0.7, delay: 0.3 + i * 0.07 }}
                        style={{ background: s.color }}
                      />
                    </div>
                    <div className="db-section-row-bottom">
                      <span className="db-section-row-pct">{ss.pct}% complete</span>
                      {ss.avgScore !== null && (
                        <span className="db-section-row-score" style={{ color: s.color }}>
                          CLB {getCLB(ss.avgScore)}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    className="db-section-row-btn"
                    style={{ color: s.color, borderColor: s.color + '50', background: s.colorLight }}
                    onClick={() => navigate('/' + s.key)}
                  >
                    {ss.done > 0 ? 'Continue' : 'Start'}
                  </button>
                </motion.div>
              )
            })}
          </div>
        </section>

        {/* ── Recent Activity ── */}
        <section className="db-section">
          <h2 className="db-section-title">Recent Activity</h2>
          {activity.length === 0 ? (
            <div className="db-activity-empty">
              <span className="db-activity-empty-icon">📭</span>
              <p>No activity yet — start practising to see your history here.</p>
              <button className="db-activity-cta" onClick={() => navigate('/exam')}>
                Start a Mock Exam →
              </button>
            </div>
          ) : (
            <div className="db-activity-feed">
              {activity.slice(0, 10).map((a, i) => {
                const sec = SECTIONS.find(s => s.key === a.section)
                const scoreColor = a.pct >= 70 ? '#2D8A56' : a.pct >= 50 ? '#C8972A' : '#C8102E'
                return (
                  <motion.div
                    key={`${a.ts}-${i}`}
                    className="db-activity-item"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: i * 0.03 }}
                  >
                    <div className="db-activity-icon" style={{ background: sec?.colorLight || '#f3f4f6', color: sec?.color || '#6B7280' }}>
                      {sec?.icon || '📝'}
                    </div>
                    <div className="db-activity-body">
                      <span className="db-activity-title">
                        {sec?.label || 'Practice'} — {a.partId} Set {a.setNum}
                      </span>
                      <span className="db-activity-meta">{timeAgo(a.ts)}</span>
                    </div>
                    <div className="db-activity-score" style={{ color: scoreColor, background: scoreColor + '10' }}>
                      {a.pct}%
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </section>


      </div>
    </main>
  )
}

export default DashboardPage
