import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Lock } from 'lucide-react'
import SEO from '../components/SEO'
import ScoreTips, { getReadingTips } from '../components/ScoreTips'
import UpgradeModal from '../components/UpgradeModal'
import { useAuth } from '../context/AuthContext'
import { useAuthGate } from '../hooks/useAuthGate'
import { useProgress } from '../hooks/useProgress'
import r1Data from '../data/reading/R1_correspondence.json'
import r2Data from '../data/reading/R2_apply_diagram.json'
import r3Data from '../data/reading/R3_information.json'
import r4Data from '../data/reading/R4_viewpoints.json'
import { asset, FREE_PARTS } from '../data/constants'

const COLOR = '#2D8A56'
const DIFF_COLOR = { easy: '#2D8A56', intermediate: '#C8972A', advanced: '#C8102E' }
const LETTERS = ['A', 'B', 'C', 'D', 'E']

const PART_META = {
  R1: { label: 'Reading Correspondence',    icon: '✉️', timeMins: 11, data: r1Data,  type: 'correspondence' },
  R2: { label: 'Apply a Diagram',           icon: '📊', timeMins: 13, data: r2Data,  type: 'diagram'        },
  R3: { label: 'Reading for Information',   icon: '📄', timeMins: 14, data: r3Data,  type: 'information'    },
  R4: { label: 'Reading for Viewpoints',    icon: '⚖️',  timeMins: 17, data: r4Data,  type: 'viewpoints'     },
}

