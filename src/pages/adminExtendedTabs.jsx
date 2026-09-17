import { useEffect, useMemo, useRef, useState } from 'react'
import { adminSupabase } from '../lib/adminSupabase'
import { isPaidPremiumSource } from '../lib/adminMetrics'

const inputStyle = {
  width: '100%', background: '#0B1626', border: '1px solid #1d3152', borderRadius: 8,
  color: '#E6ECF5', padding: '10px 12px', fontSize: 14, outline: 'none', boxSizing: 'border-box',
}
const btnGhostStyle = {
  background: 'transparent', border: '1px solid #1d3152', color: '#E6ECF5',
  padding: '8px 14px', borderRadius: 8, fontSize: 13, cursor: 'pointer',
}

function StatCard({ label, value, accent = '#E6ECF5', onClick, hint }) {
  const clickable = typeof onClick === 'function'
  return (
    <div
      onClick={onClick}
      style={{
        background: '#12223A', border: '1px solid #1d3152', borderRadius: 12, padding: '16px 18px',
        cursor: clickable ? 'pointer' : 'default',
      }}
      title={hint || undefined}
    >
      <div style={{ fontSize: 11, color: '#98a2b5', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 700, color: accent }}>{value}</div>
    </div>
  )
}

function Panel({ title, children }) {
  return (
    <div style={{ background: '#12223A', border: '1px solid #1d3152', borderRadius: 12, padding: '18px 20px', marginBottom: 18 }}>
      {title && <h3 style={{ margin: '0 0 14px', fontSize: 15, color: '#E6ECF5' }}>{title}</h3>}
      {children}
    </div>
  )
}

function Chip({ color, text }) {
  return <span style={{ display: 'inline-block', background: `${color}22`, color, fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 4, letterSpacing: '.04em' }}>{text}</span>
}

function Loading() { return <div style={{ color: '#98a2b5', padding: 20 }}>Loading…</div> }
function Err({ msg }) { return <div style={{ color: '#ff9a9a', padding: 20 }}>Error: {msg}</div> }

