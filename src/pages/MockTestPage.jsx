import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import SEO from '../components/SEO'
import { useAuth } from '../context/AuthContext'
import { useTestSession } from '../hooks/useTestSession'
import { supabase } from '../lib/supabase'
import {
  buildMockReportCard,
  formatBandScore,
  getAiBand,
  normalizeAiResult,
  summarizeMockScores,
  summarizeSubjectiveSection,
} from '../lib/mockScoreUtils'
import { LISTENING_DATA } from '../data/listeningData'
import { WRITING_SETS } from '../data/writingData'
import { asset } from '../data/constants'
import speakingQData from '../data/speakingQuestions.json'
import r1Data from '../data/reading/R1_correspondence.json'
import r2Data from '../data/reading/R2_apply_diagram.json'
import r3Data from '../data/reading/R3_information.json'
import r4Data from '../data/reading/R4_viewpoints.json'

/* ═══════════════════════════════════════════════════════════════
   CELPIP Mock Test — Full Exam Simulation
   Self-contained: same UI as practice pages (ll-*, rdg-*, wl-*, sl-* CSS)
   Flow: Landing → L1-L6 → Listening Results → R1-R4 → Reading Results
         → W1-W2 → Writing Results → S1-S8 → Speaking Results → Final
═══════════════════════════════════════════════════════════════ */

const COLORS = { listening: '#4A90D9', reading: '#2D8A56', writing: '#C8972A', speaking: '#C8102E' }
const SECTION_ICONS = { listening: '\uD83C\uDFA7', reading: '\uD83D\uDCD6', writing: '\u270D\uFE0F', speaking: '\uD83C\uDF99\uFE0F' }
const LETTERS = ['A', 'B', 'C', 'D', 'E']

const SECTION_ORDER = ['listening', 'reading', 'writing', 'speaking']
const SECTION_PARTS = {
  listening: ['L1','L2','L3','L4','L5','L6'],
  reading: ['R1','R2','R3','R4'],
  writing: ['W1','W2'],
  speaking: ['S1','S2','S3','S4','S5','S6','S7','S8'],
}

const PART_LABELS = {
  L1: 'Problem Solving', L2: 'Daily Life Conversation',
  L3: 'Listening for Information', L4: 'Listening to a News Item',
  L5: 'Listening to a Discussion', L6: 'Listening for Viewpoints',
  R1: 'Reading Correspondence', R2: 'Apply a Diagram',
  R3: 'Reading for Information', R4: 'Reading for Viewpoints',
  W1: 'Writing an Email', W2: 'Survey Response',
  S1: 'Giving Advice', S2: 'Personal Experience',
  S3: 'Describing a Scene', S4: 'Making Predictions',
  S5: 'Comparing & Persuading', S6: 'Difficult Situation',
  S7: 'Expressing Opinions', S8: 'Unusual Situation',
}

// Listening 55 min total (per-part audio+questions), Reading 55 min (single section-level timer), Writing 53 min (per-task), Speaking per-prompt
const PART_TIMES = {
  L1: 11, L2: 8, L3: 11, L4: 7, L5: 9, L6: 9,
  R1: 11, R2: 13, R3: 14, R4: 17,
  W1: 27, W2: 26,
}
const READING_SECTION_MINUTES = 55

const READING_JSON = { R1: r1Data, R2: r2Data, R3: r3Data, R4: r4Data }
const READING_TYPE = { R1: 'correspondence', R2: 'diagram', R3: 'information', R4: 'viewpoints' }
const READING_ICON = { R1: '\u2709\uFE0F', R2: '\uD83D\uDCCA', R3: '\uD83D\uDCC4', R4: '\u2696\uFE0F' }

const SPEAKING_META = {
  1: { label: 'Giving Advice', icon: '\uD83D\uDCAC' },
  2: { label: 'Personal Experience', icon: '\uD83D\uDDE3\uFE0F' },
  3: { label: 'Describing a Scene', icon: '\uD83D\uDDBC\uFE0F' },
  4: { label: 'Making Predictions', icon: '\uD83D\uDD2E' },
  5: { label: 'Comparing & Persuading', icon: '\u2696\uFE0F' },
  6: { label: 'Difficult Situation', icon: '\u26A0\uFE0F' },
  7: { label: 'Expressing Opinions', icon: '\uD83D\uDCDD' },
  8: { label: 'Unusual Situation', icon: '\u2753' },
}

const DIFF_COLORS = { easy: '#2D8A56', intermediate: '#C8972A', advanced: '#C8102E' }

/* ── Seed-based random ── */
function seededRandom(seed) {
  let s = seed
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646 }
}

/* ── Build one set per part ── */
function buildExamSets(examNumber) {
  const rng = seededRandom(examNumber * 7919)
  const pick = (arr) => arr[Math.floor(rng() * arr.length)]
  const pickIdx = (len) => Math.floor(rng() * len)
  const sets = {}

  for (const p of SECTION_PARTS.listening) {
    const d = LISTENING_DATA[p]
    if (d?.sets?.length) { const idx = pickIdx(d.sets.length); sets[p] = { ...d.sets[idx], _setIdx: idx } }
  }
  for (const p of SECTION_PARTS.reading) {
    const d = READING_JSON[p]
    if (d?.sets?.length) { const idx = pickIdx(d.sets.length); sets[p] = { ...d.sets[idx], _setIdx: idx } }
  }
  const w1All = WRITING_SETS.flatMap(s => s.tasks.filter(t => t.taskNumber === 1))
  const w2All = WRITING_SETS.flatMap(s => s.tasks.filter(t => t.taskNumber === 2))
  if (w1All.length) sets.W1 = pick(w1All)
  if (w2All.length) sets.W2 = pick(w2All)
  const spkIdx = pickIdx(speakingQData.sets.length)
  const spkSet = speakingQData.sets[spkIdx]
  for (const task of spkSet.tasks) sets[`S${task.task_number}`] = { ...task, _setId: spkSet.set_id, _difficulty: spkSet.difficulty }
  return sets
}

/* ── Helpers ── */
function fmtTime(secs) {
  if (secs === null || secs === undefined) return '--:--'
  const m = Math.floor(Math.abs(secs) / 60)
  const s = Math.abs(secs) % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

/* CELPIP score levels — matches official CELPIP 1–12 / M scale.
   Listening & Reading share ~38 raw questions; we scale raw → level. */
function getCelpipLevel(correct, total) {
  const raw = total === 38 ? correct : Math.round((correct / Math.max(total, 1)) * 38)
  if (raw >= 37) return { level: 12, num: 12, label: 'Advanced Proficiency',          color: '#166534', tier: 'expert' }
  if (raw >= 35) return { level: 11, num: 11, label: 'Advanced Proficiency',          color: '#166534', tier: 'expert' }
  if (raw >= 33) return { level: 10, num: 10, label: 'Highly Effective Proficiency',  color: '#15803D', tier: 'expert' }
  if (raw >= 31) return { level: 9,  num: 9,  label: 'Effective Proficiency',         color: '#16A34A', tier: 'strong' }
  if (raw >= 28) return { level: 8,  num: 8,  label: 'Good Proficiency',              color: '#2D8A56', tier: 'strong' }
  if (raw >= 25) return { level: 7,  num: 7,  label: 'Adequate Proficiency',          color: '#4A90D9', tier: 'strong' }
  if (raw >= 21) return { level: 6,  num: 6,  label: 'Developing Proficiency',        color: '#4A90D9', tier: 'fair'   }
  if (raw >= 17) return { level: 5,  num: 5,  label: 'Acquiring Proficiency',         color: '#C8972A', tier: 'fair'   }
  if (raw >= 13) return { level: 4,  num: 4,  label: 'Adequate for Daily Life',       color: '#C8972A', tier: 'weak'   }
  if (raw >= 9)  return { level: 3,  num: 3,  label: 'Some Proficiency',              color: '#D97706', tier: 'weak'   }
  if (raw >= 5)  return { level: 2,  num: 2,  label: 'Limited Proficiency',           color: '#DC2626', tier: 'weak'   }
  if (raw >= 1)  return { level: 1,  num: 1,  label: 'Minimal Proficiency',           color: '#C8102E', tier: 'weak'   }
  return              { level: 'M', num: 0,  label: 'Minimal (very little/no ability)', color: '#991B1B', tier: 'weak' }
}

function optsArr(opts) {
  return ['A','B','C','D','E'].map(l => ({ letter: l, text: opts[l] })).filter(o => o.text)
}

/* ── Reading question helpers ── */
function rdgSetTotal(set, type) {
  if (type === 'information') return (set.questions || []).length
  const mcq = (set.mcq_questions || []).length
  const fib = type === 'viewpoints'
    ? (set.fill_in_blank_comment?.blanks || []).length
    : (set.fill_in_blank_response?.blanks || []).length
  return mcq + fib
}
function rdgSetScore(set, type, answers, pfx) {
  let correct = 0
  if (type === 'information') {
    (set.questions || []).forEach(q => { if (answers[pfx + `r3_${q.question_number}`] === q.correct_answer) correct++ })
  } else {
    (set.mcq_questions || []).forEach(q => { if (answers[pfx + `mcq_${q.question_number}`] === q.correct_answer) correct++ })
    const fibs = type === 'viewpoints' ? (set.fill_in_blank_comment?.blanks || []) : (set.fill_in_blank_response?.blanks || [])
    fibs.forEach(b => { if (answers[pfx + `fib_${b.blank_number}`] === b.correct_answer) correct++ })
  }
  return correct
}
function rdgSetDone(set, type, answers, pfx) {
  let count = 0
  if (type === 'information') {
    (set.questions || []).forEach(q => { if (answers[pfx + `r3_${q.question_number}`] !== undefined) count++ })
  } else {
    (set.mcq_questions || []).forEach(q => { if (answers[pfx + `mcq_${q.question_number}`] !== undefined) count++ })
    const fibs = type === 'viewpoints' ? (set.fill_in_blank_comment?.blanks || []) : (set.fill_in_blank_response?.blanks || [])
    fibs.forEach(b => { if (answers[pfx + `fib_${b.blank_number}`] !== undefined) count++ })
  }
  return count
}

/* ── AI scoring stubs (same API as practice pages) ── */
async function scoreWritingAI(responseText, prompt, criteria, taskType) {
  try {
    const res = await fetch('/api/score-writing', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ responseText, prompt, criteria, taskType }),
    })
    if (!res.ok) throw new Error('Scoring failed')
    return normalizeAiResult(await res.json())
  } catch {
    return { overall: 0, clbBand: '-', scores: {}, feedback: 'Scoring unavailable.', suggestions: [], error: true }
  }
}
async function scoreSpeakingAI(responseText, prompt, taskType, topic) {
  try {
    const res = await fetch('/api/score-speaking', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ responseText, prompt, taskType, topic }),
    })
    if (!res.ok) throw new Error('Scoring failed')
    return normalizeAiResult(await res.json())
  } catch {
    return { overall: 0, clbBand: '-', scores: {}, feedback: 'Scoring unavailable.', suggestions: [], error: true }
  }
}

function normalizePartResult(result) {
  if (!result?.aiResult) return result
  return { ...result, aiResult: normalizeAiResult(result.aiResult) }
}