function fmtTime(secs) {
  const m = Math.floor(Math.abs(secs) / 60)
  const s = Math.abs(secs) % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

/* ── Opts object {A,B,C,D} → array ['A) …', 'B) …'] ── */
function optsArr(opts) {
  return ['A', 'B', 'C', 'D'].map(l => ({ letter: l, text: opts[l] })).filter(o => o.text)
}

/* ── Count total questions in a set ── */
function setTotal(set, type) {
  if (type === 'information') return (set.questions || []).length
  const mcq = (set.mcq_questions || []).length
  const fib = type === 'viewpoints'
    ? (set.fill_in_blank_comment?.blanks || []).length
    : (set.fill_in_blank_response?.blanks || []).length
  return mcq + fib
}

/* ── Count answered questions for a given set ── */
function setAnswered(setIdx, set, type, answers) {
  const pfx = `${setIdx}_`
  let count = 0
  if (type === 'information') {
    ;(set.questions || []).forEach(q => {
      if (answers[pfx + `r3_${q.question_number}`] !== undefined) count++
    })
  } else {
    ;(set.mcq_questions || []).forEach(q => {
      if (answers[pfx + `mcq_${q.question_number}`] !== undefined) count++
    })
    const fibs = type === 'viewpoints'
      ? (set.fill_in_blank_comment?.blanks || [])
      : (set.fill_in_blank_response?.blanks || [])
    fibs.forEach(b => {
      if (answers[pfx + `fib_${b.blank_number}`] !== undefined) count++
    })
  }
  return count
}

/* ── Score for current set ── */
function setScore(setIdx, set, type, answers) {
  const pfx = `${setIdx}_`
  let correct = 0
  if (type === 'information') {
    ;(set.questions || []).forEach(q => {
      if (answers[pfx + `r3_${q.question_number}`] === q.correct_answer) correct++
    })
  } else {
    ;(set.mcq_questions || []).forEach(q => {
      if (answers[pfx + `mcq_${q.question_number}`] === q.correct_answer) correct++
    })
    const fibs = type === 'viewpoints'
      ? (set.fill_in_blank_comment?.blanks || [])
      : (set.fill_in_blank_response?.blanks || [])
    fibs.forEach(b => {
      if (answers[pfx + `fib_${b.blank_number}`] === b.correct_answer) correct++
    })
  }
  return correct
}

function buildReadingAttemptDetails(setIdx, set, type, answers) {
  const pfx = `${setIdx}_`
  const questions = []

  if (type === 'information') {
    ;(set.questions || []).forEach(question => {
      const selectedAnswer = answers[pfx + `r3_${question.question_number}`]
      questions.push({
        questionId: question.id ?? question.question_number,
        number: question.question_number,
        type: 'information',
        text: question.question,
        selectedAnswer,
        correctAnswer: question.correct_answer,
        isCorrect: selectedAnswer !== undefined && selectedAnswer === question.correct_answer,
        options: question.options || {},
      })
    })
  } else {
    ;(set.mcq_questions || []).forEach(question => {
      const selectedAnswer = answers[pfx + `mcq_${question.question_number}`]
      questions.push({
        questionId: question.id ?? question.question_number,
        number: question.question_number,
        type: 'mcq',
        text: question.question,
        selectedAnswer,
        correctAnswer: question.correct_answer,
        isCorrect: selectedAnswer !== undefined && selectedAnswer === question.correct_answer,
        options: question.options || {},
      })
    })

    const blanks = type === 'viewpoints'
      ? (set.fill_in_blank_comment?.blanks || [])
      : (set.fill_in_blank_response?.blanks || [])
    blanks.forEach(blank => {
      const selectedAnswer = answers[pfx + `fib_${blank.blank_number}`]
      questions.push({
        questionId: `fib_${blank.blank_number}`,
        number: blank.blank_number,
        type: 'fill_blank',
        text: blank.sentence || blank.context || '',
        selectedAnswer,
        correctAnswer: blank.correct_answer,
        isCorrect: selectedAnswer !== undefined && selectedAnswer === blank.correct_answer,
        options: blank.options || {},
      })
    })
  }

  return {
    source: 'reading-practice-page',
    setTitle: set.title || set.set_title || '',
    setType: type,
    questions,
  }
}

/* ══════════════════════════════════════════════════════════════
   PASSAGE RENDERING
══════════════════════════════════════════════════════════════ */

function PassageEmail({ passage }) {
  return (
    <div className="rdg-email">
      <div className="rdg-email-header">
        <div className="rdg-email-row"><span className="rdg-email-field">From:</span><span className="rdg-email-val">{passage.from}</span></div>
        <div className="rdg-email-row"><span className="rdg-email-field">To:</span><span className="rdg-email-val">{passage.to}</span></div>
        <div className="rdg-email-row"><span className="rdg-email-field">Subject:</span><span className="rdg-email-val rdg-email-subject">{passage.subject}</span></div>
      </div>
      <div className="rdg-email-body">
        <pre className="rdg-passage-pre">{passage.body}</pre>
      </div>
    </div>
  )
}

function PassageDiagram({ diagram, passage, setNumber }) {
  const [imgError, setImgError] = useState(false)
  const [zoomed, setZoomed] = useState(false)
  const imgSrc = asset(`/images/R2/${setNumber}.png`)

  // Close zoom on Escape
  useEffect(() => {
    if (!zoomed) return
    const onKey = (e) => { if (e.key === 'Escape') setZoomed(false) }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [zoomed])

  return (
    <div className="rdg-diagram-wrap">
      <div className="rdg-diagram-label">📊 Visual Information</div>
      <div className="rdg-diagram-box" style={{ position: 'relative' }}>
        {!imgError ? (
          <>
            <img
              src={imgSrc}
              alt={`Diagram — Set ${setNumber}`}
              className="rdg-diagram-img"
              onError={() => setImgError(true)}
              onClick={() => setZoomed(true)}
              style={{ cursor: 'zoom-in' }}
            />
            <button
              type="button"
              onClick={() => setZoomed(true)}
              aria-label="Zoom diagram"
              style={{
                position: 'absolute', top: 10, right: 10,
                width: 36, height: 36, borderRadius: 8,
                border: '1px solid rgba(15,31,61,0.12)',
                background: 'rgba(255,255,255,0.95)',
                color: '#0F1F3D', cursor: 'zoom-in',
                fontSize: 16, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(15,31,61,0.12)',
              }}
              title="Click to zoom"
            >🔍</button>
          </>
        ) : (
          <pre className="rdg-diagram-text">{diagram.text_description}</pre>
        )}
      </div>
      {passage && (
        <div className="rdg-diagram-passage">
          <div className="rdg-diagram-passage-label">📝 Reading Passage</div>
          <pre className="rdg-passage-pre">{passage}</pre>
        </div>
      )}

      {zoomed && !imgError && (
        <div
          onClick={() => setZoomed(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(15,31,61,0.85)',
            zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 24, cursor: 'zoom-out',
          }}
        >
          <button
            onClick={(e) => { e.stopPropagation(); setZoomed(false) }}
            aria-label="Close zoom"
            style={{
              position: 'absolute', top: 18, right: 18,
              width: 40, height: 40, borderRadius: 10, border: 'none',
              background: 'rgba(255,255,255,0.95)', color: '#0F1F3D',
              fontSize: 22, fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            }}
          >×</button>
          <img
            src={imgSrc}
            alt={`Diagram zoomed — Set ${setNumber}`}
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '95vw', maxHeight: '92vh',
              objectFit: 'contain',
              borderRadius: 8,
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
              background: '#fff',
            }}
          />
        </div>
      )}
    </div>
  )
}

