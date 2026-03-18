import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/* ── Constants ────────────────────────────────────────────────── */
const SECTIONS = [
  {
    id: 'listening',
    label: 'Listening',
    icon: '🎧',
    color: '#4A90D9',
    colorLight: '#EEF4FF',
    parts: 6,
    duration: '47–55 min',
    questions: 38,
    description: 'Listen to conversations, news items, and interviews. Answer multiple-choice questions.',
    skills: ['Short conversations', 'News reports', 'Discussions', 'Workplace talks'],
    clbRange: 'CLB 4–12',
  },
  {
    id: 'reading',
    label: 'Reading',
    icon: '📖',
    color: '#2D8A56',
    colorLight: '#F0FDF4',
    parts: 4,
    duration: '55–60 min',
    questions: 38,
    description: 'Read correspondence, diagrams, reports, and viewpoints. Answer multiple-choice questions.',
    skills: ['Email/correspondence', 'Diagrams & forms', 'Reports', 'Viewpoints'],
    clbRange: 'CLB 4–12',
  },
  {
    id: 'writing',
    label: 'Writing',
    icon: '✍️',
    color: '#C8972A',
    colorLight: '#FFFBEB',
    parts: 2,
    duration: '53–60 min',
    questions: 2,
    description: 'Write an email response and a survey-style opinion essay. Scored on content, vocabulary, and organization.',
    skills: ['Email writing', 'Opinion essay', 'Vocabulary range', 'Sentence structure'],
    clbRange: 'CLB 4–12',
  },
  {
    id: 'speaking',
    label: 'Speaking',
    icon: '🎙️',
    color: '#C8102E',
    colorLight: '#FEF2F2',
    parts: 8,
    duration: '15–22 min',
    questions: 8,
    description: 'Respond to images, conversations, and real-world scenarios. Scored on fluency, vocabulary, and coherence.',
    skills: ['Picture description', 'Daily conversations', 'Advice giving', 'Story narration'],
    clbRange: 'CLB 4–12',
  },
]

const TEST_MODES = [
  {
    id: 'full_mock',
    label: 'Full Mock Test',
    icon: '🏆',
    badge: 'Most Popular',
    badgeColor: '#C8972A',
    description: 'Simulate the real exam with all 4 sections, real timing, and a full score report at the end.',
    duration: '~3 hrs',
    includes: ['All 4 sections', 'Real-time countdown', 'Score + CLB report', 'Section breakdown'],
    cta: 'Start Full Mock',
    locked: false,
  },
  {
    id: 'section_mock',
    label: 'Section Mock',
    icon: '📋',
    badge: null,
    description: 'Practice one full section at a time with real timing and part-by-part score analysis.',
    duration: '15–60 min',
    includes: ['Single section', 'Real timing per part', 'Part-wise score', 'Review mode'],
    cta: 'Choose Section',
    locked: false,
  },
  {
    id: 'quick_drill',
    label: 'Quick Drill',
    icon: '⚡',
    badge: 'Untimed',
    badgeColor: '#4A90D9',
    description: 'Practice specific question types at your own pace. No time pressure — focus on accuracy.',
    duration: 'Your pace',
    includes: ['Choose question type', 'Immediate feedback', 'Explanations', 'Unlimited attempts'],
    cta: 'Start Drill',
    locked: false,
  },
  {
    id: 'ai_feedback',
    label: 'AI Scoring',
    icon: '🤖',
    badge: 'Pro',
    badgeColor: '#9B59B6',
    description: 'Submit Writing & Speaking responses and get instant AI-powered CLB-band feedback.',
    duration: 'On demand',
    includes: ['Writing evaluation', 'Speaking feedback', 'Band score per criterion', 'Improvement tips'],
    cta: 'Get AI Feedback',
    locked: true,
  },
]

/* ── Stat badges on top ────────────────────────────────────────── */
const STATS = [
  { label: 'Questions', value: '1,200+', icon: '📝' },
  { label: 'Mock Tests', value: '12',    icon: '🏆' },
  { label: 'Sections',  value: '4',      icon: '📚' },
  { label: 'Avg. Improvement', value: '+1.8 CLB', icon: '📈' },
]