function Table({ cols, rows, empty, onRowClick }) {
  if (!rows?.length) return <div style={{ color: '#667', fontSize: 13, padding: '8px 0' }}>{empty || 'No rows.'}</div>
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #1d3152', textAlign: 'left' }}>
            {cols.map(c => <th key={c} style={{ padding: '10px 12px', fontSize: 11, color: '#98a2b5', fontWeight: 600 }}>{c}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              onClick={onRowClick ? () => onRowClick(i) : undefined}
              style={{
                borderBottom: '1px solid #1d3152',
                cursor: onRowClick ? 'pointer' : 'default',
              }}
            >
              {row.map((cell, j) => <td key={j} style={{ padding: '10px 12px', color: '#E6ECF5', verticalAlign: 'middle' }}>{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function stripeSessionUrl(sessionId) {
  if (!sessionId) return null
  return `https://dashboard.stripe.com/checkout/sessions/${encodeURIComponent(sessionId)}`
}

export async function adminApi(action, payload = {}) {
  const { data: { session } } = await adminSupabase.auth.getSession()
  if (!session?.access_token) throw new Error('Admin session required')
  const res = await fetch('/api/admin', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ action, ...payload }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.message || data.error || 'Admin request failed')
  return data
}

function previewText(text, max = 80) {
  const s = String(text || '').replace(/\s+/g, ' ').trim()
  return s.length <= max ? s : `${s.slice(0, max)}…`
}

export function useAdminAlertCounts() {
  const [counts, setCounts] = useState({ supportOpen: null, checkoutHot: null })
  const [err, setErr] = useState('')

  useEffect(() => {
    let cancel = false
    ;(async () => {
      try {
        const data = await adminApi('support-alert-counts')
        if (cancel) return
        setCounts({
          supportOpen: data.supportOpen ?? 0,
          checkoutHot: data.checkoutHot ?? 0,
        })
      } catch (e) {
        if (cancel) return
        setErr(e.message || 'Alert fetch failed')
        setCounts({ supportOpen: 0, checkoutHot: 0 })
      }
    })()
    return () => { cancel = true }
  }, [])

  return { counts, err }
}

const ADMIN_PROFILE_COLUMNS = 'id, email, full_name, is_premium, premium_source, created_at, last_seen_at, exam_date, current_plan, subscription_status, cancel_at_period_end'

function useAdminProfiles() {
  const [rows, setRows] = useState(null)
  const [err, setErr] = useState('')
  useEffect(() => {
    let cancel = false
    ;(async () => {
      let { data, error } = await adminSupabase
        .from('profiles')
        .select(ADMIN_PROFILE_COLUMNS)
        .order('created_at', { ascending: false })
      if (error && /column .* does not exist/i.test(error.message || '')) {
        const fallback = await adminSupabase
          .from('profiles')
          .select('id, email, full_name, is_premium, premium_source, created_at, last_seen_at')
          .order('created_at', { ascending: false })
        data = fallback.data
        error = fallback.error
      }
      if (cancel) return
      if (error) setErr(error.message)
      else setRows(data ?? [])
    })()
    return () => { cancel = true }
  }, [])
  return { rows, err }
}

export function SupportTab({ UserDetailPanel }) {
  const { rows: profiles, err: profilesErr } = useAdminProfiles()
  const [rows, setRows] = useState(null)
  const [err, setErr] = useState('')
  const [query, setQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [urgencyFilter, setUrgencyFilter] = useState('all')
  const [range, setRange] = useState('30')
  const [selectedUser, setSelectedUser] = useState(null)
  const [selectedMessage, setSelectedMessage] = useState(null)
  const drawerRef = useRef(null)

  useEffect(() => {
    let cancel = false
    const days = parseInt(range, 10)
    const since = new Date(Date.now() - days * 864e5).toISOString()
    ;(async () => {
      try {
        const data = await adminApi('list-contact-messages', { since })
        if (cancel) return
        setRows(data.rows ?? [])
      } catch (e) {
        if (cancel) return
        setErr(e.message || 'Failed to load messages')
      }
    })()
    return () => { cancel = true }
  }, [range])

  useEffect(() => {
    if (!selectedUser || !drawerRef.current) return
    drawerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [selectedUser])

  const profileById = useMemo(() => new Map((profiles || []).map(p => [p.id, p])), [profiles])
  const profileByEmail = useMemo(() => {
    const map = new Map()
    for (const p of profiles || []) {
      if (p.email) map.set(p.email.toLowerCase(), p)
    }
    return map
  }, [profiles])

  const filtered = useMemo(() => {
    if (!rows) return []
    const q = query.trim().toLowerCase()
    return rows.filter(r => {
      if (typeFilter !== 'all' && r.request_type !== typeFilter) return false
      if (urgencyFilter !== 'all' && r.urgency !== urgencyFilter) return false
      if (!q) return true
      return [r.name, r.email, r.message, r.request_type].some(v => String(v || '').toLowerCase().includes(q))
    })
  }, [rows, query, typeFilter, urgencyFilter])

  const handleRowClick = (idx) => {
    const row = filtered[idx]
    if (!row) return
    const linked = row.user_id ? profileById.get(row.user_id) : profileByEmail.get(String(row.email || '').toLowerCase())
    if (linked) {
      setSelectedMessage(null)
      setSelectedUser({ id: linked.id, email: linked.email })
    } else {
      setSelectedUser(null)
      setSelectedMessage(row)
    }
  }

  if (profilesErr) return <Err msg={profilesErr} />
  if (err) return <Err msg={err} />
  if (!rows || !profiles) return <Loading />

  const billingCount = rows.filter(r => r.request_type === 'Billing or refund').length
  const technicalCount = rows.filter(r => r.request_type === 'Technical problem').length

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 24, color: '#E6ECF5' }}>Support inbox</h2>
          <p style={{ margin: '6px 0 0', color: '#98a2b5', fontSize: 13 }}>
            Contact form submissions — including users without accounts.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 14, marginBottom: 18 }}>
        <StatCard label="Messages" value={filtered.length} />
        <StatCard label="Billing / refund" value={billingCount} accent="#ffd66a" />
        <StatCard label="Technical" value={technicalCount} accent="#ff9a9a" />
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <select value={range} onChange={e => setRange(e.target.value)} style={{ ...inputStyle, margin: 0, width: 140 }}>
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
          <option value="365">Last year</option>
        </select>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={{ ...inputStyle, margin: 0, width: 180 }}>
          <option value="all">All types</option>
          <option value="Billing or refund">Billing or refund</option>
          <option value="Technical problem">Technical problem</option>
          <option value="Ask a question">Ask a question</option>
        </select>
        <select value={urgencyFilter} onChange={e => setUrgencyFilter(e.target.value)} style={{ ...inputStyle, margin: 0, width: 140 }}>
          <option value="all">All urgency</option>
          <option value="Urgent">Urgent</option>
          <option value="Normal">Normal</option>
        </select>
        <input
          placeholder="Search name, email, message…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          style={{ ...inputStyle, flex: 1, minWidth: 220, margin: 0 }}
        />
      </div>

      <Panel title={`${filtered.length} message${filtered.length === 1 ? '' : 's'}`}>
        <Table
          cols={['Date', 'Name', 'Email', 'Type', 'Urgency', 'Preview', 'Account']}
          rows={filtered.map(r => {
            const linked = r.user_id ? profileById.get(r.user_id) : profileByEmail.get(String(r.email || '').toLowerCase())
            return [
              r.created_at ? new Date(r.created_at).toLocaleString() : '—',
              r.name || '—',
              r.email || '—',
              r.request_type || '—',
              r.urgency === 'Urgent' ? <Chip color="#ff9a9a" text="URGENT" /> : <span style={{ color: '#98a2b5', fontSize: 12 }}>Normal</span>,
              <span style={{ color: '#98a2b5', fontSize: 12 }}>{previewText(r.message)}</span>,
              linked
                ? <Chip color="#7dffb0" text="LINKED" />
                : <Chip color="#667" text="NO ACCOUNT" />,
            ]
          })}
          empty="No contact messages in this range."
          onRowClick={handleRowClick}
        />
      </Panel>

      {selectedMessage && (
        <Panel title="Message detail">
          <div style={{ fontSize: 13, color: '#98a2b5', marginBottom: 8 }}>
            {selectedMessage.created_at ? new Date(selectedMessage.created_at).toLocaleString() : ''}
            {' · '}{selectedMessage.request_type} · {selectedMessage.urgency}
          </div>
          <div style={{ fontSize: 15, color: '#E6ECF5', marginBottom: 8 }}>
            <strong>{selectedMessage.name || 'Anonymous'}</strong>
            {selectedMessage.email && (
              <> · <a href={`mailto:${selectedMessage.email}`} style={{ color: '#7dc8ff' }}>{selectedMessage.email}</a></>
            )}
          </div>
          <div style={{ whiteSpace: 'pre-wrap', color: '#E6ECF5', lineHeight: 1.6, fontSize: 14 }}>{selectedMessage.message}</div>
          <button onClick={() => setSelectedMessage(null)} style={{ ...btnGhostStyle, marginTop: 14 }}>Close</button>
        </Panel>
      )}

      {selectedUser && UserDetailPanel && (
        <div ref={drawerRef}>
          <UserDetailPanel
            userId={selectedUser.id}
            email={selectedUser.email}
            onClose={() => setSelectedUser(null)}
          />
        </div>
      )}
    </>
  )
}

export function CheckoutTab() {
  const { rows: profiles, err: profilesErr } = useAdminProfiles()
  const [rows, setRows] = useState(null)
  const [err, setErr] = useState('')
  const [range, setRange] = useState('30')
  const [showOpenOnly, setShowOpenOnly] = useState(false)

  useEffect(() => {
    let cancel = false
    const days = parseInt(range, 10)
    const since = new Date(Date.now() - days * 864e5).toISOString()
    ;(async () => {
      const { data, error } = await adminSupabase
        .from('checkout_intents')
        .select('id, user_id, email, plan, stripe_session_id, created_at, converted_at')
        .gte('created_at', since)
        .order('created_at', { ascending: false })
        .limit(500)
      if (cancel) return
      if (error) setErr(error.message)
      else setRows(data ?? [])
    })()
    return () => { cancel = true }
  }, [range])

  const profileById = useMemo(() => new Map((profiles || []).map(p => [p.id, p])), [profiles])

  const enriched = useMemo(() => {
    return (rows || []).map(r => {
      const profile = profileById.get(r.user_id)
      const converted = !!r.converted_at
      const stillPremium = profile?.is_premium && isPaidPremiumSource(profile.premium_source)
      const abandoned = !converted && !stillPremium
      const hot = abandoned && Date.now() - new Date(r.created_at).getTime() < 72 * 3600e3
      return { ...r, profile, converted, abandoned, hot }
    })
  }, [rows, profileById])

  const visible = useMemo(() => {
    if (!showOpenOnly) return enriched
    return enriched.filter(r => r.abandoned)
  }, [enriched, showOpenOnly])

  if (profilesErr) return <Err msg={profilesErr} />
  if (err) return <Err msg={err} />
  if (!rows || !profiles) return <Loading />

  const since7d = Date.now() - 7 * 864e5
  const since30d = Date.now() - 30 * 864e5
  const last7 = enriched.filter(r => new Date(r.created_at).getTime() >= since7d)
  const last30 = enriched.filter(r => new Date(r.created_at).getTime() >= since30d)
  const converted7 = last7.filter(r => r.converted).length
  const converted30 = last30.filter(r => r.converted).length
  const abandoned30 = last30.filter(r => r.abandoned).length
  const abandonRate = last30.length ? Math.round((abandoned30 / last30.length) * 100) : 0
  const hotLeads = enriched.filter(r => r.hot).length

  const byPlan = ['weekly', 'monthly', 'annual'].map(plan => ({
    plan,
    started: last30.filter(r => String(r.plan || '').toLowerCase() === plan).length,
    converted: last30.filter(r => String(r.plan || '').toLowerCase() === plan && r.converted).length,
  }))

  return (
    <>
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ margin: 0, fontSize: 24, color: '#E6ECF5' }}>Checkout abandonment</h2>
        <p style={{ margin: '6px 0 0', color: '#98a2b5', fontSize: 13 }}>
          Stripe checkout intents — open intents from the last 72h are hot leads.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 14, marginBottom: 18 }}>
        <StatCard label="Started (7d)" value={last7.length} accent="#7dc8ff" />
        <StatCard label="Converted (7d)" value={converted7} accent="#7dffb0" />
        <StatCard label="Started (30d)" value={last30.length} />
        <StatCard label="Converted (30d)" value={converted30} accent="#7dffb0" />
        <StatCard label="Abandon rate (30d)" value={`${abandonRate}%`} accent={abandonRate >= 50 ? '#ff9a9a' : '#ffd66a'} />
        <StatCard label="Hot leads (72h)" value={hotLeads} accent={hotLeads ? '#ff9a9a' : '#E6ECF5'} hint="Open intents, not yet converted" />
      </div>

      <Panel title="By plan (30d)">
        <Table
          cols={['Plan', 'Started', 'Converted', 'Rate']}
          rows={byPlan.map(p => [
            p.plan,
            p.started,
            p.converted,
            p.started ? `${Math.round((p.converted / p.started) * 100)}%` : '—',
          ])}
        />
      </Panel>

      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <select value={range} onChange={e => setRange(e.target.value)} style={{ ...inputStyle, margin: 0, width: 140 }}>
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
        </select>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#98a2b5', fontSize: 13 }}>
          <input type="checkbox" checked={showOpenOnly} onChange={e => setShowOpenOnly(e.target.checked)} />
          Open / abandoned only
        </label>
      </div>

      <Panel title={`Checkout intents · ${visible.length}`}>
        <Table
          cols={['Date', 'Email', 'Plan', 'Status', 'Stripe', 'Premium now']}
          rows={visible.map(r => [
            r.created_at ? new Date(r.created_at).toLocaleString() : '—',
            r.email || r.profile?.email || '—',
            r.plan || '—',
            r.converted
              ? <Chip color="#7dffb0" text="CONVERTED" />
              : r.hot
                ? <Chip color="#ff9a9a" text="HOT — OPEN" />
                : r.abandoned
                  ? <Chip color="#ffd66a" text="ABANDONED" />
                  : <Chip color="#98a2b5" text="OPEN" />,
            r.stripe_session_id
              ? <a href={stripeSessionUrl(r.stripe_session_id)} target="_blank" rel="noreferrer" style={{ color: '#7dc8ff', fontSize: 12 }} onClick={e => e.stopPropagation()}>Session ↗</a>
              : '—',
            r.profile?.is_premium ? <Chip color="#7dffb0" text="YES" /> : <span style={{ color: '#667', fontSize: 12 }}>no</span>,
          ])}
          empty="No checkout intents in this range."
        />
      </Panel>
    </>
  )
}

