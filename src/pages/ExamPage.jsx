import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import AuthModal from '../components/AuthModal'
import SEO from '../components/SEO'

/* CELPIP band derivation — mirrors MockTestPage.getCelpipLevel */
function examCelpip(correct, total) {
  const raw = total === 38 ? correct : Math.round((correct / Math.max(total, 1)) * 38)
  if (raw >= 37) return { level: 12, color: '#166534' }
  if (raw >= 35) return { level: 11, color: '#166534' }
  if (raw >= 33) return { level: 10, color: '#15803D' }
  if (raw >= 31) return { level: 9,  color: '#16A34A' }
  if (raw >= 28) return { level: 8,  color: '#2D8A56' }
  if (raw >= 25) return { level: 7,  color: '#4A90D9' }
  if (raw >= 21) return { level: 6,  color: '#4A90D9' }
  if (raw >= 17) return { level: 5,  color: '#C8972A' }
  if (raw >= 13) return { level: 4,  color: '#C8972A' }
  if (raw >= 9)  return { level: 3,  color: '#D97706' }
  if (raw >= 5)  return { level: 2,  color: '#DC2626' }
  if (raw >= 1)  return { level: 1,  color: '#C8102E' }
  return            { level: 'M', color: '#991B1B' }
}

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
  const { user, isPremium } = useAuth()
  const [authOpen, setAuthOpen] = useState(false)
  const [authReason, setAuthReason] = useState('')
  const [scoreModal, setScoreModal] = useState(null)   // { examNumber, session | null }
  const [scoresByExam, setScoresByExam] = useState({}) // { [examNumber]: session row | null }

  // Pull the most recent completed mock attempt per exam number for this user
  useEffect(() => {
    if (!user?.id) { setScoresByExam({}); return }
    let cancelled = false
    ;(async () => {
      try {
        const { data, error } = await supabase
          .from('test_sessions')
          .select('id, exam_number, scores, completed_at, updated_at')
          .eq('kind', 'mock')
          .eq('is_completed', true)
          .order('completed_at', { ascending: false })
        if (error) throw error
        if (cancelled) return
        const map = {}
        for (const row of data || []) {
          if (row.exam_number != null && !map[row.exam_number]) map[row.exam_number] = row
        }
        setScoresByExam(map)
      } catch (e) {
        if (!cancelled) setScoresByExam({})
      }
    })()
    return () => { cancelled = true }
  }, [user?.id])

  const handleScoreClick = (examNum) => {
    if (!user) { setAuthReason('view your mock exam scores'); setAuthOpen(true); return }
    setScoreModal({ examNumber: examNum, session: scoresByExam[examNum] || null })
  }

  return (
    <div className="page-wrap">
      <SEO
        title="CELPIP Mock Exams – Full Practice Tests"
        description="Take full-length CELPIP mock exams with timed Listening, Reading, Writing and Speaking sections. Instant scoring and feedback included."
        canonical="/exam"
        noindex={true}
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
            🍁 Full-Length Practice
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
                <span className="ep-pill-icon">{p.icon}</span> {p.label}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      <div className="ep-body">

        {/* ── Stats strip ── */}
        <div className="ep-stats-strip">
          {[
            { val: '8', label: 'Mock Exams' },
            { val: '344', label: 'Questions' },
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
              onClose={() => setScoreModal(null)}
              onRetake={() => { setScoreModal(null); navigate(`/mock-test/${scoreModal.examNumber}`) }}
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
function ScoreModal({ examNumber, session, onClose, onRetake, isPremium, onUpgrade }) {
  const scores = session?.scores || {}
  const completedAt = session?.completed_at || session?.updated_at

  // Build per-section summary identical to FinalResults logic
  const sections = ['listening', 'reading', 'writing', 'speaking'].map(secId => {
    const meta = SECTION_META[secId]
    let correct = 0, total = 0, hasData = false
    if (meta.objective) {
      meta.parts.forEach(p => {
        const s = scores[p]
        if (s && typeof s.correct === 'number' && typeof s.total === 'number') {
          correct += s.correct; total += s.total; hasData = true
        }
      })
    } else {
      // writing/speaking — check whether AI bands exist
      meta.parts.forEach(p => {
        const s = scores[p]
        if (s && (s.aiResult || s.text || s.transcript)) hasData = true
      })
    }
    const pct = total > 0 ? Math.round((correct / total) * 100) : 0
    const band = meta.objective ? examCelpip(correct, total) : null
    return { id: secId, ...meta, correct, total, pct, band, hasData }
  })

  const objSections = sections.filter(s => s.objective)
  const overallCorrect = objSections.reduce((a, s) => a + s.correct, 0)
  const overallTotal   = objSections.reduce((a, s) => a + s.total, 0)
  const overallBand    = overallTotal > 0 ? examCelpip(overallCorrect, overallTotal) : null

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

        {!session ? (
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
                  {overallCorrect}/{overallTotal} across listening &amp; reading.
                  Writing &amp; Speaking are AI-scored separately.
                </div>
              </div>
            )}

            {/* Per-section grid */}
            <div style={{ display: 'grid', gap: 10, marginBottom: 20 }}>
              {sections.map(s => (
                <div key={s.id} style={{
                  display: 'flex', alignItems: 'center', gap: 14, padding: 14,
                  border: '1px solid #E5E7EB', borderRadius: 12,
                  borderLeft: `4px solid ${s.color}`,
                }}>
                  <span style={{ fontSize: 20 }}>{s.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#0F1F3D' }}>{s.label}</div>
                    <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>
                      {s.objective
                        ? (s.hasData ? `${s.correct}/${s.total} correct` : 'Not attempted')
                        : (s.hasData ? 'Submitted — see attempt for AI feedback' : 'Not submitted')
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
                </div>
              ))}
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
                onClick={onRetake}
                style={{
                  padding: '10px 18px', background: '#C8102E', color: '#fff',
                  border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: 'pointer',
                }}
              >Retake Mock {examNumber} →</button>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  )
}