/* ═══════════════════════════════════════════════════════════════
   MOCK SIDEBAR — shows parts in current section
═══════════════════════════════════════════════════════════════ */
function MockSidebar({ section, parts, activePartIdx, color, scores, icon, sectionLabel, onSkipSection }) {
  const isObjective = section === 'listening' || section === 'reading'
  const completedCount = parts.filter(p => scores[p]).length
  // Raw correct/total fraction across completed parts (only makes sense for Listening & Reading)
  const totals = parts.reduce((acc, p) => {
    const sc = scores[p]
    if (sc && typeof sc.total === 'number' && sc.total > 0) {
      acc.correct += (sc.correct || 0)
      acc.total += sc.total
    }
    return acc
  }, { correct: 0, total: 0 })
  const hasFraction = totals.total > 0
  const subjectiveSummary = isObjective ? null : summarizeSubjectiveSection(scores, parts)
  const sectionScoreText = isObjective
    ? (hasFraction ? `${totals.correct}/${totals.total}` : '\u2014')
    : formatBandScore(subjectiveSummary?.band)

  return (
    <aside className="ll-sidebar">
      <div className="ll-sidebar-header">
        <div className="ll-sidebar-icon">{icon}</div>
        <div className="ll-sidebar-header-text">
          <div className="ll-sidebar-title" style={{ color }}>{sectionLabel}</div>
          <div className="ll-sidebar-label">Mock Exam</div>
        </div>
      </div>
      <div className="ll-sidebar-stats">
        <div className="ll-sidebar-stat">
          <span className="ll-sidebar-stat-val">{completedCount}</span>
          <span className="ll-sidebar-stat-lbl">Done</span>
        </div>
        <div className="ll-sidebar-stat-divider" />
        <div className="ll-sidebar-stat">
          <span className="ll-sidebar-stat-val">{parts.length}</span>
          <span className="ll-sidebar-stat-lbl">Total</span>
        </div>
        <div className="ll-sidebar-stat-divider" />
        <div className="ll-sidebar-stat">
          <span className="ll-sidebar-stat-val">{sectionScoreText}</span>
          <span className="ll-sidebar-stat-lbl">Score</span>
        </div>
      </div>
      <div className="ll-sidebar-progress-wrap">
        <div className="ll-sidebar-progress-bar">
          <div className="ll-sidebar-progress-fill" style={{ width: `${parts.length > 0 ? (completedCount / parts.length) * 100 : 0}%`, background: color }} />
        </div>
      </div>
      <div style={{ padding: '0 16px 12px' }}>
        {onSkipSection && completedCount < parts.length && (
          <button
            type="button"
            onClick={() => { if (window.confirm(`Skip the rest of ${sectionLabel}? Unanswered parts will be marked as skipped.`)) onSkipSection() }}
            style={{
              width: '100%', padding: '9px 12px', fontSize: 12, fontWeight: 700, letterSpacing: '0.6px', textTransform: 'uppercase',
              color: '#6b7280', background: '#fff', border: '1px dashed #d1d5db', borderRadius: 8, cursor: 'pointer',
            }}
          >
            Skip section →
          </button>
        )}
      </div>
      <div className="ll-sidebar-list-label">Exam Parts</div>
      <div className="ll-part-list">
        {parts.map((p, pi) => {
          const isActive = pi === activePartIdx
          const done = !!scores[p]
          const sc = scores[p]
          const subjectiveBand = isObjective ? null : getAiBand(sc?.aiResult)
          const partScoreText = isObjective ? `${sc?.correct ?? 0}/${sc?.total ?? 0}` : formatBandScore(subjectiveBand)
          const partScoreColor = isObjective
            ? (sc?.correct === sc?.total ? '#22c55e' : '#888')
            : (subjectiveBand != null ? color : '#888')
          return (
            <div
              key={p}
              className={`ll-set-row${isActive ? ' ll-set-row--active' : ''}${done ? ' ll-set-row--done' : ''}`}
              style={isActive ? { borderLeftColor: color } : {}}
            >
              <span className="ll-set-num" style={isActive ? { background: color } : done ? { background: '#22c55e' } : {}}>{p}</span>
              <div className="ll-set-info">
                <span className="ll-set-title">{PART_LABELS[p]}</span>
                <span className="ll-set-meta">
                  {done && sc && <span className="ll-set-score" style={{ color: partScoreColor }}>{partScoreText}</span>}
                  {!done && isActive && <span style={{ color, fontWeight: 600 }}>In Progress</span>}
                  {!done && !isActive && pi > activePartIdx && <span style={{ color: '#bbb' }}>Upcoming</span>}
                </span>
              </div>
              {done && <span className="ll-set-check">{'\u2713'}</span>}
            </div>
          )
        })}
      </div>
    </aside>
  )
}


