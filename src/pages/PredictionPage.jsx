import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  fetchBandPrediction,
  readinessFor,
  confidenceLabel,
  TRACKED_SECTIONS,
  SECTION_STYLE,
} from '../lib/bandPrediction'
import { loadPlanConfig, fetchPlanConfigCloud } from '../lib/studyPlan'
import SEO from '../components/SEO'

const TARGET_CHOICES = [7, 8, 9, 10, 11]
const SECTION_ROUTE = {
  listening: '/celpip-listening-practice',
  reading: '/celpip-reading-practice',
  writing: '/celpip-writing-practice',
  speaking: '/celpip-speaking-practice',
}

const STATE_STYLE = {
  ready: { color: '#2D8A56', bg: '#ECFDF3', label: 'On track' },
  close: { color: '#C8972A', bg: '#FEF9EC', label: 'Almost there' },
  below: { color: '#C8102E', bg: '#FEF2F2', label: 'Needs work' },
  unknown: { color: '#94a3b8', bg: '#F1F5F9', label: 'No data' },
}

export default function PredictionPage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [loading, setLoading] = useState(true)
  const [prediction, setPrediction] = useState(null)
  const [target, setTarget] = useState(9)

  useEffect(() => {
    if (!user?.id) { setLoading(false); return }
    let cancelled = false
    setLoading(true)
    ;(async () => {
      try {
        const pred = await fetchBandPrediction()
        if (!cancelled) setPrediction(pred)
        // seed target from the user's study plan, if any
        const cloud = await fetchPlanConfigCloud().catch(() => null)
        const cfg = cloud || loadPlanConfig(user.id)
        if (!cancelled && cfg?.targetCLB) setTarget(cfg.targetCLB)
      } catch { /* ignore */ }
      finally { if (!cancelled) setLoading(false) }
    })()
    return () => { cancelled = true }
  }, [user?.id])

  const readiness = useMemo(
    () => (prediction ? readinessFor(prediction, target) : null),
    [prediction, target]
  )

  const totalAttempts = prediction?.overall?.totalAttempts || 0

  /* ── signed-out ── */
  if (!user?.id && !loading) {
    return (
      <main style={styles.page}>
        <SEO title="Band Score Prediction — CELPIPACE" description="Estimate your likely CELPIP CLB band from your practice history, section by section." />
        <div style={styles.cardCenter}>
          <div style={styles.bigIcon}>🔮</div>
          <h1 style={styles.h1}>Band Score Prediction</h1>
          <p style={styles.muted}>Sign in to see your estimated CELPIP CLB band — built from your practice history and trend, section by section.</p>
          <button style={styles.primaryBtn} onClick={() => navigate('/dashboard')}>Go to Dashboard</button>
        </div>
      </main>
    )
  }

  if (loading) {
    return <main style={styles.page}><div style={styles.cardCenter}><p style={styles.muted}>Estimating your band…</p></div></main>
  }

  /* ── empty ── */
  if (totalAttempts === 0) {
    return (
      <main style={styles.page}>
        <SEO title="Band Score Prediction — CELPIPACE" description="Estimate your likely CELPIP CLB band from your practice history." />
        <div style={styles.cardCenter}>
          <div style={styles.bigIcon}>🔮</div>
          <h1 style={styles.h1}>Not enough practice yet</h1>
          <p style={styles.muted}>Complete a few practice sets in each section and we'll estimate the CLB band you're likely to score.</p>
          <button style={styles.primaryBtn} onClick={() => navigate('/celpip-listening-practice')}>Start practising</button>
        </div>
      </main>
    )
  }

  const o = prediction.overall

  return (
    <main style={styles.page}>
      <SEO title="Band Score Prediction — CELPIPACE" description="Estimate your likely CELPIP CLB band from your practice history, section by section, with an exam-readiness check." />
      <div style={styles.wrap}>

        {/* headline estimate */}
        <div style={styles.hero}>
          <div style={styles.heroTop}>
            <div>
              <div style={styles.heroKicker}>Predicted overall band</div>
              <div style={styles.heroBand}>CLB {o.predictedBand ?? '—'}</div>
              <div style={styles.heroSub}>
                Average across {o.sectionsCovered} section{o.sectionsCovered === 1 ? '' : 's'} · weakest link CLB {o.guaranteedCLB ?? '—'}
              </div>
            </div>
            <div style={styles.heroRing(readiness?.pct || 0)}>
              <div style={styles.heroRingInner}>
                <div style={styles.heroRingPct}>{readiness?.pct ?? 0}%</div>
                <div style={styles.heroRingLbl}>ready</div>
              </div>
            </div>
          </div>

          <div style={styles.targetRow}>
            <span style={styles.targetLbl}>Target band</span>
            <div style={styles.targetChips}>
              {TARGET_CHOICES.map(t => (
                <button
                  key={t}
                  onClick={() => setTarget(t)}
                  style={{ ...styles.targetChip, ...(target === t ? styles.targetChipOn : {}) }}
                >
                  CLB {t}
                </button>
              ))}
            </div>
          </div>

          <div style={{ ...styles.verdict, background: readiness?.allReady ? '#ECFDF3' : '#FEF9EC', color: readiness?.allReady ? '#1E6B40' : '#8A6516' }}>
            {readiness?.allReady
              ? `On current form, you're tracking at or above CLB ${target} in every section you've practised.`
              : `${readiness?.ready ?? 0} of ${readiness?.total ?? 0} practised sections are tracking at CLB ${target}. Focus where the gap is largest.`}
          </div>
        </div>

        {/* per-section predictions */}
        <div style={styles.sectionGrid}>
          {TRACKED_SECTIONS.map(sec => {
            const ps = prediction.perSection[sec]
            const st = SECTION_STYLE[sec]
            const rd = readiness?.sections[sec] || { state: 'unknown', gap: null }
            const ss = STATE_STYLE[rd.state]
            const hasData = ps.attempts > 0
            return (
              <div key={sec} style={styles.secCard}>
                <div style={styles.secHead}>
                  <span style={styles.secIcon}>{st.icon}</span>
                  <span style={styles.secLabel}>{st.label}</span>
                  <span style={{ ...styles.statePill, color: ss.color, background: ss.bg }}>{ss.label}</span>
                </div>

                {hasData ? (
                  <>
                    <div style={styles.secBandRow}>
                      <div>
                        <div style={{ ...styles.secBand, color: st.color }}>CLB {ps.predictedBand}</div>
                        <div style={styles.secBandSub}>predicted · {ps.predictedCLB} avg</div>
                      </div>
                      <Trend slope={ps.slopePerWeek} projected={ps.projectedCLB} />
                    </div>

                    <div style={styles.secMetaRow}>
                      <span style={styles.metaChip}>{ps.attempts} attempt{ps.attempts === 1 ? '' : 's'}</span>
                      <span style={styles.metaChip}>best CLB {ps.bestCLB}</span>
                      <span style={{ ...styles.metaChip, color: confColor(ps.confidence) }}>{confidenceLabel(ps.confidence)}</span>
                    </div>

                    {rd.gap != null && rd.gap > 0 && (
                      <div style={styles.gapNote}>
                        {rd.gap} band{rd.gap === 1 ? '' : 's'} below your CLB {target} target ·{' '}
                        <button style={styles.gapLink} onClick={() => navigate(SECTION_ROUTE[sec])}>Practise {st.label} →</button>
                      </div>
                    )}
                  </>
                ) : (
                  <div style={styles.secEmpty}>
                    No attempts yet ·{' '}
                    <button style={styles.gapLink} onClick={() => navigate(SECTION_ROUTE[sec])}>Try {st.label} →</button>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <p style={styles.disclaimer}>
          This is an estimate based on your practice scores, weighted toward recent attempts — not an official CELPIP result.
          The more you practise, the more accurate it gets.{' '}
          <button style={styles.inlineLink} onClick={() => navigate('/progress')}>See your full progress →</button>
        </p>
      </div>
    </main>
  )
}

function Trend({ slope, projected }) {
  const flat = !slope || slope === 0
  const up = slope > 0
  const color = flat ? '#94a3b8' : up ? '#2D8A56' : '#C8102E'
  return (
    <div style={{ ...styles.trendBox, color }}>
      <div style={styles.trendArrow}>{flat ? '→' : up ? '▲' : '▼'}</div>
      <div style={styles.trendVal}>{flat ? 'steady' : `${up ? '+' : ''}${slope}/wk`}</div>
      {!flat && <div style={styles.trendProj}>~CLB {projected} in 4 wks</div>}
    </div>
  )
}

function confColor(level) {
  if (level === 'high') return '#2D8A56'
  if (level === 'medium') return '#C8972A'
  return '#94a3b8'
}

const styles = {
  page: { minHeight: '70vh', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '32px 16px 80px', background: '#F8FAFC' },
  wrap: { width: '100%', maxWidth: 720 },
  cardCenter: { width: '100%', maxWidth: 540, margin: '0 auto', background: '#fff', borderRadius: 18, padding: '40px 32px', boxShadow: '0 4px 24px rgba(15,23,42,0.06)', textAlign: 'center' },
  bigIcon: { fontSize: 46, marginBottom: 8 },
  h1: { fontSize: 24, fontWeight: 700, color: '#0f172a', margin: '8px 0 12px' },
  muted: { fontSize: 15, lineHeight: 1.6, color: '#64748b', margin: '0 0 20px' },
  primaryBtn: { background: '#0f172a', color: '#fff', border: 'none', borderRadius: 10, padding: '12px 22px', fontSize: 14, fontWeight: 600, cursor: 'pointer' },

  hero: { background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', borderRadius: 20, padding: '24px 24px 22px', color: '#fff', boxShadow: '0 8px 30px rgba(15,23,42,0.18)', marginBottom: 16 },
  heroTop: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 18 },
  heroKicker: { fontSize: 12.5, fontWeight: 600, letterSpacing: 0.4, textTransform: 'uppercase', color: '#94a3b8' },
  heroBand: { fontSize: 42, fontWeight: 800, lineHeight: 1.05, margin: '4px 0 4px' },
  heroSub: { fontSize: 13, color: '#cbd5e1' },
  heroRing: (pct) => ({
    width: 92, height: 92, borderRadius: '50%', flexShrink: 0,
    background: `conic-gradient(#34d399 ${pct * 3.6}deg, rgba(255,255,255,0.14) 0deg)`,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  }),
  heroRingInner: { width: 72, height: 72, borderRadius: '50%', background: '#0f172a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
  heroRingPct: { fontSize: 20, fontWeight: 800 },
  heroRingLbl: { fontSize: 10.5, color: '#94a3b8', marginTop: -2 },

  targetRow: { display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 14 },
  targetLbl: { fontSize: 13, fontWeight: 600, color: '#cbd5e1' },
  targetChips: { display: 'flex', gap: 6, flexWrap: 'wrap' },
  targetChip: { background: 'rgba(255,255,255,0.08)', border: '1.5px solid rgba(255,255,255,0.18)', borderRadius: 8, padding: '6px 11px', fontSize: 12.5, fontWeight: 600, color: '#e2e8f0', cursor: 'pointer' },
  targetChipOn: { background: '#34d399', borderColor: '#34d399', color: '#06281c' },

  verdict: { borderRadius: 12, padding: '11px 14px', fontSize: 13.5, fontWeight: 600, lineHeight: 1.5 },

  sectionGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14, marginBottom: 18 },
  secCard: { background: '#fff', borderRadius: 16, padding: '16px 18px', boxShadow: '0 2px 12px rgba(15,23,42,0.05)' },
  secHead: { display: 'flex', alignItems: 'center', gap: 9, marginBottom: 12 },
  secIcon: { fontSize: 18 },
  secLabel: { fontSize: 14.5, fontWeight: 700, color: '#0f172a', flex: 1 },
  statePill: { fontSize: 11, fontWeight: 700, borderRadius: 99, padding: '3px 9px' },

  secBandRow: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 12 },
  secBand: { fontSize: 26, fontWeight: 800, lineHeight: 1 },
  secBandSub: { fontSize: 12, color: '#94a3b8', marginTop: 3 },

  trendBox: { textAlign: 'right' },
  trendArrow: { fontSize: 16, fontWeight: 800, lineHeight: 1 },
  trendVal: { fontSize: 12.5, fontWeight: 700, marginTop: 1 },
  trendProj: { fontSize: 11, color: '#94a3b8', marginTop: 1 },

  secMetaRow: { display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 4 },
  metaChip: { fontSize: 11.5, fontWeight: 600, color: '#64748b', background: '#F1F5F9', borderRadius: 7, padding: '3px 8px' },

  gapNote: { marginTop: 10, fontSize: 12.5, color: '#64748b', lineHeight: 1.5 },
  gapLink: { background: 'none', border: 'none', padding: 0, color: '#4A90D9', fontWeight: 700, fontSize: 12.5, cursor: 'pointer' },
  secEmpty: { fontSize: 13, color: '#94a3b8', fontWeight: 500 },

  disclaimer: { fontSize: 12.5, color: '#94a3b8', lineHeight: 1.6, textAlign: 'center', margin: '4px auto 0', maxWidth: 560 },
  inlineLink: { background: 'none', border: 'none', padding: 0, color: '#4A90D9', fontWeight: 700, fontSize: 12.5, cursor: 'pointer' },
}
