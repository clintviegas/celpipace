import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getStudyQueue,
  getDeckStats,
  getFlashcardSummary,
  gradeFlashcard,
  resetFlashcards,
  FLASHCARD_GRADES,
} from '../lib/flashcards'
import SEO from '../components/SEO'

export default function FlashcardsPage() {
  const navigate = useNavigate()

  const [mode, setMode] = useState('picker') // 'picker' | 'study'
  const [loading, setLoading] = useState(true)
  const [decks, setDecks] = useState([])
  const [summary, setSummary] = useState({ total: 0, due: 0, mastered: 0 })

  // study session state
  const [queue, setQueue] = useState([])
  const [idx, setIdx] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [studiedCount, setStudiedCount] = useState(0)
  const [activeDeck, setActiveDeck] = useState(null) // null = all decks
  const [grading, setGrading] = useState(false)

  const loadPicker = useCallback(async () => {
    setLoading(true)
    const [d, s] = await Promise.all([getDeckStats(), getFlashcardSummary()])
    setDecks(d)
    setSummary(s)
    setLoading(false)
  }, [])

  useEffect(() => { loadPicker() }, [loadPicker])

  const startStudy = useCallback(async (deckId) => {
    setLoading(true)
    setActiveDeck(deckId)
    const q = await getStudyQueue(deckId, 30)
    setQueue(q)
    setIdx(0)
    setFlipped(false)
    setStudiedCount(0)
    setMode('study')
    setLoading(false)
  }, [])

  const current = queue[idx]

  const handleGrade = useCallback(async (quality) => {
    if (!current || grading) return
    setGrading(true)
    await gradeFlashcard(current, quality)
    setGrading(false)
    setStudiedCount(c => c + 1)
    if (idx + 1 < queue.length) {
      setIdx(idx + 1)
      setFlipped(false)
    } else {
      // session done — refresh picker data behind the finished screen
      loadPicker()
      setIdx(queue.length) // pushes past end → finished view
    }
  }, [current, grading, idx, queue.length, loadPicker])

  const backToPicker = useCallback(() => {
    setMode('picker')
    loadPicker()
  }, [loadPicker])

  /* ── Loading ── */
  if (loading && mode === 'picker') {
    return (
      <main style={styles.page}>
        <div style={styles.cardCenter}><p style={styles.muted}>Loading your flashcards…</p></div>
      </main>
    )
  }

  /* ══════════════ STUDY MODE ══════════════ */
  if (mode === 'study') {
    const finished = idx >= queue.length
    if (loading) {
      return <main style={styles.page}><div style={styles.cardCenter}><p style={styles.muted}>Shuffling your deck…</p></div></main>
    }

    if (finished || queue.length === 0) {
      return (
        <main style={styles.page}>
          <SEO title="Vocabulary & Grammar Flashcards — CELPIPACE" description="Master CELPIP vocabulary, idioms and grammar with spaced-repetition flashcards." />
          <div style={styles.cardCenter}>
            <div style={styles.bigIcon}>{queue.length === 0 ? '🎉' : '✅'}</div>
            <h1 style={styles.h1}>{queue.length === 0 ? 'All caught up!' : 'Session complete!'}</h1>
            <p style={styles.muted}>
              {queue.length === 0
                ? 'Nothing is due in this deck right now. Your cards are scheduled with spaced repetition — come back later to keep them fresh.'
                : `You studied ${studiedCount} card${studiedCount === 1 ? '' : 's'}. Great work — they’ll resurface on an optimal schedule.`}
            </p>
            <div style={styles.btnRow}>
              <button style={styles.primaryBtn} onClick={backToPicker}>Back to decks</button>
              <button style={styles.ghostBtn} onClick={() => navigate('/dashboard')}>Dashboard</button>
            </div>
          </div>
        </main>
      )
    }

    const pct = Math.round((idx / queue.length) * 100)
    return (
      <main style={styles.page}>
        <SEO title="Vocabulary & Grammar Flashcards — CELPIPACE" description="Master CELPIP vocabulary, idioms and grammar with spaced-repetition flashcards." />
        <div style={styles.wrap}>
          <div style={styles.headerRow}>
            <button style={styles.linkBtn} onClick={backToPicker}>← Decks</button>
            <span style={styles.headerSub}>{idx + 1} / {queue.length}</span>
          </div>
          <div style={styles.progressTrack}><div style={{ ...styles.progressFill, width: `${pct}%` }} /></div>

          <div
            style={{ ...styles.flashcard, borderTop: `4px solid ${current.color}` }}
            onClick={() => !flipped && setFlipped(true)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); if (!flipped) setFlipped(true) } }}
          >
            <span style={{ ...styles.deckTag, color: current.color, background: `${current.color}14` }}>
              {current.icon} {current.deckLabel}
            </span>

            {!flipped ? (
              <>
                <div style={styles.cardFront}>{current.front}</div>
                <p style={styles.flipHint}>Tap to reveal</p>
              </>
            ) : (
              <>
                <div style={styles.cardFrontSmall}>{current.front}</div>
                <div style={styles.cardBack}>{current.back}</div>
                {current.example && (
                  <div style={styles.example}><span style={styles.exLabel}>Example</span>{current.example}</div>
                )}
              </>
            )}
          </div>

          {flipped && (
            <>
              <p style={styles.gradePrompt}>How well did you know it?</p>
              <div style={styles.gradeRow}>
                {FLASHCARD_GRADES.map(g => (
                  <button
                    key={g.quality}
                    disabled={grading}
                    onClick={() => handleGrade(g.quality)}
                    style={{ ...styles.gradeBtn, borderColor: g.color, color: g.color }}
                  >
                    <span style={{ fontWeight: 700 }}>{g.label}</span>
                    <span style={styles.gradeHint}>{g.hint}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    )
  }

  /* ══════════════ DECK PICKER ══════════════ */
  return (
    <main style={styles.page}>
      <SEO title="Vocabulary & Grammar Flashcards — CELPIPACE" description="Master CELPIP vocabulary, idioms and grammar with spaced-repetition flashcards." />
      <div style={styles.wrap}>
        <div style={styles.headerCard}>
          <div style={styles.headerTop}>
            <div>
              <h1 style={styles.h1Left}>Flashcard Drills</h1>
              <p style={styles.headerSub}>Build the vocabulary, idioms and grammar that lift your Writing & Speaking bands.</p>
            </div>
          </div>
          <div style={styles.metaRow}>
            <Meta label="Cards" value={summary.total} color="#0f172a" />
            <Meta label="Due now" value={summary.due} color={summary.due > 0 ? '#C8102E' : '#94a3b8'} />
            <Meta label="Mastered" value={summary.mastered} color="#2D8A56" />
          </div>
          {summary.due > 0 && (
            <button style={{ ...styles.primaryBtn, width: '100%', marginTop: 4 }} onClick={() => startStudy(null)}>
              Study all due cards ({summary.due}) →
            </button>
          )}
        </div>

        <div style={styles.deckGrid}>
          {decks.map(deck => {
            const pct = deck.total > 0 ? Math.round((deck.mastered / deck.total) * 100) : 0
            return (
              <div key={deck.id} style={{ ...styles.deckCard, borderTop: `4px solid ${deck.color}` }}>
                <div style={styles.deckHead}>
                  <span style={styles.deckIcon}>{deck.icon}</span>
                  <span style={styles.deckTitle}>{deck.label}</span>
                </div>
                <p style={styles.deckDesc}>{deck.desc}</p>
                <div style={styles.deckProgressTrack}>
                  <div style={{ ...styles.deckProgressFill, width: `${pct}%`, background: deck.color }} />
                </div>
                <div style={styles.deckMetaRow}>
                  <span style={styles.deckMeta}>{deck.mastered}/{deck.total} mastered</span>
                  {deck.due > 0 && <span style={{ ...styles.dueBadge }}>{deck.due} due</span>}
                </div>
                <button
                  style={{ ...styles.deckBtn, background: deck.color }}
                  onClick={() => startStudy(deck.id)}
                >
                  {deck.mastered === deck.total ? 'Review deck' : 'Study deck'} →
                </button>
              </div>
            )
          })}
        </div>

        <div style={styles.footerRow}>
          <button
            style={styles.linkDanger}
            onClick={async () => { await resetFlashcards(null); loadPicker() }}
          >
            Reset all flashcard progress
          </button>
        </div>
      </div>
    </main>
  )
}

function Meta({ label, value, color }) {
  return (
    <div style={styles.meta}>
      <span style={{ ...styles.metaValue, color }}>{value}</span>
      <span style={styles.metaLabel}>{label}</span>
    </div>
  )
}

const styles = {
  page: { minHeight: '70vh', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '32px 16px 80px', background: '#F8FAFC' },
  wrap: { width: '100%', maxWidth: 620 },
  cardCenter: { width: '100%', maxWidth: 540, margin: '0 auto', background: '#fff', borderRadius: 18, padding: '40px 32px', boxShadow: '0 4px 24px rgba(15,23,42,0.06)', textAlign: 'center' },
  bigIcon: { fontSize: 46, marginBottom: 8 },
  h1: { fontSize: 24, fontWeight: 700, color: '#0f172a', margin: '8px 0 12px' },
  h1Left: { fontSize: 22, fontWeight: 700, color: '#0f172a', margin: 0 },
  muted: { fontSize: 15, lineHeight: 1.6, color: '#64748b', margin: '0 0 20px' },
  primaryBtn: { background: '#0f172a', color: '#fff', border: 'none', borderRadius: 10, padding: '12px 22px', fontSize: 14, fontWeight: 600, cursor: 'pointer' },
  ghostBtn: { background: '#fff', color: '#0f172a', border: '1px solid #E2E8F0', borderRadius: 10, padding: '12px 22px', fontSize: 14, fontWeight: 600, cursor: 'pointer' },
  linkBtn: { background: 'none', border: 'none', color: '#64748b', fontSize: 14, fontWeight: 600, cursor: 'pointer', padding: 6 },
  linkDanger: { background: 'none', border: 'none', color: '#C8102E', fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: 8 },
  btnRow: { display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' },

  headerCard: { background: '#fff', borderRadius: 18, padding: '24px 24px 22px', boxShadow: '0 4px 24px rgba(15,23,42,0.06)', marginBottom: 16 },
  headerTop: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 16 },
  headerSub: { fontSize: 13.5, color: '#64748b', margin: '6px 0 0' },
  metaRow: { display: 'flex', gap: 26, marginBottom: 16 },
  meta: { display: 'flex', flexDirection: 'column', gap: 2 },
  metaValue: { fontSize: 20, fontWeight: 800 },
  metaLabel: { fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.05em' },

  deckGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 },
  deckCard: { background: '#fff', borderRadius: 16, padding: '20px 20px 18px', boxShadow: '0 2px 12px rgba(15,23,42,0.05)', display: 'flex', flexDirection: 'column' },
  deckHead: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 },
  deckIcon: { fontSize: 22 },
  deckTitle: { fontSize: 15.5, fontWeight: 700, color: '#0f172a' },
  deckDesc: { fontSize: 13, lineHeight: 1.5, color: '#64748b', margin: '0 0 14px', flex: 1 },
  deckProgressTrack: { height: 7, background: '#EEF2F7', borderRadius: 99, overflow: 'hidden', marginBottom: 8 },
  deckProgressFill: { height: '100%', borderRadius: 99, transition: 'width .3s ease' },
  deckMetaRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  deckMeta: { fontSize: 12.5, color: '#64748b', fontWeight: 600 },
  dueBadge: { fontSize: 11.5, fontWeight: 700, color: '#C8102E', background: '#FEF2F2', borderRadius: 99, padding: '3px 9px' },
  deckBtn: { color: '#fff', border: 'none', borderRadius: 10, padding: '11px 14px', fontSize: 13.5, fontWeight: 700, cursor: 'pointer' },

  headerRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  progressTrack: { height: 8, background: '#E2E8F0', borderRadius: 99, overflow: 'hidden', marginBottom: 18 },
  progressFill: { height: '100%', background: 'linear-gradient(90deg,#4A90D9,#2D8A56)', borderRadius: 99, transition: 'width .3s ease' },

  flashcard: { background: '#fff', borderRadius: 18, padding: '34px 28px', boxShadow: '0 4px 24px rgba(15,23,42,0.07)', minHeight: 220, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', textAlign: 'center', marginBottom: 18 },
  deckTag: { position: 'relative', alignSelf: 'center', fontSize: 12, fontWeight: 700, padding: '5px 12px', borderRadius: 99, marginBottom: 16 },
  cardFront: { fontSize: 26, fontWeight: 800, color: '#0f172a', lineHeight: 1.3 },
  cardFrontSmall: { fontSize: 19, fontWeight: 800, color: '#0f172a', marginBottom: 12 },
  cardBack: { fontSize: 16, lineHeight: 1.55, color: '#334155', fontWeight: 500 },
  example: { marginTop: 16, fontSize: 14, lineHeight: 1.55, color: '#475569', fontStyle: 'italic', background: '#F8FAFC', borderRadius: 10, padding: '12px 14px', textAlign: 'left', width: '100%', boxSizing: 'border-box' },
  exLabel: { display: 'block', fontStyle: 'normal', fontWeight: 700, fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 4 },
  flipHint: { fontSize: 12.5, color: '#94a3b8', marginTop: 18 },

  gradePrompt: { fontSize: 13, fontWeight: 600, color: '#64748b', textAlign: 'center', margin: '0 0 12px' },
  gradeRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 },
  gradeBtn: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, background: '#fff', border: '1.5px solid', borderRadius: 12, padding: '12px 6px', fontSize: 14, cursor: 'pointer' },
  gradeHint: { fontSize: 11, color: '#94a3b8' },
  footerRow: { textAlign: 'center', marginTop: 18 },
}