/* ═══════════════════════════════════════════════════════════════
   LISTENING PART — One set, same ll-* UI
═══════════════════════════════════════════════════════════════ */
function ListeningPart({ partId, setData, partData, color, onDone }) {
  const [answers, setAnswers] = useState({})
  const [timeLeft, setTimeLeft] = useState(null)
  const [started, setStarted] = useState(false)
  const [overtime, setOvertime] = useState(0)
  const [showBanner, setShowBanner] = useState(false)
  const [showTranscript, setShowTranscript] = useState(false)
  const [audioPhase, setAudioPhase] = useState('idle')
  const [currentLineIdx, setCurrentLineIdx] = useState(-1)
  const [audioError, setAudioError] = useState(false)
  const audioRef = useRef(null)
  const lineIdxRef = useRef(-1)
  const audioLoadingRef = useRef(false)
  const audioFailCountRef = useRef(0)
  const audioRetryRef = useRef(null)
  const [allLinesFailed, setAllLinesFailed] = useState(false)
  const [partialAudioFail, setPartialAudioFail] = useState(false)
  const timerRef = useRef(null)
  const otRef = useRef(null)
  const transcriptBodyRef = useRef(null)
  const transcriptLineRefs = useRef([])
  const startTimerRef = useRef(null)

  const qs = setData.questions || []
  const total = qs.length
  const aKey = (qi) => `q_${qi}`
  const doneCount = qs.filter((_, qi) => answers[aKey(qi)] !== undefined).length
  const correctCnt = qs.filter((q, qi) => { const a = answers[aKey(qi)]; return a !== undefined && a === q.answer }).length
  const isSetDone = doneCount === total && total > 0
  const scorePct = total > 0 ? Math.round((correctCnt / total) * 100) : 0
  const reviewQuestions = () => qs.map((q, qi) => ({
    num: q.num ?? qi + 1,
    text: q.text,
    userAnswer: answers[aKey(qi)],
    correctAnswer: q.answer,
    options: q.options,
    skill: q.skill,
  }))

  const getAudioPath = (lineIdx) => {
    const sn = String(setData.setNumber).padStart(2, '0')
    const ln = String(lineIdx).padStart(2, '0')
    return asset(`/audio/${partId}/set-${sn}/line-${ln}.mp3`)
  }

  const playAudioElement = (audio, idx, attempt = 0) => {
    audio.play().catch(() => {
      audioLoadingRef.current = false
      if (audio.error || lineIdxRef.current !== idx) return
      if (audioRetryRef.current) clearTimeout(audioRetryRef.current)
      const retryDelay = document.hidden ? 1000 : Math.min(1200, 250 + attempt * 250)
      audioRetryRef.current = setTimeout(() => playAudioElement(audio, idx, attempt + 1), retryDelay)
    })
  }

  const playFromLine = (idx) => {
    if (!audioRef.current || !setData.transcript || idx >= setData.transcript.length) {
      setAudioPhase('done'); setCurrentLineIdx(-1); lineIdxRef.current = -1;
      // If every single line failed, give prominent error
      if (audioFailCountRef.current >= (setData.transcript?.length || 1)) {
        setAllLinesFailed(true); setAudioError(true); setShowTranscript(true)
      } else if (audioFailCountRef.current > 0) {
        setPartialAudioFail(true)
      }
      return
    }
    if (audioLoadingRef.current && lineIdxRef.current === idx) return // guard double-fire
    audioLoadingRef.current = true
    lineIdxRef.current = idx; setCurrentLineIdx(idx)
    const audio = audioRef.current
    audio.src = getAudioPath(idx)
    playAudioElement(audio, idx)
  }

  useEffect(() => {
    const audio = audioRef.current; if (!audio) return
    const advance = () => {
      audioLoadingRef.current = false
      const next = lineIdxRef.current + 1
      if (setData.transcript && next < setData.transcript.length) { playFromLine(next) }
      else { setAudioPhase('done'); setCurrentLineIdx(-1); lineIdxRef.current = -1; if (startTimerRef.current) startTimerRef.current() }
    }
    const onEnded = () => advance()
    const onError = () => { audioFailCountRef.current++; setAudioError(true); advance() }
    audio.addEventListener('ended', onEnded); audio.addEventListener('error', onError)
    return () => { audio.removeEventListener('ended', onEnded); audio.removeEventListener('error', onError) }
  }, [])

  useEffect(() => {
    if (currentLineIdx >= 0 && transcriptLineRefs.current[currentLineIdx] && transcriptBodyRef.current) {
      const el = transcriptLineRefs.current[currentLineIdx]
      const container = transcriptBodyRef.current
      container.scrollTo({ top: el.offsetTop - container.offsetTop - container.clientHeight / 2 + el.clientHeight / 2, behavior: 'smooth' })
    }
  }, [currentLineIdx])

  const startAudio = () => { setAudioPhase('playing'); setAudioError(false); setAllLinesFailed(false); setPartialAudioFail(false); audioFailCountRef.current = 0; audioLoadingRef.current = false; playFromLine(0) }

  const stopAudio = () => {
    if (audioRetryRef.current) clearTimeout(audioRetryRef.current)
    audioRetryRef.current = null
    audioLoadingRef.current = false
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.removeAttribute('src')
      audioRef.current.load()
    }
  }

  const skipAudio = () => {
    stopAudio()
    setAudioPhase('done')
    setCurrentLineIdx(-1)
    lineIdxRef.current = -1
    setAllLinesFailed(false)
    setPartialAudioFail(false)
    setAudioError(false)
    if (!started && startTimerRef.current) startTimerRef.current()
  }

  const tryAgain = () => {
    stopAudio()
    if (timerRef.current) clearInterval(timerRef.current)
    if (otRef.current) clearInterval(otRef.current)
    setAnswers({})
    setTimeLeft(null)
    setStarted(false)
    setOvertime(0)
    setShowBanner(false)
    setShowTranscript(false)
    setAudioPhase('idle')
    setCurrentLineIdx(-1)
    lineIdxRef.current = -1
    setAudioError(false)
    setAllLinesFailed(false)
    setPartialAudioFail(false)
    audioFailCountRef.current = 0
  }

  const startTimer = () => {
    if (started) return
    const mins = PART_TIMES[partId] || 8
    setTimeLeft(mins * 60); setStarted(true); setOvertime(0); setShowBanner(false)
    if (timerRef.current) clearInterval(timerRef.current)
    if (otRef.current) clearInterval(otRef.current)
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); setShowBanner(true); otRef.current = setInterval(() => setOvertime(o => o + 1), 1000); return 0 }
        return t - 1
      })
    }, 1000)
  }
  startTimerRef.current = startTimer

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); if (otRef.current) clearInterval(otRef.current); stopAudio() }, [])

  useEffect(() => {
    if (isSetDone) {
      if (timerRef.current) clearInterval(timerRef.current); if (otRef.current) clearInterval(otRef.current)
    }
  }, [isSetDone])

  const handleAnswer = (qi, optIdx) => { if (answers[aKey(qi)] !== undefined) return; setAnswers(a => ({ ...a, [aKey(qi)]: optIdx })) }

  const SKILL_LABELS = {
    main_idea: 'Main Idea', detail_recall: 'Detail Recall', decision_tracking: 'Decision Tracking',
    speaker_intent: 'Speaker Intent', implied_meaning: 'Implied Meaning', inference: 'Inference',
    tone_recognition: 'Tone', sequencing: 'Sequencing', specific_fact: 'Specific Fact',
    fact_extraction: 'Fact Extraction', context_inference: 'Context Inference',
  }

  const timeCritical = timeLeft !== null && timeLeft <= 60 && timeLeft > 0
  const timeAmber = timeLeft !== null && timeLeft <= 300 && timeLeft > 60
  const timeUp = timeLeft === 0
  const timerColor = timeUp ? '#999' : timeCritical ? '#C8102E' : timeAmber ? '#C8972A' : color

  return (
    <div className="ll-main">
      <audio ref={audioRef} preload="auto" />
      <div className="ll-topbar">
        <div className="ll-topbar-left">
          <span className="ll-part-badge" style={{ background: color }}>{partId}</span>
          <div className="ll-topbar-title-group">
            <span className="ll-topbar-title">{setData.title || PART_LABELS[partId]}</span>
            <span className="ll-topbar-set-tag">{total} questions{PART_TIMES[partId] ? ` \u00B7 ${PART_TIMES[partId]} min` : ''}</span>
          </div>
        </div>
        <div className="ll-topbar-right">
          {doneCount > 0 && (
            <div className="ll-live-score" style={{ borderColor: color }}>
              <span className="ll-live-score-num" style={{ color }}>{correctCnt}/{doneCount}</span>
            </div>
          )}
          {started ? (
            <div className={`ll-timer${timeCritical ? ' ll-timer--critical' : ''}${timeUp ? ' ll-timer--up' : ''}`} style={{ color: timerColor, borderColor: timerColor }}>
              <span className="ll-timer-icon">{'\u23F1'}</span>
              {timeUp ? <span className="ll-timer-digits">+{fmtTime(overtime)}</span> : <span className="ll-timer-digits">{fmtTime(timeLeft)}</span>}
              {timeUp && <span className="ll-timer-up-label">overtime</span>}
            </div>
          ) : (
            <div className="ll-audio-actions">
              <button className="ll-start-btn" style={{ background: color }} onClick={startAudio}>
                {'\u25B6'} Listen & Start ({PART_TIMES[partId] || 8} min)
              </button>
              <button className="ll-skip-audio-btn" onClick={skipAudio}>Skip Audio</button>
            </div>
          )}
        </div>
      </div>

      {timeAmber && !timeUp && <div className="ll-nudge ll-nudge--amber">{'\u23F3'} 5 minutes remaining — keep a steady pace!</div>}
      {timeCritical && !timeUp && <div className="ll-nudge ll-nudge--red">{'\uD83D\uDD25'} Under 1 minute left — trust your instincts!</div>}
      {showBanner && (
        <div className="ll-banner">
          <span>{'\u23F0'} Time is up! On the real exam you would stop here. But this is practice — take your time.</span>
          <button className="ll-banner-close" onClick={() => setShowBanner(false)}>{'\u2715'}</button>
        </div>
      )}

      <div className="ll-context-box" style={{ borderLeftColor: color }}>
        <p className="ll-context-text">{setData.context}</p>
        {setData.speakers?.length > 0 && (
          <div className="ll-speakers">
            {setData.speakers.map(sp => (
              <span key={sp.id} className="ll-speaker-tag">
                <span className="ll-speaker-id" style={{ background: color }}>{sp.id}</span>
                {sp.name} — {sp.role}
              </span>
            ))}
          </div>
        )}
      </div>

      {audioPhase === 'idle' && !started && (
        <div className="ll-audio-cta" style={{ borderColor: `${color}44` }}>
          <div className="ll-audio-cta-icon">{'\uD83C\uDFA7'}</div>
          <div className="ll-audio-cta-text">
            <strong>Press "Listen & Start" to begin the simulation</strong>
            <span>Listen to the full audio first — questions appear after the audio ends, just like the real test.</span>
          </div>
        </div>
      )}
      {audioPhase === 'playing' && (
        <div className="ll-audio-bar ll-audio-bar--playing" style={{ borderColor: color, background: `${color}0a` }}>
          <span className="ll-audio-pulse" style={{ background: color }} />
          <span className="ll-audio-bar-text">{'\uD83D\uDD0A'} Playing line {currentLineIdx + 1} of {(setData.transcript || []).length}...</span>
          <button className="ll-audio-skip" onClick={skipAudio}>Skip Audio</button>
        </div>
      )}
      {audioPhase === 'done' && !allLinesFailed && (
        <div className="ll-audio-bar ll-audio-bar--done">
          <span>{'\u2705'} Audio complete — your time has started. Answer the questions below.</span>
          <button className="ll-audio-replay" style={{ color }} onClick={() => { setAudioPhase('playing'); setAudioError(false); setAllLinesFailed(false); setPartialAudioFail(false); audioFailCountRef.current = 0; playFromLine(0) }}>{'\uD83D\uDD01'} Replay</button>
        </div>
      )}
      {audioPhase === 'done' && allLinesFailed && (
        <div className="ll-audio-bar ll-audio-bar--error">
          <span>{'\u26A0\uFE0F'} Audio files could not be loaded. Use the transcript below to read along instead.</span>
          <button className="ll-audio-replay" style={{ color }} onClick={() => { setAudioPhase('playing'); setAudioError(false); setAllLinesFailed(false); setPartialAudioFail(false); audioFailCountRef.current = 0; playFromLine(0) }}>{'\uD83D\uDD01'} Retry</button>
        </div>
      )}
      {partialAudioFail && !allLinesFailed && (
        <div className="ll-audio-bar ll-audio-bar--error">
          <span>{'\u26A0\uFE0F'} Some audio lines skipped — transcript is open so you can follow along.</span>
          <button className="ll-audio-replay" style={{ color }} onClick={() => { setShowTranscript(true); setAudioError(false); setAllLinesFailed(false); setPartialAudioFail(false); audioFailCountRef.current = 0; playFromLine(0) }}>{'\uD83D\uDD01'} Retry audio</button>
        </div>
      )}

      {audioPhase !== 'idle' && setData.transcript && (
        <div className="ll-transcript-box">
          <div className="ll-transcript-header">
            <span className="ll-transcript-label" style={{ color }}>{'\uD83C\uDFA7'} Transcript</span>
            <button className="ll-transcript-toggle" onClick={() => setShowTranscript(!showTranscript)}>{showTranscript ? 'Hide' : 'Show'}</button>
          </div>
          {showTranscript && (
            <>
              <div className="ll-transcript-divider" />
              <div className="ll-transcript-body" ref={transcriptBodyRef}>
                {setData.transcript.map((t, ti) => {
                  const sp = setData.speakers ? setData.speakers.find(s => s.id === t.speaker) : null
                  return (
                    <div key={ti} ref={el => transcriptLineRefs.current[ti] = el} className={`ll-transcript-line${ti === currentLineIdx ? ' ll-transcript-line--active' : ''}`}>
                      <span className="ll-transcript-speaker" style={{ color }}>{sp ? sp.name : t.speaker}:</span>
                      <span className="ll-transcript-text">{t.text}</span>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>
      )}

      {audioPhase === 'playing' && (
        <div className="ll-questions-locked" style={{ borderColor: `${color}33` }}>
          <span className="ll-questions-locked-icon">{'\uD83D\uDD12'}</span>
          <span className="ll-questions-locked-text">Questions will appear after the audio finishes</span>
        </div>
      )}
      {(audioPhase === 'done' || (audioPhase === 'idle' && doneCount > 0)) && (
        <div className="ll-questions">
          <div className="ll-questions-header">
            <span className="ll-questions-label">Questions ({total})</span>
            {doneCount > 0 && <span className="ll-questions-progress">{doneCount}/{total} answered</span>}
          </div>
          {qs.map((q, qi) => {
            const key = aKey(qi)
            const ans = answers[key]
            const answered = ans !== undefined
            const correct = answered && ans === q.answer
            return (
              <div key={qi} className={`ll-q-card${answered ? (correct ? ' ll-q-card--correct' : ' ll-q-card--wrong') : ''}`}>
                <div className="ll-q-header">
                  <span className="ll-q-num" style={{ background: color }}>Q{q.num}</span>
                  <span className="ll-q-skill-tag">{SKILL_LABELS[q.skill] || q.skill}</span>
                  {answered && (
                    <span className={`ll-q-verdict ${correct ? 'll-q-verdict--ok' : 'll-q-verdict--err'}`}>
                      {correct ? '\u2713 Correct' : '\u2717 Incorrect'}
                    </span>
                  )}
                </div>
                <p className="ll-q-stem">{q.text}</p>
                <div className="ll-q-opts">
                  {q.options.map((opt, oi) => {
                    let cls = 'll-q-opt'
                    if (answered) {
                      if (oi === q.answer) cls += ' ll-q-opt--correct'
                      else if (oi === ans) cls += ' ll-q-opt--wrong'
                      else cls += ' ll-q-opt--dim'
                    }
                    return (
                      <button key={oi} className={cls} onClick={() => handleAnswer(qi, oi)} disabled={answered}>
                        <span className="ll-q-letter">{LETTERS[oi]}</span>
                        <span className="ll-q-opt-text">{opt}</span>
                      </button>
                    )
                  })}
                </div>
                {answered && !correct && (
                  <div className="ll-q-correct-ans">{'\u2713'} Correct answer: <strong>{q.options[q.answer]}</strong></div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Done — next part button */}
      {isSetDone && (
        <motion.div className="mk-part-done" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.18 }}>
                <motion.div className="mk-part-done-score" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.18 }}>
                <span className="mk-part-done-emoji">{scorePct >= 80 ? '⭐' : scorePct >= 60 ? '💪' : '💡'}</span>
                <span className="mk-part-done-text">{partId} complete — <strong>{correctCnt}/{total}</strong></span>
              </motion.div>
          <button className="mk-next-btn mk-next-btn--secondary" onClick={tryAgain}>
            Try Again
          </button>
          <button className="mk-next-btn" style={{ background: color }} onClick={() => onDone({ correct: correctCnt, total, answers, questions: reviewQuestions() })}>
            Next Part {'\u2192'}
          </button>
        </motion.div>
      )}
    </div>
  )
}


/* ═══════════════════════════════════════════════════════════════
   READING PART — One set, same rdg-* UI with split pane
═══════════════════════════════════════════════════════════════ */
function ZoomableDiagram({ src, alt, onError }) {
  const [zoomed, setZoomed] = useState(false)
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
    <>
      <img
        src={src}
        alt={alt}
        className="rdg-diagram-img"
        onError={onError}
        onClick={() => setZoomed(true)}
        style={{ cursor: 'zoom-in' }}
      />
      <button
        type="button"
        onClick={() => setZoomed(true)}
        aria-label="Zoom diagram"
        title="Click to zoom"
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
      >🔍</button>
      {zoomed && (
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
            src={src}
            alt={alt}
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '95vw', maxHeight: '92vh', objectFit: 'contain',
              borderRadius: 8, background: '#fff',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            }}
          />
        </div>
      )}
    </>
  )
}

function ReadingPassage({ set, type }) {
  const [imgOk, setImgOk] = useState(true)

  if (type === 'correspondence') {
    const p = set.passage
    return (
      <div className="rdg-email">
        <div className="rdg-email-header">
          <div className="rdg-email-row"><span className="rdg-email-field">From:</span><span className="rdg-email-val">{p.from}</span></div>
          <div className="rdg-email-row"><span className="rdg-email-field">To:</span><span className="rdg-email-val">{p.to}</span></div>
          <div className="rdg-email-row"><span className="rdg-email-field">Subject:</span><span className="rdg-email-val rdg-email-subject">{p.subject}</span></div>
        </div>
        <div className="rdg-email-body"><pre className="rdg-passage-pre">{p.body}</pre></div>
      </div>
    )
  }
  if (type === 'diagram') {
    const imgSrc = asset(`/images/R2/${set.set_number}.png`)
    return (
      <div className="rdg-diagram-wrap">
        <div className="rdg-diagram-label">{'\uD83D\uDCCA'} Visual Information</div>
        <div className="rdg-diagram-box" style={{ position: 'relative' }}>
          {imgOk ? (
            <ZoomableDiagram src={imgSrc} alt={`Diagram — Set ${set.set_number}`} onError={() => setImgOk(false)} />
          ) : (
            <div className="mk-img-fallback"><span className="mk-img-fallback-icon">{'\uD83D\uDCCA'}</span><span>Diagram image could not be loaded.<br/>Answer from the passage text below.</span></div>
          )}
        </div>
        {set.passage && (
          <div className="rdg-diagram-passage">
            <div className="rdg-diagram-passage-label">{'\uD83D\uDCDD'} Reading Passage</div>
            <pre className="rdg-passage-pre">{typeof set.passage === 'string' ? set.passage : set.passage.body || set.passage.text || JSON.stringify(set.passage)}</pre>
          </div>
        )}
      </div>
    )
  }
  if (type === 'information') {
    const p = set.passage
    const keys = Object.keys(p.paragraphs || {})
    return (
      <div className="rdg-info-wrap">
        <p className="rdg-info-intro">{p.intro}</p>
        <div className="rdg-info-paragraphs">
          {keys.map(k => (
            <div key={k} className="rdg-info-para">
              <span className="rdg-info-para-label">[{k}]</span>
              <p className="rdg-info-para-text">{p.paragraphs[k]}</p>
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
  if (type === 'viewpoints') {
    const a = set.article
    return (
      <div className="rdg-viewpoints-wrap">
        <div className="rdg-viewpoints-headline">{a.headline}</div>
        <pre className="rdg-passage-pre rdg-viewpoints-body">{a.body}</pre>
      </div>
    )
  }
  return null
}

function ReadingFIBText({ text, blanks, pfx, answers, setAnswers, color, locked }) {
  const blankMap = {}
  blanks.forEach(b => { blankMap[b.blank_number] = b })
  const parts = []
  const re = /\[BLANK_(\d+)\]/g
  let last = 0, m
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
        if (!b) return <span key={i}>[{part.num}]</span>
        const key = pfx + `fib_${b.blank_number}`
        const ans = answers[key]
        const answered = ans !== undefined
        const correct = answered && ans === b.correct_answer
        const opts = optsArr(b.options)
        if (answered) {
          return (
            <span key={i} className={`rdg-fib-inline-ans ${correct ? 'rdg-fib-inline-ans--ok' : 'rdg-fib-inline-ans--err'}`}>
              {ans}) {b.options[ans]}
              {!correct && <span className="rdg-fib-correction"> [{'\u2713'} {b.correct_answer}) {b.options[b.correct_answer]}]</span>}
            </span>
          )
        }
        return (
          <select key={i} className="rdg-fib-select" style={{ borderColor: color }} value="" disabled={locked} onChange={e => e.target.value && setAnswers(a => ({ ...a, [key]: e.target.value }))}>
            <option value="" disabled>_____</option>
            {opts.map(o => <option key={o.letter} value={o.letter}>{o.letter}) {o.text}</option>)}
          </select>
        )
      })}
    </div>
  )
}

function ReadingPart({ partId, setData, color, onDone, sectionTimer }) {
  const type = READING_TYPE[partId]
  const [answers, setAnswers] = useState({})

  const pfx = 'mk_'
  const total = rdgSetTotal(setData, type)
  const done = rdgSetDone(setData, type, answers, pfx)
  const score = rdgSetScore(setData, type, answers, pfx)
  const isSetDone = done === total && total > 0
  const scorePct = total > 0 ? Math.round((score / total) * 100) : 0

  const { timeLeft, started, overtime, showBanner, dismissBanner, startTimer } = sectionTimer
  const mainRef = useRef(null)
  const locked = !started

  const timeCritical = timeLeft !== null && timeLeft <= 60 && timeLeft > 0
  const timeAmber = timeLeft !== null && timeLeft <= 300 && timeLeft > 60
  const timeUp = timeLeft === 0
  const timerColor = timeUp ? '#999' : timeCritical ? '#C8102E' : timeAmber ? '#C8972A' : color

  // Collect all questions for result
  const collectResult = () => {
    const allQs = []
    if (type === 'information') {
      (setData.questions || []).forEach(q => {
        const key = pfx + `r3_${q.question_number}`
        allQs.push({ num: q.question_number, text: q.question_text, userAnswer: answers[key], correctAnswer: q.correct_answer, type: 'r3', options: null })
      })
    } else {
      (setData.mcq_questions || []).forEach(q => {
        const key = pfx + `mcq_${q.question_number}`
        allQs.push({ num: q.question_number, text: q.question_text, userAnswer: answers[key], correctAnswer: q.correct_answer, type: 'mcq', options: q.options })
      })
      const fibs = type === 'viewpoints' ? (setData.fill_in_blank_comment?.blanks || []) : (setData.fill_in_blank_response?.blanks || [])
      fibs.forEach(b => {
        const key = pfx + `fib_${b.blank_number}`
        allQs.push({ num: b.blank_number, text: b.context || 'Fill in blank', userAnswer: answers[key], correctAnswer: b.correct_answer, type: 'fib', options: b.options })
      })
    }
    onDone({ correct: score, total, answers, questions: allQs })
  }

  const renderQuestions = () => {
    if (type === 'information') {
      return (
        <div className="rdg-questions">
          <div className="rdg-questions-label"><span>Paragraph Matching</span><span className="rdg-questions-count">{done}/{total} answered</span></div>
          <p className="rdg-questions-hint">For each statement, choose paragraph A{'\u2013'}D or E if not given.</p>
          {(setData.questions || []).map(q => {
            const qKey = pfx + `r3_${q.question_number}`
            const ans = answers[qKey]
            const answered = ans !== undefined
            const correct = answered && ans === q.correct_answer
            return (
              <div key={q.question_number} className={`rdg-q-card rdg-q-card--r3${answered ? (correct ? ' rdg-q-card--ok' : ' rdg-q-card--err') : ''}`}>
                <div className="rdg-q-header">
                  <span className="rdg-q-num" style={{ background: color }}>Q{q.question_number}</span>
                  <span className="rdg-q-type">Paragraph Matching</span>
                  {answered && <span className={`rdg-q-verdict ${correct ? 'rdg-q-verdict--ok' : 'rdg-q-verdict--err'}`}>{correct ? '\u2713 Correct' : '\u2717 Incorrect'}</span>}
                </div>
                <div className="rdg-r3-row">
                  <p className="rdg-r3-statement">{q.question_text}</p>
                  <div className="rdg-r3-select-wrap">
                    {answered ? (
                      <span className={`rdg-r3-badge ${correct ? 'rdg-r3-badge--ok' : 'rdg-r3-badge--err'}`}>
                        {ans}{!correct && <span className="rdg-r3-badge-correct"> {'\u2192'} {q.correct_answer}</span>}
                      </span>
                    ) : (
                      <select className="rdg-r3-select" style={{ borderColor: color }} value="" disabled={locked} onChange={e => e.target.value && setAnswers(a => ({ ...a, [qKey]: e.target.value }))}>
                        <option value="" disabled>Select paragraph</option>
                        {['A','B','C','D','E'].map(l => <option key={l} value={l}>{l}{l === 'E' ? ' \u2014 Not Given' : ''}</option>)}
                      </select>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )
    }

    const mcqQs = setData.mcq_questions || []
    const fibData = type === 'viewpoints' ? setData.fill_in_blank_comment : setData.fill_in_blank_response
    return (
      <>
        <div className="rdg-questions">
          <div className="rdg-questions-label"><span>Multiple Choice</span><span className="rdg-questions-count">{mcqQs.filter(q => answers[pfx + `mcq_${q.question_number}`] !== undefined).length}/{mcqQs.length}</span></div>
          {mcqQs.map(q => {
            const qKey = pfx + `mcq_${q.question_number}`
            const ans = answers[qKey]
            const answered = ans !== undefined
            const correct = answered && ans === q.correct_answer
            const opts = optsArr(q.options)
            return (
              <div key={q.question_number} className={`rdg-q-card${answered ? (correct ? ' rdg-q-card--ok' : ' rdg-q-card--err') : ''}`}>
                <div className="rdg-q-header">
                  <span className="rdg-q-num" style={{ background: color }}>Q{q.question_number}</span>
                  <span className="rdg-q-type">Multiple Choice</span>
                  {answered && <span className={`rdg-q-verdict ${correct ? 'rdg-q-verdict--ok' : 'rdg-q-verdict--err'}`}>{correct ? '\u2713 Correct' : '\u2717 Incorrect'}</span>}
                </div>
                <p className="rdg-q-stem">{q.question_text}</p>
                <div className="rdg-q-opts">
                  {opts.map(o => {
                    let cls = 'rdg-q-opt'
                    if (answered) { if (o.letter === q.correct_answer) cls += ' rdg-q-opt--correct'; else if (o.letter === ans) cls += ' rdg-q-opt--wrong'; else cls += ' rdg-q-opt--dim' }
                    return (
                      <button key={o.letter} className={cls} onClick={() => !answered && !locked && setAnswers(a => ({ ...a, [qKey]: o.letter }))} disabled={answered || locked}>
                        <span className="rdg-q-letter">{o.letter}</span><span className="rdg-q-opt-text">{o.text}</span>
                      </button>
                    )
                  })}
                </div>
                {answered && !correct && <div className="rdg-q-feedback rdg-q-feedback--err">{'\u2713'} Correct: <strong>{q.correct_answer}) {q.options[q.correct_answer]}</strong></div>}
              </div>
            )
          })}
        </div>
        {fibData && (
          <div className="rdg-fib-section">
            <div className="rdg-fib-header"><span className="rdg-fib-icon">{'\u270F\uFE0F'}</span><span className="rdg-fib-title">Fill in the Blanks</span></div>
            <p className="rdg-fib-instructions">{fibData.instructions}</p>
            <div className="rdg-fib-card">
              <ReadingFIBText text={fibData.response_text || fibData.comment_text || ''} blanks={fibData.blanks || []} pfx={pfx} answers={answers} setAnswers={setAnswers} locked={locked} color={color} />
            </div>
          </div>
        )}
      </>
    )
  }

  return (
    <div className="rdg-main" ref={mainRef}>
      <div className="rdg-topbar">
        <div className="rdg-topbar-left">
          <span className="rdg-part-badge" style={{ background: color }}>{partId}</span>
          <div className="rdg-topbar-title-group">
            <span className="rdg-topbar-title">{setData.title || PART_LABELS[partId]}</span>
            <span className="rdg-topbar-sub">{total} questions</span>
          </div>
        </div>
        <div className="rdg-topbar-right">
          {!started ? (
            <button className="rdg-start-btn" style={{ background: color }} onClick={startTimer}>{'\u25B6'} Start Timer ({READING_SECTION_MINUTES} min · Reading section)</button>
          ) : (
            <div className={`rdg-timer${timeCritical ? ' rdg-timer--critical' : ''}${timeAmber ? ' rdg-timer--amber' : ''}`} style={{ color: timerColor, borderColor: timerColor }}>
              <span className="rdg-timer-icon">{'\u23F1'}</span>
              {timeUp ? <span className="rdg-timer-digits">+{fmtTime(overtime)}</span> : <span className="rdg-timer-digits">{fmtTime(timeLeft)}</span>}
              {timeUp && <span className="rdg-timer-label">overtime</span>}
            </div>
          )}
        </div>
      </div>
      {timeAmber && !timeUp && <div className="rdg-nudge rdg-nudge--amber">{'\u23F3'} 5 minutes remaining</div>}
      {timeCritical && !timeUp && <div className="rdg-nudge rdg-nudge--red">{'\uD83D\uDD25'} Under 1 minute!</div>}
      {showBanner && (
        <div className="rdg-banner">
          <span>{'\u23F0'} Time is up! In practice, you may continue.</span>
          <button className="rdg-banner-close" onClick={dismissBanner}>{'\u2715'}</button>
        </div>
      )}
      <div className="rdg-split">
        <div className="rdg-split-passage">
          <div className="rdg-passage-box">
            <div className="rdg-passage-header">
              <span className="rdg-passage-icon" style={{ color }}>{READING_ICON[partId]}</span>
              <span className="rdg-passage-label" style={{ color }}>{PART_LABELS[partId]}</span>
            </div>
            <ReadingPassage set={setData} type={type} />
          </div>
        </div>
        <div className="rdg-split-questions">
          {renderQuestions()}
          {isSetDone && (
            <motion.div className="mk-part-done" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.18 }}>
              <div className="mk-part-done-score">
                <span className="mk-part-done-emoji">{scorePct >= 80 ? '⭐' : '💪'}</span>
                <span className="mk-part-done-text">{partId} — <strong>{score}/{total}</strong></span>
              </div>
              <button className="mk-next-btn" style={{ background: color }} onClick={collectResult}>Next Part {'\u2192'}</button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}


/* ═══════════════════════════════════════════════════════════════
   WRITING PART — One task, same wl-* UI
═══════════════════════════════════════════════════════════════ */
function WritingPart({ partId, taskData, color, onDone, onScore }) {
  const [text, setText] = useState('')
  const [timeLeft, setTimeLeft] = useState(null)
  const [started, setStarted] = useState(false)
  const [overtime, setOvertime] = useState(0)
  const [showBanner, setShowBanner] = useState(false)
  const [aiResult, setAiResult] = useState(null)
  const [aiLoading, setAiLoading] = useState(false)
  const timerRef = useRef(null)
  const otRef = useRef(null)

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0
  const mins = taskData.timeLimitMinutes || PART_TIMES[partId] || 27

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current); if (otRef.current) clearInterval(otRef.current)
    setTimeLeft(mins * 60); setStarted(true); setOvertime(0); setShowBanner(false)
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); setShowBanner(true); otRef.current = setInterval(() => setOvertime(o => o + 1), 1000); return 0 }
        return t - 1
      })
    }, 1000)
  }
  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); if (otRef.current) clearInterval(otRef.current) }, [])

  const handleAIScore = async () => {
    if (!text.trim() || aiLoading) return
    setAiLoading(true); setAiResult(null)
    const result = normalizeAiResult(await scoreWritingAI(text, taskData.promptText, [], taskData.taskType === 'email' ? 'W1' : 'W2'))
    setAiResult(result); setAiLoading(false)
    onScore?.({ text, wordCount, aiResult: result })
  }

  const timeCritical = timeLeft !== null && timeLeft <= 120 && timeLeft > 0
  const timeAmber = timeLeft !== null && timeLeft <= 300 && timeLeft > 120
  const timeUp = timeLeft === 0
  const timerColor = timeUp ? '#999' : timeCritical ? '#C8102E' : timeAmber ? '#C8972A' : color

  return (
    <div className="wl-main">
      <div className="wl-topbar">
        <div className="wl-topbar-left">
          <span className="wl-q-num-badge" style={{ background: color }}>{partId}</span>
          <div className="wl-topbar-title-group">
            <span className="wl-q-title">{PART_LABELS[partId]}</span>
            <span className="wl-topbar-set-tag">{mins} min · 150–200 words</span>
          </div>
        </div>
        <div className="wl-topbar-right">
          {wordCount > 0 && (
            <div className={`wl-wc-badge${wordCount >= 150 && wordCount <= 200 ? ' wl-wc-badge--good' : wordCount > 200 ? ' wl-wc-badge--over' : ''}`}>{wordCount} words</div>
          )}
          {started ? (
            <div className={`wl-timer${timeCritical ? ' wl-timer--critical' : ''}${timeUp ? ' wl-timer--up' : ''}`} style={{ color: timerColor, borderColor: timerColor }}>
              <span className="wl-timer-icon">{'\u23F1'}</span>
              {timeUp ? <span className="wl-timer-digits">+{fmtTime(overtime)}</span> : <span className="wl-timer-digits">{fmtTime(timeLeft)}</span>}
              {timeUp && <span className="wl-timer-up-label">overtime</span>}
            </div>
          ) : (
            <button className="wl-start-btn" style={{ background: color }} onClick={startTimer}>{'\u25B6'} Start Timer ({mins} min)</button>
          )}
        </div>
      </div>
      {timeAmber && !timeUp && <div className="wl-nudge wl-nudge--amber">{'\u23F3'} 5 minutes remaining</div>}
      {timeCritical && !timeUp && <div className="wl-nudge wl-nudge--red">{'\uD83D\uDD25'} Under 2 minutes left</div>}
      {showBanner && (
        <div className="wl-banner">
          <span>{'\u23F0'} Time is up! Take your time in practice.</span>
          <button className="wl-banner-close" onClick={() => setShowBanner(false)}>{'\u2715'}</button>
        </div>
      )}
      <div className="wl-prompt-box">
        <div className="wl-prompt-label" style={{ color }}>{taskData.taskType === 'email' ? '\u2709 Email Prompt' : '\uD83D\uDCCB Survey Prompt'}</div>
        {taskData.scenarioContext && <div className="wl-prompt-scenario">{taskData.scenarioContext}</div>}
        <pre className="wl-prompt-text">{taskData.promptText}</pre>
        {taskData.bulletPoints && (
          <ul className="wl-bullet-list">{taskData.bulletPoints.map((b, i) => <li key={i}>{b}</li>)}</ul>
        )}
        {taskData.optionA && (
          <div className="wl-options-row">
            <div className="wl-option-pill"><strong>Option A:</strong> {taskData.optionA}</div>
            <div className="wl-option-pill"><strong>Option B:</strong> {taskData.optionB}</div>
          </div>
        )}
        <div className="wl-prompt-meta">
          <span>{'\uD83D\uDDE3\uFE0F'} {taskData.tone}</span>
          <span>{'\uD83C\uDFAF'} 150{'\u2013'}200 words</span>
        </div>
      </div>
      <div className="wl-editor">
        <textarea className="wl-textarea" value={text} onChange={e => setText(e.target.value)} placeholder={started ? 'Write your response here…' : 'Press “Start Timer” above to begin writing…'} disabled={!started} rows={14} style={{ borderColor: text ? color : undefined }} />
        <div className="wl-editor-footer">
          <span className={`wl-word-count${wordCount >= 150 && wordCount <= 200 ? ' wl-wc--good' : wordCount > 200 ? ' wl-wc--over' : ''}`}>
            {wordCount} words{wordCount >= 150 && wordCount <= 200 && ' \u2713'}{wordCount > 200 && ' \u2014 over limit'}{wordCount > 0 && wordCount < 150 && ` \u2014 ${150 - wordCount} more needed`}
          </span>
          <div className="wl-editor-actions">
            <button className="wl-ai-btn" style={{ background: aiLoading ? '#aaa' : color }} onClick={handleAIScore} disabled={aiLoading || !text.trim()}>
              {aiLoading ? '\u23F3 Scoring\u2026' : 'Submit for Evaluation'}
            </button>
          </div>
        </div>
      </div>
      {aiResult && (
        <motion.div className="wl-ai-panel" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="wl-ai-header"><div className="wl-ai-title"><span>{'\uD83D\uDCCB'} Score Report</span></div></div>
          <div className="wl-ai-band" style={{ borderColor: color }}>
            <div className="wl-ai-band-score" style={{ color }}>{getAiBand(aiResult) ?? '-'}</div>
            <div className="wl-ai-band-label"><span>Score out of 12</span><strong style={{ color }}>CLB {getAiBand(aiResult) ?? '-'}</strong></div>
          </div>
          {aiResult.scores && (
            <div className="wl-ai-scores">
              {Object.entries(aiResult.scores).map(([k, v]) => {
                const score = getAiBand({ overall: v })
                return (
                  <div key={k} className="wl-ai-score-row">
                    <div className="wl-ai-score-label"><span>{k.replace(/([A-Z])/g, ' $1').trim()}</span><span className="wl-ai-score-val">{formatBandScore(score)}</span></div>
                    <div className="wl-ai-score-track"><div className="wl-ai-score-fill" style={{ width: `${Math.min(((score || 0)/12)*100,100)}%`, background: color }} /></div>
                  </div>
                )
              })}
            </div>
          )}
          {aiResult.feedback && <div className="wl-ai-feedback"><p>{aiResult.feedback}</p></div>}
        </motion.div>
      )}
      <motion.div className="mk-part-done" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.18 }} style={{ marginTop: 24 }}>
        <button className="mk-next-btn" style={{ background: color }} onClick={() => onDone({ text, wordCount, aiResult })}>
          {aiResult ? 'Next Part \u2192' : 'Skip Scoring & Continue \u2192'}
        </button>
      </motion.div>
    </div>
  )
}