export function ProductTab() {
  const [stats, setStats] = useState(null)
  const [err, setErr] = useState('')
  const [range, setRange] = useState('30')

  useEffect(() => {
    let cancel = false
    const days = parseInt(range, 10)
    ;(async () => {
      const { data, error } = await adminSupabase.rpc('get_admin_product_stats', { p_days: days })
      if (cancel) return
      if (error) {
        // Fallback: client-side aggregation if RPC not deployed yet
        const since = new Date(Date.now() - days * 864e5).toISOString()
        const { data: attempts, error: attErr } = await adminSupabase
          .from('practice_attempts')
          .select('section, part_id, set_number, user_id, created_at, pct')
          .gte('created_at', since)
          .limit(10000)
        if (attErr) { setErr(attErr.message); return }
        const bySection = {}
        const setCounts = {}
        const users = new Set()
        for (const a of attempts || []) {
          users.add(a.user_id)
          bySection[a.section] = (bySection[a.section] || 0) + 1
          const key = `${a.section}|${a.part_id}|${a.set_number}`
          setCounts[key] = (setCounts[key] || 0) + 1
        }
        const topSets = Object.entries(setCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 15)
          .map(([key, count]) => {
            const [section, part_id, set_number] = key.split('|')
            return { section, part_id, set_number: Number(set_number), count }
          })
        setStats({
          attempts_by_section: Object.entries(bySection).map(([section, count]) => ({ section, count })).sort((a, b) => b.count - a.count),
          top_sets: topSets,
          mock_completions: (attempts || []).filter(a => a.section === 'mock').length,
          total_attempts: (attempts || []).length,
          unique_users: users.size,
          activation_rate: null,
        })
        return
      }
      setStats(data)
    })()
    return () => { cancel = true }
  }, [range])

  if (err) return <Err msg={err} />
  if (!stats) return <Loading />

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 24, color: '#E6ECF5' }}>Product engagement</h2>
          <p style={{ margin: '6px 0 0', color: '#98a2b5', fontSize: 13 }}>
            Practice attempts by section, top sets, and activation.
          </p>
        </div>
        <select value={range} onChange={e => setRange(e.target.value)} style={{ ...inputStyle, margin: 0, width: 140 }}>
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 14, marginBottom: 18 }}>
        <StatCard label="Total attempts" value={stats.total_attempts ?? 0} />
        <StatCard label="Unique users" value={stats.unique_users ?? 0} accent="#7dc8ff" />
        <StatCard label="Mock attempts" value={stats.mock_completions ?? 0} accent="#ffd66a" />
        <StatCard label="7-day activation" value={stats.activation_rate != null ? `${stats.activation_rate}%` : '—'} accent="#7dffb0" hint="% of new signups with ≥1 attempt in first 7 days" />
      </div>

      <Panel title="Attempts by section">
        <Table
          cols={['Section', 'Attempts']}
          rows={(stats.attempts_by_section || []).map(s => [s.section, s.count])}
          empty="No practice data."
        />
      </Panel>

      <Panel title="Top practice sets">
        <Table
          cols={['Section', 'Part', 'Set', 'Attempts']}
          rows={(stats.top_sets || []).map(s => [s.section, s.part_id || '—', s.set_number ?? '—', s.count])}
          empty="No set data."
        />
      </Panel>
    </>
  )
}

