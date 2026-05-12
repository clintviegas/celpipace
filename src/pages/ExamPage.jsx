import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import AuthModal from '../components/AuthModal'
import SEO from '../components/SEO'
import { PRODUCT_STATS } from '../data/constants'
import { formatBandScore, summarizeMockScores } from '../lib/mockScoreUtils'

const SECTION_META = {
  listening: { label: 'Listening', icon: '\uD83C\uDFA7', parts: ['L1','L2','L3','L4','L5','L6'], color: '#4A90D9', objective: true },
  reading:   { label: 'Reading',   icon: '\uD83D\uDCD6', parts: ['R1','R2','R3','R4'],            color: '#2D8A56', objective: true },
  writing:   { label: 'Writing',   icon: '\u270D\uFE0F', parts: ['W1','W2'],                       color: '#C8972A', objective: false },
  speaking:  { label: 'Speaking',  icon: '\uD83C\uDF99\uFE0F', parts: ['S1','S2','S3','S4','S5','S6','S7','S8'], color: '#C8102E', objective: false },
}

/* ── Mock exam data ─────────────────────────────────────────── */
const EXAMS = Array.from({ length: 8 }, (_, i) => ({
  num: i + 1,
  sections: [
    { id: 'listening', icon: '🎧', label: 'Listening', qs: 38 },
    { id: 'reading',   icon: '📖', label: 'Reading',   qs: 38 },
    { id: 'writing',   icon: '✍️', label: 'Writing',   qs: 2 },
    { id: 'speaking',  icon: '🎙️', label: 'Speaking',  qs: 8 },
  ],
}))

