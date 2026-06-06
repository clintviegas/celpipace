import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { PENDING_EXAM_DATE_KEY } from '../context/AuthContext'
import { savePlanConfigLocal, savePlanConfigCloud } from '../lib/studyPlan'
import {
  SPRINT_SECTIONS,
  generateSprintPlan,
  toPlanConfig,
  daysUntil,
} from '../lib/sprintPlan'

/* ── date utilities ── */
function isoFromOffset(days) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}
const TODAY_ISO = () => new Date().toISOString().slice(0, 10)
const MAX_ISO = () => isoFromOffset(548) // ~18 months

// Most visitors arrive with only a few days left — lead with those.
const DATE_CHIPS = [
  { label: 'In 3 days', days: 3 },
  { label: 'In 5 days', days: 5 },
  { label: 'In 1 week', days: 7 },
  { label: 'In 2 weeks', days: 14 },
  { label: '4+ weeks', days: 30 },
]

const CLB_OPTIONS = [12, 11, 10, 9, 8, 7, 6, 5, 4, 3]
const TARGET_CHIPS = [
  { clb: 7, note: 'CLB 7 — common minimum' },
  { clb: 9, note: 'CLB 9 — strong PR points' },
  { clb: 10, note: 'CLB 10 — maximum CRS language points' },
]
const HOURS_CHIPS = [
  { h: 1, label: '~1 hr/day' },
  { h: 2, label: '~2 hrs/day' },
  { h: 3, label: '3+ hrs/day' },
]

const STEPS = ['date', 'level', 'target', 'plan']

