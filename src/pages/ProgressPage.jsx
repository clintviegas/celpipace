import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  fetchProgressHistory,
  TRACKED_SECTIONS,
  SECTION_STYLE,
} from '../lib/progressHistory'
import LineChart from '../components/LineChart'
import SEO from '../components/SEO'

const RANGES = [
  { key: '30', label: '30 days', days: 30 },
  { key: '90', label: '90 days', days: 90 },
  { key: 'all', label: 'All time', days: null },
]

function withinRange(dateStr, days) {
  if (days == null) return true
  const cutoff = Date.now() - days * 86400000
  return new Date(dateStr).getTime() >= cutoff
}

export default function ProgressPage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [loading, setLoading] = useState(true)
  const [history, setHistory] = useState(null)
  const [range, setRange] = useState('90')
  const [visible, setVisible] = useState(() => new Set(TRACKED_SECTIONS))

  useEffect(() => {
    if (!user?.id) { setLoading(false); return }
    let cancelled = false
    setLoading(true)
    fetchProgressHistory()
      .then(h => { if (!cancelled) setHistory(h) })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [user?.id])

  const days = RANGES.find(r => r.key === range)?.days ?? null

  const series = useMemo(() => {
    if (!history) return []
    return TRACKED_SECTIONS
      .filter(sec => visible.has(sec))
      .map(sec => ({
        key: sec,
        label: SECTION_STYLE[sec].label,
        color: SECTION_STYLE[sec].color,
        points: (history.daily[sec] || []).filter(p => withinRange(p.date, days)),
      }))
  }, [history, visible, days])

  const overallSeries = useMemo(() => {
    if (!history) return []
    return [{
      key: 'overall',
      label: 'Overall',
      color: '#0f172a',
      points: (history.overallDaily || []).filter(p => withinRange(p.date, days)),
    }]
  }, [history, days])

  const totalAttempts = history?.attempts?.length || 0

  const toggle = (sec) => {
    setVisible(prev => {
      const next = new Set(prev)
      if (next.has(sec)) { if (next.size > 1) next.delete(sec) }
      else next.add(sec)
      return next
    })
  }

  /* ── signed-out ── */
  if (!user?.id && !loading) {
    return (
      <main style={styles.page}>
        <SEO title="Your Progress Over Time — CELPIPACE" description="Track your CELPIP CLB band progress over time across Listening, Reading, Writing and Speaking." />
        <div style={styles.cardCenter}>
          <div style={styles.bigIcon}>📈</div>
          <h1 style={styles.h1}>Your Progress Over Time</h1>
          <p style={styles.muted}>Sign in to see how your CLB band is trending across every section, with charts built from your practice history.</p>
          <button style={styles.primaryBtn} onClick={() => navigate('/dashboard')}>Go to Dashboard</button>
        </div>
      </main>
    )
  }

  if (loading) {
    return <main style={styles.page}><div style={styles.cardCenter}><p style={styles.muted}>Loading your progress…</p></div></main>
  }

  /* ── empty ── */
  if (totalAttempts === 0) {
    return (
      <main style={styles.page}>
        <SEO title="Your Progress Over Time — CELPIPACE" description="Track your CELPIP CLB band progress over time." />
        <div style={styles.cardCenter}>
          <div style={styles.bigIcon}>📊</div>
          <h1 style={styles.h1}>No progress to chart yet</h1>
          <p style={styles.muted}>Complete a few practice sets and your CLB trend will appear here — section by section and overall.</p>
          <button style={styles.primaryBtn} onClick={() => navigate('/celpip-listening-practice')}>Start practising</button>
        </div>
      </main>
    )
  }

  return (
    <main style={styles.page}>
      <SEO title="Your Progress Over Time — CELPIPACE" description="Track your CELPIP CLB band progress over time across Listening, Reading, Writing and Speaking." />
      <div style={styles.wrap}>
        <div style={styles.headerCard}>
          <div style={styles.headerTop}>
            <div>
              <h1 style={styles.h1Left}>Progress Over Time</h1>
              <p style={styles.headerSub}>{totalAttempts} practice attempt{totalAttempts === 1 ? '' : 's'} tracked · CLB band trend</p>
            </div>
            <div style={styles.rangeRow}>
              {RANGES.map(r => (
                <button
                  key={r.key}
                  onClick={() => setRange(r.key)}
                  style={{ ...styles.rangeBtn, ...(range === r.key ? styles.rangeBtnActive : {}) }}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* per-section summary tiles */}
          <div style={styles.summaryGrid}>
            {TRACKED_SECTIONS.map(sec => {
              const s = history.summary[sec]
              const st = SECTION_STYLE[sec]
              return (
                <div key={sec} style={styles.sumTile}>
                  <div style={styles.sumTop}>
                    <span style={styles.sumIcon}>{st.icon}</span>
                    <span style={styles.sumLabel}>{st.label}</span>
                  </div>
                  {s.attempts > 0 ? (
                    <>
                      <div style={{ ...styles.sumValue, color: st.color }}>CLB {s.latestCLB}</div>
                      <div style={styles.sumMeta}>
                        <TrendBadge trend={s.trend} />
                        <span style={styles.sumBest}>best {s.bestCLB}</span>
                      </div>
                    </>
                  ) : (
                    <div style={styles.sumEmpty}>No data</div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* overall trend */}
        <div style={styles.chartCard}>
          <h2 style={styles.chartTitle}>Overall CLB trend</h2>
          <LineChart series={overallSeries} yMin={0} yMax={12} height={200} />
        </div>

        {/* per-section trend with toggles */}
        <div style={styles.chartCard}>
          <div style={styles.chartHead}>
            <h2 style={styles.chartTitle}>By section</h2>
            <div style={styles.legendRow}>
              {TRACKED_SECTIONS.map(sec => {
                const st = SECTION_STYLE[sec]
                const on = visible.has(sec)
                return (
                  <button
                    key={sec}
                    onClick={() => toggle(sec)}
                    style={{ ...styles.legendChip, opacity: on ? 1 : 0.4, borderColor: on ? st.color : '#E2E8F0' }}
                  >
                    <span style={{ ...styles.legendDot, background: st.color }} />
                    {st.label}
                  </button>
                )
              })}
            </div>
          </div>
          <LineChart series={series} yMin={0} yMax={12} height={240} />
        </div>

        {/* activity volume (last 30 days) */}
        <div style={styles.chartCard}>
          <h2 style={styles.chartTitle}>Practice activity (last 30 days)</h2>
          <VolumeStrip data={history.volume} />
        </div>
      </div>
    </main>
  )
}

function TrendBadge({ trend }) {
  if (!trend || trend === 0) return <span style={{ ...styles.trend, color: '#94a3b8' }}>— steady</span>
  const up = trend > 0
  return (
    <span style={{ ...styles.trend, color: up ? '#2D8A56' : '#C8102E' }}>
      {up ? '▲' : '▼'} {Math.abs(trend)}
    </span>
  )
}

function VolumeStrip({ data }) {
  const max = Math.max(1, ...data.map(d => d.count))
  return (
    <div style={styles.volWrap}>
      {data.map((d, i) => {
        const h = Math.round((d.count / max) * 56)
        return (
          <div key={i} style={styles.volCol} title={`${new Date(d.date).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })}: ${d.count} attempt${d.count === 1 ? '' : 's'}`}>
            <div style={{ ...styles.volBar, height: Math.max(2, h), background: d.count > 0 ? '#4A90D9' : '#EEF2F7' }} />
          </div>
        )
      })}
    </div>
  )
}

const styles = {
  page: { minHeight: '70vh', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '32px 16px 80px', background: '#F8FAFC' },
  wrap: { width: '100%', maxWidth: 720 },
  cardCenter: { width: '100%', maxWidth: 540, margin: '0 auto', background: '#fff', borderRadius: 18, padding: '40px 32px', boxShadow: '0 4px 24px rgba(15,23,42,0.06)', textAlign: 'center' },
  bigIcon: { fontSize: 46, marginBottom: 8 },
  h1: { fontSize: 24, fontWeight: 700, color: '#0f172a', margin: '8px 0 12px' },
  h1Left: { fontSize: 22, fontWeight: 700, color: '#0f172a', margin: 0 },
  muted: { fontSize: 15, lineHeight: 1.6, color: '#64748b', margin: '0 0 20px' },
  primaryBtn: { background: '#0f172a', color: '#fff', border: 'none', borderRadius: 10, padding: '12px 22px', fontSize: 14, fontWeight: 600, cursor: 'pointer' },

  headerCard: { background: '#fff', borderRadius: 18, padding: '22px 22px 20px', boxShadow: '0 4px 24px rgba(15,23,42,0.06)', marginBottom: 16 },
  headerTop: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 18 },
  headerSub: { fontSize: 13.5, color: '#64748b', margin: '6px 0 0' },
  rangeRow: { display: 'flex', gap: 6 },
  rangeBtn: { background: '#fff', border: '1.5px solid #E2E8F0', borderRadius: 8, padding: '7px 12px', fontSize: 13, fontWeight: 600, color: '#475569', cursor: 'pointer' },
  rangeBtnActive: { background: '#0f172a', borderColor: '#0f172a', color: '#fff' },

  summaryGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 10 },
  sumTile: { background: '#F8FAFC', border: '1px solid #EEF2F7', borderRadius: 12, padding: '12px 14px' },
  sumTop: { display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6 },
  sumIcon: { fontSize: 16 },
  sumLabel: { fontSize: 12.5, fontWeight: 600, color: '#475569' },
  sumValue: { fontSize: 20, fontWeight: 800 },
  sumMeta: { display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 },
  sumBest: { fontSize: 11.5, color: '#94a3b8' },
  sumEmpty: { fontSize: 13, color: '#cbd5e1', fontWeight: 600, marginTop: 6 },
  trend: { fontSize: 12, fontWeight: 700 },

  chartCard: { background: '#fff', borderRadius: 16, padding: '20px 20px 14px', boxShadow: '0 2px 12px rgba(15,23,42,0.05)', marginBottom: 14 },
  chartHead: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 6 },
  chartTitle: { fontSize: 15, fontWeight: 700, color: '#0f172a', margin: '0 0 8px' },
  legendRow: { display: 'flex', flexWrap: 'wrap', gap: 7 },
  legendChip: { display: 'inline-flex', alignItems: 'center', gap: 6, background: '#fff', border: '1.5px solid', borderRadius: 99, padding: '5px 11px', fontSize: 12.5, fontWeight: 600, color: '#475569', cursor: 'pointer' },
  legendDot: { width: 9, height: 9, borderRadius: 99, display: 'inline-block' },

  volWrap: { display: 'flex', alignItems: 'flex-end', gap: 3, height: 64, padding: '8px 0 0' },
  volCol: { flex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' },
  volBar: { width: '70%', borderRadius: 3, transition: 'height .3s ease' },
}
