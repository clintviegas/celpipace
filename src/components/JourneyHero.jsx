import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { PENDING_EXAM_DATE_KEY } from '../context/AuthContext'
import { savePlanConfigLocal, savePlanConfigCloud, saveJourneyLocal, saveJourneyCloud } from '../lib/studyPlan'
import { PRODUCT_STATS } from '../data/constants'
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
  { label: 'In 3 days', sub: 'Sprint', days: 3 },
  { label: 'In 5 days', sub: 'Sprint', days: 5 },
  { label: 'In 1 week', sub: 'Focused', days: 7 },
  { label: 'In 2 weeks', sub: 'Steady', days: 14 },
  { label: '4+ weeks', sub: 'Full prep', days: 30 },
]

const CLB_OPTIONS = [12, 11, 10, 9, 8, 7, 6, 5, 4, 3]
const TARGET_CHIPS = [
  { clb: 7, note: 'Common minimum' },
  { clb: 9, note: 'Strong PR points' },
  { clb: 10, note: 'Max language points' },
]
const HOURS_CHIPS = [
  { h: 1, label: '~1 hr', sub: 'a day' },
  { h: 2, label: '~2 hrs', sub: 'a day' },
  { h: 3, label: '3+ hrs', sub: 'a day' },
]

const STEPS = ['date', 'level', 'target', 'plan']
const ROTATING = ['3 days', 'one week', 'two weeks', 'test day']

