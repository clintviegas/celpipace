import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import AuthModal from '../components/AuthModal'

/* ── 20 Mock Exam Sets ────────────────────────────────────────── */
const MOCK_EXAM_SETS = Array.from({ length: 20 }, (_, i) => ({
  id: `mock-${i + 1}`,
  number: i + 1,
  title: `Mock Test ${i + 1}`,
  description: `Full CELPIP simulation with all 4 sections`,
  completed: i < 3 ? true : false,
  score: i < 3 ? 80 + Math.floor(Math.random() * 10) : null,
  clb: i < 3 ? Math.floor(7 + Math.random() * 5) : null,
  lastAttempt: i < 3 ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toLocaleDateString() : null,
  difficulty: ['Warm-up', 'Standard', 'Advanced'][Math.floor(Math.random() * 3)],
}))

const SECTIONS = [
  { id: 'listening', label: 'Listening', icon: '🎧', color: '#4A90D9', colorLight: '#EEF4FF' },
  { id: 'reading', label: 'Reading', icon: '📖', color: '#2D8A56', colorLight: '#F0FDF4' },
  { id: 'writing', label: 'Writing', icon: '✍️', color: '#C8972A', colorLight: '#FFFBEB' },
  { id: 'speaking', label: 'Speaking', icon: '🎙️', color: '#C8102E', colorLight: '#FEF2F2' },
]

/* ── Components ────────────────────────────────────────────────── */
function ProgressDashboard({ completedCount, totalCount, avgScore }) {
  const progressPercent = (completedCount / totalCount) * 100

  return (
    <motion.section
      className="exam-dashboard"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div className="dashboard-inner">
        <div className="dashboard-header">
          <h2 className="dashboard-title">Your Progress</h2>
          <p className="dashboard-subtitle">Track your mock exam journey</p>
        </div>

        <div className="dashboard-stats-grid">
          <div className="dashboard-stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <div className="stat-label">Tests Completed</div>
              <div className="stat-value">{completedCount}</div>
            </div>
          </div>

          <div className="dashboard-stat-card">
            <div className="stat-icon">🎯</div>
            <div className="stat-content">
              <div className="stat-label">Remaining</div>
              <div className="stat-value">{totalCount - completedCount}</div>
            </div>
          </div>

          <div className="dashboard-stat-card">
            <div className="stat-icon">⭐</div>
            <div className="stat-content">
              <div className="stat-label">Average Score</div>
              <div className="stat-value">{avgScore}%</div>
            </div>
          </div>
        </div>

        <div className="dashboard-progress">
          <div className="progress-header">
            <span className="progress-label">Overall Progress</span>
            <span className="progress-percent">{Math.round(progressPercent)}%</span>
          </div>
          <div className="progress-bar-bg">
            <motion.div
              className="progress-bar-fill"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              style={{ background: 'linear-gradient(90deg, #4A90D9, #aa3bff)' }}
            />
          </div>
        </div>
      </div>
    </motion.section>
  )
}

function SectionFilter({ sections, activeId, onSelect }) {
  return (
    <div className="section-filter-strip">
      {sections.map(section => (
        <button
          key={section.id}
          className={`section-filter-pill${activeId === section.id ? ' active' : ''}`}
          onClick={() => onSelect(section.id)}
          style={activeId === section.id ? {
            background: section.color,
            borderColor: section.color,
            color: '#fff'
          } : {}}
        >
          <span className="pill-icon">{section.icon}</span>
          <span className="pill-label">{section.label}</span>
        </button>
      ))}
    </div>
  )
}

