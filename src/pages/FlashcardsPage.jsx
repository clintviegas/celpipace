import { useEffect, useState, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import SEO from '../components/SEO'
import {
  SYNONYM_CATEGORIES,
  wordsForCategory,
  buildGame,
} from '../data/synonymData'
import {
  getSynonymStats,
  recordGame,
  resetSynonymStats,
} from '../lib/synonymGame'

const ROUNDS_PER_GAME = 10

const PRAISE = ['Nice!', 'Spot on!', 'Exactly!', 'You got it!', 'Sharp!', 'Brilliant!']
const MISS = ['Not quite', 'Close one', 'Tricky!', 'Almost']

export default function FlashcardsPage() {
  const navigate = useNavigate()

  const [mode, setMode] = useState('home')        // 'home' | 'play' | 'result'
  const [category, setCategory] = useState('all')
  const [stats, setStats] = useState(() => getSynonymStats())

  // game state
  const [rounds, setRounds] = useState([])
  const [idx, setIdx] = useState(0)
  const [picked, setPicked] = useState(null)       // selected option string
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)

  // refs so the finish handler reads the freshest values
  const scoreRef = useRef(0)
  const bestStreakRef = useRef(0)
  const lockRef = useRef(false)

  // refresh stats whenever we land back on home/result
  useEffect(() => {
    if (mode !== 'play') setStats(getSynonymStats())
  }, [mode])

  const startGame = useCallback((catId) => {
    setCategory(catId)
    setRounds(buildGame(catId, ROUNDS_PER_GAME))
    setIdx(0)
    setPicked(null)
    setScore(0)
    setStreak(0)
    setBestStreak(0)
    scoreRef.current = 0
    bestStreakRef.current = 0
    lockRef.current = false
    setMode('play')
  }, [])

  const current = rounds[idx]

  const choose = useCallback((opt) => {
    if (lockRef.current || !current) return
    lockRef.current = true
    setPicked(opt)

    const correct = opt === current.correct
    if (correct) {
      scoreRef.current += 1
      setScore(scoreRef.current)
      setStreak(s => {
        const next = s + 1
        if (next > bestStreakRef.current) {
          bestStreakRef.current = next
          setBestStreak(next)
        }
        return next
      })
    } else {
      setStreak(0)
    }

    const isLast = idx + 1 >= rounds.length
    window.setTimeout(() => {
      if (isLast) {
        recordGame({ correct: scoreRef.current, total: rounds.length, bestStreak: bestStreakRef.current })
        setMode('result')
        lockRef.current = false
      } else {
        setIdx(i => i + 1)
        setPicked(null)
        lockRef.current = false
      }
    }, correct ? 720 : 1150)
  }, [current, idx, rounds.length])

  /* ══════════════ HOME / CATEGORY PICKER ══════════════ */
  if (mode === 'home') {
    return (
      <main style={styles.page}>
        <SEO
          title="Synonym Match — CELPIP Vocabulary Game | CELPIPACE"
          description="Play Synonym Match: a fast, fun CELPIP vocabulary game. Guess the right synonym, build streaks, and grow the high-band words that lift your Writing and Speaking."
        />
        <div style={styles.wrap}>
          <div style={styles.hero}>
            <span style={styles.heroBadge}>🎯 Word game</span>
            <h1 style={styles.heroTitle}>Synonym Match</h1>
            <p style={styles.heroSub}>
              A word pops up — tap the synonym that means the same thing. Build a streak,
              beat your best score, and soak up the high-band vocabulary examiners love.
            </p>
            <div style={styles.statStrip}>
              <Stat label="Best score" value={`${stats.bestScore}/${ROUNDS_PER_GAME}`} />
              <Stat label="Best streak" value={`🔥 ${stats.bestStreak}`} />
              <Stat label="Games played" value={stats.gamesPlayed} />
            </div>
            <button style={styles.bigPlay} onClick={() => startGame('all')}>
              ▶ Quick play · {ROUNDS_PER_GAME} words
            </button>
          </div>

          <p style={styles.pickLabel}>Or pick a category</p>
          <div style={styles.catGrid}>
            {SYNONYM_CATEGORIES.map(cat => {
              const count = wordsForCategory(cat.id).length
              return (
                <button
                  key={cat.id}
                  style={{ ...styles.catCard, borderTop: `4px solid ${cat.color}` }}
                  onClick={() => startGame(cat.id)}
                >
                  <span style={styles.catIcon}>{cat.icon}</span>
                  <span style={styles.catTitle}>{cat.label}</span>
                  <span style={styles.catDesc}>{cat.desc}</span>
                  <span style={{ ...styles.catCount, color: cat.color }}>{count} words →</span>
                </button>
              )
            })}
          </div>

          {stats.gamesPlayed > 0 && (
            <div style={styles.footerRow}>
              <button
                style={styles.linkDanger}
                onClick={() => { resetSynonymStats(); setStats(getSynonymStats()) }}
              >
                Reset my game stats
              </button>
            </div>
          )}
        </div>
      </main>
    )
  }

  /* ══════════════ RESULT ══════════════ */
  if (mode === 'result') {
    const total = rounds.length || ROUNDS_PER_GAME
    const pct = Math.round((score / total) * 100)
    const emoji = pct >= 90 ? '🏆' : pct >= 70 ? '🎉' : pct >= 50 ? '👏' : '💪'
    const headline = pct >= 90 ? 'Word wizard!' : pct >= 70 ? 'Great round!' : pct >= 50 ? 'Solid effort!' : 'Keep going!'
    const newBest = score > 0 && score >= stats.bestScore
    return (
      <main style={styles.page}>
        <SEO title="Synonym Match — CELPIP Vocabulary Game | CELPIPACE" description="Play Synonym Match, the fast CELPIP vocabulary game." />
        <div style={styles.wrap}>
          <div style={styles.resultCard}>
            <div style={styles.resultEmoji}>{emoji}</div>
            <h1 style={styles.resultTitle}>{headline}</h1>
            <div style={styles.scoreBig}>{score}<span style={styles.scoreOf}> / {total}</span></div>
            <p style={styles.muted}>
              {pct}% correct · best streak this round 🔥 {bestStreak}
              {newBest && <span style={styles.newBest}> · new personal best!</span>}
            </p>
            <div style={styles.btnRow}>
              <button style={styles.primaryBtn} onClick={() => startGame(category)}>Play again →</button>
              <button style={styles.ghostBtn} onClick={() => setMode('home')}>Change category</button>
            </div>
            <button style={styles.linkBtn} onClick={() => navigate('/dashboard')}>Back to dashboard</button>
          </div>
        </div>
      </main>
    )
  }

  /* ══════════════ PLAY ══════════════ */
  if (!current) {
    return <main style={styles.page}><div style={styles.resultCard}><p style={styles.muted}>Loading…</p></div></main>
  }

  const pct = Math.round((idx / rounds.length) * 100)
  const answered = picked !== null
  return (
    <main style={styles.page}>
      <SEO title="Synonym Match — CELPIP Vocabulary Game | CELPIPACE" description="Play Synonym Match, the fast CELPIP vocabulary game." />
      <div style={styles.wrap}>
        <div style={styles.playTop}>
          <button style={styles.linkBtn} onClick={() => setMode('home')}>← Quit</button>
          <div style={styles.playMeta}>
            <span style={styles.metaPill}>{idx + 1} / {rounds.length}</span>
            <span style={styles.metaPill}>Score {score}</span>
            <span style={{ ...styles.metaPill, ...(streak >= 2 ? styles.streakHot : null) }}>🔥 {streak}</span>
          </div>
        </div>

        <div style={styles.progressTrack}><div style={{ ...styles.progressFill, width: `${pct}%` }} /></div>

        <div style={styles.promptCard}>
          <span style={styles.promptKicker}>Which word means the same as</span>
          <h2 style={styles.promptWord}>{current.word}</h2>
          <span style={styles.promptClue}>“{current.clue}”</span>
        </div>

        <div style={styles.optionGrid}>
          {current.options.map(opt => {
            const isCorrect = opt === current.correct
            const isPicked = opt === picked
            let style = { ...styles.option }
            if (answered) {
              if (isCorrect) style = { ...style, ...styles.optionCorrect }
              else if (isPicked) style = { ...style, ...styles.optionWrong }
              else style = { ...style, ...styles.optionDim }
            }
            return (
              <button
                key={opt}
                style={style}
                disabled={answered}
                onClick={() => choose(opt)}
              >
                <span>{opt}</span>
                {answered && isCorrect && <span style={styles.tick}>✓</span>}
                {answered && isPicked && !isCorrect && <span style={styles.cross}>✕</span>}
              </button>
            )
          })}
        </div>

        <div style={styles.feedbackSlot}>
          {answered && (
            picked === current.correct
              ? <span style={styles.fbGood}>{PRAISE[idx % PRAISE.length]} {streak >= 3 ? `🔥 ${streak} in a row!` : ''}</span>
              : <span style={styles.fbBad}>{MISS[idx % MISS.length]} — it’s <strong>{current.correct}</strong></span>
          )}
        </div>
      </div>
    </main>
  )
}