export function CohortRetentionPanel() {
  const [rows, setRows] = useState(null)
  const [err, setErr] = useState('')

  useEffect(() => {
    let cancel = false
    ;(async () => {
      const { data, error } = await adminSupabase.rpc('get_admin_cohort_retention', { p_weeks: 8 })
      if (cancel) return
      if (error) setErr(error.message)
      else setRows(data ?? [])
    })()
    return () => { cancel = true }
  }, [])

  if (err) return <Panel title="Cohort retention"><div style={{ color: '#ff9a9a', fontSize: 13 }}>RPC unavailable — run supabase/admin_analytics_rpc.sql. {err}</div></Panel>
  if (!rows) return <Panel title="Cohort retention"><Loading /></Panel>

  const pct = (num, denom) => (denom ? Math.round((num / denom) * 100) : 0)

  return (
    <Panel title="Weekly signup cohorts (retention)">
      <p style={{ margin: '0 0 12px', color: '#98a2b5', fontSize: 13 }}>
        Active = returned or practiced in each week window after signup.
      </p>
      <Table
        cols={['Cohort week', 'Size', 'Wk 0', 'Wk 1', 'Wk 2', 'Wk 4', 'Paid']}
        rows={rows.map(r => [
          r.cohort_week ? new Date(r.cohort_week).toLocaleDateString() : '—',
          r.cohort_size,
          `${r.active_week_0} (${pct(r.active_week_0, r.cohort_size)}%)`,
          `${r.active_week_1} (${pct(r.active_week_1, r.cohort_size)}%)`,
          `${r.active_week_2} (${pct(r.active_week_2, r.cohort_size)}%)`,
          `${r.active_week_4} (${pct(r.active_week_4, r.cohort_size)}%)`,
          `${r.paid_count} (${pct(r.paid_count, r.cohort_size)}%)`,
        ])}
        empty="No cohort data yet."
      />
    </Panel>
  )
}

