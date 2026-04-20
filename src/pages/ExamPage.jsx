import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AuthModal from '../components/AuthModal'
import SEO from '../components/SEO'

/* ── Mock exam data ─────────────────────────────────────────── */
const EXAMS = Array.from({ length: 8 }, (_, i) => ({
  num: i + 1,
  sections: [
    { id: 'listening', icon: '🎧', label: 'Listening', qs: 38 },
    { id: 'reading',   icon: '📖', label: 'Reading',   qs: 38 },
    { id: 'writing',   icon: '✍️', label: 'Writing',   qs: 2 },
    { id: 'speaking',  icon: '🎙️', label: 'Speaking',  qs: 8 },
  ],
}))

/* ── Main ExamPage ─────────────────────────────────────────── */
export default function ExamPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [authOpen, setAuthOpen] = useState(false)
  const [authReason, setAuthReason] = useState('')

  const requireAuth = (reason, action) => {
    if (user) { action() } else { setAuthReason(reason); setAuthOpen(true) }
  }

  return (
    <div className="page-wrap">
      <SEO
        title="CELPIP Mock Exams – Full Practice Tests"
        description="Take full-length CELPIP mock exams with timed Listening, Reading, Writing and Speaking sections. AI-powered scoring included."
        canonical="/exam"
        noindex={true}
      />
      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} reason={authReason} />

      {/* ── Hero ── */}
      <section className="ep-hero">
        <div className="ep-hero-inner">
          <motion.span
            className="ep-hero-badge"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            🍁 Full-Length Practice
          </motion.span>
          <motion.h1
            className="ep-hero-title"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            CELPIP Mock Exams
          </motion.h1>
          <motion.p
            className="ep-hero-sub"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            Simulate the real exam with timed sections, real question format, and instant scoring.
          </motion.p>
          <motion.div
            className="ep-feature-pills"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            {[
              { icon: '⏱', label: 'Timed Sections' },
              { icon: '📋', label: 'Real Format' },
              { icon: '🤖', label: 'AI Scoring' },
              { icon: '📊', label: 'CLB Report' },
            ].map(p => (
              <span key={p.label} className="ep-pill">
                <span className="ep-pill-icon">{p.icon}</span> {p.label}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      <div className="ep-body">

        {/* ── Stats strip ── */}
        <div className="ep-stats-strip">
          {[
            { val: '8', label: 'Mock Exams' },
            { val: '344', label: 'Questions' },
            { val: '4', label: 'Sections' },
            { val: '~3h', label: 'Per Exam' },
          ].map(s => (
            <div key={s.label} className="ep-stats-item">
              <span className="ep-stats-val">{s.val}</span>
              <span className="ep-stats-label">{s.label}</span>
            </div>
          ))}
        </div>

        {/* ── Exam list ── */}
        <div className="ep-exam-list">
          <div className="ep-list-header">
            <span className="ep-list-header-name">Exam</span>
            <span className="ep-list-header-sections">Sections</span>
            <span className="ep-list-header-action" />
          </div>
          {EXAMS.map((exam, i) => {
            const isFree = exam.num === 1
            return (
              <motion.div
                key={exam.num}
                className="ep-exam-row"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: i * 0.04 }}
              >
                <div className="ep-exam-row-left">
                  <span className="ep-exam-num">{exam.num}</span>
                  <div className="ep-exam-info">
                    <span className="ep-exam-name">Mock Exam {exam.num}</span>
                    {isFree && <span className="ep-exam-free-tag">Free</span>}
                  </div>
                </div>
                <div className="ep-exam-sections">
                  {exam.sections.map(s => (
                    <span key={s.id} className="ep-exam-section-chip">{s.icon}</span>
                  ))}
                </div>
                <div className="ep-exam-row-right">
                  {isFree ? (
                    <button
                      className="ep-exam-start-btn"
                      onClick={() => navigate(`/mock-test/${exam.num}`)}
                    >
                      Start Free
                    </button>
                  ) : (
                    <button
                      className="ep-exam-lock-btn"
                      onClick={() => navigate('/pricing')}
                    >
                      🔒 Unlock
                    </button>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* ── Upgrade banner ── */}
        <div className="ep-unlock-banner">
          <div className="ep-unlock-badge">⭐ Premium</div>
          <div className="ep-unlock-left">
            <div className="ep-unlock-title">Get full access to all 8 Mock Exams</div>
            <div className="ep-unlock-sub">
              Unlimited AI scoring · Timed sections · CLB-level reports · Writing & Speaking feedback
            </div>
          </div>
          <button className="ep-unlock-btn" onClick={() => navigate('/pricing')}>
            Upgrade Now →
          </button>
        </div>

        {/* ── Section quick links ── */}
        <div className="ep-sections-grid">
          {[
            { id: 'listening', icon: '🎧', label: 'Listening', desc: '6 parts · 120 sets', color: '#4A90D9', bg: '#EEF4FF' },
            { id: 'reading',   icon: '📖', label: 'Reading',   desc: '4 parts · 46 sets',  color: '#2D8A56', bg: '#F0FDF4' },
            { id: 'writing',   icon: '✍️', label: 'Writing',   desc: '2 tasks · AI scoring',color: '#C8972A', bg: '#FFFBEB' },
            { id: 'speaking',  icon: '🎙️', label: 'Speaking',  desc: '8 tasks · practice',  color: '#C8102E', bg: '#FEF2F2' },
          ].map(s => (
            <button key={s.id} className="ep-section-card" onClick={() => navigate('/' + s.id)}>
              <span className="ep-section-icon" style={{ background: s.bg, color: s.color }}>{s.icon}</span>
              <div>
                <span className="ep-section-label">{s.label}</span>
                <span className="ep-section-desc">{s.desc}</span>
              </div>
            </button>
          ))}
        </div>

      </div>
    </div>
  )
}
