import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  getDueReviewItems,
  getReviewSummary,
  gradeReviewItem,
  REVIEW_GRADES,
} from '../lib/reviewQueue'
import SEO from '../components/SEO'

const SECTION_META = {
  listening: { label: 'Listening', icon: '🎧', color: '#4A90D9' },
  reading:   { label: 'Reading',   icon: '📖', color: '#2D8A56' },
}

/* Pull the leading letter (A/B/C/D) out of an option or answer string so we
   can compare a chosen option against the stored correct answer reliably. */
function answerKey(value) {
  if (value == null) return ''
  const s = String(value).trim()
  const m = s.match(/^([A-Da-d])\b|^([A-Da-d])\)/)
  if (m) return (m[1] || m[2]).toUpperCase()
  return s.toUpperCase()
}

export default function ReviewPage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [loading, setLoading] = useState(true)
  const [queue, setQueue] = useState([])
  const [idx, setIdx] = useState(0)
  const [summary, setSummary] = useState({ due: 0, learning: 0, mastered: 0, total: 0 })
  const [selected, setSelected] = useState(null)
  const [revealed, setRevealed] = useState(false)
  const [grading, setGrading] = useState(false)
  const [reviewedCount, setReviewedCount] = useState(0)
  const [finished, setFinished] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const [items, sum] = await Promise.all([getDueReviewItems(20), getReviewSummary()])
    setQueue(items)
    setSummary(sum)
    setIdx(0)
    setSelected(null)
    setRevealed(false)
    setReviewedCount(0)
    setFinished(items.length === 0)
    setLoading(false)
  }, [])

  useEffect(() => {
    if (!user?.id) { setLoading(false); return }
    load()
  }, [user?.id, load])

  const current = queue[idx]
  const correctKey = current ? answerKey(current.correct_answer) : ''

  const handleSelect = (option) => {
    if (revealed) return
    setSelected(option)
    setRevealed(true)
  }

  const handleGrade = async (quality) => {
    if (!current || grading) return
    setGrading(true)
    const wasCorrect = answerKey(selected) === correctKey
    await gradeReviewItem(current, quality, wasCorrect)
    setGrading(false)
    setReviewedCount(c => c + 1)

    if (idx + 1 < queue.length) {
      setIdx(idx + 1)
      setSelected(null)
      setRevealed(false)
    } else {
      // Pull any newly-due items (e.g. ones graded "Again") then finish.
      const more = await getDueReviewItems(20)
      const fresh = more.filter(m => !queue.some(q => q.id === m.id) || m.id === current.id)
      if (more.length > 0 && reviewedCount + 1 < 40) {
        setQueue(more)
        setIdx(0)
        setSelected(null)
        setRevealed(false)
      } else {
        const sum = await getReviewSummary()
        setSummary(sum)
        setFinished(true)
      }
    }
  }

  /* ── Signed-out state ── */
  if (!user?.id) {
    return (
      <main style={styles.page}>
        <SEO title="Review Your Mistakes — CELPIPACE" description="Review and master the CELPIP questions you got wrong with spaced repetition." />
        <div style={styles.card}>
          <div style={styles.bigIcon}>🔁</div>
          <h1 style={styles.h1}>Review Your Mistakes</h1>
          <p style={styles.muted}>Sign in to build a personalised review deck from every question you miss, scheduled with spaced repetition so it sticks.</p>
          <button style={styles.primaryBtn} onClick={() => navigate('/dashboard')}>Go to Dashboard</button>
        </div>
      </main>
    )
  }

  if (loading) {
    return (
      <main style={styles.page}>
        <div style={styles.card}><p style={styles.muted}>Loading your review deck…</p></div>
      </main>
    )
  }

  /* ── Nothing due / finished ── */
  if (finished || !current) {
    const nothingEver = summary.total === 0
    return (
      <main style={styles.page}>
        <SEO title="Review Your Mistakes — CELPIPACE" description="Review and master the CELPIP questions you got wrong with spaced repetition." />
        <div style={styles.card}>
          <div style={styles.bigIcon}>{nothingEver ? '🎯' : '✅'}</div>
          <h1 style={styles.h1}>
            {nothingEver ? 'No mistakes to review yet' : reviewedCount > 0 ? 'Review complete!' : 'All caught up!'}
          </h1>
          <p style={styles.muted}>
            {nothingEver
              ? 'As you practise Listening and Reading sets, every question you miss is added here automatically. Come back to review them on a smart schedule.'
              : reviewedCount > 0
                ? `You reviewed ${reviewedCount} question${reviewedCount === 1 ? '' : 's'}. Nice work — they’ll resurface later for long-term retention.`
                : 'Nothing is due for review right now. Check back later — your items are scheduled with spaced repetition.'}
          </p>

          {!nothingEver && (
            <div style={styles.statRow}>
              <Stat label="Due now" value={summary.due} color="#C8102E" />
              <Stat label="Learning" value={summary.learning} color="#C8972A" />
              <Stat label="Mastered" value={summary.mastered} color="#2D8A56" />
            </div>
          )}

          <div style={styles.btnRow}>
            <button style={styles.primaryBtn} onClick={() => navigate('/celpip-listening-practice')}>Practice Listening</button>
            <button style={styles.ghostBtn} onClick={() => navigate('/celpip-reading-practice')}>Practice Reading</button>
          </div>
          <button style={styles.linkBtn} onClick={() => navigate('/dashboard')}>← Back to Dashboard</button>
        </div>
      </main>
    )
  }

  /* ── Active review card ── */
  const meta = SECTION_META[current.section] || { label: current.section, icon: '📘', color: '#4A90D9' }
  const total = queue.length
  const progressPct = Math.round((idx / total) * 100)

  return (
    <main style={styles.page}>
      <SEO title="Review Your Mistakes — CELPIPACE" description="Review and master the CELPIP questions you got wrong with spaced repetition." />
      <div style={{ width: '100%', maxWidth: 760 }}>
        {/* Header */}
        <div style={styles.headerRow}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 22 }}>🔁</span>
            <div>
              <h1 style={styles.headerTitle}>Review Your Mistakes</h1>
              <span style={styles.headerSub}>{summary.due} due today · {summary.mastered} mastered</span>
            </div>
          </div>
          <button style={styles.linkBtn} onClick={() => navigate('/dashboard')}>Exit</button>
        </div>

        {/* Progress bar */}
        <div style={styles.progressTrack}>
          <div style={{ ...styles.progressFill, width: `${progressPct}%` }} />
        </div>
        <div style={styles.progressLabel}>{idx + 1} of {total}</div>

        {/* Question card */}
        <div style={styles.qCard}>
          <div style={{ ...styles.tag, background: `${meta.color}18`, color: meta.color }}>
            {meta.icon} {meta.label} · {current.part_id} · Set {current.set_number}
          </div>
          <p style={styles.qText}>{current.question_text || 'Select the correct answer.'}</p>

          <div style={{ display: 'grid', gap: 10 }}>
            {(current.options || []).map((opt, i) => {
              const optKey = answerKey(opt)
              const isCorrect = optKey === correctKey
              const isChosen = selected != null && answerKey(selected) === optKey
              let bg = '#fff', border = '#E2E8F0', color = '#0f172a'
              if (revealed) {
                if (isCorrect) { bg = '#F0FDF4'; border = '#2D8A56'; color = '#14532d' }
                else if (isChosen) { bg = '#FEF2F2'; border = '#C8102E'; color = '#7f1d1d' }
              }
              return (
                <button
                  key={i}
                  onClick={() => handleSelect(opt)}
                  disabled={revealed}
                  style={{ ...styles.option, background: bg, borderColor: border, color, cursor: revealed ? 'default' : 'pointer' }}
                >
                  <span>{opt}</span>
                  {revealed && isCorrect && <span style={{ fontWeight: 700 }}>✓</span>}
                  {revealed && isChosen && !isCorrect && <span style={{ fontWeight: 700 }}>✕</span>}
                </button>
              )
            })}
          </div>

          {/* Grade buttons after reveal */}
          {revealed && (
            <div style={{ marginTop: 22 }}>
              <p style={styles.gradePrompt}>How well did you know this?</p>
              <div style={styles.gradeRow}>
                {REVIEW_GRADES.map(g => (
                  <button
                    key={g.quality}
                    onClick={() => handleGrade(g.quality)}
                    disabled={grading}
                    style={{ ...styles.gradeBtn, borderColor: g.color, color: g.color }}
                  >
                    <span style={{ fontWeight: 700 }}>{g.label}</span>
                    <span style={styles.gradeHint}>{g.hint}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

function Stat({ label, value, color }) {
  return (
    <div style={styles.stat}>
      <span style={{ ...styles.statValue, color }}>{value}</span>
      <span style={styles.statLabel}>{label}</span>
    </div>
  )
}

const styles = {
  page: { minHeight: '70vh', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '32px 16px 80px', background: '#F8FAFC' },
  card: { width: '100%', maxWidth: 560, background: '#fff', borderRadius: 18, padding: '40px 32px', boxShadow: '0 4px 24px rgba(15,23,42,0.06)', textAlign: 'center' },
  bigIcon: { fontSize: 46, marginBottom: 8 },
  h1: { fontSize: 24, fontWeight: 700, color: '#0f172a', margin: '8px 0 12px' },
  muted: { fontSize: 15, lineHeight: 1.6, color: '#64748b', margin: '0 0 20px' },
  statRow: { display: 'flex', justifyContent: 'center', gap: 28, margin: '8px 0 24px' },
  stat: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 },
  statValue: { fontSize: 26, fontWeight: 800 },
  statLabel: { fontSize: 12, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.05em' },
  btnRow: { display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 14 },
  primaryBtn: { background: '#0f172a', color: '#fff', border: 'none', borderRadius: 10, padding: '12px 22px', fontSize: 14, fontWeight: 600, cursor: 'pointer' },
  ghostBtn: { background: '#fff', color: '#0f172a', border: '1px solid #E2E8F0', borderRadius: 10, padding: '12px 22px', fontSize: 14, fontWeight: 600, cursor: 'pointer' },
  linkBtn: { background: 'none', border: 'none', color: '#64748b', fontSize: 14, fontWeight: 600, cursor: 'pointer', padding: 6 },
  headerRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  headerTitle: { fontSize: 20, fontWeight: 700, color: '#0f172a', margin: 0 },
  headerSub: { fontSize: 13, color: '#94a3b8' },
  progressTrack: { height: 8, background: '#E2E8F0', borderRadius: 99, overflow: 'hidden' },
  progressFill: { height: '100%', background: 'linear-gradient(90deg,#4A90D9,#2D8A56)', borderRadius: 99, transition: 'width .3s ease' },
  progressLabel: { fontSize: 12, color: '#94a3b8', textAlign: 'right', margin: '6px 0 16px' },
  qCard: { background: '#fff', borderRadius: 18, padding: '28px 26px', boxShadow: '0 4px 24px rgba(15,23,42,0.06)' },
  tag: { display: 'inline-block', fontSize: 12, fontWeight: 700, padding: '5px 12px', borderRadius: 99, marginBottom: 16 },
  qText: { fontSize: 17, lineHeight: 1.6, color: '#0f172a', fontWeight: 600, margin: '0 0 20px' },
  option: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, textAlign: 'left', border: '1.5px solid #E2E8F0', borderRadius: 12, padding: '14px 16px', fontSize: 15, lineHeight: 1.45, transition: 'all .15s ease' },
  gradePrompt: { fontSize: 13, fontWeight: 600, color: '#64748b', textAlign: 'center', margin: '0 0 12px' },
  gradeRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 },
  gradeBtn: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, background: '#fff', border: '1.5px solid', borderRadius: 12, padding: '12px 6px', fontSize: 14, cursor: 'pointer' },
  gradeHint: { fontSize: 11, color: '#94a3b8' },
}