/* ── Main ExamPage ─────────────────────────────────────────── */
export default function ExamPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, isPremium } = useAuth()
  const [authOpen, setAuthOpen] = useState(false)
  const [authReason, setAuthReason] = useState('')
  const [scoreModal, setScoreModal] = useState(null)   // { examNumber, session | null }
  const [scoresByExam, setScoresByExam] = useState({}) // { [examNumber]: session row | null }
  const [attemptsByExam, setAttemptsByExam] = useState({}) // { [examNumber]: session[] }

  // Pull the most recent completed mock attempt per exam number for this user.
  // Depends on location.key so it re-fetches on every navigation to this page
  // (not just when user?.id changes), ensuring data is fresh after exam completion.
  useEffect(() => {
    if (!user?.id) { setScoresByExam({}); setAttemptsByExam({}); return }
    let cancelled = false
    ;(async () => {
      try {
        const { data, error } = await supabase
          .from('test_sessions')
          .select('id, exam_number, scores, meta, completed_at, updated_at')
          .eq('user_id', user.id)
          .eq('kind', 'mock')
          .eq('is_completed', true)
          .order('completed_at', { ascending: false })
        if (error) throw error
        if (cancelled) return
        const map = {}
        const attemptsMap = {}
        for (const row of data || []) {
          const hasScores = row.scores && Object.keys(row.scores).length > 0
          if (!hasScores) continue
          if (row.exam_number != null && !map[row.exam_number]) map[row.exam_number] = row
          if (row.exam_number != null) {
            attemptsMap[row.exam_number] = [...(attemptsMap[row.exam_number] || []), row]
          }
        }
        setScoresByExam(map)
        setAttemptsByExam(attemptsMap)
      } catch (err) {
        console.error('[ExamPage] failed to load scores:', err)
        if (!cancelled) { setScoresByExam({}); setAttemptsByExam({}) }
      }
    })()
    return () => { cancelled = true }
  }, [user?.id, location.key])

  const handleScoreClick = (examNum) => {
    if (!user) { setAuthReason('view your mock exam scores'); setAuthOpen(true); return }
    const saved = scoresByExam[examNum]
    if (saved?.id) {
      // Navigate straight to the full report page — no modal friction
      navigate(`/mock-test/${examNum}?attempt=${saved.id}`)
    } else {
      // No attempt yet — show the "no attempt" prompt
      setScoreModal({ examNumber: examNum, session: null })
    }
  }

  const handleReviewAttempt = (examNum, sessionId) => {
    if (!sessionId) return
    setScoreModal(null)
    navigate(`/mock-test/${examNum}?attempt=${sessionId}`)
  }

  const handleReattempt = async (examNum) => {
    if (!user) { setAuthReason('start a mock exam'); setAuthOpen(true); return }
    if (!isPremium) { setScoreModal(null); navigate('/pricing'); return }
    try {
      await supabase
        .from('test_sessions')
        .delete()
        .eq('kind', 'mock')
        .eq('exam_number', examNum)
        .eq('is_completed', false)
    } catch { /* non-fatal */ }
    setScoreModal(null)
    navigate(`/mock-test/${examNum}`)
  }

  return (
    <div className="page-wrap">
      <SEO
        title="CELPIP Mock Exams – Full Practice Tests"
        description="Take full-length CELPIP mock exams with timed Listening, Reading, Writing and Speaking sections. Instant scoring and feedback included."
        canonical="/exam"
      />
      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} reason={authReason} />

      {/* ── Hero ── */}
      <section className="ep-hero">
        <div className="ep-hero-inner">
          <motion.span
            className="ep-hero-badge"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span aria-hidden="true">🍁</span> Full-Length Practice
          </motion.span>
          <motion.h1
            className="ep-hero-title"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            CELPIP Mock Exams
          </motion.h1>
          <motion.p
            className="ep-hero-sub"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            Simulate the real exam with timed sections, real question format, and instant scoring.
          </motion.p>
          <motion.div
            className="ep-feature-pills"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            {[
              { icon: '⏱', label: 'Timed Sections' },
              { icon: '📋', label: 'Real Format' },
              { icon: '⚡', label: 'Instant Scoring' },
              { icon: '📊', label: 'CLB Report' },
            ].map(p => (
              <span key={p.label} className="ep-pill">
                <span className="ep-pill-icon" aria-hidden="true">{p.icon}</span> {p.label}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      <div className="ep-body">

        {/* ── Stats strip ── */}
        <div className="ep-stats-strip">
          {[
            { val: PRODUCT_STATS.mockExams, label: 'Mock Exams' },
            { val: '86', label: 'Items / Exam' },
            { val: '4', label: 'Sections' },
            { val: '~3h', label: 'Per Exam' },
          ].map(s => (
            <div key={s.label} className="ep-stats-item">
              <span className="ep-stats-val">{s.val}</span>
              <span className="ep-stats-label">{s.label}</span>
            </div>
          ))}
        </div>

        {/* ── Exam list ── */}
        <div className="ep-exam-heading">
          <span>Choose a mock exam</span>
          <small>Timed sections, score report, and saved attempts.</small>
        </div>
        <div className="ep-exam-list">
          <div className="ep-list-header">
            <span className="ep-list-header-name">Exam</span>
            <span className="ep-list-header-sections">Sections</span>
            <span className="ep-list-header-action" />
          </div>
          {EXAMS.map((exam, i) => {
            const unlocked   = isPremium
            const hasAttempt = !!scoresByExam[exam.num]
            return (
              <motion.div
                key={exam.num}
                className="ep-exam-row"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: i * 0.04 }}
              >
                <div className="ep-exam-row-left">
                  <span className="ep-exam-num">{exam.num}</span>
                  <div className="ep-exam-info">
                    <span className="ep-exam-name">Mock Exam {exam.num}</span>
                    {hasAttempt && <span className="ep-exam-status-tag" style={{ background: '#ECFDF5', color: '#15803D' }}>Completed</span>}
                  </div>
                </div>
                <div className="ep-exam-sections">
                  {exam.sections.map(s => (
                    <span key={s.id} className="ep-exam-section-chip">{s.icon}</span>
                  ))}
                </div>
                <div className="ep-exam-row-right" style={{ display: 'flex', gap: 8 }}>
                  {unlocked ? (
                    <button
                      className="ep-exam-start-btn"
                      onClick={() => navigate(`/mock-test/${exam.num}`)}
                    >
                      Start
                    </button>
                  ) : (
                    <button
                      className="ep-exam-lock-btn"
                      onClick={() => navigate('/pricing')}
                    >
                      🔒 Upgrade
                    </button>
                  )}
                  <button
                    className="ep-exam-score-btn"
                    onClick={() => handleScoreClick(exam.num)}
                    style={{
                      padding: '8px 14px',
                      border: '1px solid #E5E7EB',
                      background: '#fff',
                      color: '#0F1F3D',
                      borderRadius: 8,
                      fontWeight: 700,
                      fontSize: 13,
                      cursor: 'pointer',
                    }}
                  >
                    Score
                  </button>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* ── Upgrade banner ── */}
        {!isPremium && (
          <div className="ep-unlock-banner">
            <div className="ep-unlock-badge">⭐ Premium</div>
            <div className="ep-unlock-left">
              <div className="ep-unlock-title">Get full access to all 8 Mock Exams</div>
              <div className="ep-unlock-sub">
                Unlimited instant scoring · Timed sections · CLB-level reports · Writing & Speaking feedback
              </div>
            </div>
            <button className="ep-unlock-btn" onClick={() => navigate('/pricing')}>
              Upgrade Now →
            </button>
          </div>
        )}

        {/* ── Score modal ── */}
        <AnimatePresence>
          {scoreModal && (
            <ScoreModal
              examNumber={scoreModal.examNumber}
              session={scoreModal.session}
              attempts={attemptsByExam[scoreModal.examNumber] || []}
              onClose={() => setScoreModal(null)}
              onReview={(sessionId) => handleReviewAttempt(scoreModal.examNumber, sessionId)}
              onRetake={() => handleReattempt(scoreModal.examNumber)}
              isPremium={isPremium}
              onUpgrade={() => { setScoreModal(null); navigate('/pricing') }}
            />
          )}
        </AnimatePresence>

        {/* ── Section quick links ── */}
        <div className="ep-sections-grid">
          {[
            { id: 'listening', icon: '🎧', label: 'Listening', desc: '6 parts · 120 sets', color: '#4A90D9', bg: '#EEF4FF' },
            { id: 'reading',   icon: '📖', label: 'Reading',   desc: '4 parts · 46 sets',  color: '#2D8A56', bg: '#F0FDF4' },
            { id: 'writing',   icon: '✍️', label: 'Writing',   desc: '2 tasks · instant scoring',color: '#C8972A', bg: '#FFFBEB' },
            { id: 'speaking',  icon: '🎙️', label: 'Speaking',  desc: '8 tasks · practice',  color: '#C8102E', bg: '#FEF2F2' },
          ].map(s => (
            <button key={s.id} className="ep-section-card" onClick={() => navigate('/' + s.id)}>
              <span className="ep-section-icon" style={{ background: s.bg, color: s.color }}>{s.icon}</span>
              <div>
                <span className="ep-section-label">{s.label}</span>
                <span className="ep-section-desc">{s.desc}</span>
              </div>
            </button>
          ))}
        </div>

      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   Score modal — shows last completed mock attempt for a given exam
═══════════════════════════════════════════════════════════════ */
function ScoreModal({ examNumber, session, attempts = [], onClose, onReview, onRetake, isPremium, onUpgrade }) {
  const attemptList = attempts.length ? attempts : (session ? [session] : [])
  const [selectedAttemptId, setSelectedAttemptId] = useState(attemptList[0]?.id || null)
  const activeSession = attemptList.find(attempt => attempt.id === selectedAttemptId) || session
  const scores = activeSession?.scores || {}
  const completedAt = activeSession?.completed_at || activeSession?.updated_at
  const { sections, overallBand } = summarizeMockScores(scores)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(15,31,61,0.55)',
        zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16, backdropFilter: 'blur(2px)',
      }}
    >
      <motion.div
        initial={{ y: 24, opacity: 0, scale: 0.96 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 12, opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.22 }}
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: 18, width: '100%', maxWidth: 640,
          maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 30px 60px -20px rgba(15,31,61,0.4)',
          padding: 28,
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: 1.4, color: '#6B7280', textTransform: 'uppercase' }}>
              Mock Exam {examNumber}
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#0F1F3D', marginTop: 4 }}>
              Your last attempt
            </div>
            {completedAt && (
              <div style={{ fontSize: 12, color: '#6B7280', marginTop: 4 }}>
                Completed {new Date(completedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            style={{
              border: 'none', background: '#F3F4F6', width: 32, height: 32,
              borderRadius: 8, cursor: 'pointer', fontSize: 18, color: '#6B7280',
            }}
            aria-label="Close"
          >×</button>
        </div>

        {!activeSession ? (
          /* No attempt */
          <div style={{
            padding: '40px 20px', textAlign: 'center',
            background: '#F9FAFB', borderRadius: 14, border: '1px dashed #D1D5DB',
          }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#0F1F3D', marginBottom: 6 }}>
              No attempt has been made yet
            </div>
            <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 20 }}>
              Take Mock Exam {examNumber} to see your CELPIP band and section breakdown here.
            </div>
            {isPremium ? (
              <button
                onClick={onRetake}
                style={{
                  padding: '10px 22px', background: '#C8102E', color: '#fff',
                  border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: 'pointer',
                }}
              >Start Mock {examNumber} →</button>
            ) : (
              <button
                onClick={onUpgrade}
                style={{
                  padding: '10px 22px', background: '#C8102E', color: '#fff',
                  border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: 'pointer',
                }}
              >Upgrade to Premium</button>
            )}
          </div>
        ) : (
          <>
            {attemptList.length > 1 && (
              <div style={{ display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 16, paddingBottom: 2 }}>
                {attemptList.map((attempt, index) => (
                  <button
                    key={attempt.id}
                    type="button"
                    onClick={() => setSelectedAttemptId(attempt.id)}
                    style={{
                      flex: '0 0 auto', padding: '8px 12px', borderRadius: 999,
                      border: attempt.id === activeSession.id ? '1px solid #C8102E' : '1px solid #E5E7EB',
                      background: attempt.id === activeSession.id ? '#FEF2F2' : '#fff',
                      color: attempt.id === activeSession.id ? '#C8102E' : '#374151',
                      fontSize: 12, fontWeight: 800, cursor: 'pointer',
                    }}
                  >
                    Attempt {attemptList.length - index}
                  </button>
                ))}
              </div>
            )}

            {/* Overall band */}
            {overallBand && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 16, padding: 18,
                background: `linear-gradient(135deg, ${overallBand.color}12, ${overallBand.color}05)`,
                border: `1px solid ${overallBand.color}33`, borderRadius: 14, marginBottom: 18,
              }}>
                <div style={{
                  minWidth: 90, padding: 12, borderRadius: 12, textAlign: 'center',
                  background: `linear-gradient(135deg, ${overallBand.color}, ${overallBand.color}dd)`, color: '#fff',
                }}>
                  <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: 1.3, opacity: 0.9 }}>OVERALL</div>
                  <div style={{ fontSize: 32, fontWeight: 900, lineHeight: 1.05 }}>{overallBand.level}</div>
                  <div style={{ fontSize: 9, fontWeight: 700, opacity: 0.9 }}>CELPIP</div>
                </div>
                <div style={{ flex: 1, fontSize: 13, color: '#374151', lineHeight: 1.5 }}>
                  Your saved report includes Listening, Reading, Writing, and Speaking bands when each section was completed and submitted for evaluation.
                </div>
              </div>
            )}

            {/* Per-section grid */}
            <div style={{ display: 'grid', gap: 10, marginBottom: 20 }}>
              {sections.map(s => {
                const meta = SECTION_META[s.section]
                return (
                  <div key={s.section} style={{
                    display: 'flex', alignItems: 'center', gap: 14, padding: 14,
                    border: '1px solid #E5E7EB', borderRadius: 12,
                    borderLeft: `4px solid ${meta.color}`,
                  }}>
                    <span style={{ fontSize: 20 }}>{meta.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#0F1F3D' }}>{meta.label}</div>
                      <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>
                        {s.objective
                          ? (s.hasData ? `${s.correct}/${s.total} correct` : 'Not attempted')
                          : (s.band != null
                              ? `Real-time scored — average ${formatBandScore(s.band)}`
                              : (s.hasData ? 'Submitted — no scoring yet' : 'Not submitted'))
                        }
                      </div>
                    </div>
                    {s.objective && s.band && s.hasData && (
                      <div style={{
                        padding: '6px 12px', borderRadius: 999,
                        background: `${s.band.color}15`, color: s.band.color,
                        fontSize: 12, fontWeight: 800,
                      }}>
                        CELPIP {s.band.level}
                      </div>
                    )}
                    {!s.objective && s.band != null && (
                      <div style={{
                        padding: '6px 12px', borderRadius: 999,
                        background: `${meta.color}15`, color: meta.color,
                        fontSize: 12, fontWeight: 800,
                      }}>
                        {formatBandScore(s.band)}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                onClick={onClose}
                style={{
                  padding: '10px 18px', background: '#fff', color: '#0F1F3D',
                  border: '1px solid #E5E7EB', borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: 'pointer',
                }}
              >Close</button>
              <button
                onClick={() => onReview?.(activeSession.id)}
                style={{
                  padding: '10px 18px', background: '#0F1F3D', color: '#fff',
                  border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: 'pointer',
                }}
              >Review Report</button>
              <button
                onClick={onRetake}
                style={{
                  padding: '10px 18px', background: '#C8102E', color: '#fff',
                  border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: 'pointer',
                }}
              >Re-attempt Mock {examNumber} →</button>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  )
}