function PassageInfo({ passage }) {
  const { intro, paragraphs } = passage
  const keys = Object.keys(paragraphs)
  return (
    <div className="rdg-info-wrap">
      <p className="rdg-info-intro">{intro}</p>
      <div className="rdg-info-paragraphs">
        {keys.map(k => (
          <div key={k} className="rdg-info-para">
            <span className="rdg-info-para-label">[{k}]</span>
            <p className="rdg-info-para-text">{paragraphs[k]}</p>
          </div>
        ))}
        <div className="rdg-info-para rdg-info-para--e">
          <span className="rdg-info-para-label">[E]</span>
          <p className="rdg-info-para-text"><em>Not Given — the information is not stated in the passage.</em></p>
        </div>
      </div>
    </div>
  )
}

function PassageViewpoints({ article }) {
  return (
    <div className="rdg-viewpoints-wrap">
      <div className="rdg-viewpoints-headline">{article.headline}</div>
      <pre className="rdg-passage-pre rdg-viewpoints-body">{article.body}</pre>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   QUESTION RENDERING
══════════════════════════════════════════════════════════════ */

function MCQQuestion({ q, qKey, answers, setAnswers, color }) {
  const ans = answers[qKey]
  const answered = ans !== undefined
  const correct = answered && ans === q.correct_answer
  const opts = optsArr(q.options)
  const skillLabel = q.skill?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || ''

  return (
    <div className={`rdg-q-card${answered ? (correct ? ' rdg-q-card--ok' : ' rdg-q-card--err') : ''}`}>
      <div className="rdg-q-header">
        <span className="rdg-q-num" style={{ background: color }}>Q{q.question_number}</span>
        <span className="rdg-q-type">Multiple Choice</span>
        {skillLabel && <span className="rdg-q-skill">{skillLabel}</span>}
        {answered && (
          <span className={`rdg-q-verdict ${correct ? 'rdg-q-verdict--ok' : 'rdg-q-verdict--err'}`}>
            {correct ? '✓ Correct' : '✗ Incorrect'}
          </span>
        )}
      </div>
      <p className="rdg-q-stem">{q.question_text}</p>
      <div className="rdg-q-opts">
        {opts.map(o => {
          let cls = 'rdg-q-opt'
          if (answered) {
            if (o.letter === q.correct_answer) cls += ' rdg-q-opt--correct'
            else if (o.letter === ans)         cls += ' rdg-q-opt--wrong'
            else                               cls += ' rdg-q-opt--dim'
          }
          return (
            <button
              key={o.letter}
              className={cls}
              onClick={() => !answered && setAnswers(a => ({ ...a, [qKey]: o.letter }))}
              disabled={answered}
            >
              <span className="rdg-q-letter">{o.letter}</span>
              <span className="rdg-q-opt-text">{o.text}</span>
            </button>
          )
        })}
      </div>
      {answered && !correct && (
        <div className="rdg-q-feedback rdg-q-feedback--err">
          ✓ Correct answer: <strong>{q.correct_answer}) {q.options[q.correct_answer]}</strong>
        </div>
      )}
      {answered && correct && (
        <div className="rdg-q-feedback rdg-q-feedback--ok">Well done!</div>
      )}
    </div>
  )
}

function R3Question({ q, qKey, answers, setAnswers, color }) {
  const ans = answers[qKey]
  const answered = ans !== undefined
  const correct = answered && ans === q.correct_answer
  const opts = ['A', 'B', 'C', 'D', 'E']

  return (
    <div className={`rdg-q-card rdg-q-card--r3${answered ? (correct ? ' rdg-q-card--ok' : ' rdg-q-card--err') : ''}`}>
      <div className="rdg-q-header">
        <span className="rdg-q-num" style={{ background: color }}>Q{q.question_number}</span>
        <span className="rdg-q-type">Paragraph Matching</span>
        {answered && (
          <span className={`rdg-q-verdict ${correct ? 'rdg-q-verdict--ok' : 'rdg-q-verdict--err'}`}>
            {correct ? '✓ Correct' : '✗ Incorrect'}
          </span>
        )}
      </div>
      <div className="rdg-r3-row">
        <p className="rdg-r3-statement">{q.question_text}</p>
        <div className="rdg-r3-select-wrap">
          {answered ? (
            <span className={`rdg-r3-badge ${correct ? 'rdg-r3-badge--ok' : 'rdg-r3-badge--err'}`}>
              {ans}
              {!correct && <span className="rdg-r3-badge-correct"> → {q.correct_answer}</span>}
            </span>
          ) : (
            <select
              className="rdg-r3-select"
              style={{ borderColor: color }}
              value=""
              onChange={e => e.target.value && setAnswers(a => ({ ...a, [qKey]: e.target.value }))}
            >
              <option value="" disabled>Select paragraph</option>
              {opts.map(l => (
                <option key={l} value={l}>{l}{l === 'E' ? ' — Not Given' : ''}</option>
              ))}
            </select>
          )}
        </div>
      </div>
    </div>
  )
}

/* ── Render text with [BLANK_n] placeholders ── */
function FIBText({ text, blanks, pfx, answers, setAnswers, color }) {
  const blankMap = {}
  blanks.forEach(b => { blankMap[b.blank_number] = b })

  // Split on [BLANK_n]
  const parts = []
  const re = /\[BLANK_(\d+)\]/g
  let last = 0
  let m
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push({ type: 'text', val: text.slice(last, m.index) })
    parts.push({ type: 'blank', num: parseInt(m[1], 10) })
    last = m.index + m[0].length
  }
  if (last < text.length) parts.push({ type: 'text', val: text.slice(last) })

  return (
    <div className="rdg-fib-text">
      {parts.map((part, i) => {
        if (part.type === 'text') return <span key={i}>{part.val}</span>
        const b = blankMap[part.num]
        if (!b) return <span key={i} className="rdg-fib-blank-placeholder">[{part.num}]</span>
        const key = pfx + `fib_${b.blank_number}`
        const ans = answers[key]
        const answered = ans !== undefined
        const correct = answered && ans === b.correct_answer
        const opts = optsArr(b.options)

        if (answered) {
          return (
            <span key={i} className={`rdg-fib-inline-ans ${correct ? 'rdg-fib-inline-ans--ok' : 'rdg-fib-inline-ans--err'}`}>
              {ans}) {b.options[ans]}
              {!correct && <span className="rdg-fib-correction"> [✓ {b.correct_answer}) {b.options[b.correct_answer]}]</span>}
            </span>
          )
        }
        return (
          <select
            key={i}
            className="rdg-fib-select"
            style={{ borderColor: color }}
            value=""
            onChange={e => e.target.value && setAnswers(a => ({ ...a, [key]: e.target.value }))}
          >
            <option value="" disabled>_____</option>
            {opts.map(o => (
              <option key={o.letter} value={o.letter}>{o.letter}) {o.text}</option>
            ))}
          </select>
        )
      })}
    </div>
  )
}

