import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { WRITING_SETS, DIFF_STYLE } from '../data/writingData'
import SEO from '../components/SEO'

// ─── constants ────────────────────────────────────────────────────────────────
const COLOR = '#C8972A'
const WORD_LIMIT = 200
const WORD_MIN = 150

// ─── tiny helpers ─────────────────────────────────────────────────────────────
function fmtTime(totalSecs) {
  const absSecs = Math.abs(totalSecs)
  const m = Math.floor(absSecs / 60)
  const s = absSecs % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function wordCount(text) {
  return text.trim() === '' ? 0 : text.trim().split(/\s+/).length
}

/** Seeded Fisher-Yates shuffle so order is stable per session but varied */
function shuffleArray(arr) {
  const a = [...arr]
  // Use a simple day-based seed so the order changes daily
  let seed = Math.floor(Date.now() / 86_400_000)
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) & 0xffffffff
    return (seed >>> 0) / 0xffffffff
  }
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// ─── DiffBadge ────────────────────────────────────────────────────────────────
function DiffBadge({ difficulty }) {
  const s = DIFF_STYLE[difficulty] || DIFF_STYLE.easy
  return (
    <span className="wp-diff-badge" style={{ background: s.bg, color: s.color }}>
      {s.label}
    </span>
  )
}

// ─── SetCard ──────────────────────────────────────────────────────────────────
function SetCard({ set, completionMap, onSelect }) {
  const t1 = set.tasks[0]
  const t2 = set.tasks[1]
  const done1 = completionMap[`${set.setNumber}-1`]
  const done2 = completionMap[`${set.setNumber}-2`]
  const bothDone = done1 && done2
  const eitherDone = done1 || done2

  return (
    <motion.div
      className={`wp-set-card${bothDone ? ' wp-set-card--done' : ''}`}
      whileHover={{ y: -4, boxShadow: '0 8px 24px rgba(0,0,0,0.10)' }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <div className="wp-set-card-header">
        <span className="wp-set-number">Set {set.setNumber}</span>
        {bothDone && <span className="wp-done-chip">✓ Done</span>}
        {eitherDone && !bothDone && <span className="wp-progress-chip">In Progress</span>}
      </div>

      <div className="wp-set-tasks">
        <button
          className={`wp-task-row${done1 ? ' wp-task-row--done' : ''}`}
          onClick={() => onSelect(set, 1)}
        >
          <span className="wp-task-row-label">
            <span className="wp-task-icon">✉</span>
            <span>Task 1 — Email</span>
          </span>
          <div className="wp-task-row-right">
            <DiffBadge difficulty={t1.difficulty} />
            <span className="wp-task-time">{t1.timeLimitMinutes} min</span>
            {done1 && <span className="wp-check">✓</span>}
          </div>
        </button>

        <button
          className={`wp-task-row${done2 ? ' wp-task-row--done' : ''}`}
          onClick={() => onSelect(set, 2)}
        >
          <span className="wp-task-row-label">
            <span className="wp-task-icon">📋</span>
            <span>Task 2 — Survey</span>
          </span>
          <div className="wp-task-row-right">
            <DiffBadge difficulty={t2.difficulty} />
            <span className="wp-task-time">{t2.timeLimitMinutes} min</span>
            {done2 && <span className="wp-check">✓</span>}
          </div>
        </button>
      </div>
    </motion.div>
  )
}

// ─── SetSelectorView ──────────────────────────────────────────────────────────
function SetSelectorView({ completionMap, onSelect }) {
  const shuffled = useMemo(() => shuffleArray(WRITING_SETS), [])
  const totalDone = Object.values(completionMap).filter(Boolean).length
  const totalTasks = WRITING_SETS.length * 2  // 40

  function pickRandom() {
    // Filter to sets that have at least one un-done task
    const candidates = WRITING_SETS.flatMap(s =>
      s.tasks
        .filter(t => !completionMap[`${s.setNumber}-${t.taskNumber}`])
        .map(t => ({ set: s, taskNum: t.taskNumber }))
    )
    if (candidates.length === 0) return
    const pick = candidates[Math.floor(Math.random() * candidates.length)]
    onSelect(pick.set, pick.taskNum)
  }

  return (
    <div className="wp-selector">
      {/* Header */}
      <div className="wp-selector-header">
        <div>
          <h1 className="wp-selector-title">Writing Practice Sets</h1>
          <p className="wp-selector-sub">20 sets · Task 1 (email, 27 min) + Task 2 (survey, 26 min)</p>
        </div>
        <button className="wp-random-btn" onClick={pickRandom} style={{ background: COLOR }}>
          🎲 Random Task
        </button>
      </div>

      {/* Progress bar */}
      <div className="wp-progress-wrap">
        <div className="wp-progress-bar">
          <div
            className="wp-progress-fill"
            style={{ width: `${(totalDone / totalTasks) * 100}%`, background: COLOR }}
          />
        </div>
        <span className="wp-progress-label">{totalDone} / {totalTasks} tasks completed</span>
      </div>

      {/* Cards grid */}
      <div className="wp-grid">
        {shuffled.map(set => (
          <SetCard
            key={set.setNumber}
            set={set}
            completionMap={completionMap}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  )
}

// ─── Timer ────────────────────────────────────────────────────────────────────
function WritingTimer({ timeLimitMinutes, onOvertimeStart }) {
  const totalSecs = timeLimitMinutes * 60
  const [elapsed, setElapsed] = useState(0)
  const [overtimeNotified, setOvertimeNotified] = useState(false)
  const intervalRef = useRef(null)

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setElapsed(e => e + 1)
    }, 1000)
    return () => clearInterval(intervalRef.current)
  }, [])

  const remaining = totalSecs - elapsed
  const isOvertime = remaining < 0
  const overtimeSecs = isOvertime ? Math.abs(remaining) : 0

  useEffect(() => {
    if (isOvertime && !overtimeNotified) {
      setOvertimeNotified(true)
      onOvertimeStart?.()
    }
  }, [isOvertime, overtimeNotified, onOvertimeStart])

  // Colour logic
  let timerColor = '#2D8A56'  // green
  let nudge = null
  if (!isOvertime) {
    if (remaining <= 60) {
      timerColor = '#C8102E'
      nudge = 'Less than 1 minute — wrap up your final thoughts!'
    } else if (remaining <= 300) {
      timerColor = COLOR
      nudge = 'Under 5 minutes — start your conclusion.'
    }
  } else {
    timerColor = '#888'
  }

  return (
    <div className="wp-timer-wrap">
      <div className="wp-timer-pill" style={{ borderColor: timerColor, color: timerColor }}>
        {isOvertime ? (
          <span>+{fmtTime(overtimeSecs)} <span className="wp-timer-overtime-label">overtime</span></span>
        ) : (
          fmtTime(remaining)
        )}
      </div>
      {nudge && !isOvertime && (
        <p className="wp-timer-nudge" style={{ color: timerColor }}>{nudge}</p>
      )}
    </div>
  )
}