function Stat({ label, value }) {
  return (
    <div style={styles.stat}>
      <span style={styles.statValue}>{value}</span>
      <span style={styles.statLabel}>{label}</span>
    </div>
  )
}

const styles = {
  page: { minHeight: '70vh', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '32px 16px 80px', background: '#F8FAFC' },
  wrap: { width: '100%', maxWidth: 620 },

  // hero / home
  hero: { background: 'linear-gradient(160deg,#0f172a 0%,#1e293b 100%)', borderRadius: 22, padding: '30px 26px 26px', color: '#fff', boxShadow: '0 18px 40px -22px rgba(15,23,42,.6)', marginBottom: 22 },
  heroBadge: { display: 'inline-block', fontSize: 12, fontWeight: 700, color: '#a7f3d0', background: 'rgba(52,211,153,.14)', borderRadius: 99, padding: '5px 12px', marginBottom: 14 },
  heroTitle: { fontSize: 30, fontWeight: 900, margin: '0 0 8px', letterSpacing: '-0.02em' },
  heroSub: { fontSize: 14.5, lineHeight: 1.6, color: '#cbd5e1', margin: '0 0 20px' },
  statStrip: { display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' },
  stat: { background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 14, padding: '12px 16px', flex: '1 1 auto', minWidth: 100 },
  statValue: { display: 'block', fontSize: 19, fontWeight: 800, color: '#fff' },
  statLabel: { display: 'block', fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.05em', marginTop: 3 },
  bigPlay: { width: '100%', background: '#34d399', color: '#04241a', border: 'none', borderRadius: 14, padding: '15px 18px', fontSize: 16, fontWeight: 800, cursor: 'pointer' },

  pickLabel: { fontSize: 13, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.06em', margin: '0 0 12px 4px' },
  catGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 14 },
  catCard: { textAlign: 'left', background: '#fff', borderRadius: 16, padding: '18px 18px 16px', boxShadow: '0 2px 12px rgba(15,23,42,.05)', display: 'flex', flexDirection: 'column', gap: 6, cursor: 'pointer', border: '1px solid #eef2f7' },
  catIcon: { fontSize: 24 },
  catTitle: { fontSize: 15.5, fontWeight: 800, color: '#0f172a' },
  catDesc: { fontSize: 12.5, lineHeight: 1.5, color: '#64748b', flex: 1 },
  catCount: { fontSize: 12.5, fontWeight: 700, marginTop: 4 },

  // play
  playTop: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, gap: 10 },
  playMeta: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  metaPill: { fontSize: 12.5, fontWeight: 700, color: '#475569', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 99, padding: '5px 11px' },
  streakHot: { color: '#b45309', background: '#fffbeb', borderColor: '#fde68a' },
  progressTrack: { height: 8, background: '#E2E8F0', borderRadius: 99, overflow: 'hidden', marginBottom: 20 },
  progressFill: { height: '100%', background: 'linear-gradient(90deg,#34d399,#059669)', borderRadius: 99, transition: 'width .35s ease' },

  promptCard: { background: '#fff', borderRadius: 18, padding: '28px 24px', boxShadow: '0 4px 24px rgba(15,23,42,.07)', textAlign: 'center', marginBottom: 16 },
  promptKicker: { fontSize: 12.5, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.06em' },
  promptWord: { fontSize: 32, fontWeight: 900, color: '#0f172a', margin: '10px 0 8px', letterSpacing: '-0.02em' },
  promptClue: { fontSize: 14, color: '#64748b', fontStyle: 'italic' },

  optionGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  option: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, background: '#fff', border: '2px solid #e2e8f0', borderRadius: 14, padding: '16px 18px', fontSize: 16, fontWeight: 700, color: '#0f172a', cursor: 'pointer', transition: 'transform .1s ease, border-color .15s ease', minHeight: 58, textAlign: 'left' },
  optionCorrect: { borderColor: '#34d399', background: '#ecfdf5', color: '#047857', cursor: 'default' },
  optionWrong: { borderColor: '#f87171', background: '#fef2f2', color: '#b91c1c', cursor: 'default' },
  optionDim: { opacity: 0.55, cursor: 'default' },
  tick: { color: '#059669', fontWeight: 900 },
  cross: { color: '#dc2626', fontWeight: 900 },

  feedbackSlot: { minHeight: 30, textAlign: 'center', marginTop: 16 },
  fbGood: { fontSize: 15, fontWeight: 800, color: '#059669' },
  fbBad: { fontSize: 15, fontWeight: 700, color: '#b91c1c' },

  // result
  resultCard: { background: '#fff', borderRadius: 20, padding: '40px 30px', boxShadow: '0 4px 24px rgba(15,23,42,.07)', textAlign: 'center', maxWidth: 480, margin: '0 auto' },
  resultEmoji: { fontSize: 54, marginBottom: 6 },
  resultTitle: { fontSize: 24, fontWeight: 800, color: '#0f172a', margin: '0 0 10px' },
  scoreBig: { fontSize: 52, fontWeight: 900, color: '#059669', lineHeight: 1 },
  scoreOf: { fontSize: 24, fontWeight: 700, color: '#94a3b8' },
  newBest: { color: '#b45309', fontWeight: 800 },

  // shared
  muted: { fontSize: 14.5, lineHeight: 1.6, color: '#64748b', margin: '14px 0 22px' },
  btnRow: { display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 8 },
  primaryBtn: { background: '#0f172a', color: '#fff', border: 'none', borderRadius: 12, padding: '13px 24px', fontSize: 15, fontWeight: 700, cursor: 'pointer' },
  ghostBtn: { background: '#fff', color: '#0f172a', border: '1px solid #E2E8F0', borderRadius: 12, padding: '13px 24px', fontSize: 15, fontWeight: 700, cursor: 'pointer' },
  linkBtn: { background: 'none', border: 'none', color: '#64748b', fontSize: 14, fontWeight: 600, cursor: 'pointer', padding: 8 },
  linkDanger: { background: 'none', border: 'none', color: '#C8102E', fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: 8 },
  footerRow: { textAlign: 'center', marginTop: 20 },
}