/* ═══════════════════════════════════════════════════════════════
   SPEAKING PART — One prompt, same sl-* UI
═══════════════════════════════════════════════════════════════ */
function SpeakingPart({ partId, promptData, color, meta, onDone, onScore }) {
  const [phase, setPhase] = useState('idle')
  const [elapsed, setElapsed] = useState(0)
  const [transcript, setTranscript] = useState('')
  const [interimText, setInterimText] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [aiResult, setAiResult] = useState(null)
  const [aiLoading, setAiLoading] = useState(false)
  const timerRef = useRef(null)
  const recognitionRef = useRef(null)
  const finalTranscriptRef = useRef('')

  const SpeechRecognition = typeof window !== 'undefined' ? window.SpeechRecognition || window.webkitSpeechRecognition : null

  const startRecognition = () => {
    if (!SpeechRecognition) return
    try {
      const recog = new SpeechRecognition()
      recog.continuous = true; recog.interimResults = true; recog.lang = 'en-US'
      finalTranscriptRef.current = transcript
      recog.onresult = (event) => {
        let interim = ''
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const t = event.results[i][0].transcript
          if (event.results[i].isFinal) { finalTranscriptRef.current += (finalTranscriptRef.current ? ' ' : '') + t.trim(); setTranscript(finalTranscriptRef.current) }
          else { interim += t }
        }
        setInterimText(interim)
      }
      recog.onerror = () => { /* browser speech errors are non-fatal */ }
      recog.onend = () => { if (recognitionRef.current === recog) try { recog.start() } catch { /* ignore restart errors */ } }
      recog.start(); recognitionRef.current = recog; setIsListening(true)
    } catch { /* speech recognition may be unavailable */ }
  }
  const stopRecognition = () => {
    if (recognitionRef.current) { try { recognitionRef.current.stop() } catch { /* ignore stop errors */ }; recognitionRef.current = null }
    setIsListening(false); setInterimText('')
  }

  const prepTime = promptData.prep_time_seconds || promptData.prep_seconds || 30
  const speakTime = promptData.speak_time_seconds || promptData.speak_seconds || 90

  const startPrep = () => { setPhase('prep'); setElapsed(0); if (timerRef.current) clearInterval(timerRef.current); timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000) }
  const skipPrep = () => { if (timerRef.current) clearInterval(timerRef.current); startSpeak() }
  const startSpeak = () => { if (timerRef.current) clearInterval(timerRef.current); setPhase('speak'); setElapsed(0); timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000); startRecognition() }
  const finishSpeaking = () => { if (timerRef.current) clearInterval(timerRef.current); stopRecognition(); setPhase('done') }

  useEffect(() => { if (phase === 'prep' && elapsed >= prepTime) startSpeak() }, [phase, elapsed])
  useEffect(() => { if (phase === 'speak' && elapsed >= speakTime) finishSpeaking() }, [phase, elapsed])
  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); stopRecognition() }, [])

  const handleAIScore = async () => {
    if (!transcript.trim() || aiLoading) return
    setAiLoading(true); setAiResult(null)
    const result = normalizeAiResult(await scoreSpeakingAI(transcript, promptData.prompt, meta.label, promptData.topic || ''))
    setAiResult(result); setAiLoading(false)
    onScore?.({ transcript, wordCount, aiResult: result })
  }

  const prepRemaining = Math.max(0, prepTime - elapsed)
  const speakRemaining = Math.max(0, speakTime - elapsed)
  const prepPct = Math.min((elapsed / prepTime) * 100, 100)
  const speakPct = Math.min((elapsed / speakTime) * 100, 100)
  const wordCount = transcript.trim() ? transcript.trim().split(/\s+/).length : 0

  return (
    <div className="sl-main">
      <div className="sl-topbar">
        <div className="sl-topbar-left">
          <span className="sl-task-badge" style={{ background: color }}>{partId}</span>
          <div className="sl-topbar-title-group">
            <span className="sl-topbar-title">{meta.label}</span>
            <span className="sl-topbar-sub">Prep {prepTime}s · Speak {speakTime}s</span>
          </div>
        </div>
      </div>
      <div className="sl-prompt-box" style={{ borderLeftColor: color }}>
        <div className="sl-prompt-label" style={{ color }}>{meta.icon} {meta.label}</div>
        <pre className="sl-prompt-text">{promptData.prompt}</pre>
        {promptData.image_url && (
          <div className="sl-prompt-img-wrap">
            <img
              src={asset(promptData.image_url)}
              alt="Speaking prompt"
              className="sl-prompt-img"
              style={{ maxWidth: '100%', borderRadius: 8, marginTop: 12 }}
              onError={e => { e.target.style.display = 'none'; e.target.nextElementSibling && (e.target.nextElementSibling.style.display = 'flex') }}
            />
            <div className="mk-img-fallback" style={{ display: 'none' }}>
              <span className="mk-img-fallback-icon">{'\uD83D\uDDBC\uFE0F'}</span>
              <span>Image could not be loaded. Use the prompt text above to form your response.</span>
            </div>
          </div>
        )}
      </div>

      {phase === 'idle' && (
        <div className="sl-idle-cta">
          <button className="sl-start-btn" style={{ background: color }} onClick={startPrep}>{'\u25B6'} Begin Attempt</button>
          <p className="sl-idle-hint">You will get {prepTime}s to prepare, then {speakTime}s to speak.</p>
        </div>
      )}

      {phase === 'prep' && (
        <div className="sl-phase-card sl-phase-card--prep" style={{ borderColor: color }}>
          <div className="sl-phase-header"><span className="sl-phase-icon">{'\uD83D\uDCDD'}</span><span className="sl-phase-title">Preparation Time</span></div>
          <div className="sl-timer-ring">
            <svg viewBox="0 0 100 100" className="sl-timer-svg">
              <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" strokeWidth="6" />
              <circle cx="50" cy="50" r="45" fill="none" stroke={color} strokeWidth="6" strokeDasharray={`${prepPct * 2.827} 282.7`} strokeLinecap="round" transform="rotate(-90 50 50)" />
            </svg>
            <div className="sl-timer-center"><span className="sl-timer-digits">{fmtTime(prepRemaining)}</span><span className="sl-timer-label">remaining</span></div>
          </div>
          <p className="sl-phase-hint">Read the prompt and plan your response. Speaking starts automatically.</p>
          <button className="sl-skip-btn" style={{ borderColor: color, color }} onClick={skipPrep}>
            {'\u23ED\uFE0F'} Skip prep &amp; start speaking now
          </button>
        </div>
      )}

      {phase === 'speak' && (
        <div className="sl-phase-card sl-phase-card--speak" style={{ borderColor: '#C8102E' }}>
          <div className="sl-phase-header"><span className="sl-phase-icon">{'\uD83C\uDF99\uFE0F'}</span><span className="sl-phase-title">Speaking Now</span></div>
          <div className="sl-timer-ring">
            <svg viewBox="0 0 100 100" className="sl-timer-svg">
              <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" strokeWidth="6" />
              <circle cx="50" cy="50" r="45" fill="none" stroke="#C8102E" strokeWidth="6" strokeDasharray={`${speakPct * 2.827} 282.7`} strokeLinecap="round" transform="rotate(-90 50 50)" />
            </svg>
            <div className="sl-timer-center"><span className="sl-timer-digits">{fmtTime(speakRemaining)}</span><span className="sl-timer-label">remaining</span></div>
          </div>
          {isListening && <div className="sl-mic-indicator"><span className="sl-mic-pulse" /><span>{'\uD83C\uDF99\uFE0F'} Recording...</span></div>}
          {(transcript || interimText) && (
            <div className="sl-live-transcript">
              <span>{transcript}</span>
              {interimText && <span style={{ color: '#9ca3af' }}> {interimText}</span>}
            </div>
          )}
          <button className="sl-finish-btn" onClick={finishSpeaking}>Finish Early</button>
        </div>
      )}

      {phase === 'done' && (
        <div className="sl-done-card">
          <p className="sl-done-label">{'\u2705'} Speaking complete</p>
          {transcript && <div className="sl-transcript-review"><p className="sl-transcript-label">Your transcript ({wordCount} words):</p><pre className="sl-transcript-text">{transcript}</pre></div>}
          <div className="sl-done-actions">
            <button className="wl-ai-btn" style={{ background: aiLoading ? '#aaa' : color }} onClick={handleAIScore} disabled={aiLoading || !transcript.trim()}>
              {aiLoading ? '⏳ Scoring…' : '⚡ Get Instant Score'}
            </button>
          </div>
          {aiResult && (
            <motion.div className="sl-ai-panel" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="sl-ai-band" style={{ borderColor: color }}>
                <div className="sl-ai-band-score" style={{ color }}>{getAiBand(aiResult) ?? '-'}</div>
                <div className="sl-ai-band-label"><span>Score out of 12</span><strong style={{ color }}>CLB {getAiBand(aiResult) ?? '-'}</strong></div>
              </div>
              {aiResult.feedback && <div className="wl-ai-feedback"><p>{aiResult.feedback}</p></div>}
            </motion.div>
          )}
          <button className="mk-next-btn" style={{ background: color, marginTop: 16 }} onClick={() => onDone({ transcript, wordCount, aiResult })}>
            Next Part {'\u2192'}
          </button>
        </div>
      )}
    </div>
  )
}


