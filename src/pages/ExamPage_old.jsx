import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import AuthModal from '../components/AuthModal'

/* ── Constants ────────────────────────────────────────────────── */
// 20 mock exam sets
const MOCK_EXAM_SETS = Array.from({ length: 20 }, (_, i) => ({
  id: `mock-${i + 1}`,
  number: i + 1,
  title: `Mock Test ${i + 1}`,
  description: `Full CELPIP simulation with all 4 sections`,
  completed: i < 3 ? true : false, // First 3 are completed
  score: i < 3 ? 80 + Math.floor(Math.random() * 10) : null,
  clb: i < 3 ? Math.floor(7 + Math.random() * 5) : null,
  lastAttempt: i < 3 ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toLocaleDateString() : null,
  difficulty: ['Warm-up', 'Standard', 'Advanced'][Math.floor(Math.random() * 3)],
}))

const SECTIONS = [
  {
    id: 'listening',
    label: 'Listening',
    icon: '�',
    color: '#4A90D9',
    colorLight: '#EEF4FF',
  },
  {
    id: 'reading',
    label: 'Reading',
    icon: '�',
    color: '#2D8A56',
    colorLight: '#F0FDF4',
  },
  {
    id: 'writing',
    label: 'Writing',
    icon: '✍️',
    color: '#C8972A',
    colorLight: '#FFFBEB',
  },
  {
    id: 'speaking',
    label: 'Speaking',
    icon: '🎙️',
    color: '#C8102E',
    colorLight: '#FEF2F2',
  },
]

/* ── Sub-components ────────────────────────────────────────────── */
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

function SectionPill({ section, active, onClick }) {
  return (
    <button
      className={`exam-section-pill${active ? ' active' : ''}`}
      style={active ? { background: section.color, borderColor: section.color, color: '#fff' } : {}}
      onClick={onClick}
    >
      {section.icon} {section.label}
    </button>
  )
}