function MockExamCard({ exam, onStart, requireAuth }) {
  return (
    <motion.div
      className={`mock-exam-card${exam.completed ? ' completed' : ''}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div className="exam-card-header">
        <div className="exam-card-number">Mock {exam.number}</div>
        {exam.completed && <span className="exam-card-badge">✓ Done</span>}
      </div>

      <p className="exam-card-title">{exam.title}</p>
      <p className="exam-card-desc">{exam.description}</p>

      {exam.completed && (
        <div className="exam-card-result">
          <div className="result-row">
            <span className="result-label">Last Score:</span>
            <span className="result-value">{exam.score}%</span>
          </div>
          <div className="result-row">
            <span className="result-label">CLB Score:</span>
            <span className="result-value">CLB {exam.clb}</span>
          </div>
          <div className="result-row small">
            <span className="result-label">Attempted:</span>
            <span className="result-value">{exam.lastAttempt}</span>
          </div>
        </div>
      )}

      <div className="exam-card-footer">
        <span className="difficulty-badge">{exam.difficulty}</span>
        <button
          className={`btn ${exam.completed ? 'btn-outline' : 'btn-primary'}`}
          onClick={() => requireAuth(`Sign in to ${exam.completed ? 'retake' : 'start'} this mock exam`, () => onStart(exam))}
        >
          {exam.completed ? 'Retake →' : 'Start →'}
        </button>
      </div>
    </motion.div>
  )
}

/* ── Main ExamPage ────────────────────────────────────────────── */
export default function ExamPage({ setPage = () => {} }) {
  const { user } = useAuth()
  const [activeSection, setActiveSection] = useState('listening')
  const [authOpen, setAuthOpen] = useState(false)
  const [authReason, setAuthReason] = useState('')
  const [pendingAction, setPendingAction] = useState(null)

  const requireAuth = (reason, action) => {
    if (user) {
      action()
    } else {
      setAuthReason(reason)
      setPendingAction(() => action)
      setAuthOpen(true)
    }
  }

  const handleAuthClose = () => {
    setAuthOpen(false)
    if (user && pendingAction) {
      pendingAction()
      setPendingAction(null)
    }
  }

  const handleStartExam = (exam) => {
    console.log('Starting exam:', exam)
    // TODO: Navigate to exam player or show exam modal
  }

  // Calculate stats
  const completedCount = MOCK_EXAM_SETS.filter(e => e.completed).length
  const avgScore = completedCount > 0
    ? Math.round(MOCK_EXAM_SETS.filter(e => e.completed).reduce((sum, e) => sum + e.score, 0) / completedCount)
    : 0

  return (
    <div className="page-wrap exam-page-wrap">
      <AuthModal isOpen={authOpen} onClose={handleAuthClose} reason={authReason} />

      {/* Hero Section */}
      <section className="exam-hero-section">
        <div className="exam-hero-inner">
          <div className="exam-hero-content">
            <div className="exam-hero-eyebrow">CELPIP Mock Exams</div>
            <h1 className="exam-hero-title">
              Master CELPIP with <span className="highlight">20 full-length mock exams</span>
            </h1>
            <p className="exam-hero-sub">
              Practice exactly like the real test. All 4 sections, real timing, and instant feedback. Progress toward CLB 9 with confidence.
            </p>
          </div>
        </div>
      </section>

      {/* Progress Dashboard */}
      <ProgressDashboard
        completedCount={completedCount}
        totalCount={MOCK_EXAM_SETS.length}
        avgScore={avgScore}
      />

      {/* Section Filter */}
      <section className="exam-section-filter-wrapper">
        <div className="section-filter-header">
          <h2>Filter by Skill</h2>
          <p>Focus on the section you need the most help with</p>
        </div>
        <SectionFilter
          sections={SECTIONS}
          activeId={activeSection}
          onSelect={setActiveSection}
        />
      </section>

      {/* Mock Exam Sets Grid */}
      <section className="exam-sets-section">
        <div className="exam-sets-header">
          <div>
            <h2 className="exam-sets-title">20 Full-Length Mock Exams</h2>
            <p className="exam-sets-subtitle">
              Each mock is a complete simulation of the real CELPIP test with all 4 sections.
              Start with easier warm-up tests and work your way up to advanced difficulty.
            </p>
          </div>
        </div>

        <motion.div
          className="mock-exam-grid"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          {MOCK_EXAM_SETS.map((exam, idx) => (
            <MockExamCard
              key={exam.id}
              exam={exam}
              onStart={handleStartExam}
              requireAuth={requireAuth}
            />
          ))}
        </motion.div>
      </section>

      {/* Info Section */}
      <section className="exam-info-section">
        <div className="info-grid">
          <div className="info-card">
            <div className="info-icon">🎯</div>
            <h3 className="info-title">Real-Time Scoring</h3>
            <p className="info-text">Get instant CLB band scores for each completed mock with detailed section breakdowns.</p>
          </div>

          <div className="info-card">
            <div className="info-icon">📊</div>
            <h3 className="info-title">Track Progress</h3>
            <p className="info-text">Watch your scores improve over time with comprehensive progress analytics and trend charts.</p>
          </div>

          <div className="info-card">
            <div className="info-icon">⏱️</div>
            <h3 className="info-title">Real Timing</h3>
            <p className="info-text">All mocks follow official CELPIP timing and format — prepare exactly like the real exam.</p>
          </div>

          <div className="info-card">
            <div className="info-icon">🎓</div>
            <h3 className="info-title">Smart Explanations</h3>
            <p className="info-text">Review all answers with detailed explanations and sample responses at different CLB levels.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="exam-cta-section">
        <div className="cta-inner">
          <h2>Ready to ace CELPIP?</h2>
          <p>Start with Mock Test 1 or jump to a specific difficulty level.</p>
          <button
            className="btn btn-primary btn-lg"
            onClick={() => requireAuth('Sign in to start a mock exam', () => handleStartExam(MOCK_EXAM_SETS[0]))}
          >
            Start First Mock Test →
          </button>
        </div>
      </section>
    </div>
  )
}