/* ═══════════════════════════════════════════════════════════════
   SECTION RESULTS — Bands + detailed answer review
═══════════════════════════════════════════════════════════════ */
function SectionResults({ section, color, scores, onContinue, isLast }) {
  const parts = SECTION_PARTS[section]
  const isObjective = section === 'listening' || section === 'reading'
  const subjectiveSummary = isObjective ? null : summarizeSubjectiveSection(scores, parts)

  let totalCorrect = 0, totalQs = 0
  if (isObjective) {
    parts.forEach(p => { if (scores[p]) { totalCorrect += scores[p].correct; totalQs += scores[p].total } })
  }
  const celpip = getCelpipLevel(totalCorrect, totalQs || 38)

  return (
    <div className="mk-section-results">
      {/* Redesigned hero: band chip, gradient surface, section stats */}
      <motion.div
        className={`mk-sr-heroV2 mk-sr-heroV2--${section}`}
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 0.61, 0.36, 1] }}
      >
        <div className="mk-sr-heroV2-inner">
          <motion.span
            className="mk-sr-heroV2-icon"
            initial={{ scale: 0.5, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 260, damping: 18 }}
          >
            {SECTION_ICONS[section]}
          </motion.span>
          <div className="mk-sr-heroV2-text">
            <span className="mk-sr-heroV2-eyebrow">Section Complete</span>
            <h2 className="mk-sr-heroV2-title">{section.charAt(0).toUpperCase() + section.slice(1)} — done!</h2>
            <p className="mk-sr-heroV2-sub">
              {isObjective
                ? 'Your raw score has been mapped to CELPIP bands below. Review every question before moving on.'
                : 'Your responses are scored instantly. Expand a card to review your response and feedback.'}
            </p>
          </div>
        </div>

        {isObjective && (
          <motion.div
            className="mk-sr-bandCard"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 180, damping: 18 }}
          >
            <div className="mk-sr-bandCard-left" style={{ background: `linear-gradient(135deg, ${celpip.color}, ${celpip.color}dd)` }}>
              <span className="mk-sr-bandCard-eyebrow">CELPIP</span>
              <span className="mk-sr-bandCard-level">{celpip.level}</span>
              <span className="mk-sr-bandCard-label">{celpip.label}</span>
            </div>
            <div className="mk-sr-bandCard-right">
              <div className="mk-sr-bandCard-row">
                <span className="mk-sr-bandCard-val">{totalCorrect}<span className="mk-sr-bandCard-denom">/{totalQs}</span></span>
                <span className="mk-sr-bandCard-cap">Correct</span>
              </div>
              <div className="mk-sr-bandCard-row">
                <span className="mk-sr-bandCard-val">{parts.filter(p => scores[p]).length}<span className="mk-sr-bandCard-denom">/{parts.length}</span></span>
                <span className="mk-sr-bandCard-cap">Parts</span>
              </div>
            </div>
          </motion.div>
        )}
        {!isObjective && (
          subjectiveSummary?.band != null ? (
            <motion.div
              className="mk-sr-bandCard"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 180, damping: 18 }}
            >
              <div className="mk-sr-bandCard-left" style={{ background: `linear-gradient(135deg, ${color}, ${color}dd)` }}>
                <span className="mk-sr-bandCard-eyebrow">CELPIP</span>
                <span className="mk-sr-bandCard-level">{subjectiveSummary.band}</span>
                <span className="mk-sr-bandCard-label">Score out of 12</span>
              </div>
              <div className="mk-sr-bandCard-right">
                <div className="mk-sr-bandCard-row">
                  <span className="mk-sr-bandCard-val">{formatBandScore(subjectiveSummary.band)}</span>
                  <span className="mk-sr-bandCard-cap">Average</span>
                </div>
                <div className="mk-sr-bandCard-row">
                  <span className="mk-sr-bandCard-val">{subjectiveSummary.scoredParts}<span className="mk-sr-bandCard-denom">/{subjectiveSummary.totalParts}</span></span>
                  <span className="mk-sr-bandCard-cap">Scored</span>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              className="mk-sr-aiPill"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <span className="mk-sr-aiPill-icon">{'⚡'}</span>
              <span>Submit responses for AI scoring to generate a full band out of 12.</span>
            </motion.div>
          )
        )}
      </motion.div>

      {/* Per-part breakdown with question details */}
      <div className="mk-sr-parts">
        {parts.map(p => {
          const sc = scores[p]
          if (!sc) return null
          const partPct = sc.total > 0 ? Math.round((sc.correct / sc.total) * 100) : 0
          const aiBand = getAiBand(sc.aiResult)
          return (
            <motion.div key={p} className="mk-sr-part-card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              <div className="mk-sr-part-header" style={{ borderLeftColor: color }}>
                <span className="mk-sr-part-id" style={{ background: color }}>{p}</span>
                <span className="mk-sr-part-label">{PART_LABELS[p]}</span>
                {isObjective && <span className="mk-sr-part-score" style={{ color: partPct >= 70 ? '#22c55e' : partPct >= 50 ? '#C8972A' : '#C8102E' }}>{sc.correct}/{sc.total}</span>}
              </div>

              {/* Listening / Reading: question detail list */}
              {isObjective && sc.questions && (
                <div className="mk-sr-q-list">
                  {(sc.questions || []).map((q, qi) => {
                    const userAnswer = q.userAnswer !== undefined ? q.userAnswer : sc.answers?.[`q_${qi}`]
                    const correctAnswer = q.correctAnswer !== undefined ? q.correctAnswer : q.answer
                    const questionText = q.text || q.question_text || 'Question review'
                    const questionNum = q.num || q.question_number || qi + 1
                    const isCorrect = userAnswer !== undefined && (
                      typeof correctAnswer === 'number'
                        ? userAnswer === correctAnswer
                        : String(userAnswer) === String(correctAnswer)
                    )
                    const unanswered = userAnswer === undefined
                    return (
                      <div key={qi} className={`mk-sr-q-row${isCorrect ? ' mk-sr-q-row--ok' : unanswered ? ' mk-sr-q-row--skip' : ' mk-sr-q-row--err'}`}>
                        <span className="mk-sr-q-num">Q{questionNum}</span>
                        <span className="mk-sr-q-text">{questionText}</span>
                        <span className="mk-sr-q-ans">
                          {unanswered ? (
                            <span className="mk-sr-q-skip">Skipped</span>
                          ) : isCorrect ? (
                            <span className="mk-sr-q-correct">{'\u2713'} {typeof userAnswer === 'number' ? LETTERS[userAnswer] : userAnswer}</span>
                          ) : (
                            <span className="mk-sr-q-wrong">
                              <span className="mk-sr-q-your">{typeof userAnswer === 'number' ? LETTERS[userAnswer] : userAnswer}</span>
                              <span className="mk-sr-q-arrow">{'\u2192'}</span>
                              <span className="mk-sr-q-right">{typeof correctAnswer === 'number' ? LETTERS[correctAnswer] : correctAnswer}</span>
                            </span>
                          )}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Writing: show response + AI score */}
              {section === 'writing' && sc.text && (
                <div className="mk-sr-writing">
                  <p className="mk-sr-writing-wc">{sc.wordCount} words</p>
                  {sc.aiResult && !sc.aiResult.error && (
                    <div className="mk-sr-writing-score">
                      <span>CELPIP Level: <strong style={{ color }}>{formatBandScore(aiBand)}</strong></span>
                      <span> (CLB {aiBand ?? '-'})</span>
                    </div>
                  )}
                </div>
              )}

              {/* Speaking: show transcript + AI score */}
              {section === 'speaking' && sc.transcript && (
                <div className="mk-sr-speaking">
                  <p className="mk-sr-speaking-wc">{sc.wordCount} words spoken</p>
                  {sc.aiResult && !sc.aiResult.error && (
                    <div className="mk-sr-speaking-score">
                      <span>CELPIP Level: <strong style={{ color }}>{formatBandScore(aiBand)}</strong></span>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )
        })}
      </div>

      <div className="mk-sr-actions">
        <button className="mk-btn mk-btn--primary" style={{ background: color }} onClick={onContinue}>
          {isLast ? 'View Overall Results \u2192' : `Continue to ${SECTION_ORDER[SECTION_ORDER.indexOf(section) + 1]?.charAt(0).toUpperCase()}${SECTION_ORDER[SECTION_ORDER.indexOf(section) + 1]?.slice(1) || ''} \u2192`}
        </button>
      </div>
    </div>
  )
}


/* ═══════════════════════════════════════════════════════════════
   FINAL RESULTS
═══════════════════════════════════════════════════════════════ */
function FinalResults({ examNumber, scores, onTryAgain }) {
  const navigate = useNavigate()
  const { sections: sectionSummary, overallBand } = summarizeMockScores(scores)

  // Motivation copy by tier
  const MOTIVATION = {
    expert: {
      emoji: '🏆',
      headline: 'Outstanding! You’re exam-ready.',
      body: 'You’re performing at an advanced CELPIP level. Polish your subjective sections, simulate one more full mock under strict timing, and book the test with confidence.'
    },
    strong: {
      emoji: '🚀',
      headline: 'Great work — you’re on the path to a high band.',
      body: 'Solid effective proficiency. Focus on the few question types that cost you points, keep your writing tight around 150–200 words, and you’ll break into the advanced tier soon.'
    },
    fair: {
      emoji: '💪',
      headline: 'Good progress — keep the momentum going.',
      body: 'You’re building real proficiency. Target one weak section per week, drill under timed conditions, and revisit every wrong answer. Steady practice compounds fast.'
    },
    weak: {
      emoji: '🌱',
      headline: 'Every expert started here — you’ve got this.',
      body: 'Don’t get discouraged. Master the basics in each section, rebuild your timing, and treat this mock as a diagnostic. Small daily practice makes a measurable difference.'
    },
  }
  const mot = MOTIVATION[overallBand.tier] || MOTIVATION.fair

  return (
    <div className="mk-final-page">
      <motion.div className="mk-final-hero" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <span className="mk-final-trophy">{'🏆'}</span>
        <h1 className="mk-final-title">Mock Test #{examNumber} — Complete!</h1>
        <p className="mk-final-sub">Here’s your performance across all 4 sections.</p>
      </motion.div>

      {/* Overall CELPIP band & motivation banner */}
      {overallBand && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.35 }}
          style={{
            maxWidth: 960, margin: '0 auto 32px', padding: '28px 32px',
            background: `linear-gradient(135deg, ${overallBand.color}0d, ${overallBand.color}05)`,
            border: `1px solid ${overallBand.color}33`,
            borderRadius: 20, display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap',
          }}
        >
          <div style={{
            minWidth: 130, padding: '18px 22px', borderRadius: 16, textAlign: 'center',
            background: `linear-gradient(135deg, ${overallBand.color}, ${overallBand.color}dd)`, color: '#fff',
            boxShadow: `0 10px 30px -12px ${overallBand.color}55`,
          }}>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.6, opacity: 0.9 }}>OVERALL CELPIP</div>
            <div style={{ fontSize: 48, fontWeight: 900, lineHeight: 1, margin: '4px 0' }}>{overallBand.level}</div>
            <div style={{ fontSize: 12, fontWeight: 600, opacity: 0.95 }}>{overallBand.label}</div>
          </div>
          <div style={{ flex: 1, minWidth: 260 }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#0F1F3D', marginBottom: 6 }}>
              <span style={{ marginRight: 8 }}>{mot.emoji}</span>{mot.headline}
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.6, color: '#4b5563', margin: 0 }}>{mot.body}</p>
          </div>
        </motion.div>
      )}

      <div className="mk-final-grid">
        {sectionSummary.map((s, i) => (
          <motion.div key={s.section} className="mk-final-card" style={{ borderTopColor: COLORS[s.section] }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.08 }}>
            <div className="mk-final-card-header">
              <span>{SECTION_ICONS[s.section]}</span>
              <h3>{s.section.charAt(0).toUpperCase() + s.section.slice(1)}</h3>
              {s.objective && s.band && <span className="mk-final-level" style={{ color: s.band.color }}>CELPIP {s.band.level}</span>}
              {!s.objective && s.band != null && (
                <span className="mk-final-level" style={{ color: COLORS[s.section] }}>CLB {s.band}</span>
              )}
            </div>
            {s.objective && s.hasData && (
              <>
                <div className="mk-final-bar"><div className="mk-final-bar-fill" style={{ width: `${s.pct}%`, background: COLORS[s.section] }} /></div>
                <p className="mk-final-detail">{s.correct}/{s.total} — {s.band.label}</p>
              </>
            )}
            {s.objective && !s.hasData && (
              <p className="mk-final-detail">Not attempted</p>
            )}
            {!s.objective && s.band != null && (
              <>
                <div className="mk-final-bar"><div className="mk-final-bar-fill" style={{ width: `${Math.min(100, Math.round((s.band / 12) * 100))}%`, background: COLORS[s.section] }} /></div>
                <p className="mk-final-detail">
                  AI score {formatBandScore(s.band)} · {s.scoredParts}/{s.totalParts} scored
                </p>
              </>
            )}
            {!s.objective && s.band == null && (
              <p className="mk-final-detail">Not AI-scored — submit responses for evaluation</p>
            )}
          </motion.div>
        ))}
      </div>

      <div className="mk-final-actions">
        <button className="mk-btn mk-btn--outline" onClick={() => navigate('/dashboard')}>{'\u2190'} Dashboard</button>
        <button className="mk-btn mk-btn--outline" onClick={() => navigate('/scores?tab=mocks')}>Saved Reports</button>
        <button className="mk-btn mk-btn--outline" onClick={onTryAgain}>Try Again</button>
        {examNumber < 8 ? (
          <button className="mk-btn mk-btn--primary" onClick={() => navigate(`/mock-test/${examNumber + 1}`)}>Try Mock #{examNumber + 1} {'\u2192'}</button>
        ) : (
          <button className="mk-btn mk-btn--primary" onClick={() => navigate('/exam')}>Mock Exams {'\u2192'}</button>
        )}
      </div>
    </div>
  )
}