function SectionCard({ section, onPractice, onMock, isFeatured = false, onFocus }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <motion.div
      className={`exam-section-card${isFeatured ? ' exam-section-card--featured' : ''}`}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{ borderTopColor: section.color }}
      onClick={() => onFocus?.(section.id)}
    >
      {/* Header */}
      <div className="exam-sc-header" style={{ background: section.colorLight }}>
        <span className="exam-sc-icon" style={{ color: section.color }}>{section.icon}</span>
        <div>
          <div className="exam-sc-title" style={{ color: section.color }}>{section.label}</div>
          <div className="exam-sc-meta">{section.parts} parts · {section.duration} · {section.questions} questions</div>
        </div>
        <div className="exam-sc-clb">{section.clbRange}</div>
      </div>

      {/* Description */}
      <p className="exam-sc-desc">{section.description}</p>

      {/* Skills chips */}
      <div className="exam-sc-skills">
        {section.skills.map(sk => (
          <span key={sk} className="exam-sc-skill-chip" style={{ background: section.colorLight, color: section.color }}>
            {sk}
          </span>
        ))}
      </div>

      {/* Parts expand toggle */}
      <button
        className="exam-sc-parts-toggle"
        style={{ color: section.color }}
        onClick={() => setExpanded(e => !e)}
      >
        {expanded ? '▲ Hide parts' : `▼ See all ${section.parts} parts`}
      </button>

      {/* Expanded parts list */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            className="exam-sc-parts-list"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
          >
            {section.partDetails.map(p => (
              <div key={p.num} className="exam-sc-part-row">
                <span className="exam-sc-part-num" style={{ background: section.color + '18', color: section.color }}>{p.num}</span>
                <div className="exam-sc-part-info">
                  <div className="exam-sc-part-name">{p.name}</div>
                  <div className="exam-sc-part-desc">{p.desc}</div>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actions */}
      <div className="exam-sc-actions">
        <button
          className="btn btn-outline exam-sc-btn"
          style={{ borderColor: section.color + '60', color: section.color }}
          onClick={() => onPractice(section)}
        >
          ⚡ Quick Drill
        </button>
        <button
          className="btn btn-primary exam-sc-btn"
          style={{ background: section.color, borderColor: section.color }}
          onClick={() => onMock(section)}
        >
          📋 Section Mock
        </button>
      </div>
    </motion.div>
  )
}

function ModeCard({ mode, onStart }) {
  return (
    <motion.div
      className={`exam-mode-card${mode.locked ? ' exam-mode-card--locked' : ''}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="exam-mode-header">
        <span className="exam-mode-icon">{mode.icon}</span>
        <div className="exam-mode-title">{mode.label}</div>
        {mode.badge && (
          <span className="exam-mode-badge" style={{ background: mode.badgeColor + '22', color: mode.badgeColor, border: `1px solid ${mode.badgeColor}40` }}>
            {mode.badge}
          </span>
        )}
      </div>
      <p className="exam-mode-desc">{mode.description}</p>
      <div className="exam-mode-includes">
        {mode.includes.map(item => (
          <div key={item} className="exam-mode-include-row">
            <span className="exam-mode-check">✓</span> {item}
          </div>
        ))}
      </div>
      <div className="exam-mode-footer">
        <span className="exam-mode-duration">⏱ {mode.duration}</span>
        <button
          className={`btn ${mode.locked ? 'btn-outline' : 'btn-primary'} exam-mode-cta`}
          onClick={() => onStart(mode)}
          disabled={mode.locked}
        >
          {mode.locked ? '🔒 Unlock Pro' : mode.cta}
        </button>
      </div>
    </motion.div>
  )
}

/* ── Learning Tab ─────────────────────────────────────────────── */
function LearningCard({ section }) {
  const [open, setOpen] = useState(null) // 'scoring' | 'prep' | 'time'

  const toggle = (key) => setOpen(o => o === key ? null : key)

  const accordion = [
    {
      key: 'what',
      icon: '📋',
      title: `What the ${section.label} test includes`,
      content: section.description,
    },
    {
      key: 'scoring',
      icon: '📊',
      title: 'How scoring works',
      content: section.scoring,
    },
    {
      key: 'prep',
      icon: '💡',
      title: 'How to prepare',
      content: section.prepTip,
    },
    {
      key: 'time',
      icon: '⏱',
      title: 'Time guide',
      content: section.timeGuide,
    },
  ]

  return (
    <motion.div
      className="learn-card"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{ borderTopColor: section.color }}
    >
      {/* Header */}
      <div className="learn-card-header" style={{ background: section.colorLight }}>
        <span className="learn-card-icon" style={{ color: section.color }}>{section.icon}</span>
        <div>
          <div className="learn-card-title" style={{ color: section.color }}>{section.label}</div>
          <div className="learn-card-meta">{section.parts} parts · {section.duration}</div>
        </div>
      </div>

      {/* Parts quick-list */}
      <div className="learn-parts-grid">
        {section.partDetails.map(p => (
          <div key={p.num} className="learn-part-chip" style={{ background: section.color + '12', color: section.color, borderColor: section.color + '30' }}>
            <span className="learn-part-num">{p.num}</span>
            <span className="learn-part-name">{p.name}</span>
          </div>
        ))}
      </div>

      {/* Accordion info */}
      <div className="learn-accordion">
        {accordion.map(item => (
          <div key={item.key} className="learn-acc-item">
            <button
              className="learn-acc-trigger"
              onClick={() => toggle(item.key)}
              style={{ color: open === item.key ? section.color : undefined }}
            >
              <span className="learn-acc-icon">{item.icon}</span>
              <span className="learn-acc-label">{item.title}</span>
              <span className="learn-acc-chevron" style={{ transform: open === item.key ? 'rotate(180deg)' : 'rotate(0deg)' }}>▾</span>
            </button>
            <AnimatePresence>
              {open === item.key && (
                <motion.div
                  className="learn-acc-body"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.22 }}
                >
                  <p>{item.content}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

/* ── Mock Test Canvas (placeholder) ──────────────────────────── */
function MockTestCanvas({ section, mode, onExit }) {
  const [started, setStarted] = useState(false)
  const sectionData = section || SECTIONS[0]

  return (
    <div className="exam-test-canvas">

      {/* Top bar */}
      <div className="exam-topbar">
        <button className="exam-topbar-exit" onClick={onExit}>← Exit Test</button>
        <div className="exam-topbar-title">
          {sectionData.icon} {mode?.id === 'full_mock' ? 'Full Mock Test' : `${sectionData.label} — Section Mock`}
        </div>
        <div className="exam-topbar-timer">
          <span className="exam-timer-dot" />
          <span className="exam-timer-label">00:00</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="exam-progress-bar">
        <div className="exam-progress-fill" style={{ width: '0%', background: sectionData.color }} />
      </div>

      {!started ? (
        /* ── Pre-test briefing ── */
        <div className="exam-briefing">
          <div className="exam-briefing-inner">
            <div className="exam-briefing-icon">{sectionData.icon}</div>
            <h2 className="exam-briefing-title">
              {mode?.id === 'full_mock' ? 'Full CELPIP Mock Test' : `${sectionData.label} Test`}
            </h2>
            <p className="exam-briefing-sub">Read the instructions carefully before you begin.</p>

            <div className="exam-briefing-rules">
              {[
                `${sectionData.parts} parts · ${sectionData.questions} questions`,
                `Time allowed: ${sectionData.duration}`,
                'You cannot pause the timer once started',
                'Read each question carefully before answering',
                mode?.id !== 'full_mock' && 'Score report shown at the end',
              ].filter(Boolean).map((rule, i) => (
                <div key={i} className="exam-briefing-rule">
                  <span className="exam-briefing-bullet" style={{ background: sectionData.color }} />
                  {rule}
                </div>
              ))}
            </div>

            <div className="exam-briefing-parts">
              <div className="exam-briefing-parts-title">Sections in this test</div>
              <div className="exam-briefing-parts-grid">
                {(mode?.id === 'full_mock' ? SECTIONS : [sectionData]).map(s => (
                  <div key={s.id} className="exam-briefing-part-chip" style={{ background: s.colorLight, color: s.color, borderColor: s.color + '30' }}>
                    {s.icon} {s.label}
                  </div>
                ))}
              </div>
            </div>

            <button
              className="btn btn-primary exam-briefing-start"
              style={{ background: sectionData.color, borderColor: sectionData.color }}
              onClick={() => setStarted(true)}
            >
              ▶ Begin Test
            </button>
          </div>
        </div>
      ) : (
        /* ── Test body placeholder ── */
        <div className="exam-body">
          <div className="exam-sidebar">
            <div className="exam-sidebar-title">Navigation</div>
            <div className="exam-sidebar-parts">
              {Array.from({ length: sectionData.parts }, (_, i) => (
                <div key={i} className={`exam-sidebar-part${i === 0 ? ' active' : ''}`}
                  style={i === 0 ? { background: sectionData.color + '18', borderColor: sectionData.color, color: sectionData.color } : {}}>
                  Part {i + 1}
                </div>
              ))}
            </div>
            <div className="exam-sidebar-divider" />
            <div className="exam-sidebar-progress">
              <div className="exam-sidebar-prog-label">Progress</div>
              <div className="exam-sidebar-prog-track">
                <div className="exam-sidebar-prog-fill" style={{ width: '8%', background: sectionData.color }} />
              </div>
              <div className="exam-sidebar-prog-text">1 / {sectionData.questions}</div>
            </div>
          </div>

          <div className="exam-content-area">
            {/* Question header */}
            <div className="exam-q-header">
              <span className="exam-q-part" style={{ background: sectionData.colorLight, color: sectionData.color }}>
                Part 1
              </span>
              <span className="exam-q-num">Question 1 of {sectionData.questions}</span>
            </div>

            {/* Stimulus placeholder */}
            <div className="exam-stimulus-placeholder">
              <div className="exam-placeholder-inner">
                <span className="exam-placeholder-icon">{sectionData.icon}</span>
                <div className="exam-placeholder-title">Question content goes here</div>
                <div className="exam-placeholder-sub">
                  {sectionData.id === 'listening' && 'Audio player + transcript will appear here'}
                  {sectionData.id === 'reading'   && 'Reading passage or email will appear here'}
                  {sectionData.id === 'writing'   && 'Writing prompt and email will appear here'}
                  {sectionData.id === 'speaking'  && 'Image or conversation prompt will appear here'}
                </div>
              </div>
            </div>

            {/* Answer area placeholder */}
            {(sectionData.id === 'listening' || sectionData.id === 'reading') && (
              <div className="exam-options-placeholder">
                {['A', 'B', 'C', 'D'].map(l => (
                  <div key={l} className="exam-option-placeholder">
                    <span className="exam-option-letter">{l}</span>
                    <div className="exam-option-text-placeholder" />
                  </div>
                ))}
              </div>
            )}
            {sectionData.id === 'writing' && (
              <div className="exam-writing-placeholder">
                <div className="exam-writing-toolbar">
                  <span className="exam-writing-meta">Word limit: 150–200 words</span>
                  <span className="exam-writing-meta">Time: 27 min</span>
                </div>
                <div className="exam-writing-area-placeholder">
                  Text editor will go here — word count, formatting toolbar
                </div>
              </div>
            )}
            {sectionData.id === 'speaking' && (
              <div className="exam-speaking-placeholder">
                <div className="exam-speaking-phases">
                  <div className="exam-speaking-phase">
                    <span className="exam-speaking-phase-label">Prep Time</span>
                    <span className="exam-speaking-phase-val">30s</span>
                  </div>
                  <div className="exam-speaking-phase exam-speaking-phase--active">
                    <span className="exam-speaking-phase-label">Speaking</span>
                    <span className="exam-speaking-phase-val">60s</span>
                  </div>
                </div>
                <div className="exam-mic-placeholder">🎙️ Microphone recorder will go here</div>
              </div>
            )}

            {/* Nav controls */}
            <div className="exam-nav-controls">
              <button className="btn btn-outline exam-nav-btn" disabled>← Previous</button>
              <div className="exam-nav-dots">
                {Array.from({ length: Math.min(8, sectionData.questions) }, (_, i) => (
                  <span key={i} className={`exam-nav-dot${i === 0 ? ' active' : ''}`}
                    style={i === 0 ? { background: sectionData.color } : {}} />
                ))}
                {sectionData.questions > 8 && <span className="exam-nav-more">+{sectionData.questions - 8}</span>}
              </div>
              <button className="btn btn-primary exam-nav-btn"
                style={{ background: sectionData.color, borderColor: sectionData.color }}>
                Next →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Score Report placeholder ─────────────────────────────────── */
function ScoreReport({ section, onRetry, onHome }) {
  const sectionData = section || SECTIONS[0]
  return (
    <div className="exam-report">
      <div className="exam-report-header">
        <div className="exam-report-icon">🏆</div>
        <h2 className="exam-report-title">Test Complete!</h2>
        <p className="exam-report-sub">Here's your performance summary.</p>
      </div>

      <div className="exam-report-scores">
        {(section ? [sectionData] : SECTIONS).map(s => (
          <div key={s.id} className="exam-report-score-card" style={{ borderTopColor: s.color }}>
            <div className="exam-report-score-header" style={{ background: s.colorLight }}>
              <span style={{ color: s.color }}>{s.icon} {s.label}</span>
            </div>
            <div className="exam-report-score-body">
              <div className="exam-report-clb-placeholder" style={{ color: s.color }}>CLB —</div>
              <div className="exam-report-pct-placeholder">Score will appear here</div>
              <div className="exam-report-bar-placeholder">
                <div style={{ width: '0%', background: s.color, height: '100%', borderRadius: 99 }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="exam-report-actions">
        <button className="btn btn-outline" onClick={onRetry}>↺ Retake Test</button>
        <button className="btn btn-primary" onClick={onHome}>← Back to Exam Hub</button>
      </div>
    </div>
  )
}

/* ── Main ExamPage ─────────────────────────────────────────────── */
export default function ExamPage({ setPage = () => {} }) {
  const { user } = useAuth()

  const [view, setView] = useState('lobby')       // 'lobby' | 'test' | 'report'
  const [focusedSectionId, setFocusedSectionId] = useState(SECTIONS[0].id)
  const [selectedSection, setSelectedSection] = useState(null)
  const [selectedMode, setSelectedMode]       = useState(null)

  // Auth modal state
  const [authOpen, setAuthOpen]       = useState(false)
  const [authReason, setAuthReason]   = useState('')
  const [pendingAction, setPendingAction] = useState(null)

  // If user just logged in and there's a pending action, run it
  const requireAuth = (reason, action) => {
    if (user) {
      action()
    } else {
      setAuthReason(reason)
      setPendingAction(() => action)
      setAuthOpen(true)
    }
  }

  // When modal closes, if user is now logged in run the pending action
  const handleAuthClose = () => {
    setAuthOpen(false)
    if (user && pendingAction) {
      pendingAction()
      setPendingAction(null)
    }
  }

  const handleStartMock = (section) => {
    requireAuth('Sign in to start a Section Mock Test', () => {
      setSelectedSection(section)
      setSelectedMode(TEST_MODES.find(m => m.id === 'section_mock'))
      setView('test')
    })
  }
  const handleStartDrill = (section) => {
    requireAuth('Sign in to track your drill progress', () => {
      setSelectedSection(section)
      setSelectedMode(TEST_MODES.find(m => m.id === 'quick_drill'))
      setView('test')
    })
  }
  const handleModeStart = (mode) => {
    if (mode.locked) return
    requireAuth(`Sign in to start ${mode.label}`, () => {
      setSelectedMode(mode)
      setSelectedSection(mode.id === 'full_mock' ? null : SECTIONS[0])
      setView('test')
    })
  }

  const focusedSection = SECTIONS.find(section => section.id === focusedSectionId) || SECTIONS[0]
  const orderedSections = [
    focusedSection,
    ...SECTIONS.filter(section => section.id !== focusedSection.id),
  ]
  const modePreviewCards = TEST_MODES.filter(mode => !mode.locked).slice(0, 3)

  const scrollToSections = () => {
    document.getElementById('exam-section-explorer')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }

  return (
    <div className="page-wrap exam-page-wrap">
      {/* Auth modal — soft gate */}
      <AuthModal isOpen={authOpen} onClose={handleAuthClose} reason={authReason} />

      <AnimatePresence mode="wait">

        {/* ── LOBBY ── */}
        {view === 'lobby' && (
          <motion.div key="lobby"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}>

            <div className="exam-lobby-shell">
              {/* Hero header */}
              <section className="exam-hero">
                <div className="exam-hero-inner exam-hero-grid">
                  <div className="exam-hero-copy">
                    <div className="exam-hero-eyebrow">CELPIP Mock Exams</div>
                    <h1 className="exam-hero-title">
                      Practice with a <span className="exam-hero-highlight">clean, test-day ready</span> exam hub
                    </h1>
                    <p className="exam-hero-sub">
                      Full mock tests, section drills, and AI feedback in one place. The structure feels closer to a polished exam catalog, while the visuals stay aligned with your current CELPIPace brand.
                    </p>
                    <div className="exam-hero-actions">
                      <button className="btn btn-primary btn-lg" onClick={() => handleModeStart(TEST_MODES[0])}>
                        🏆 Start Full Mock Test
                      </button>
                      <button className="btn btn-outline btn-lg" onClick={scrollToSections}>
                        Explore Sections
                      </button>
                    </div>
                    <div className="exam-hero-trust">
                      <span>20 parts across all 4 CELPIP skills</span>
                      <span>Instant drill access + section mocks</span>
                      <span>Built to help you push toward CLB 9</span>
                    </div>
                    <div className="exam-hero-pills">
                      {SECTIONS.map(section => (
                        <SectionPill
                          key={section.id}
                          section={section}
                          active={section.id === focusedSection.id}
                          onClick={() => setFocusedSectionId(section.id)}
                        />
                      ))}
                    </div>
                  </div>

                  <motion.div
                    className="exam-hero-preview"
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                  >
                    <div className="exam-preview-card">
                      <div className="exam-preview-top">
                        <span className="exam-preview-badge">Live Preview</span>
                        <span className="exam-preview-status">Mock catalog</span>
                      </div>

                      <div className="exam-preview-body">
                        <div className="exam-preview-sidebar">
                          {modePreviewCards.map(mode => (
                            <div key={mode.id} className="exam-preview-mode">
                              <span className="exam-preview-mode-icon">{mode.icon}</span>
                              <div>
                                <div className="exam-preview-mode-title">{mode.label}</div>
                                <div className="exam-preview-mode-meta">{mode.duration}</div>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="exam-preview-main">
                          <div className="exam-preview-header">
                            <div>
                              <div className="exam-preview-title">{focusedSection.icon} {focusedSection.label}</div>
                              <div className="exam-preview-meta">{focusedSection.parts} parts · {focusedSection.questions} questions · {focusedSection.duration}</div>
                            </div>
                            <div className="exam-preview-score">{focusedSection.clbRange}</div>
                          </div>

                          <div className="exam-preview-progress">
                            <div className="exam-preview-progress-labels">
                              <span>Exam readiness</span>
                              <span>72%</span>
                            </div>
                            <div className="exam-preview-progress-bar">
                              <div className="exam-preview-progress-fill" style={{ width: '72%', background: focusedSection.color }} />
                            </div>
                          </div>

                          <div className="exam-preview-task-list">
                            {focusedSection.partDetails.slice(0, 3).map(part => (
                              <div key={part.num} className="exam-preview-task">
                                <span className="exam-preview-task-chip" style={{ background: focusedSection.colorLight, color: focusedSection.color }}>
                                  {part.num}
                                </span>
                                <div>
                                  <div className="exam-preview-task-title">{part.name}</div>
                                  <div className="exam-preview-task-copy">{part.desc}</div>
                                </div>
                              </div>
                            ))}
                          </div>

                          <button
                            className="btn btn-primary exam-preview-action"
                            style={{ background: focusedSection.color, borderColor: focusedSection.color }}
                            onClick={() => handleStartMock(focusedSection)}
                          >
                            Start {focusedSection.label} Mock
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </section>

              {/* Stats */}
              <StatStrip />

              <section className="exam-lobby-section">
                <div className="exam-section-head">
                  <div>
                    <div className="exam-section-kicker">Practice Modes</div>
                    <h2 className="exam-section-heading">Choose how you want to train</h2>
                    <p className="exam-section-copy">
                      A cleaner card-based layout similar to the reference site, but tuned to your existing navigation and mock-test flow.
                    </p>
                  </div>
                </div>

                <motion.div
                  className="exam-mode-grid"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {TEST_MODES.map(m => (
                    <ModeCard key={m.id} mode={m} onStart={handleModeStart} />
                  ))}
                </motion.div>
              </section>

              <section className="exam-lobby-section exam-sections-shell" id="exam-section-explorer">
                <div className="exam-section-intro-card">
                  <div className="exam-section-intro-eyebrow">Section Explorer</div>
                  <h2 className="exam-section-intro-title">Jump into the section that needs the most work</h2>
                  <p className="exam-section-intro-copy">
                    Focus a skill, preview its parts, and launch either a quick drill or a full section mock from the same place.
                  </p>

                  <div className="exam-section-intro-list">
                    <div className="exam-section-intro-item">Current focus: <strong>{focusedSection.label}</strong></div>
                    <div className="exam-section-intro-item">{focusedSection.parts} parts and {focusedSection.questions} questions</div>
                    <div className="exam-section-intro-item">{focusedSection.timeGuide}</div>
                  </div>

                  <div className="exam-section-intro-tip">
                    <span>Prep tip</span>
                    <p>{focusedSection.prepTip}</p>
                  </div>

                  <div className="exam-section-intro-actions">
                    <button className="btn btn-primary" onClick={() => handleStartMock(focusedSection)}>
                      📋 Start {focusedSection.label} Mock
                    </button>
                    <button className="btn btn-outline" onClick={() => handleStartDrill(focusedSection)}>
                      ⚡ Quick Drill
                    </button>
                  </div>
                </div>

                <div className="exam-section-explorer">
                  <div className="exam-section-pill-row">
                    {SECTIONS.map(section => (
                      <SectionPill
                        key={section.id}
                        section={section}
                        active={section.id === focusedSection.id}
                        onClick={() => setFocusedSectionId(section.id)}
                      />
                    ))}
                  </div>

                  <motion.div
                    className="exam-section-grid"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {orderedSections.map(s => (
                      <SectionCard
                        key={s.id}
                        section={s}
                        isFeatured={s.id === focusedSection.id}
                        onFocus={setFocusedSectionId}
                        onPractice={handleStartDrill}
                        onMock={handleStartMock}
                      />
                    ))}
                  </motion.div>
                </div>
              </section>

              <section className="exam-lobby-section">
                <div className="exam-section-head">
                  <div>
                    <div className="exam-section-kicker">Learning Hub</div>
                    <h2 className="exam-section-heading">Know what each section is actually testing</h2>
                    <p className="exam-section-copy">
                      You already had strong learning content here, so I kept it and placed it in a cleaner editorial-style section below the mock catalog.
                    </p>
                  </div>
                </div>

                <div className="learn-grid">
                  {SECTIONS.map(s => (
                    <LearningCard key={s.id} section={s} />
                  ))}
                </div>
              </section>

              <section className="exam-lobby-section exam-clb-strip">
                <div className="exam-section-head exam-section-head--tight">
                  <div>
                    <div className="exam-section-kicker">CLB Reference</div>
                    <h2 className="exam-section-heading">A quick score target guide</h2>
                  </div>
                  <button className="btn btn-outline" onClick={() => setPage('scores')}>
                    View Score Guide
                  </button>
                </div>

                <div className="exam-clb-table">
                  {[
                    { clb:'4–5', label:'Below avg', color:'#DC2626', desc:'Needs significant improvement' },
                    { clb:'6',   label:'Developing', color:'#C8972A', desc:'Approaching minimum standard' },
                    { clb:'7',   label:'Adequate',   color:'#C8972A', desc:'Minimum for most programs' },
                    { clb:'8',   label:'Good',        color:'#2D8A56', desc:'Competitive for Express Entry' },
                    { clb:'9',   label:'Strong',      color:'#2D8A56', desc:'Target level — maximum lang pts' },
                    { clb:'10+', label:'Excellent',   color:'#0F6B8A', desc:'Near-maximum CRS language points' },
                  ].map(row => (
                    <div key={row.clb} className="exam-clb-row">
                      <span className="exam-clb-num" style={{ color: row.color, borderColor: row.color + '40', background: row.color + '10' }}>CLB {row.clb}</span>
                      <span className="exam-clb-level" style={{ color: row.color }}>{row.label}</span>
                      <span className="exam-clb-desc">{row.desc}</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>

          </motion.div>
        )}

        {/* ── TEST CANVAS ── */}
        {view === 'test' && (
          <motion.div key="test"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}>
            <MockTestCanvas
              section={selectedSection}
              mode={selectedMode}
              onExit={() => setView('lobby')}
            />
          </motion.div>
        )}

        {/* ── SCORE REPORT ── */}
        {view === 'report' && (
          <motion.div key="report"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}>
            <ScoreReport
              section={selectedSection}
              onRetry={() => setView('test')}
              onHome={() => setView('lobby')}
            />
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  )
}