export default function JourneyHero() {
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

  // Rotating accent word — ties the headline to the "few days left" reality.
  const [wordIdx, setWordIdx] = useState(0)
  useEffect(() => {
    if (step !== 'date') return undefined
    const t = setInterval(() => setWordIdx(i => (i + 1) % ROTATING.length), 2200)
    return () => clearInterval(t)
  }, [step])

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
    const journey = {
      examDate: examDate || null,
      notBooked,
      targetCLB,
      hoursPerDay,
      levelMode,
      weakAreas: levelMode === 'areas' ? weakAreas : [],
      levels: levelMode === 'scores' ? levels : {},
    }
    // Always mirror locally so the path works instantly (guest or signed-in).
    saveJourneyLocal(user?.id || null, journey)
    if (examDate) {
      savePlanConfigLocal(user?.id || null, config)
      try { window.localStorage.setItem(PENDING_EXAM_DATE_KEY, examDate) } catch { void 0 }
    }
    if (user) {
      if (examDate) await savePlanConfigCloud(config)
      await saveJourneyCloud(journey)
      setSaved(true)
    }
    // Everyone goes straight to the gamified path. Guests preview it from
    // the locally-saved journey; the path page shows a "sign up to save"
    // banner and migrates their journey to the cloud once they register.
    navigate('/learning-path')
  }

  const weakest = plan?.focusOrder?.[0]
  const onPlan = step === 'plan'

  return (
    <section className={`jh ${onPlan ? 'jh--plan' : ''}`} id="journey">
      {/* animated atmosphere */}
      <div className="jh-aurora" aria-hidden="true">
        <span className="jh-blob jh-blob-1" />
        <span className="jh-blob jh-blob-2" />
        <span className="jh-blob jh-blob-3" />
      </div>
      <div className="jh-grid" aria-hidden="true" />

      <div className="jh-inner">
        {!onPlan && (
          <motion.div
            className="jh-head"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="jh-eyebrow">
              <span className="jh-pulse" aria-hidden="true" />
              AI-built CELPIP study plans
            </div>

            <h1 className="jh-title">
              Know exactly what to study<br className="jh-br" />{' '}
              before{' '}
              <span className="jh-rotate" aria-live="polite">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={ROTATING[wordIdx]}
                    className="jh-rotate-word"
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -14 }}
                    transition={{ duration: 0.32 }}
                  >
                    {ROTATING[wordIdx]}
                  </motion.span>
                </AnimatePresence>
              </span>
              .
            </h1>

            <p className="jh-sub">
              Tell us your test date — even if it&apos;s in 3 days — and get a
              day-by-day plan that hits your weakest skills first.
              <strong> No more guessing what to do next.</strong>
            </p>
          </motion.div>
        )}

        <div className="jh-stage">
          {!onPlan && <Stepper step={step} />}

          <motion.div
            className={`jh-card ${onPlan ? 'jh-card--plan' : ''}`}
            initial={{ opacity: 0, y: 22, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.12 }}
          >
            <AnimatePresence mode="wait">
              {/* ── STEP 1: DATE ── */}
              {step === 'date' && (
                <Panel key="date">
                  <span className="jh-step-tag">Step 1 of 3</span>
                  <h2 className="jh-q">When is your CELPIP test?</h2>
                  <div className="jh-chips jh-chips-date">
                    {DATE_CHIPS.map(c => (
                      <button key={c.days} className="jh-chip jh-chip-stack" onClick={() => pickDateOffset(c.days)}>
                        <strong>{c.label}</strong>
                        <span>{c.sub}</span>
                      </button>
                    ))}
                  </div>
                  <div className="jh-or"><span>or pick the exact date</span></div>
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
                      className="btn btn-primary btn-lg jh-cta-btn"
                      disabled={!examDate}
                      onClick={() => setStep('level')}
                    >
                      Build my plan →
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
                  <span className="jh-step-tag">Step 2 of 3</span>
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
                      <p className="jh-hint">Tap the skills that worry you most — we&apos;ll attack them first.</p>
                      <div className="jh-section-grid">
                        {SPRINT_SECTIONS.map(s => (
                          <button
                            key={s.key}
                            className={`jh-section-pick ${weakAreas.includes(s.key) ? 'is-active' : ''}`}
                            style={{ '--accent': s.color }}
                            onClick={() => toggleWeak(s.key)}
                          >
                            <span className="jh-section-ico" aria-hidden="true">{s.icon}</span>
                            <span className="jh-section-name">{s.label}</span>
                            <span className="jh-section-check" aria-hidden="true">✓</span>
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
                    <button className="btn btn-primary btn-lg jh-cta-btn" onClick={() => setStep('target')}>Next →</button>
                  </div>
                </Panel>
              )}

              {/* ── STEP 3: TARGET ── */}
              {step === 'target' && (
                <Panel key="target">
                  <span className="jh-step-tag">Step 3 of 3</span>
                  <h2 className="jh-q">What score do you need?</h2>
                  <div className="jh-chips jh-chips-target">
                    {TARGET_CHIPS.map(t => (
                      <button
                        key={t.clb}
                        className={`jh-chip jh-chip-stack jh-chip-target ${targetCLB === t.clb ? 'is-active' : ''}`}
                        onClick={() => setTargetCLB(t.clb)}
                      >
                        <strong>CLB {t.clb}</strong>
                        <span>{t.note}</span>
                      </button>
                    ))}
                  </div>

                  <h3 className="jh-q jh-q-sm">How much time can you study per day?</h3>
                  <div className="jh-chips jh-chips-hours">
                    {HOURS_CHIPS.map(h => (
                      <button
                        key={h.h}
                        className={`jh-chip jh-chip-stack ${hoursPerDay === h.h ? 'is-active' : ''}`}
                        onClick={() => setHoursPerDay(h.h)}
                      >
                        <strong>{h.label}</strong>
                        <span>{h.sub}</span>
                      </button>
                    ))}
                  </div>

                  <div className="jh-nav">
                    <button className="jh-back" onClick={() => setStep('level')}>← Back</button>
                    <button className="btn btn-primary btn-lg jh-cta-btn" onClick={() => setStep('plan')}>
                      Reveal my plan →
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
          </motion.div>
        </div>

        {!onPlan && (
          <motion.div
            className="jh-trust"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="jh-trust-stars">
              <span aria-hidden="true">★★★★★</span> Built by CELPIP high-scorers
            </div>
            <div className="jh-trust-stats">
              <span><strong>{PRODUCT_STATS.questionItems}</strong> question items</span>
              <span className="jh-trust-dot" aria-hidden="true">·</span>
              <span><strong>{PRODUCT_STATS.mockExams}</strong> full mock exams</span>
              <span className="jh-trust-dot" aria-hidden="true">·</span>
              <span><strong>Instant</strong> AI scoring</span>
              <span className="jh-trust-dot" aria-hidden="true">·</span>
              <span>No credit card to start</span>
            </div>
          </motion.div>
        )}
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
      {STEPS.slice(0, 3).map((s, i) => (
        <span key={s} className={`jh-track ${i < idx ? 'is-done' : ''} ${i === idx ? 'is-current' : ''}`} />
      ))}
    </div>
  )
}

function PlanView({ plan, notBooked, weakest, user, saved, onEdit, onSave, onStart }) {
  const items = plan.mode === 'sprint' ? plan.days : plan.weeks
  const isSprint = plan.mode === 'sprint'
  const countdown = notBooked ? null : plan.daysLeft
  const headline = notBooked
    ? 'Your 2-week starting plan'
    : plan.daysLeft <= 0
      ? 'It’s test day'
      : 'Your personalised plan is ready'

  // CLB progress: how far the start band is toward the target.
  const span = Math.max(1, plan.target - 3)
  const startPct = Math.min(100, Math.max(0, ((plan.startCLB - 3) / span) * 100))

  return (
    <div className="jh-plan">
      <div className="jh-plan-hero">
        {countdown != null && (
          <div className={`jh-count ${countdown <= 4 ? 'is-urgent' : ''}`}>
            <span className="jh-count-num">{countdown}</span>
            <span className="jh-count-label">{countdown === 1 ? 'day' : 'days'} left</span>
          </div>
        )}
        <div className="jh-plan-headcopy">
          <h2 className="jh-plan-title">{headline}</h2>
          <p className="jh-plan-summary">{plan.summary}</p>
        </div>
      </div>

      {/* CLB trajectory bar */}
      <div className="jh-clb">
        <div className="jh-clb-row">
          <span className="jh-clb-from">Now · ~CLB {plan.startCLB}</span>
          <span className="jh-clb-to">Goal · CLB {plan.target}</span>
        </div>
        <div className="jh-clb-bar">
          <div className="jh-clb-fill" style={{ width: `${startPct}%` }} />
          <div className="jh-clb-target" />
        </div>
        {weakest && (
          <div className="jh-clb-focus" style={{ '--accent': weakest.color }}>
            <span aria-hidden="true">{weakest.icon}</span> Biggest gap to close: <strong>{weakest.label}</strong>
          </div>
        )}
      </div>

      {/* the journey path */}
      <ol className="jh-path">
        {items.map((item, i) => (
          <li key={item.label} className={`jh-node ${item.isRestDay ? 'is-rest' : ''} ${i === items.length - 1 ? 'is-last' : ''}`}>
            <div className="jh-node-rail">
              <span className="jh-node-dot">
                {item.isRestDay ? '★' : (isSprint ? item.dayNumber : item.index)}
              </span>
            </div>
            <div className="jh-node-card">
              <div className="jh-node-top">
                <strong>{item.label}</strong>
                <span className="jh-node-date">{item.dateLabel || item.rangeLabel}</span>
                {item.milestoneCLB != null && !item.isRestDay && (
                  <span className="jh-node-goal">target CLB {item.milestoneCLB}</span>
                )}
              </div>
              <ul className="jh-tasks">
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

      {/* conversion */}
      <div className="jh-save">
        <div className="jh-save-copy">
          <strong>{saved ? 'Plan saved ✓' : 'Lock in this plan — free'}</strong>
          <span>
            {notBooked
              ? 'Add your test date to get day-by-day reminders before the exam.'
              : 'We’ll track your tasks, adapt as your scores climb, and remind you before test day.'}
          </span>
        </div>
        <div className="jh-save-btns">
          <button className="btn btn-gold btn-lg jh-cta-btn" onClick={onSave}>
            {user ? 'Save to my Study Plan' : 'Save my plan — free'}
          </button>
          <button className="btn btn-ghost-white btn-lg" onClick={onStart}>
            Start {weakest?.label || 'practice'} now →
          </button>
        </div>
        <button className="jh-link jh-link-light" onClick={onEdit}>← Change my answers</button>
      </div>
    </div>
  )
}