// ─── Overtime banner ──────────────────────────────────────────────────────────
function OvertimeBanner({ onDismiss }) {
  return (
    <motion.div
      className="wp-overtime-banner"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
    >
      <span>⏱ Time's up! You can keep writing — your work won't be lost.</span>
      <button className="wp-overtime-dismiss" onClick={onDismiss}>✕</button>
    </motion.div>
  )
}

// ─── WritingTaskView ──────────────────────────────────────────────────────────
function WritingTaskView({ set, taskNumber, onBack, onComplete }) {
  const { user } = useAuth()
  const task = set.tasks[taskNumber - 1]
  const [text, setText] = useState('')
  const [showOvertimeBanner, setShowOvertimeBanner] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)
  const startTimeRef = useRef(Date.now())

  const wc = wordCount(text)
  const wcColor = wc < WORD_MIN ? '#888' : wc <= WORD_LIMIT ? '#2D8A56' : '#C8102E'

  // For Task 2 (survey): track selected option
  const [selectedOption, setSelectedOption] = useState(null)

  async function handleSubmit() {
    if (saving) return
    setSaving(true)
    setSaveError(null)

    const elapsedMs = Date.now() - startTimeRef.current
    const timeSecs = Math.round(elapsedMs / 1000)
    const expectedSecs = task.timeLimitMinutes * 60
    const overtimeSecs = Math.max(0, timeSecs - expectedSecs)

    if (user) {
      // Try to find the task UUID from Supabase
      const { data: taskRow } = await supabase
        .from('writing_tasks')
        .select('id')
        .eq('set_id', (await supabase.from('writing_sets').select('id').eq('set_number', set.setNumber).single()).data?.id)
        .eq('task_number', taskNumber)
        .single()

      if (taskRow) {
        const { error } = await supabase.from('writing_responses').upsert({
          user_id: user.id,
          task_id: taskRow.id,
          response_text: text,
          word_count: wc,
          time_spent_seconds: timeSecs,
          overtime_seconds: overtimeSecs,
          submitted_at: new Date().toISOString(),
        }, { onConflict: 'user_id,task_id' })
        if (error) setSaveError('Could not save to your account — your response is shown below.')
      }
    }

    setSaving(false)
    setSubmitted(true)
    onComplete?.(set.setNumber, taskNumber)
  }

  if (submitted) {
    return (
      <div className="wp-submitted">
        <div className="wp-submitted-card">
          <div className="wp-submitted-icon">✓</div>
          <h2>Response submitted!</h2>
          {user
            ? <p>Your response has been saved to your account.</p>
            : <p>Sign in to track your progress across all sets.</p>}
          <p className="wp-submitted-wc">Words written: <strong>{wc}</strong></p>
          <div className="wp-submitted-actions">
            {taskNumber === 1 ? (
              <button
                className="wp-submit-btn"
                style={{ background: COLOR }}
                onClick={() => onComplete(set.setNumber, taskNumber, 'next')}
              >
                Continue to Task 2 →
              </button>
            ) : null}
            <button className="wp-back-btn" onClick={onBack}>← Back to Sets</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="wp-task-screen">
      {/* Breadcrumb + timer row */}
      <div className="wp-task-topbar">
        <button className="wp-breadcrumb-btn" onClick={onBack}>
          ← Sets
        </button>
        <span className="wp-breadcrumb-sep">/ Set {set.setNumber} / Task {taskNumber}</span>
        <WritingTimer
          timeLimitMinutes={task.timeLimitMinutes}
          onOvertimeStart={() => setShowOvertimeBanner(true)}
        />
      </div>

      {/* Overtime banner */}
      <AnimatePresence>
        {showOvertimeBanner && (
          <OvertimeBanner onDismiss={() => setShowOvertimeBanner(false)} />
        )}
      </AnimatePresence>

      {/* Task header */}
      <div className="wp-task-header">
        <div className="wp-task-meta">
          <span className="wp-task-type-pill">
            {task.taskType === 'email' ? '✉ Email' : '📋 Survey'}
          </span>
          <DiffBadge difficulty={task.difficulty} />
          <span className="wp-task-time-badge">{task.timeLimitMinutes} min · ~{WORD_MIN}–{WORD_LIMIT} words</span>
        </div>
        <h2 className="wp-task-title">
          {taskNumber === 1 ? 'Task 1 — Email Response' : 'Task 2 — Survey Response'}
        </h2>
      </div>

      {/* Prompt box */}
      <div className="wp-prompt-box">
        {/* Scenario context (Task 1 only) */}
        {task.scenarioContext && (
          <div className="wp-scenario">
            <span className="wp-scenario-label">Scenario</span>
            <p>{task.scenarioContext}</p>
          </div>
        )}

        {/* Main prompt */}
        <p className="wp-prompt-text">{task.promptText}</p>

        {/* Task 1: bullet points */}
        {task.bulletPoints && (
          <div className="wp-bullets">
            <p className="wp-bullets-label">In your email, make sure to:</p>
            <ul className="wp-bullet-list">
              {task.bulletPoints.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Task 2: option choice */}
        {task.optionA && (
          <div className="wp-options">
            <p className="wp-options-label">Choose one position to argue:</p>
            <div className="wp-option-cards">
              <button
                className={`wp-option-card${selectedOption === 'A' ? ' wp-option-card--selected' : ''}`}
                onClick={() => setSelectedOption('A')}
                style={selectedOption === 'A' ? { borderColor: COLOR, background: '#FEF8EE' } : {}}
              >
                <span className="wp-option-letter">A</span>
                <span>{task.optionA}</span>
              </button>
              <button
                className={`wp-option-card${selectedOption === 'B' ? ' wp-option-card--selected' : ''}`}
                onClick={() => setSelectedOption('B')}
                style={selectedOption === 'B' ? { borderColor: COLOR, background: '#FEF8EE' } : {}}
              >
                <span className="wp-option-letter">B</span>
                <span>{task.optionB}</span>
              </button>
            </div>
          </div>
        )}

        {/* Tone tip */}
        {task.tone && (
          <p className="wp-tone-tip"><strong>Tone:</strong> {task.tone}</p>
        )}
      </div>

      {/* Writing area */}
      <div className="wp-editor-wrap">
        <textarea
          className="wp-textarea"
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Start writing your response here…"
          rows={14}
          spellCheck
        />
        <div className="wp-editor-footer">
          <span className="wp-word-count" style={{ color: wcColor }}>
            {wc} / {WORD_LIMIT} words
            {wc < WORD_MIN && wc > 0 && <span className="wp-wc-hint"> (aim for {WORD_MIN}+)</span>}
            {wc > WORD_LIMIT && <span className="wp-wc-hint"> (over limit)</span>}
          </span>
          <button
            className="wp-submit-btn"
            style={{ background: saving ? '#aaa' : COLOR }}
            onClick={handleSubmit}
            disabled={saving}
          >
            {saving ? 'Saving…' : 'Submit Response →'}
          </button>
        </div>
        {saveError && <p className="wp-save-error">{saveError}</p>}
      </div>
    </div>
  )
}

// ─── WritingPracticePage ───────────────────────────────────────────────────────
export default function WritingPracticePage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  // view: 'selector' | 'task'
  const [view, setView] = useState('selector')
  const [activeSet, setActiveSet] = useState(null)
  const [activeTask, setActiveTask] = useState(1)

  // Completion map: key = "setNumber-taskNumber", value = true
  const [completionMap, setCompletionMap] = useState({})

  // Load completion state from Supabase (if logged in) or localStorage (guest)
  useEffect(() => {
    async function loadCompletion() {
      if (user) {
        const { data } = await supabase
          .from('writing_responses')
          .select('task_id, writing_tasks(task_number, set_id, writing_sets(set_number))')
          .eq('user_id', user.id)
        if (data) {
          const map = {}
          data.forEach(r => {
            const sn = r.writing_tasks?.writing_sets?.set_number
            const tn = r.writing_tasks?.task_number
            if (sn && tn) map[`${sn}-${tn}`] = true
          })
          setCompletionMap(map)
        }
      } else {
        // Guest: use localStorage
        try {
          const stored = JSON.parse(localStorage.getItem('wp_completion') || '{}')
          setCompletionMap(stored)
        } catch { /* ignore */ }
      }
    }
    loadCompletion()
  }, [user])

  function handleSelectTask(set, taskNum) {
    setActiveSet(set)
    setActiveTask(taskNum)
    setView('task')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleComplete(setNumber, taskNumber, action) {
    // Mark done
    const key = `${setNumber}-${taskNumber}`
    const updated = { ...completionMap, [key]: true }
    setCompletionMap(updated)
    if (!user) {
      localStorage.setItem('wp_completion', JSON.stringify(updated))
    }

    if (action === 'next' && taskNumber === 1) {
      // Stay in task view, move to task 2 of same set
      setActiveTask(2)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      setView('selector')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <>
      <SEO
        title="Writing Practice Sets — CELPIP Prep"
        description="Practice all 20 CELPIP writing sets. Timed email and survey tasks with automatic word count and progress tracking."
      />

      <div className="page-wrap wp-root">
        <AnimatePresence mode="wait">
          {view === 'selector' ? (
            <motion.div
              key="selector"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.25 }}
            >
              <SetSelectorView
                completionMap={completionMap}
                onSelect={handleSelectTask}
              />
            </motion.div>
          ) : (
            <motion.div
              key={`task-${activeSet?.setNumber}-${activeTask}`}
              initial={{ opacity: 0, x: 32 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -32 }}
              transition={{ duration: 0.25 }}
            >
              <WritingTaskView
                set={activeSet}
                taskNumber={activeTask}
                onBack={() => {
                  setView('selector')
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                onComplete={handleComplete}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}