/* ── Sub-components ────────────────────────────────────────────── */
function StatStrip() {
  return (
    <div className="exam-stat-strip">
      {STATS.map(s => (
        <div key={s.label} className="exam-stat-chip">
          <span className="exam-stat-icon">{s.icon}</span>
          <div>
            <div className="exam-stat-value">{s.value}</div>
            <div className="exam-stat-label">{s.label}</div>
          </div>
        </div>
      ))}
    </div>
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

function SectionCard({ section, onPractice, onMock }) {
  return (
    <motion.div
      className="exam-section-card"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{ borderTopColor: section.color }}
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
  const [view, setView] = useState('lobby')       // 'lobby' | 'test' | 'report'
  const [activeTab, setActiveTab] = useState('sections') // 'sections' | 'modes'
  const [selectedSection, setSelectedSection] = useState(null)
  const [selectedMode, setSelectedMode]       = useState(null)

  const handleStartMock = (section) => {
    setSelectedSection(section)
    setSelectedMode(TEST_MODES.find(m => m.id === 'section_mock'))
    setView('test')
  }
  const handleStartDrill = (section) => {
    setSelectedSection(section)
    setSelectedMode(TEST_MODES.find(m => m.id === 'quick_drill'))
    setView('test')
  }
  const handleModeStart = (mode) => {
    if (mode.locked) return
    setSelectedMode(mode)
    setSelectedSection(mode.id === 'full_mock' ? null : SECTIONS[0])
    setView('test')
  }

  return (
    <div className="page-wrap exam-page-wrap">
      <AnimatePresence mode="wait">

        {/* ── LOBBY ── */}
        {view === 'lobby' && (
          <motion.div key="lobby"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}>

            {/* Hero header */}
            <div className="exam-hero">
              <div className="exam-hero-inner">
                <div className="exam-hero-eyebrow">CELPIP Practice Platform</div>
                <h1 className="exam-hero-title">
                  Real exam experience,<br />
                  <span className="exam-hero-highlight">anytime you practice</span>
                </h1>
                <p className="exam-hero-sub">
                  Full mock tests, section drills, and AI scoring — everything you need to reach CLB 9.
                </p>
                <div className="exam-hero-actions">
                  <button className="btn btn-primary btn-lg" onClick={() => handleModeStart(TEST_MODES[0])}>
                    🏆 Start Full Mock Test
                  </button>
                  <button className="btn btn-outline btn-lg" onClick={() => setActiveTab('sections')}>
                    ⚡ Section Drill
                  </button>
                </div>
              </div>
            </div>

            {/* Stats */}
            <StatStrip />

            {/* Tab switcher */}
            <div className="exam-tab-bar">
              <button
                className={`exam-tab${activeTab === 'sections' ? ' active' : ''}`}
                onClick={() => setActiveTab('sections')}>
                📚 Practice by Section
              </button>
              <button
                className={`exam-tab${activeTab === 'modes' ? ' active' : ''}`}
                onClick={() => setActiveTab('modes')}>
                🎯 Test Modes
              </button>
            </div>

            {/* Section cards */}
            {activeTab === 'sections' && (
              <motion.div key="sections"
                className="exam-section-grid"
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}>
                {SECTIONS.map(s => (
                  <SectionCard
                    key={s.id}
                    section={s}
                    onPractice={handleStartDrill}
                    onMock={handleStartMock}
                  />
                ))}
              </motion.div>
            )}

            {/* Mode cards */}
            {activeTab === 'modes' && (
              <motion.div key="modes"
                className="exam-mode-grid"
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}>
                {TEST_MODES.map(m => (
                  <ModeCard key={m.id} mode={m} onStart={handleModeStart} />
                ))}
              </motion.div>
            )}

            {/* CLB info strip */}
            <div className="exam-clb-strip">
              <div className="exam-clb-strip-title">CLB Score Reference</div>
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