export function ExamDateSegmentsPanel({ profiles }) {
  const segments = useMemo(() => {
    const now = Date.now()
    const day = 864e5
    const withExam = (profiles || []).filter(p => p.exam_date)
    const urgent7 = withExam.filter(p => {
      const d = new Date(p.exam_date).getTime()
      return d >= now && d - now <= 7 * day
    })
    const urgent30 = withExam.filter(p => {
      const d = new Date(p.exam_date).getTime()
      return d >= now && d - now <= 30 * day
    })
    const nonUrgent = (profiles || []).filter(p => !p.exam_date || new Date(p.exam_date).getTime() > now + 30 * day)

    const convRate = (list) => {
      if (!list.length) return 0
      const paid = list.filter(p => p.is_premium && isPaidPremiumSource(p.premium_source)).length
      return Math.round((paid / list.length) * 100)
    }

    const activeRate = (list) => {
      if (!list.length) return 0
      const since = now - 7 * day
      const active = list.filter(p => p.last_seen_at && new Date(p.last_seen_at).getTime() >= since).length
      return Math.round((active / list.length) * 100)
    }

    return [
      { label: 'Exam ≤7 days', users: urgent7, color: '#ff9a9a' },
      { label: 'Exam ≤30 days', users: urgent30, color: '#ffd66a' },
      { label: 'No urgent exam', users: nonUrgent, color: '#7dc8ff' },
    ].map(s => ({
      ...s,
      count: s.users.length,
      conversion: convRate(s.users),
      active7d: activeRate(s.users),
    }))
  }, [profiles])

  if (!profiles) return null

  return (
    <Panel title="Exam-date urgency segments">
      <p style={{ margin: '0 0 12px', color: '#98a2b5', fontSize: 13 }}>
        Compare conversion and recent activity for users with upcoming exams vs everyone else.
      </p>
      <Table
        cols={['Segment', 'Users', 'Paid conversion', 'Active (7d)']}
        rows={segments.map(s => [
          s.label,
          s.count,
          `${s.conversion}%`,
          `${s.active7d}%`,
        ])}
      />
    </Panel>
  )
}