/* ═══════════════════════════════════════════════════════════════
   LANDING
═══════════════════════════════════════════════════════════════ */
function MockLanding({ examNumber, onStart }) {
  const SECTION_INFO = {
    listening: { parts: 6, time: '~47 min', desc: 'Audio-based comprehension' },
    reading:   { parts: 4, time: '~55 min', desc: 'Passage-based questions' },
    writing:   { parts: 2, time: '~53 min', desc: '150\u2013200 word responses' },
    speaking:  { parts: 8, time: '~20 min', desc: 'Timed speaking prompts' },
  }
  return (
    <div className="mk-landing">
      <SEO title={`CELPIP Mock Test ${examNumber}`} description="Simulate the full CELPIP General test with real exam timing and scoring." noindex />
      <motion.div
        className="mk-heroV2"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 0.61, 0.36, 1] }}
      >
        <div className="mk-heroV2-bg" />
        <div className="mk-heroV2-inner">
          <span className="mk-heroV2-badge">{'\uD83C\uDF41'} Full-Length Simulation</span>
          <h1 className="mk-heroV2-title">Mock Test <span className="mk-heroV2-num">#{examNumber}</span></h1>
          <p className="mk-heroV2-sub">
            A timed CELPIP General experience — 20 parts, 4 sections, one set per part.
            Every section ends with a CELPIP-style band report and a question-by-question review.
          </p>
          <div className="mk-heroV2-meta">
            <span className="mk-heroV2-meta-pill">{'\u23F1'} ~3 hours</span>
            <span className="mk-heroV2-meta-pill">{'\uD83D\uDCDD'} 86 questions</span>
            <span className="mk-heroV2-meta-pill">{'⚡'} Instant scoring</span>
            <span className="mk-heroV2-meta-pill">{'\uD83C\uDFC6'} CLB band report</span>
          </div>
        </div>
      </motion.div>

      <div className="mk-sections-grid">
        {SECTION_ORDER.map((sec, i) => (
          <motion.div
            key={sec}
            className="mk-section-cardV2"
            style={{ '--sec-color': COLORS[sec] }}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 + i * 0.08, type: 'spring', stiffness: 180, damping: 20 }}
            whileHover={{ y: -6 }}
          >
            <div className="mk-section-cardV2-top" style={{ background: `linear-gradient(135deg, ${COLORS[sec]}15, ${COLORS[sec]}05)` }}>
              <span className="mk-section-cardV2-icon">{SECTION_ICONS[sec]}</span>
            </div>
            <div className="mk-section-cardV2-body">
              <h3 className="mk-section-cardV2-name">{sec.charAt(0).toUpperCase() + sec.slice(1)}</h3>
              <p className="mk-section-cardV2-parts">{SECTION_INFO[sec].parts} parts {'\u00B7'} {SECTION_INFO[sec].time}</p>
              <p className="mk-section-cardV2-desc">{SECTION_INFO[sec].desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        className="mk-start-areaV2"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, type: 'spring', stiffness: 180 }}
      >
        <button className="mk-btnV2 mk-btnV2--primary" onClick={onStart}>
          <span>{'\u25B6'}</span> Begin Mock Exam
        </button>
        <p className="mk-start-sub">No pauses between sections once you begin — plan for ~3 hours.</p>
      </motion.div>
    </div>
  )
}