function FIBSection({ fibData, fibKey, pfx, answers, setAnswers, color }) {
  const text = fibData.response_text || fibData.comment_text || ''
  const blanks = fibData.blanks || []

  return (
    <div className="rdg-fib-section">
      <div className="rdg-fib-header">
        <span className="rdg-fib-icon">✏️</span>
        <span className="rdg-fib-title">Fill in the Blanks</span>
        <span className="rdg-fib-count">{blanks.length} blanks</span>
      </div>
      <p className="rdg-fib-instructions">{fibData.instructions}</p>
      <div className="rdg-fib-card">
        <FIBText
          text={text}
          blanks={blanks}
          pfx={pfx}
          answers={answers}
          setAnswers={setAnswers}
          color={color}
        />
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════════ */
export default function ReadingPracticePage() {
  const { partId } = useParams()
  const navigate   = useNavigate()
  const { isPremium } = useAuth()
  const { requireAuth, authGateModal } = useAuthGate('Sign in with Google to start the timer, answer questions, and save your reading progress.')
  const { recordCompletion, isCompleted, getSetScore, getPartStats } = useProgress()
  const [upgradeFor, setUpgradeFor] = useState(null)
  const meta       = PART_META[partId] || PART_META.R1
  const sets       = meta.data.sets || []
  const type       = meta.type

  const [activeIdx, setActiveIdx] = useState(0)
  const [answers, setAnswers]     = useState({})
  const [timeLeft, setTimeLeft]   = useState(null)
  const [started, setStarted]     = useState(false)
  const [overtime, setOvertime]   = useState(0)
  const [showBanner, setShowBanner] = useState(false)
  const timerRef = useRef(null)
  const otRef    = useRef(null)
  const mainRef  = useRef(null)

  const set  = sets[activeIdx] || sets[0]
  const pfx  = `${activeIdx}_`
  const total = set ? setTotal(set, type) : 0
  const done  = set ? setAnswered(activeIdx, set, type, answers) : 0
  const score = set ? setScore(activeIdx, set, type, answers) : 0
  const isSetDone = done === total && total > 0

  /* Record completion when a set is fully answered — best score wins (deduped by ref) */
  const recordedRef = useRef({})
  useEffect(() => {
    if (!set || !isSetDone) return
    const sn = set.set_number
    const key = `${partId}:${sn}:${score}`
    if (recordedRef.current[key]) return
    recordedRef.current[key] = true
    recordCompletion('reading', partId, sn, score, total, buildReadingAttemptDetails(activeIdx, set, type, answers))
  }, [isSetDone, score, total, set, partId, recordCompletion])

  const dc = DIFF_COLOR[set?.difficulty] || DIFF_COLOR.intermediate

  const switchSet = (idx) => {
    if (!isPremium && (!FREE_PARTS.has(partId) || idx > 0)) { setUpgradeFor(sets[idx]?.set_number || idx + 1); return }
    setActiveIdx(idx)
    clearTimers()
    setTimeLeft(null)
    setStarted(false)
    setOvertime(0)
    setShowBanner(false)
    mainRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const clearTimers = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    if (otRef.current)    clearInterval(otRef.current)
  }

  const setAnswersWithAuth = (updater) => {
    if (!requireAuth()) return
    setAnswers(updater)
  }

  const startTimer = () => {
    if (!requireAuth()) return
    clearTimers()
    const secs = meta.timeMins * 60
    setTimeLeft(secs)
    setStarted(true)
    setOvertime(0)
    setShowBanner(false)
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current)
          setShowBanner(true)
          otRef.current = setInterval(() => setOvertime(o => o + 1), 1000)
          return 0
        }
        return t - 1
      })
    }, 1000)
  }

  useEffect(() => () => clearTimers(), [])

  const timeCritical = timeLeft !== null && timeLeft <= 60 && timeLeft > 0
  const timeAmber    = timeLeft !== null && timeLeft <= 300 && timeLeft > 60
  const timeUp       = timeLeft === 0
  const timerColor   = timeUp ? '#999' : timeCritical ? '#C8102E' : timeAmber ? '#C8972A' : COLOR

  const renderPassage = () => {
    if (!set) return null
    if (type === 'correspondence') return <PassageEmail passage={set.passage} />
    if (type === 'diagram')       return <PassageDiagram diagram={set.diagram} passage={set.passage} setNumber={set.set_number} />
    if (type === 'information')   return <PassageInfo passage={set.passage} />
    if (type === 'viewpoints')    return <PassageViewpoints article={set.article} />
    return null
  }

  const renderQuestions = () => {
    if (!set) return null
    if (type === 'information') {
      return (
        <div className="rdg-questions">
          <div className="rdg-questions-label">
            <span>Paragraph Matching</span>
            <span className="rdg-questions-count">{done}/{total} answered</span>
          </div>
          <p className="rdg-questions-hint">For each statement below, choose the paragraph (A–D) where the information is found, or <strong>E</strong> if it is not given.</p>
          {(set.questions || []).map(q => (
            <R3Question
              key={q.question_number}
              q={q}
              qKey={pfx + `r3_${q.question_number}`}
              answers={answers}
              setAnswers={setAnswersWithAuth}
              color={COLOR}
            />
          ))}
        </div>
      )
    }

    // R1, R2, R4: MCQ + FIB
    const mcqQs = set.mcq_questions || []
    const fibData = type === 'viewpoints' ? set.fill_in_blank_comment : set.fill_in_blank_response

    return (
      <>
        <div className="rdg-questions">
          <div className="rdg-questions-label">
            <span>Multiple Choice Questions</span>
            <span className="rdg-questions-count">{mcqQs.filter(q => answers[pfx + `mcq_${q.question_number}`] !== undefined).length}/{mcqQs.length} answered</span>
          </div>
          {mcqQs.map(q => (
            <MCQQuestion
              key={q.question_number}
              q={q}
              qKey={pfx + `mcq_${q.question_number}`}
              answers={answers}
              setAnswers={setAnswersWithAuth}
              color={COLOR}
            />
          ))}
        </div>
        {fibData && (
          <FIBSection
            fibData={fibData}
            pfx={pfx}
            answers={answers}
            setAnswers={setAnswersWithAuth}
            color={COLOR}
          />
        )}
      </>
    )
  }

  if (!set) {
    return (
      <div className="ps-root ps-root--wide">
        <div style={{ padding: 40, color: '#888' }}>No sets found for {partId}</div>
      </div>
    )
  }

  return (
    <div className="ps-root ps-root--wide">
      <SEO
        title={`CELPIP ${partId} — ${meta.label} Practice`}
        description={`Practice CELPIP ${meta.label} with 15 sets, instant feedback, and a countdown timer.`}
        canonical={`/celpip-reading-practice/${partId}`}
      />

      {/* ── Breadcrumb topbar ── */}
      <div className="ps-topbar ps-topbar--wide">
        <div className="ps-topbar-left">
          <button className="ps-bc-link" onClick={() => navigate('/celpip-reading-practice')}>📖 Reading</button>
          <span className="ps-bc-sep">›</span>
          <span className="ps-bc-current-bold">{partId} — {meta.label}</span>
          <span className="ps-bc-qs-tag">{sets.length} sets · CLB 4–12</span>
        </div>
        <button className="ps-arrow-btn" onClick={() => navigate('/celpip-reading-practice')}>← Back to Reading</button>
      </div>

      <div className="ps-layout-wrap ps-layout-wrap--wide">
      <div className="rdg-shell">
        {/* ── SIDEBAR ── */}
        <aside className="rdg-sidebar">
          <div className="rdg-sidebar-header">
            <div className="rdg-sidebar-icon">{meta.icon}</div>
            <div className="rdg-sidebar-header-text">
              <div className="rdg-sidebar-part" style={{ color: COLOR }}>{partId}</div>
              <div className="rdg-sidebar-label">{meta.label}</div>
            </div>
          </div>

          <div className="rdg-sidebar-stats">
            <div className="rdg-sidebar-stat">
              <span className="rdg-sidebar-stat-val" style={{ color: COLOR }}>
                {sets.filter(s => isCompleted('reading', partId, s.set_number)).length
                  || sets.filter((s, si) => setAnswered(si, s, type, answers) === setTotal(s, type) && setTotal(s, type) > 0).length}
              </span>
              <span className="rdg-sidebar-stat-lbl">Done</span>
            </div>
            <div className="rdg-sidebar-stat-divider" />
            <div className="rdg-sidebar-stat">
              <span className="rdg-sidebar-stat-val">{sets.length}</span>
              <span className="rdg-sidebar-stat-lbl">Sets</span>
            </div>
            <div className="rdg-sidebar-stat-divider" />
            <div className="rdg-sidebar-stat">
              <span className="rdg-sidebar-stat-val" style={{ color: COLOR }}>
                {(() => {
                  const ps = getPartStats('reading', partId)
                  return ps.avgCLB != null ? `CLB ${ps.avgCLB}` : '—'
                })()}
              </span>
              <span className="rdg-sidebar-stat-lbl">Avg Score</span>
            </div>
          </div>

          <div className="rdg-sidebar-progress-wrap">
            <div className="rdg-sidebar-progress-bar">
              <div className="rdg-sidebar-progress-fill" style={{ width: `${(sets.filter(s => isCompleted('reading', partId, s.set_number)).length / sets.length) * 100}%`, background: COLOR }} />
            </div>
          </div>

          <div className="rdg-sidebar-list-label">Practice Sets</div>

          <div className="rdg-set-list">
            {sets.map((s, si) => {
              const isActive = si === activeIdx
              const stored = getSetScore('reading', partId, s.set_number)
              const sDone = stored ? (stored.total || setTotal(s, type)) : setAnswered(si, s, type, answers)
              const sTotal = setTotal(s, type)
              const sCorrect = stored ? stored.score : setScore(si, s, type, answers)
              const isComplete = !!stored || (sDone === sTotal && sTotal > 0)
              const sdiff = DIFF_COLOR[s.difficulty] || DIFF_COLOR.intermediate
              const locked = !isPremium && (!FREE_PARTS.has(partId) || si > 0)
              return (
                <button
                  key={si}
                  className={`rdg-set-row${isActive ? ' rdg-set-row--active' : ''}${isComplete ? ' rdg-set-row--done' : ''}${locked ? ' rdg-set-row--locked' : ''}`}
                  style={isActive ? { background: `${COLOR}0d`, borderLeftColor: COLOR } : {}}
                  onClick={() => switchSet(si)}
                >
                  <span className="rdg-set-num" style={isActive ? { background: COLOR, color: '#fff' } : {}}>{s.set_number}</span>
                  <div className="rdg-set-info">
                    <span className="rdg-set-title">{s.title}</span>
                    <span className="rdg-set-meta">
                      <span style={{ color: sdiff, fontWeight: 600, textTransform: 'capitalize' }}>{s.difficulty}</span>
                      {' · '}
                      {isComplete
                        ? <span style={{ color: sCorrect === sTotal ? '#22c55e' : '#888', fontWeight: 600 }}>{sCorrect}/{sTotal}</span>
                        : <span>{sDone}/{sTotal}</span>}
                    </span>
                  </div>
                  {locked
                    ? <span className="set-lock-pill"><Lock size={10} strokeWidth={2.5} /> PRO</span>
                    : isComplete && <span className="rdg-set-check">✓</span>}
                </button>
              )
            })}
          </div>
        </aside>

        {/* ── MAIN ── */}
        <div className="rdg-main" ref={mainRef}>
          {/* Topbar */}
          <div className="rdg-topbar">
            <div className="rdg-topbar-left">
              <span className="rdg-part-badge" style={{ background: COLOR }}>{partId}</span>
              <div className="rdg-topbar-title-group">
                <span className="rdg-topbar-title">{set.title}</span>
                <span className="rdg-topbar-sub">Set {activeIdx + 1} of {sets.length} · {total} questions</span>
              </div>
              <span
                className="rdg-diff-badge"
                style={{ background: `${dc}18`, color: dc }}
              >
                {set.difficulty?.charAt(0).toUpperCase() + set.difficulty?.slice(1)}
              </span>
            </div>
            <div className="rdg-topbar-right">
              {!started ? (
                <button className="rdg-start-btn" style={{ background: COLOR }} onClick={startTimer}>
                  ▶ Start Timer ({meta.timeMins} min)
                </button>
              ) : (
                <div
                  className={`rdg-timer${timeCritical ? ' rdg-timer--critical' : ''}${timeAmber ? ' rdg-timer--amber' : ''}`}
                  style={{ color: timerColor, borderColor: timerColor }}
                >
                  <span className="rdg-timer-icon">⏱</span>
                  {timeUp
                    ? <span className="rdg-timer-digits">+{fmtTime(overtime)}</span>
                    : <span className="rdg-timer-digits">{fmtTime(timeLeft)}</span>
                  }
                  {timeUp && <span className="rdg-timer-label">overtime</span>}
                </div>
              )}
            </div>
          </div>

          {/* Nudges */}
          {timeAmber && !timeUp && (
            <div className="rdg-nudge rdg-nudge--amber">⏳ 5 minutes remaining — keep moving!</div>
          )}
          {timeCritical && !timeUp && (
            <div className="rdg-nudge rdg-nudge--red">🔥 Under 1 minute — trust your instincts!</div>
          )}
          {showBanner && (
            <AnimatePresence>
              <motion.div
                className="rdg-banner"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <span>⏰ Time is up! On the real exam you would stop here. In practice, you may continue.</span>
                <button className="rdg-banner-close" onClick={() => setShowBanner(false)}>✕</button>
              </motion.div>
            </AnimatePresence>
          )}

          {/* ── Split Pane: Passage left, Questions right ── */}
          <div className="rdg-split">
            {/* Left pane — passage */}
            <div className="rdg-split-passage">
              <div className="rdg-passage-box">
                <div className="rdg-passage-header">
                  <span className="rdg-passage-icon" style={{ color: COLOR }}>{meta.icon}</span>
                  <span className="rdg-passage-label" style={{ color: COLOR }}>{meta.label}</span>
                  {type === 'information' && (
                    <span className="rdg-passage-tip">Refer back to the paragraphs as you answer each question</span>
                  )}
                </div>
                {renderPassage()}
              </div>
            </div>

            {/* Right pane — questions */}
            <div className="rdg-split-questions">
              {renderQuestions()}

              {/* Score tips */}
              <ScoreTips tips={getReadingTips(type)} color={COLOR} />

              {/* Score summary */}
              <AnimatePresence>
                {isSetDone && (
                  <motion.div
                    className="rdg-score-card"
                    style={{ borderColor: COLOR }}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="rdg-score-top">
                      <span className="rdg-score-icon">🎯</span>
                      <div className="rdg-score-text">
                        <strong style={{ color: COLOR, fontSize: 22 }}>{score}</strong>
                        <span style={{ color: '#9ca3af', fontSize: 16 }}>/{total}</span>
                        <span style={{ marginLeft: 12, color: score / total >= 0.8 ? COLOR : score / total >= 0.6 ? '#C8972A' : '#C8102E', fontWeight: 700 }}>
                          {score / total >= 0.8 ? 'Excellent!' : score / total >= 0.6 ? 'Good effort!' : 'Keep practising!'}
                        </span>
                      </div>
                    </div>
                    <p className="rdg-score-title">{partId} — {set.title}</p>
                    <div className="rdg-score-bar-wrap">
                      <div className="rdg-score-bar">
                        <div
                          className="rdg-score-fill"
                          style={{ width: `${(score / total) * 100}%`, background: score / total >= 0.8 ? COLOR : score / total >= 0.6 ? '#C8972A' : '#C8102E' }}
                        />
                      </div>
                      <span className="rdg-score-pct">{Math.round((score / total) * 100)}%</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Navigation */}
          <div className="rdg-nav">
            <button
              className="rdg-nav-btn"
              onClick={() => activeIdx > 0 && switchSet(activeIdx - 1)}
              disabled={activeIdx === 0}
            >
              ← Previous Set
            </button>
            <span className="rdg-nav-counter" style={{ color: COLOR }}>
              {partId} · Set {activeIdx + 1} of {sets.length}
            </span>
            <button
              className="rdg-nav-btn rdg-nav-btn--next"
              style={{ background: COLOR, borderColor: COLOR }}
              onClick={() => activeIdx < sets.length - 1 && switchSet(activeIdx + 1)}
              disabled={activeIdx === sets.length - 1}
            >
              Next Set →
            </button>
          </div>
        </div>
      </div>
      </div>
      <UpgradeModal open={!!upgradeFor} onClose={() => setUpgradeFor(null)} setNumber={upgradeFor} sectionLabel="Reading" />
      {authGateModal}
    </div>
  )
}