export function ConversionPathPanel({ events, payments, rangeDays }) {
  const path = useMemo(() => {
    const pricingViews = events.filter(e => e.event_type === 'page_view' && (e.page_path === '/pricing' || e.page_path?.startsWith('/pricing'))).length
    const paymentViews = events.filter(e => e.event_type === 'page_view' && (e.page_path === '/payment' || e.page_path?.startsWith('/payment'))).length
    const checkoutStarted = events.filter(e => e.event_type === 'checkout_started').length
    const checkoutErrors = events.filter(e => e.event_type === 'checkout_error').length
    const upgradeClicks = events.filter(e => e.event_type === 'upgrade_click').length

    const since = Date.now() - rangeDays * 864e5
    const paidInRange = (payments || []).filter(p => p.status === 'succeeded' && p.created_at && new Date(p.created_at).getTime() >= since).length

    const steps = [
      { label: '/pricing page views', value: pricingViews },
      { label: '/payment page views', value: paymentViews },
      { label: 'Upgrade clicks', value: upgradeClicks },
      { label: 'Checkout started', value: checkoutStarted },
      { label: 'Payments succeeded', value: paidInRange },
    ]
    return { steps, checkoutErrors }
  }, [events, payments, rangeDays])

  const drop = (from, to) => (from ? Math.round((1 - to / from) * 100) : 0)

  return (
    <Panel title="Conversion path">
      <p style={{ margin: '0 0 12px', color: '#98a2b5', fontSize: 13 }}>
        Pricing → payment → checkout → paid. Drop-off % vs previous step.
      </p>
      <Table
        cols={['Step', 'Count', 'Drop-off vs prev']}
        rows={path.steps.map((s, i) => [
          s.label,
          s.value,
          i === 0 ? '—' : `${drop(path.steps[i - 1].value, s.value)}%`,
        ])}
      />
      {path.checkoutErrors > 0 && (
        <div style={{ marginTop: 12, color: '#ff9a9a', fontSize: 13 }}>
          {path.checkoutErrors} checkout error{path.checkoutErrors === 1 ? '' : 's'} in range — check Payment page / Stripe.
        </div>
      )}
    </Panel>
  )
}

export function eventTypeChip(eventType) {
  const map = {
    click: ['#ffd66a', 'CLICK'],
    page_view: ['#7dc8ff', 'PAGE'],
    signup_complete: ['#7dffb0', 'SIGNUP'],
    checkout_started: ['#a78bfa', 'CHECKOUT'],
    checkout_error: ['#ff9a9a', 'ERROR'],
    upgrade_click: ['#f472b6', 'UPGRADE'],
  }
  const [color, text] = map[eventType] || ['#98a2b5', String(eventType || 'EVENT').toUpperCase()]
  return <Chip color={color} text={text} />
}