export default function JourneyHero({ onSignIn }) {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [step, setStep] = useState('date')
  const [examDate, setExamDate] = useState('')
  const [notBooked, setNotBooked] = useState(false)

  const [levelMode, setLevelMode] = useState('areas') // 'areas' | 'scores'
  const [weakAreas, setWeakAreas] = useState([])
  const [levels, setLevels] = useState({ listening: '', reading: '', writing: '', speaking: '' })

  const [targetCLB, setTargetCLB] = useState(9)
  const [hoursPerDay, setHoursPerDay] = useState(2)
  const [saved, setSaved] = useState(false)

  const daysLeft = useMemo(() => (notBooked ? null : daysUntil(examDate)), [examDate, notBooked])

  const plan = useMemo(() => {
    if (step !== 'plan') return null
    return generateSprintPlan({
      daysLeft: notBooked ? null : daysLeft,
      targetCLB,
      levels: levelMode === 'scores' ? levels : {},
      weakAreas: levelMode === 'areas' ? weakAreas : [],
      hoursPerDay,
    })
  }, [step, daysLeft, notBooked, targetCLB, levels, levelMode, weakAreas, hoursPerDay])

  /* ── step handlers ── */
  function pickDateOffset(days) {
    setNotBooked(false)
    setExamDate(isoFromOffset(days))
    setStep('level')
  }
  function pickNotBooked() {
    setNotBooked(true)
    setExamDate('')
    setStep('level')
  }
  function toggleWeak(key) {
    setWeakAreas(prev => (prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]))
  }

  async function savePlan() {
    const config = toPlanConfig({ targetDate: examDate, targetCLB, hoursPerDay })
    if (examDate) {
      savePlanConfigLocal(user?.id || null, config)
      try { window.localStorage.setItem(PENDING_EXAM_DATE_KEY, examDate) } catch { void 0 }
    }
    if (user) {
      if (examDate) await savePlanConfigCloud(config)
      setSaved(true)
      navigate('/study-plan')
    } else {
      onSignIn?.()
    }
  }

  const weakest = plan?.focusOrder?.[0]

  return (
    <section className="jh" id="journey">
      <div className="jh-glow" />
      <div className="jh-inner">
        <div className="jh-badge"><span aria-hidden="true">🍁</span> Your personal CELPIP plan</div>

        {step !== 'plan' && (
          <>
            <h1 className="jh-title">
              Tell us your test date.<br />
              <span className="jh-accent">We&apos;ll build the plan.</span>
            </h1>
            <p className="jh-sub">
              No guessing what to study. Answer three quick questions and get a
              day-by-day plan that targets your weakest skills first — even if your
              test is in 3 days.
            </p>
          </>
        )}

        <Stepper step={step} />

        <div className="jh-card">
          <AnimatePresence mode="wait">
            {/* ── STEP 1: DATE ── */}
            {step === 'date' && (
              <Panel key="date">
                <h2 className="jh-q">When is your CELPIP test?</h2>
                <div className="jh-chips">
                  {DATE_CHIPS.map(c => (
                    <button key={c.days} className="jh-chip" onClick={() => pickDateOffset(c.days)}>
                      {c.label}
                    </button>
                  ))}
                </div>
                <div className="jh-or">or pick the exact date</div>
                <div className="jh-date-row">
                  <input
                    type="date"
                    className="jh-date"
                    value={examDate}
                    min={TODAY_ISO()}
                    max={MAX_ISO()}
                    onChange={e => { setNotBooked(false); setExamDate(e.target.value) }}
                  />
                  <button
                    className="btn btn-primary btn-lg"
                    disabled={!examDate}
                    onClick={() => setStep('level')}
                  >
                    Next →
                  </button>
                </div>
                <button className="jh-link" onClick={pickNotBooked}>
                  I haven&apos;t booked my test yet
                </button>
              </Panel>
            )}

            {/* ── STEP 2: STARTING LEVEL ── */}
            {step === 'level' && (
              <Panel key="level">
                <h2 className="jh-q">Where are you starting from?</h2>
                <div className="jh-toggle">
                  <button
                    className={`jh-toggle-btn ${levelMode === 'areas' ? 'is-active' : ''}`}
                    onClick={() => setLevelMode('areas')}
                  >
                    First time / not sure
                  </button>
                  <button
                    className={`jh-toggle-btn ${levelMode === 'scores' ? 'is-active' : ''}`}
                    onClick={() => setLevelMode('scores')}
                  >
                    I have a previous score
                  </button>
                </div>

                {levelMode === 'areas' ? (
                  <>
                    <p className="jh-hint">Which areas worry you most? Pick all that apply — we&apos;ll prioritise them.</p>
                    <div className="jh-section-grid">
                      {SPRINT_SECTIONS.map(s => (
                        <button
                          key={s.key}
                          className={`jh-section-pick ${weakAreas.includes(s.key) ? 'is-active' : ''}`}
                          style={{ '--accent': s.color }}
                          onClick={() => toggleWeak(s.key)}
                        >
                          <span className="jh-section-ico" aria-hidden="true">{s.icon}</span>
                          <span>{s.label}</span>
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    <p className="jh-hint">Enter your last CELPIP CLB per section (leave blank if unsure).</p>
                    <div className="jh-section-grid">
                      {SPRINT_SECTIONS.map(s => (
                        <label key={s.key} className="jh-score-field" style={{ '--accent': s.color }}>
                          <span className="jh-score-label"><span aria-hidden="true">{s.icon}</span> {s.label}</span>
                          <select
                            value={levels[s.key]}
                            onChange={e => setLevels(prev => ({ ...prev, [s.key]: e.target.value }))}
                          >
                            <option value="">—</option>
                            {CLB_OPTIONS.map(clb => (
                              <option key={clb} value={clb}>CLB {clb}</option>
                            ))}
                          </select>
                        </label>
                      ))}
                    </div>
                  </>
                )}

                <div className="jh-nav">
                  <button className="jh-back" onClick={() => setStep('date')}>← Back</button>
                  <button className="btn btn-primary btn-lg" onClick={() => setStep('target')}>Next →</button>
                </div>
              </Panel>
            )}

            {/* ── STEP 3: TARGET ── */}
            {step === 'target' && (
              <Panel key="target">
                <h2 className="jh-q">What score do you need?</h2>
                <div className="jh-chips">
                  {TARGET_CHIPS.map(t => (
                    <button
                      key={t.clb}
                      className={`jh-chip jh-chip-lg ${targetCLB === t.clb ? 'is-active' : ''}`}
                      onClick={() => setTargetCLB(t.clb)}
                    >
                      <strong>CLB {t.clb}</strong>
                      <span>{t.note.split('—')[1]}</span>
                    </button>
                  ))}
                </div>

                <h3 className="jh-q jh-q-sm">How much time can you study per day?</h3>
                <div className="jh-chips">
                  {HOURS_CHIPS.map(h => (
                    <button
                      key={h.h}
                      className={`jh-chip ${hoursPerDay === h.h ? 'is-active' : ''}`}
                      onClick={() => setHoursPerDay(h.h)}
                    >
                      {h.label}
                    </button>
                  ))}
                </div>

                <div className="jh-nav">
                  <button className="jh-back" onClick={() => setStep('level')}>← Back</button>
                  <button className="btn btn-primary btn-lg" onClick={() => setStep('plan')}>
                    Build my plan →
                  </button>
                </div>
              </Panel>
            )}

            {/* ── STEP 4: PLAN ── */}
            {step === 'plan' && plan && (
              <Panel key="plan">
                <PlanView
                  plan={plan}
                  notBooked={notBooked}
                  weakest={weakest}
                  user={user}
                  saved={saved}
                  onEdit={() => setStep('date')}
                  onSave={savePlan}
                  onStart={() => navigate(weakest?.route || '/practice')}
                />
              </Panel>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}

/* ── small presentational pieces ── */
function Panel({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.28 }}
    >
      {children}
    </motion.div>
  )
}

function Stepper({ step }) {
  const idx = STEPS.indexOf(step)
  return (
    <div className="jh-stepper" aria-hidden="true">
      {STEPS.map((s, i) => (
        <span key={s} className={`jh-dot ${i <= idx ? 'is-done' : ''} ${i === idx ? 'is-current' : ''}`} />
      ))}
    </div>
  )
}

function PlanView({ plan, notBooked, weakest, user, saved, onEdit, onSave, onStart }) {
  const items = plan.mode === 'sprint' ? plan.days : plan.weeks
  const headline = notBooked
    ? 'Here’s a 2-week starting plan'
    : plan.daysLeft <= 0
      ? 'It’s test day — here’s your game plan'
      : `You have ${plan.daysLeft} ${plan.daysLeft === 1 ? 'day' : 'days'}. Here’s your plan.`

  return (
    <div className="jh-plan">
      <div className="jh-plan-head">
        <h2 className="jh-plan-title">{headline}</h2>
        <p className="jh-plan-summary">{plan.summary}</p>
        {weakest && (
          <div className="jh-plan-tags">
            <span className="jh-plan-tag">Start band ~CLB {plan.startCLB}</span>
            <span className="jh-plan-tag">Target CLB {plan.target}</span>
            <span className="jh-plan-tag" style={{ '--accent': weakest.color }}>
              Biggest gap: {weakest.icon} {weakest.label}
            </span>
          </div>
        )}
      </div>

      <ol className="jh-timeline">
        {items.map((item) => (
          <li key={item.label} className={`jh-tl-item ${item.isRestDay ? 'is-rest' : ''}`}>
            <div className="jh-tl-marker">
              <span className="jh-tl-num">{plan.mode === 'sprint' ? item.dayNumber : item.index}</span>
            </div>
            <div className="jh-tl-body">
              <div className="jh-tl-top">
                <strong>{item.label}</strong>
                <span className="jh-tl-date">{item.dateLabel || item.rangeLabel}</span>
                {item.milestoneCLB != null && !item.isRestDay && (
                  <span className="jh-tl-milestone">→ CLB {item.milestoneCLB}</span>
                )}
              </div>
              <ul className="jh-tl-tasks">
                {item.tasks.map((t, ti) => (
                  <li key={ti} className={`jh-task jh-task-${t.type}`}>
                    <span className="jh-task-ico" aria-hidden="true">{t.icon}</span>
                    <span>{t.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ol>

      <div className="jh-cta">
        <div className="jh-cta-copy">
          <strong>{saved ? 'Plan saved ✓' : 'Save this plan & track your progress'}</strong>
          <span>
            {notBooked
              ? 'Pick your test date to lock in day-by-day reminders.'
              : 'Free account — we’ll check off tasks, adapt as you improve, and remind you before test day.'}
          </span>
        </div>
        <div className="jh-cta-btns">
          <button className="btn btn-white btn-lg" onClick={onSave}>
            {user ? 'Save to my Study Plan' : 'Save my plan — free'}
          </button>
          <button className="btn btn-ghost-white btn-lg" onClick={onStart}>
            Start with {weakest?.label || 'practice'} →
          </button>
        </div>
        <button className="jh-link jh-link-center" onClick={onEdit}>← Change my answers</button>
      </div>
    </div>
  )
}
