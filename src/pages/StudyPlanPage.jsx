import { useEffect, useMemo, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useProgress } from '../hooks/useProgress'
import {
  PLAN_SECTIONS,
  loadPlanConfig,
  savePlanConfigLocal,
  savePlanConfigCloud,
  fetchPlanConfigCloud,
  clearPlanConfigLocal,
  deletePlanConfigCloud,
  generatePlan,
  planVersion,
  loadDoneTasks,
  saveDoneTasks,
  daysUntil,
} from '../lib/studyPlan'
import SEO from '../components/SEO'

const SECTION_BY_KEY = Object.fromEntries(PLAN_SECTIONS.map(s => [s.key, s]))

function minDateStr() {
  const d = new Date(); d.setDate(d.getDate() + 1)
  return d.toISOString().slice(0, 10)
}
function defaultDateStr() {
  const d = new Date(); d.setDate(d.getDate() + 42) // ~6 weeks out
  return d.toISOString().slice(0, 10)
}

export default function StudyPlanPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { stats } = useProgress()

  const [config, setConfig] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [done, setDone] = useState({})

  // form state
  const [targetDate, setTargetDate] = useState(defaultDateStr())
  const [targetCLB, setTargetCLB] = useState(9)
  const [daysPerWeek, setDaysPerWeek] = useState(5)

  /* ── load config (cloud → local fallback) ── */
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      const local = loadPlanConfig(user?.id || null)
      let cfg = local
      if (user?.id) {
        const cloud = await fetchPlanConfigCloud()
        if (cloud) { cfg = cloud; savePlanConfigLocal(user.id, cloud) }
      }
      if (cancelled) return
      setConfig(cfg)
      if (cfg) {
        setTargetDate(cfg.targetDate)
        setTargetCLB(cfg.targetCLB)
        setDaysPerWeek(cfg.daysPerWeek)
        setDone(loadDoneTasks(user?.id || null, planVersion(cfg)))
      } else {
        setEditing(true)
      }
      setLoading(false)
    })()
    return () => { cancelled = true }
  }, [user?.id])

  const plan = useMemo(
    () => (config ? generatePlan(config, stats.sections || {}) : null),
    [config, stats.sections]
  )

  const handleSave = useCallback(async () => {
    const next = {
      targetDate,
      targetCLB: Number(targetCLB),
      daysPerWeek: Number(daysPerWeek),
      createdAt: config?.createdAt || new Date().toISOString(),
    }
    setConfig(next)
    setEditing(false)
    savePlanConfigLocal(user?.id || null, next)
    setDone(loadDoneTasks(user?.id || null, planVersion(next)))
    if (user?.id) await savePlanConfigCloud(next)
  }, [targetDate, targetCLB, daysPerWeek, config, user?.id])

  const handleReset = useCallback(async () => {
    clearPlanConfigLocal(user?.id || null)
    setConfig(null)
    setDone({})
    setEditing(true)
    setTargetDate(defaultDateStr())
    setTargetCLB(9)
    setDaysPerWeek(5)
    if (user?.id) await deletePlanConfigCloud()
  }, [user?.id])

  const toggleTask = useCallback((weekIndex, taskIndex) => {
    const key = `w${weekIndex}t${taskIndex}`
    setDone(prev => {
      const next = { ...prev, [key]: !prev[key] }
      saveDoneTasks(user?.id || null, planVersion(config), next)
      return next
    })
  }, [config, user?.id])

  /* ── signed-out ── */
  if (!user?.id && !loading) {
    return (
      <main style={styles.page}>
        <SEO title="Your CELPIP Study Plan — CELPIPACE" description="Get a personalised, adaptive week-by-week CELPIP study plan based on your test date and target CLB." />
        <div style={styles.cardCenter}>
          <div style={styles.bigIcon}>🗓️</div>
          <h1 style={styles.h1}>Your Personalised Study Plan</h1>
          <p style={styles.muted}>Sign in to build an adaptive week-by-week plan tuned to your test date, your target CLB and your weakest sections.</p>
          <button style={styles.primaryBtn} onClick={() => navigate('/dashboard')}>Go to Dashboard</button>
        </div>
      </main>
    )
  }

  if (loading) {
    return (
      <main style={styles.page}>
        <div style={styles.cardCenter}><p style={styles.muted}>Loading your study plan…</p></div>
      </main>
    )
  }

  /* ── setup / edit form ── */
  if (editing || !config) {
    return (
      <main style={styles.page}>
        <SEO title="Your CELPIP Study Plan — CELPIPACE" description="Get a personalised, adaptive week-by-week CELPIP study plan based on your test date and target CLB." />
        <div style={styles.cardCenter}>
          <div style={styles.bigIcon}>🗓️</div>
          <h1 style={styles.h1}>{config ? 'Edit your study plan' : 'Build your study plan'}</h1>
          <p style={styles.muted}>We’ll generate a week-by-week plan that adapts to your scores and prioritises your weakest sections.</p>

          <div style={styles.formField}>
            <label style={styles.label}>When is your CELPIP test?</label>
            <input
              type="date"
              value={targetDate}
              min={minDateStr()}
              onChange={e => setTargetDate(e.target.value)}
              style={styles.input}
            />
          </div>

          <div style={styles.formField}>
            <label style={styles.label}>Target CLB level</label>
            <div style={styles.chipRow}>
              {[7, 8, 9, 10, 11].map(v => (
                <button
                  key={v}
                  onClick={() => setTargetCLB(v)}
                  style={{ ...styles.chip, ...(Number(targetCLB) === v ? styles.chipActive : {}) }}
                >
                  CLB {v}
                </button>
              ))}
            </div>
          </div>

          <div style={styles.formField}>
            <label style={styles.label}>How many days per week can you study?</label>
            <div style={styles.chipRow}>
              {[3, 4, 5, 6, 7].map(v => (
                <button
                  key={v}
                  onClick={() => setDaysPerWeek(v)}
                  style={{ ...styles.chip, ...(Number(daysPerWeek) === v ? styles.chipActive : {}) }}
                >
                  {v} days
                </button>
              ))}
            </div>
          </div>

          <button style={{ ...styles.primaryBtn, width: '100%', marginTop: 8 }} onClick={handleSave}>
            {config ? 'Update plan' : 'Generate my plan'}
          </button>
          {config && (
            <button style={styles.linkBtn} onClick={() => setEditing(false)}>Cancel</button>
          )}
        </div>
      </main>
    )
  }

  /* ── plan view ── */
  const dLeft = daysUntil(config.targetDate)
  const totalTasks = plan.weeks.reduce((a, w) => a + w.tasks.length, 0)
  const doneCount = Object.values(done).filter(Boolean).length
  const overallPct = totalTasks > 0 ? Math.round((doneCount / totalTasks) * 100) : 0

  return (
    <main style={styles.page}>
      <SEO title="Your CELPIP Study Plan — CELPIPACE" description="Your personalised, adaptive week-by-week CELPIP study plan." />
      <div style={styles.wrap}>
        {/* header */}
        <div style={styles.headerCard}>
          <div style={styles.headerTop}>
            <div>
              <h1 style={styles.h1Left}>Your Study Plan</h1>
              <p style={styles.headerSub}>
                {plan.overdue
                  ? 'Your test date has passed — here’s an intensive catch-up week.'
                  : `${dLeft} day${dLeft === 1 ? '' : 's'} until your test · ${plan.weeksLeft} week${plan.weeksLeft === 1 ? '' : 's'} of practice`}
              </p>
            </div>
            <button style={styles.ghostBtn} onClick={() => setEditing(true)}>Edit</button>
          </div>

          <div style={styles.metaRow}>
            <Meta label="Target" value={`CLB ${plan.target}`} color="#0f172a" />
            <Meta label="Starting at" value={`~CLB ${plan.startCLB}`} color="#64748b" />
            <Meta label="Per week" value={`${plan.perWeek} days`} color="#64748b" />
          </div>

          <div style={styles.progressTrack}>
            <div style={{ ...styles.progressFill, width: `${overallPct}%` }} />
          </div>
          <div style={styles.progressLabel}>{doneCount}/{totalTasks} tasks done · {overallPct}%</div>

          {/* focus priority */}
          <div style={styles.focusRow}>
            <span style={styles.focusLabel}>Priority order:</span>
            {plan.focusOrder.map((s, i) => (
              <span key={s.key} style={styles.focusChip}>
                {i + 1}. {s.icon} {s.label}
                {s.current != null && <span style={styles.focusBand}> · CLB {s.current}</span>}
              </span>
            ))}
          </div>
        </div>

        {/* weeks */}
        {plan.weeks.map((week) => (
          <div
            key={week.index}
            style={{ ...styles.weekCard, ...(week.status === 'current' ? styles.weekCurrent : {}) }}
          >
            <div style={styles.weekHead}>
              <div style={styles.weekHeadLeft}>
                <span style={styles.weekTitle}>{week.label}</span>
                {week.status === 'current' && <span style={styles.nowTag}>This week</span>}
              </div>
              <span style={styles.weekRange}>{week.rangeLabel}</span>
            </div>

            <div style={styles.weekFocus}>
              <span style={styles.weekFocusLabel}>Focus:</span>
              {week.focus.map(k => {
                const s = SECTION_BY_KEY[k]
                return (
                  <span key={k} style={{ ...styles.weekFocusChip, color: s.color }}>
                    {s.icon} {s.label}
                  </span>
                )
              })}
              <span style={styles.milestone}>Aim: CLB {week.milestoneCLB}</span>
            </div>

            <ul style={styles.taskList}>
              {week.tasks.map((t, ti) => {
                const key = `w${week.index}t${ti}`
                const checked = !!done[key]
                return (
                  <li key={ti} style={styles.taskItem}>
                    <button
                      onClick={() => toggleTask(week.index, ti)}
                      style={{ ...styles.checkbox, ...(checked ? styles.checkboxOn : {}) }}
                      aria-label={checked ? 'Mark incomplete' : 'Mark complete'}
                    >
                      {checked ? '✓' : ''}
                    </button>
                    <span style={{ ...styles.taskText, ...(checked ? styles.taskTextDone : {}) }}>
                      <span style={styles.taskIcon}>{t.icon}</span>
                      {t.label}
                    </span>
                    <button style={styles.taskGo} onClick={() => navigate(t.route)}>Go →</button>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}

        <div style={styles.footerRow}>
          <button style={styles.linkDanger} onClick={handleReset}>Reset plan</button>
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
  wrap: { width: '100%', maxWidth: 640 },
  cardCenter: { width: '100%', maxWidth: 540, margin: '0 auto', background: '#fff', borderRadius: 18, padding: '36px 30px', boxShadow: '0 4px 24px rgba(15,23,42,0.06)', textAlign: 'center' },
  bigIcon: { fontSize: 44, marginBottom: 6 },
  h1: { fontSize: 24, fontWeight: 700, color: '#0f172a', margin: '6px 0 10px' },
  h1Left: { fontSize: 22, fontWeight: 700, color: '#0f172a', margin: 0 },
  muted: { fontSize: 15, lineHeight: 1.6, color: '#64748b', margin: '0 0 22px' },
  primaryBtn: { background: '#0f172a', color: '#fff', border: 'none', borderRadius: 10, padding: '13px 22px', fontSize: 15, fontWeight: 600, cursor: 'pointer' },
  ghostBtn: { background: '#fff', color: '#0f172a', border: '1px solid #E2E8F0', borderRadius: 10, padding: '9px 18px', fontSize: 14, fontWeight: 600, cursor: 'pointer' },
  linkBtn: { display: 'block', width: '100%', background: 'none', border: 'none', color: '#64748b', fontSize: 14, fontWeight: 600, cursor: 'pointer', padding: '12px 6px 0' },
  linkDanger: { background: 'none', border: 'none', color: '#C8102E', fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: 8 },

  formField: { textAlign: 'left', marginBottom: 20 },
  label: { display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 8 },
  input: { width: '100%', boxSizing: 'border-box', border: '1.5px solid #E2E8F0', borderRadius: 10, padding: '12px 14px', fontSize: 15, color: '#0f172a' },
  chipRow: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  chip: { flex: '1 1 auto', minWidth: 64, background: '#fff', border: '1.5px solid #E2E8F0', borderRadius: 10, padding: '10px 8px', fontSize: 14, fontWeight: 600, color: '#475569', cursor: 'pointer' },
  chipActive: { background: '#0f172a', borderColor: '#0f172a', color: '#fff' },

  headerCard: { background: '#fff', borderRadius: 18, padding: '24px 24px 22px', boxShadow: '0 4px 24px rgba(15,23,42,0.06)', marginBottom: 16 },
  headerTop: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 16 },
  headerSub: { fontSize: 13.5, color: '#64748b', margin: '6px 0 0' },
  metaRow: { display: 'flex', gap: 26, marginBottom: 16 },
  meta: { display: 'flex', flexDirection: 'column', gap: 2 },
  metaValue: { fontSize: 18, fontWeight: 800 },
  metaLabel: { fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.05em' },
  progressTrack: { height: 8, background: '#E2E8F0', borderRadius: 99, overflow: 'hidden' },
  progressFill: { height: '100%', background: 'linear-gradient(90deg,#4A90D9,#2D8A56)', borderRadius: 99, transition: 'width .3s ease' },
  progressLabel: { fontSize: 12, color: '#94a3b8', margin: '6px 0 0' },
  focusRow: { display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginTop: 16, paddingTop: 16, borderTop: '1px solid #F1F5F9' },
  focusLabel: { fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.04em' },
  focusChip: { fontSize: 12.5, fontWeight: 600, color: '#475569', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 99, padding: '4px 10px' },
  focusBand: { color: '#94a3b8', fontWeight: 500 },

  weekCard: { background: '#fff', borderRadius: 16, padding: '20px 22px', boxShadow: '0 2px 12px rgba(15,23,42,0.04)', marginBottom: 12, border: '1.5px solid transparent' },
  weekCurrent: { border: '1.5px solid #4A90D9', boxShadow: '0 4px 20px rgba(74,144,217,0.12)' },
  weekHead: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  weekHeadLeft: { display: 'flex', alignItems: 'center', gap: 10 },
  weekTitle: { fontSize: 16, fontWeight: 700, color: '#0f172a' },
  nowTag: { fontSize: 11, fontWeight: 700, color: '#fff', background: '#4A90D9', borderRadius: 99, padding: '3px 9px', textTransform: 'uppercase', letterSpacing: '.03em' },
  weekRange: { fontSize: 12.5, color: '#94a3b8' },
  weekFocus: { display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginBottom: 14 },
  weekFocusLabel: { fontSize: 12, fontWeight: 600, color: '#94a3b8' },
  weekFocusChip: { fontSize: 13, fontWeight: 700 },
  milestone: { marginLeft: 'auto', fontSize: 12, fontWeight: 600, color: '#2D8A56', background: '#F0FDF4', borderRadius: 99, padding: '4px 10px' },
  taskList: { listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 8 },
  taskItem: { display: 'flex', alignItems: 'center', gap: 12 },
  checkbox: { flexShrink: 0, width: 24, height: 24, borderRadius: 7, border: '1.5px solid #CBD5E1', background: '#fff', color: '#fff', fontSize: 14, fontWeight: 800, cursor: 'pointer', lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  checkboxOn: { background: '#2D8A56', borderColor: '#2D8A56' },
  taskText: { flex: 1, fontSize: 14, lineHeight: 1.45, color: '#334155' },
  taskTextDone: { color: '#94a3b8', textDecoration: 'line-through' },
  taskIcon: { marginRight: 7 },
  taskGo: { flexShrink: 0, background: 'none', border: 'none', color: '#4A90D9', fontSize: 13, fontWeight: 700, cursor: 'pointer', padding: 4 },
  footerRow: { textAlign: 'center', marginTop: 8 },
}
