import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AuthModal from '../components/AuthModal'

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
    description: 'The CELPIP Listening test has 6 parts. All audio uses Canadian English accents and reflects real-life situations. Every question is multiple choice, and each clip plays only once on the real test.',
    skills: ['Problem Solving', 'Daily Life Conversation', 'Information', 'News Item', 'Discussion', 'Viewpoints'],
    clbRange: 'CLB 4–12',
    partDetails: [
      { num: 'L1', name: 'Problem Solving', desc: 'A conversation between two people working through a problem. Tests comprehension of solutions and decisions.' },
      { num: 'L2', name: 'Daily Life Conversation', desc: 'A phone call, workplace chat, or everyday exchange. Focuses on main ideas and specific details.' },
      { num: 'L3', name: 'Information', desc: 'A longer informational passage on a general topic. Tests detail comprehension and inference.' },
      { num: 'L4', name: 'News Item', desc: 'A news-style broadcast similar to Canadian radio or TV. Tests understanding of facts, events, and opinions.' },
      { num: 'L5', name: 'Discussion', desc: 'Multiple speakers sharing different perspectives on a topic. Requires identifying who said what.' },
      { num: 'L6', name: 'Viewpoints', desc: 'Two contrasting viewpoints on a single topic. Tests ability to distinguish and compare positions.' },
    ],
    scoring: 'Scores are on the CLB scale (1–12). Express Entry requires CLB 7 minimum. CLB 9+ in all skills earns maximum CRS language points.',
    prepTip: 'Read each question before the audio plays so you know what to listen for. Take short notes during longer passages to capture names, numbers, and key details.',
    timeGuide: '47–55 minutes total. Each audio clip plays once — you cannot replay on the real test.',
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
    description: 'The CELPIP Reading test has 4 parts covering emails, diagrams, informational passages, and viewpoints. All passages use Canadian English and cover practical everyday topics.',
    skills: ['Correspondence', 'Apply a Diagram', 'Information', 'Viewpoints'],
    clbRange: 'CLB 4–12',
    partDetails: [
      { num: 'R1', name: 'Correspondence', desc: 'Comprehend everyday emails and letters. Tests your ability to identify tone, purpose, and key details in written correspondence.' },
      { num: 'R2', name: 'Apply a Diagram', desc: 'Extract and apply information from diagrams, charts, or schedules. Tests practical reading and data interpretation.' },
      { num: 'R3', name: 'Information', desc: 'A longer informational passage on a general topic. Tests both direct comprehension and inference from the text.' },
      { num: 'R4', name: 'Viewpoints', desc: 'Multiple viewpoints on a single topic. Tests your ability to identify, distinguish, and compare different opinions.' },
    ],
    scoring: 'Scored on CLB 1–12. CLB 7 required for Express Entry. CLB 4 for citizenship. Provincial programs typically require CLB 5–7.',
    prepTip: 'Read the questions before the passage so you know what information to look for. Focus on inference questions — these cause the most errors.',
    timeGuide: 'Roughly 11 min for R1 · 13 min for R2 · 14 min for R3 · 17 min for R4. You manage your own time across all 4 parts.',
  },
  {
    id: 'writing',
    label: 'Writing',
    icon: '✍️',
    color: '#C8972A',
    colorLight: '#FFFBEB',
    parts: 2,
    duration: '53 min',
    questions: 2,
    description: 'The CELPIP Writing test has 2 tasks. Both expect 150–200 words, typed on a computer. You are scored on content, vocabulary, readability, and task fulfillment.',
    skills: ['Writing an Email', 'Survey Questions'],
    clbRange: 'CLB 4–12',
    partDetails: [
      { num: 'W1', name: 'Writing an Email', desc: '27 minutes. Write an email responding to a specific scenario. Can be formal (complaint, request) or informal depending on who you\'re writing to. Address every bullet point in the prompt.' },
      { num: 'W2', name: 'Survey Questions', desc: '26 minutes. Choose a position on a topic and defend your opinion with supporting arguments. Pick one clear position and stick with it — avoid sitting on the fence.' },
    ],
    scoring: 'Scored on 4 criteria: content & coherence, vocabulary range, readability (grammar/spelling/sentences), and task fulfillment. CLB 1–12.',
    prepTip: 'For W1, address every bullet point and match tone to the scenario. For W2, pick one clear position and support it with specific reasons — never switch mid-response.',
    timeGuide: 'W1: 27 minutes · W2: 26 minutes. You manage your own time within each task window.',
  },
  {
    id: 'speaking',
    label: 'Speaking',
    icon: '🎙️',
    color: '#C8102E',
    colorLight: '#FEF2F2',
    parts: 8,
    duration: '15–20 min',
    questions: 8,
    description: 'The CELPIP Speaking test has 8 tasks measuring your ability to communicate clearly. Each task gives 30–60 seconds prep time and 60–90 seconds to record your spoken response.',
    skills: ['Giving Advice', 'Personal Experience', 'Describing a Scene', 'Making Predictions', 'Comparing & Persuading', 'Difficult Situation', 'Expressing Opinions', 'Unusual Situation'],
    clbRange: 'CLB 4–12',
    partDetails: [
      { num: 'S1', name: 'Giving Advice', desc: 'Give advice in a personal scenario. Be direct, structured, and cover the specific points asked.' },
      { num: 'S2', name: 'Personal Experience', desc: 'Talk about a personal experience. Use clear examples and connect them to the question.' },
      { num: 'S3', name: 'Describing a Scene', desc: 'Describe an image in detail — people, setting, activities, and atmosphere.' },
      { num: 'S4', name: 'Making Predictions', desc: 'Make predictions about a future situation shown or described in the prompt.' },
      { num: 'S5', name: 'Comparing & Persuading', desc: 'Compare two options and persuade someone to choose one. Support your position with reasons.' },
      { num: 'S6', name: 'Difficult Situation', desc: 'Describe how you would handle a difficult real-life scenario. Stay calm and practical.' },
      { num: 'S7', name: 'Expressing Opinions', desc: 'Express and defend an opinion on a topic. Acknowledge the other side, then argue your position.' },
      { num: 'S8', name: 'Unusual Situation', desc: 'Describe an unusual situation and how you would react or resolve it.' },
    ],
    scoring: 'Scored on 4 criteria: coherence, vocabulary range, listenability (pronunciation, pace, clarity), and task fulfillment. CLB 9+ earns 136 max CRS language points.',
    prepTip: 'The most common reason for low scores is not fully answering every part of the prompt. Use prep time to plan: opening statement → supporting points → conclusion.',
    timeGuide: '30–60 seconds prep time · 60–90 seconds speaking time per task. Entire test is 15–20 minutes.',
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
  { label: 'Practice Questions', value: '1,200+', icon: '📝' },
  { label: 'Mock Tests',         value: '12',     icon: '🏆' },
  { label: 'Test Sections',      value: '4',      icon: '📚' },
  { label: 'Parts / Tasks',      value: '20',     icon: '🎯' },
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
  const [expanded, setExpanded] = useState(false)

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
export default function ExamPage() {
  const { user } = useAuth()

  const [view, setView] = useState('lobby')       // 'lobby' | 'test' | 'report'
  const [activeTab, setActiveTab] = useState('sections') // 'sections' | 'modes' | 'learn'
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

            {/* Hero header */}
            <div className="exam-hero">
              <div className="exam-hero-inner">
                <div className="exam-hero-eyebrow">CELPIP Practice Platform</div>
                <h1 className="exam-hero-title">
                  Real exam experience,<br />
                  <span className="exam-hero-highlight">anytime you practice</span>
                </h1>
                <p className="exam-hero-sub">
                  Full mock tests · Section drills · AI scoring — 4 sections, 20 parts, 1,200+ questions to reach CLB 9.
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
              <button
                className={`exam-tab${activeTab === 'learn' ? ' active' : ''}`}
                onClick={() => setActiveTab('learn')}>
                🧠 Learning Hub
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

            {/* Learning Hub */}
            {activeTab === 'learn' && (
              <motion.div key="learn"
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}>
                <div className="learn-hub-intro">
                  <p>Everything you need to know about each CELPIP section — what's tested, how scoring works, timing strategies, and how to prepare effectively.</p>
                </div>
                <div className="learn-grid">
                  {SECTIONS.map(s => (
                    <LearningCard key={s.id} section={s} />
                  ))}
                </div>
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