/* ═══════════════════════════════════════════════════════════════
   MAIN ORCHESTRATOR
═══════════════════════════════════════════════════════════════ */
export default function MockTestPage() {
  const navigate = useNavigate()
  const { examId } = useParams()
  const [searchParams] = useSearchParams()
  const { user, isPremium, profileLoaded } = useAuth()
  const examNumber = parseInt(examId) || 1
  const reviewAttemptId = searchParams.get('attempt')

  // Premium gate: all full mock exams are premium-only.
  useEffect(() => {
    if (profileLoaded && !isPremium) {
      navigate('/pricing', { replace: true })
    }
  }, [profileLoaded, isPremium, navigate])

  const examSets = useMemo(() => buildExamSets(examNumber), [examNumber])

  /* State machine:
     'landing'              → exam overview
     'exam'                 → active exam (section + part)
     'section-results'      → section results screen
     'section-transition'   → brief interstitial before next section
     'final'                → overall results
  */
  const [phase, setPhase] = useState('landing')
  const [sectionIdx, setSectionIdx] = useState(0)
  const [partIdx, setPartIdx] = useState(0)
  const [scores, setScores] = useState({}) // { L1: { correct, total, answers, questions }, ... }

  // ── Persistent cloud-backed session (resume across reload/device) ────────
  const session = useTestSession({ kind: 'mock', examNumber, enabled: profileLoaded && isPremium && !reviewAttemptId })
  const restoredRef = useRef(false)
  const [completedFallback, setCompletedFallback] = useState(null)
  const [reviewLoading, setReviewLoading] = useState(false)

  useEffect(() => {
    if (!reviewAttemptId || !user?.id || !examNumber) return
    let cancelled = false
    setReviewLoading(true)
    ;(async () => {
      try {
        const { data, error } = await supabase
          .from('test_sessions')
          .select('id, scores, meta, completed_at, updated_at')
          .eq('id', reviewAttemptId)
          .eq('kind', 'mock')
          .eq('exam_number', examNumber)
          .eq('is_completed', true)
          .maybeSingle()
        if (error) throw error
        if (cancelled) return
        if (data?.scores) {
          setScores(data.scores || {})
          setPhase('final')
        } else {
          navigate('/exam', { replace: true })
        }
      } catch {
        if (!cancelled) navigate('/exam', { replace: true })
      } finally {
        if (!cancelled) setReviewLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [reviewAttemptId, user?.id, examNumber, navigate])

  // If no active session exists, fetch the most recent completed mock attempt
  // so direct visits can still display a saved final results page.
  useEffect(() => {
    if (reviewAttemptId) return
    if (!user?.id || !examNumber) return
    if (session.loading) return
    if (session.id) return
    // Only fetch fallback when current session has no scores yet
    if (session.scores && Object.keys(session.scores).length) return
    let cancelled = false
    ;(async () => {
      try {
        const { data, error } = await supabase
          .from('test_sessions')
          .select('id, scores, meta, completed_at, updated_at')
          .eq('kind', 'mock')
          .eq('exam_number', examNumber)
          .eq('is_completed', true)
          .order('completed_at', { ascending: false })
          .limit(1)
        if (error) throw error
        if (cancelled) return
        const row = (data || [])[0]
        if (row && row.scores && Object.keys(row.scores).length) {
          setCompletedFallback(row)
        }
      } catch {
        /* ignore — fallback is optional */
      }
    })()
    return () => { cancelled = true }
  }, [reviewAttemptId, user?.id, examNumber, session.loading, session.id, session.scores])

  // One-shot: rehydrate UI state from session row when it loads
  useEffect(() => {
    if (reviewAttemptId) return
    if (restoredRef.current) return
    if (session.loading || !session.id) return
    restoredRef.current = true
    const cs = session.currentSection
    const cp = session.currentPart
    if (session.scores && Object.keys(session.scores).length) {
      setScores(session.scores)
    }
    const restoredPhase = session.meta?.phase
    if (cs && SECTION_ORDER.includes(cs)) {
      const sIdx = SECTION_ORDER.indexOf(cs)
      setSectionIdx(sIdx)
      const parts = SECTION_PARTS[cs] || []
      const pIdx = cp ? Math.max(0, parts.indexOf(cp)) : 0
      setPartIdx(pIdx)
      if (restoredPhase === 'final') {
        setPhase('final')
      } else if (restoredPhase === 'section-results') {
        setPhase('section-results')
      } else if (session.scores && Object.keys(session.scores).length) {
        setPhase('exam')
      }
    }
  }, [reviewAttemptId, session.loading, session.id, session.currentSection, session.currentPart, session.scores, session.meta])

  // Show final results from a completed prior attempt when fresh session is empty
  useEffect(() => {
    if (!completedFallback) return
    if (phase !== 'landing') return
    if (Object.keys(scores).length) return
    setScores(completedFallback.scores || {})
    setPhase('final')
  }, [completedFallback, phase, scores])

  // Shared Reading section timer (single 55-min timer across R1-R4)
  const [rdgTimeLeft, setRdgTimeLeft] = useState(null)
  const [rdgStarted, setRdgStarted] = useState(false)
  const [rdgOvertime, setRdgOvertime] = useState(0)
  const [rdgShowBanner, setRdgShowBanner] = useState(false)
  const rdgTimerRef = useRef(null)
  const rdgOtRef = useRef(null)
  const startRdgTimer = () => {
    if (rdgStarted) return
    if (rdgTimerRef.current) clearInterval(rdgTimerRef.current)
    if (rdgOtRef.current) clearInterval(rdgOtRef.current)
    setRdgTimeLeft(READING_SECTION_MINUTES * 60); setRdgStarted(true); setRdgOvertime(0); setRdgShowBanner(false)
    rdgTimerRef.current = setInterval(() => {
      setRdgTimeLeft(t => {
        if (t === null) return t
        if (t <= 1) {
          clearInterval(rdgTimerRef.current); setRdgShowBanner(true)
          rdgOtRef.current = setInterval(() => setRdgOvertime(o => o + 1), 1000)
          return 0
        }
        return t - 1
      })
    }, 1000)
  }
  const resetRdgTimer = () => {
    if (rdgTimerRef.current) clearInterval(rdgTimerRef.current)
    if (rdgOtRef.current) clearInterval(rdgOtRef.current)
    setRdgTimeLeft(null); setRdgStarted(false); setRdgOvertime(0); setRdgShowBanner(false)
  }
  useEffect(() => () => {
    if (rdgTimerRef.current) clearInterval(rdgTimerRef.current)
    if (rdgOtRef.current) clearInterval(rdgOtRef.current)
  }, [])
  const readingTimer = {
    timeLeft: rdgTimeLeft, started: rdgStarted, overtime: rdgOvertime, showBanner: rdgShowBanner,
    dismissBanner: () => setRdgShowBanner(false), startTimer: startRdgTimer,
  }

  const section = SECTION_ORDER[sectionIdx] || 'listening'
  const parts = SECTION_PARTS[section] || []
  const currentPartId = parts[partIdx]
  const color = COLORS[section]

  const handleStart = () => {
    setPhase('exam')
    setSectionIdx(0)
    setPartIdx(0)
    setScores({})
    // Persist initial position
    session.setCurrentSection('listening')
    session.setCurrentPart('L1')
    session.setCurrentQuestionIndex(0)
    session.setMeta({ phase: 'exam', startedAt: new Date().toISOString() })
    void session.flush()
  }

  const handlePartScoreUpdate = async (result) => {
    const normalized = normalizePartResult(result)
    const nextScores = { ...scores, [currentPartId]: normalized }
    setScores(nextScores)
    session.setScores(currentPartId, normalized)
    session.setMeta({ phase: 'exam', lastScoredPart: currentPartId, lastSavedAt: new Date().toISOString() })
    await session.flush()
  }

  const handlePartDone = async (result) => {
    const normalized = normalizePartResult(result)
    const nextScores = { ...scores, [currentPartId]: normalized }
    setScores(nextScores)
    // Autosave per-part score + advance pointer in cloud session
    session.setScores(currentPartId, normalized)
    if (partIdx < parts.length - 1) {
      const nextPart = parts[partIdx + 1]
      setPartIdx(partIdx + 1)
      session.setCurrentPart(nextPart)
      session.setCurrentQuestionIndex(0)
      session.setMeta({ phase: 'exam', lastSavedPart: currentPartId, lastSavedAt: new Date().toISOString() })
    } else {
      session.setMeta({ phase: 'section-results', lastSavedPart: currentPartId, lastSavedAt: new Date().toISOString() })
      setPhase('section-results')
    }
    await session.flush()
  }

  const handleSkipSection = async () => {
    // Mark all unscored parts in the current section as skipped (0/total with empty answers)
    const patch = {}
    for (const p of parts) {
      if (scores[p]) continue
      // Determine a reasonable total based on section
      if (section === 'listening') {
        const set = examSets[p]
        const total = (set?.questions || []).length
        patch[p] = { correct: 0, total, answers: {}, questions: (set?.questions || []).map(q => ({ num: q.num, text: q.text, userAnswer: undefined, correctAnswer: q.answer })), skipped: true }
      } else if (section === 'reading') {
        const set = examSets[p]
        const type = READING_TYPE[p]
        const total = set ? rdgSetTotal(set, type) : 0
        const qs = []
        if (set) {
          if (type === 'information') {
            (set.questions || []).forEach(q => qs.push({ num: q.question_number, text: q.question_text, userAnswer: undefined, correctAnswer: q.correct_answer, type: 'r3' }))
          } else {
            (set.mcq_questions || []).forEach(q => qs.push({ num: q.question_number, text: q.question_text, userAnswer: undefined, correctAnswer: q.correct_answer, type: 'mcq', options: q.options }))
            const fibs = type === 'viewpoints' ? (set.fill_in_blank_comment?.blanks || []) : (set.fill_in_blank_response?.blanks || [])
            fibs.forEach(b => qs.push({ num: b.blank_number, text: b.context || 'Fill in blank', userAnswer: undefined, correctAnswer: b.correct_answer, type: 'fib', options: b.options }))
          }
        }
        patch[p] = { correct: 0, total, answers: {}, questions: qs, skipped: true }
      } else if (section === 'writing') {
        patch[p] = { text: '', wordCount: 0, aiResult: null, skipped: true }
      } else if (section === 'speaking') {
        patch[p] = { transcript: '', wordCount: 0, aiResult: null, skipped: true }
      }
    }
    setScores(s => ({ ...s, ...patch }))
    Object.entries(patch).forEach(([partKey, result]) => session.setScores(partKey, result))
    session.setMeta({ phase: 'section-results', lastSkippedSection: section, lastSavedAt: new Date().toISOString() })
    await session.flush()
    setPhase('section-results')
  }

  const handleContinueSection = async () => {
    // Reset reading timer when leaving Reading section
    if (section === 'reading') resetRdgTimer()
    // Mark this section as completed in cloud session
    session.markSectionComplete(section)
    if (sectionIdx < SECTION_ORDER.length - 1) {
      const nextSection = SECTION_ORDER[sectionIdx + 1]
      const nextPart = (SECTION_PARTS[nextSection] || [])[0] || null
      setSectionIdx(sectionIdx + 1)
      setPartIdx(0)
      setPhase('section-transition')
      session.setCurrentSection(nextSection)
      session.setCurrentPart(nextPart)
      session.setCurrentQuestionIndex(0)
      session.setMeta({ phase: 'section-transition', lastCompletedSection: section, lastSavedAt: new Date().toISOString() })
      await session.flush()
    } else {
      session.setMeta({
        phase: 'final',
        lastCompletedSection: section,
        completedAt: new Date().toISOString(),
        reportCard: buildMockReportCard(examNumber, scores),
      })
      await session.flush()
      // Mark the session as completed so the Mock Exams "Score" modal can find it.
      // This also unblocks a fresh attempt next time the user starts this mock.
      try { await session.complete() } catch { /* non-fatal */ }
      setPhase('final')
    }
  }

  const handleTransitionDone = () => {
    session.setMeta({ phase: 'exam', lastSavedAt: new Date().toISOString() })
    void session.flush()
    setPhase('exam')
  }

  const handleTryAgain = async () => {
    try {
      await supabase
        .from('test_sessions')
        .delete()
        .eq('kind', 'mock')
        .eq('exam_number', examNumber)
        .eq('is_completed', false)
    } catch { /* non-fatal */ }
    window.location.assign(`/mock-test/${examNumber}`)
  }

  if (!profileLoaded) return <div className="mk-loading">Loading mock exam...</div>
  if (reviewAttemptId && reviewLoading) return <div className="mk-loading">Loading saved report...</div>
  if (!isPremium) return null

  if (phase === 'landing') return (
    <AnimatePresence mode="wait">
      <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
        <MockLanding examNumber={examNumber} onStart={handleStart} />
      </motion.div>
    </AnimatePresence>
  )
  if (phase === 'final') return (
    <AnimatePresence mode="wait">
      <motion.div key="final" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
        <FinalResults examNumber={examNumber} scores={scores} onTryAgain={handleTryAgain} />
      </motion.div>
    </AnimatePresence>
  )
  if (phase === 'section-results') {
    return (
      <AnimatePresence mode="wait">
        <motion.div key={`sr-${section}`} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }}>
          <SectionResults section={section} color={color} scores={scores} onContinue={handleContinueSection} isLast={sectionIdx === SECTION_ORDER.length - 1} />
        </motion.div>
      </AnimatePresence>
    )
  }

  // Section transition interstitial
  if (phase === 'section-transition') {
    const SECTION_INTROS = {
      listening: { icon: '\uD83C\uDFA7', title: 'Listening', desc: 'Listen carefully to conversations and answer questions.', parts: 6, time: '~47 min' },
      reading: { icon: '\uD83D\uDCDA', title: 'Reading', desc: 'Read passages and answer comprehension questions.', parts: 4, time: '~55 min' },
      writing: { icon: '\u270D\uFE0F', title: 'Writing', desc: 'Compose an email and respond to a survey.', parts: 2, time: '~53 min' },
      speaking: { icon: '\uD83C\uDF99\uFE0F', title: 'Speaking', desc: 'Respond to prompts and describe situations.', parts: 8, time: '~20 min' },
    }
    const info = SECTION_INTROS[section] || SECTION_INTROS.listening
    return (
      <AnimatePresence mode="wait">
        <motion.div key={`transition-${section}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
          <div className="mk-transition">
            <motion.div className="mk-transition-card" initial={{ opacity: 0, scale: 0.92, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.5, type: 'spring', stiffness: 160 }}>
              <div className="mk-transition-icon" style={{ background: color }}>{info.icon}</div>
              <h2 className="mk-transition-title" style={{ color }}>Up Next — {info.title}</h2>
              <p className="mk-transition-desc">{info.desc}</p>
              <div className="mk-transition-meta">
                <span>{info.parts} parts</span><span className="mk-transition-dot">{'\u00B7'}</span><span>{info.time}</span>
              </div>
              <div className="mk-transition-progress">
                {SECTION_ORDER.map((s, i) => (
                  <div key={s} className={`mk-transition-step${i < sectionIdx ? ' mk-transition-step--done' : i === sectionIdx ? ' mk-transition-step--active' : ''}`} style={i === sectionIdx ? { borderColor: color, color } : {}}>
                    {SECTION_ICONS[s]} {s.charAt(0).toUpperCase() + s.slice(1)}
                  </div>
                ))}
              </div>
              <motion.button className="mk-btnV2 mk-btnV2--primary" style={{ background: color, marginTop: 28 }} onClick={handleTransitionDone} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
                Start {info.title} {'\u2192'}
              </motion.button>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>
    )
  }

  // Active exam phase
  const setData = examSets[currentPartId]
  const partData = section === 'listening' ? LISTENING_DATA[currentPartId] : null

  const renderActivePart = () => {
    if (!setData) return <div style={{ padding: 40, color: '#888' }}>No data for {currentPartId}</div>
    if (section === 'listening') return <ListeningPart key={currentPartId} partId={currentPartId} setData={setData} partData={partData} color={color} onDone={handlePartDone} />
    if (section === 'reading') return <ReadingPart key={currentPartId} partId={currentPartId} setData={setData} color={color} onDone={handlePartDone} sectionTimer={readingTimer} />
    if (section === 'writing') return <WritingPart key={currentPartId} partId={currentPartId} taskData={setData} color={color} onDone={handlePartDone} onScore={handlePartScoreUpdate} />
    if (section === 'speaking') {
      const taskNum = parseInt(currentPartId.replace('S', ''), 10)
      return <SpeakingPart key={currentPartId} partId={currentPartId} promptData={setData} color={color} meta={SPEAKING_META[taskNum] || SPEAKING_META[1]} onDone={handlePartDone} onScore={handlePartScoreUpdate} />
    }
    return null
  }

  // Compute overall exam progress
  const totalParts = SECTION_ORDER.reduce((sum, s) => sum + SECTION_PARTS[s].length, 0)
  const completedParts = SECTION_ORDER.slice(0, sectionIdx).reduce((sum, s) => sum + SECTION_PARTS[s].length, 0) + partIdx
  const progressPct = Math.round((completedParts / totalParts) * 100)

  // Use appropriate shell class based on section
  const shellClass = section === 'reading' ? 'rdg-shell' : section === 'writing' ? 'wl-shell' : section === 'speaking' ? 'sl-shell' : 'll-shell'

  return (
    <div className="ps-root ps-root--wide">
      <SEO title={`Mock Test ${examNumber} — ${currentPartId}`} noindex />
      <div className="ps-topbar ps-topbar--wide">
        <div className="ps-topbar-left">
          <button className="ps-bc-link" onClick={() => setPhase('landing')}>{SECTION_ICONS[section]} Mock Test #{examNumber}</button>
          <span className="ps-bc-sep">{'\u203A'}</span>
          <span className="ps-bc-current-bold" style={{ color }}>{currentPartId} — {PART_LABELS[currentPartId]}</span>
          <span className="ps-bc-qs-tag">Part {partIdx + 1} of {parts.length}</span>
        </div>
        <div className="mk-exam-progress">
          <span className="mk-exam-progress-label">{progressPct}%</span>
          <div className="mk-exam-progress-track"><div className="mk-exam-progress-fill" style={{ width: `${progressPct}%`, background: color }} /></div>
        </div>
      </div>
      <div className="ps-layout-wrap ps-layout-wrap--wide">
        <div className={shellClass}>
          <MockSidebar section={section} parts={parts} activePartIdx={partIdx} color={color} scores={scores} icon={SECTION_ICONS[section]} sectionLabel={section.charAt(0).toUpperCase() + section.slice(1)} onSkipSection={handleSkipSection} />
          <div key={currentPartId} className="mk-active-part-wrap">
            {renderActivePart()}
          </div>
        </div>
      </div>
    </div>
  )
}
