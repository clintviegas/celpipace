import { useEffect, useMemo, useState } from 'react'
import { adminSupabase } from '../lib/adminSupabase'

/* ─────────────────────────────────────────────────────────────
   Hidden admin dashboard — URL: /admin
   Only accessible when signed in as sales@celpipace.com.
───────────────────────────────────────────────────────────── */
const ADMIN_EMAIL = 'sales@celpipace.com'
const PROFILE_COLUMNS = 'id, email, full_name, avatar_url, is_premium, premium_source, premium_granted_at, premium_expires_at, created_at, last_seen_at'
const LEGACY_PROFILE_COLUMNS = 'id, email, full_name, avatar_url, is_premium, premium_source, premium_granted_at, premium_expires_at, created_at'

// Rough MRR estimate (monthly-equivalent ARPU per premium user in USD)
const MRR_PER_PREMIUM = 24.99

export default function AdminPage() {
  const { user, loading, signOut } = useAdminAuth()
  const isAdmin = !!user && user.email?.toLowerCase() === ADMIN_EMAIL
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loginErr, setLoginErr] = useState('')
  const [sending, setSending]   = useState(false)

  const [tab, setTab] = useState('overview')

  /* ── Login ── */
  const handleLogin = async (e) => {
    e.preventDefault()
    setLoginErr('')
    if (email.trim().toLowerCase() !== ADMIN_EMAIL) { setLoginErr('Unauthorized.'); return }
    setSending(true)
    const { error } = await adminSupabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password })
    setSending(false)
    if (error) setLoginErr(error.message)
  }

  if (loading) {
    return <div style={shellStyle}><div style={cardStyle}><p style={{ color: '#98a2b5' }}>Loading…</p></div></div>
  }

  if (!user || !isAdmin) {
    return (
      <div style={shellStyle}>
        <div style={cardStyle}>
          <div style={{ fontSize: 12, letterSpacing: '.18em', color: '#ffd66a', marginBottom: 6 }}>RESTRICTED</div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#fff' }}>Admin Console</h1>
          <p style={{ color: '#98a2b5', fontSize: 14, marginTop: 6, marginBottom: 20 }}>Authorised personnel only.</p>
          <form onSubmit={handleLogin}>
            <label style={labelStyle}>Email</label>
            <input type="email" autoComplete="email" value={email} onChange={e => { setEmail(e.target.value); setLoginErr('') }} style={inputStyle} autoFocus />
            <label style={labelStyle}>Password</label>
            <input type="password" autoComplete="current-password" value={password} onChange={e => { setPassword(e.target.value); setLoginErr('') }} style={inputStyle} />
            {loginErr && <div style={{ color: '#ff9a9a', fontSize: 13, marginTop: 6 }}>{loginErr}</div>}
            {user && !isAdmin && (
              <div style={{ color: '#ff9a9a', fontSize: 13, marginTop: 6 }}>
                Signed in as {user.email}. Not an admin account.
                <button type="button" onClick={signOut} style={{ marginLeft: 8, background: 'none', border: 'none', color: '#ffd66a', cursor: 'pointer', textDecoration: 'underline' }}>Sign out</button>
              </div>
            )}
            <button type="submit" disabled={sending} style={btnPrimaryStyle}>{sending ? 'Signing in…' : 'Sign In'}</button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0B1626', color: '#E6ECF5', padding: '32px 20px' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontSize: 12, letterSpacing: '.18em', color: '#ffd66a' }}>ADMIN</div>
            <h1 style={{ margin: '4px 0 0', fontSize: 26, fontWeight: 700 }}>CELPIPACE Dashboard</h1>
            <p style={{ color: '#98a2b5', fontSize: 13, margin: '4px 0 0' }}>
              Signed in as <strong style={{ color: '#E6ECF5' }}>{user.email}</strong>
            </p>
          </div>
          <button onClick={signOut} style={btnGhostStyle}>Sign Out</button>
        </div>

        {/* Tab bar */}
        <div style={{ display: 'flex', gap: 6, borderBottom: '1px solid #1d3152', marginBottom: 24, overflowX: 'auto' }}>
          {[
            ['overview', 'Overview'],
            ['revenue', 'Revenue'],
            ['users', 'Users'],
            ['activity', 'Activity'],
            ['subscriptions', 'Subscriptions'],
            ['observability', 'Observability'],
            ['coupons', 'Coupons'],
            ['analytics', 'Analytics'],
          ].map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              style={{
                background: tab === id ? '#12223A' : 'transparent',
                border: 'none',
                borderBottom: tab === id ? '2px solid #ffd66a' : '2px solid transparent',
                color: tab === id ? '#ffd66a' : '#98a2b5',
                padding: '10px 18px',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === 'overview' && <OverviewTab />}
        {tab === 'revenue' && <RevenueTab />}
        {tab === 'users' && <UsersTab />}
        {tab === 'activity' && <ActivityTab />}
        {tab === 'subscriptions' && <SubscriptionsTab />}
        {tab === 'observability' && <ObservabilityTab />}
        {tab === 'coupons' && <CouponsTab />}
        {tab === 'analytics' && <AnalyticsTab />}
      </div>
    </div>
  )
}

function useAdminAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    adminSupabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = adminSupabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => { mounted = false; subscription.unsubscribe() }
  }, [])

  const signOut = async () => {
    setUser(null)
    await adminSupabase.auth.signOut({ scope: 'local' }).catch(() => {})
  }

  return { user, loading, signOut }
}

/* ═══════════════════════════════════════════════════════════ */
/*  DATA HOOK — shared profiles fetch                          */
/* ═══════════════════════════════════════════════════════════ */
function useProfiles() {
  const [rows, setRows] = useState(null)
  const [err, setErr]   = useState('')
  useEffect(() => {
    let cancel = false
    ;(async () => {
      let { data, error } = await adminSupabase
        .from('profiles')
        .select(PROFILE_COLUMNS)
        .order('created_at', { ascending: false })
      if (error?.message?.includes('last_seen_at')) {
        const fallback = await adminSupabase
          .from('profiles')
          .select(LEGACY_PROFILE_COLUMNS)
          .order('created_at', { ascending: false })
        data = fallback.data?.map(row => ({ ...row, last_seen_at: null })) ?? null
        error = fallback.error
      }
      if (cancel) return
      if (error) setErr(error.message)
      else setRows(data ?? [])
    })()
    return () => { cancel = true }
  }, [])
  return { rows, setRows, err }
}

function useAdminActivity() {
  const [rows, setRows] = useState(null)
  const [err, setErr] = useState('')

  useEffect(() => {
    let cancel = false
    ;(async () => {
      const { data, error } = await adminSupabase.rpc('get_admin_user_activity')
      if (cancel) return
      if (error) setErr(error.message)
      else setRows(data ?? [])
    })()
    return () => { cancel = true }
  }, [])

  return { rows, err }
}

/* ═══════════════════════════════════════════════════════════ */
/*  OVERVIEW                                                    */
/* ═══════════════════════════════════════════════════════════ */
function OverviewTab() {
  const { rows, err } = useProfiles()
  if (err) return <Err msg={err} />
  if (!rows) return <Loading />

  const total = rows.length
  const premium = rows.filter(r => r.is_premium).length
  const free = total - premium
  const last7d = rows.filter(r => r.created_at && Date.now() - new Date(r.created_at).getTime() < 7 * 864e5).length
  const last30d = rows.filter(r => r.created_at && Date.now() - new Date(r.created_at).getTime() < 30 * 864e5).length
  const mrr = premium * MRR_PER_PREMIUM
  const arr = mrr * 12

  const recent = rows.slice(0, 8)

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14, marginBottom: 24 }}>
        <StatCard label="Total Users"  value={total} />
        <StatCard label="Premium"      value={premium} accent="#ffd66a" />
        <StatCard label="Free"         value={free} />
        <StatCard label="New (7d)"     value={last7d} accent="#7dc8ff" />
        <StatCard label="New (30d)"    value={last30d} accent="#7dc8ff" />
        <StatCard label="Conversion"   value={total ? `${Math.round(premium/total*100)}%` : '–'} />
        <StatCard label="Est. MRR"     value={`$${mrr.toFixed(0)}`} accent="#7dffb0" />
        <StatCard label="Est. ARR"     value={`$${arr.toFixed(0)}`} accent="#7dffb0" />
      </div>

      <Panel title="Recent signups">
        <Table
          cols={['Email', 'Name', 'Plan', 'Joined']}
          rows={recent.map(r => [
            r.email,
            r.full_name || '—',
            r.is_premium ? <Chip color="#ffd66a" text="PREMIUM" /> : <span style={{ color: '#98a2b5' }}>free</span>,
            r.created_at ? new Date(r.created_at).toLocaleString() : '—',
          ])}
        />
      </Panel>
    </>
  )
}

/* ═══════════════════════════════════════════════════════════ */
/*  USERS                                                       */
/* ═══════════════════════════════════════════════════════════ */
function UsersTab() {
  const { rows, setRows, err } = useProfiles()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const [busyId, setBusyId] = useState(null)

  const filtered = useMemo(() => {
    if (!rows) return []
    const q = query.trim().toLowerCase()
    return rows.filter(r => {
      if (filter === 'premium' && !r.is_premium) return false
      if (filter === 'free' && r.is_premium) return false
      if (!q) return true
      return (r.email ?? '').toLowerCase().includes(q) || (r.full_name ?? '').toLowerCase().includes(q)
    })
  }, [rows, query, filter])

  const togglePremium = async (row) => {
    setBusyId(row.id)
    const next = !row.is_premium
    const payload = next
      ? { is_premium: true, premium_source: 'admin', premium_granted_at: new Date().toISOString() }
      : { is_premium: false, premium_source: null, premium_granted_at: null, premium_expires_at: null }
    const { error } = await adminSupabase.from('profiles').update(payload).eq('id', row.id)
    setBusyId(null)
    if (error) { alert('Update failed: ' + error.message); return }
    setRows(prev => prev.map(r => r.id === row.id ? { ...r, ...payload } : r))
  }

  const downloadCsv = () => {
    const header = ['email','full_name','is_premium','premium_source','created_at']
    const lines = [header.join(',')]
    for (const r of filtered) {
      lines.push([
        JSON.stringify(r.email ?? ''),
        JSON.stringify(r.full_name ?? ''),
        r.is_premium ? 'true' : 'false',
        JSON.stringify(r.premium_source ?? ''),
        JSON.stringify(r.created_at ?? ''),
      ].join(','))
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `celpipace-users-${new Date().toISOString().slice(0,10)}.csv`
    document.body.appendChild(a); a.click(); a.remove()
    URL.revokeObjectURL(url)
  }

  if (err) return <Err msg={err} />
  if (!rows) return <Loading />

  return (
    <>
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <input placeholder="Search email or name…" value={query} onChange={e => setQuery(e.target.value)} style={{ ...inputStyle, flex: 1, minWidth: 240, margin: 0 }} />
        <select value={filter} onChange={e => setFilter(e.target.value)} style={{ ...inputStyle, margin: 0, width: 140 }}>
          <option value="all">All</option>
          <option value="premium">Premium</option>
          <option value="free">Free</option>
        </select>
        <button onClick={downloadCsv} style={btnPrimaryCompact}>⇣ Export CSV</button>
      </div>

      <Panel>
        <Table
          cols={['Email', 'Name', 'Joined', 'Premium', 'Source', 'Action']}
          rows={filtered.map(r => [
            r.email,
            r.full_name || <span style={{ color: '#667' }}>—</span>,
            r.created_at ? new Date(r.created_at).toLocaleDateString() : '—',
            r.is_premium ? <Chip color="#ffd66a" text="PREMIUM" /> : <span style={{ color: '#98a2b5' }}>free</span>,
            <span style={{ color: '#98a2b5', fontSize: 12 }}>{r.premium_source || '—'}</span>,
            <button onClick={() => togglePremium(r)} disabled={busyId === r.id} style={btnSmallStyle}>
              {busyId === r.id ? '…' : (r.is_premium ? 'Revoke' : 'Grant')}
            </button>,
          ])}
          empty="No users match."
        />
      </Panel>
      <p style={{ color: '#667', fontSize: 12, marginTop: 16, textAlign: 'center' }}>
        {filtered.length} of {rows.length} users shown
      </p>
    </>
  )
}

/* ═══════════════════════════════════════════════════════════ */
/*  ACTIVITY                                                    */
/* ═══════════════════════════════════════════════════════════ */
function ActivityTab() {
  const { rows, err } = useAdminActivity()
  const [query, setQuery] = useState('')

  if (err) return <Err msg={`${err}. Run supabase/admin_hardening.sql if this is the first deploy of activity analytics.`} />
  if (!rows) return <Loading />

  const now = Date.now()
  const inWindow = (row, days) => {
    const source = row.last_activity_at || row.last_seen_at || row.last_response_at || row.created_at
    if (!source) return false
    return now - new Date(source).getTime() <= days * 864e5
  }
  const total = rows.length
  const active24h = rows.filter(r => inWindow(r, 1)).length
  const active7d = rows.filter(r => inWindow(r, 7)).length
  const active30d = rows.filter(r => inWindow(r, 30)).length

  const q = query.trim().toLowerCase()
  const filtered = q
    ? rows.filter(r => `${r.full_name || ''} ${r.email || ''}`.toLowerCase().includes(q))
    : rows

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 24, color: '#E6ECF5' }}>User Activity</h2>
          <p style={{ margin: '6px 0 0', color: '#98a2b5', fontSize: 13 }}>
            {total} total · {active24h} in 24h · {active7d} in 7d · {active30d} in 30d
            <span style={{ marginLeft: 8, color: '#667' }}>(includes progress saves, practice responses, writing, and mock exams)</span>
          </p>
        </div>
        <input
          placeholder="Search users…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          style={{ ...inputStyle, width: 260, margin: 0 }}
        />
      </div>

      <Panel>
        <Table
          cols={['User', 'Last Seen', 'Last Response', 'Activity', 'Joined']}
          rows={filtered.map(r => [
            <div>
              <div style={{ fontWeight: 700 }}>{r.full_name || friendlyName(r.email)}</div>
              <div style={{ color: '#98a2b5', fontSize: 13, marginTop: 2 }}>{r.email || '—'}</div>
            </div>,
            <span style={{ color: r.last_seen_at ? '#E6ECF5' : '#98a2b5' }}>{formatRelativeTime(r.last_seen_at)}</span>,
            <span style={{ color: r.last_response_at ? '#E6ECF5' : '#98a2b5' }}>{formatRelativeTime(r.last_response_at)}</span>,
            <div>
              <strong>{r.response_count || 0}</strong>
              <span style={{ color: '#98a2b5', marginLeft: 6 }}>events</span>
              {!!r.completed_sessions_count && <span style={{ color: '#7dffb0', marginLeft: 8 }}>{r.completed_sessions_count} completed</span>}
            </div>,
            r.created_at ? new Date(r.created_at).toLocaleDateString() : '—',
          ])}
          empty="No activity found."
        />
      </Panel>
    </>
  )
}

/* ═══════════════════════════════════════════════════════════ */
/*  SUBSCRIPTIONS                                               */
/* ═══════════════════════════════════════════════════════════ */
function SubscriptionsTab() {
  const { rows, err } = useProfiles()
  const [source, setSource] = useState('all')

  if (err) return <Err msg={err} />
  if (!rows) return <Loading />

  const subs = rows.filter(r => r.is_premium)
  const filtered = subs.filter(r => {
    if (source === 'all') return true
    if (source === 'coupon') return (r.premium_source || '').startsWith('coupon')
    if (source === 'admin') return r.premium_source === 'admin'
    if (source === 'paid') return r.premium_source === 'paid' || r.premium_source === 'stripe'
    return true
  })

  const bySource = subs.reduce((acc, r) => {
    const key = (r.premium_source || 'unknown').split(':')[0]
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {})

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14, marginBottom: 24 }}>
        <StatCard label="Total Premium" value={subs.length} accent="#ffd66a" />
        {Object.entries(bySource).map(([k, v]) => (
          <StatCard key={k} label={k} value={v} />
        ))}
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        <select value={source} onChange={e => setSource(e.target.value)} style={{ ...inputStyle, margin: 0, width: 180 }}>
          <option value="all">All sources</option>
          <option value="coupon">Coupon</option>
          <option value="admin">Admin grant</option>
          <option value="paid">Paid</option>
        </select>
      </div>

      <Panel>
        <Table
          cols={['Email', 'Name', 'Source', 'Granted', 'Expires']}
          rows={filtered.map(r => [
            r.email,
            r.full_name || '—',
            <span style={{ color: '#ffd66a', fontSize: 12 }}>{r.premium_source || '—'}</span>,
            r.premium_granted_at ? new Date(r.premium_granted_at).toLocaleDateString() : '—',
            r.premium_expires_at ? new Date(r.premium_expires_at).toLocaleDateString() : <span style={{ color: '#7dffb0' }}>lifetime</span>,
          ])}
          empty="No premium subscribers yet."
        />
      </Panel>
    </>
  )
}

/* ═══════════════════════════════════════════════════════════ */
/*  COUPONS                                                     */
/* ═══════════════════════════════════════════════════════════ */
function CouponsTab() {
  const [coupons, setCoupons] = useState(null)
  const [err, setErr]         = useState('')
  const [newCode, setNewCode] = useState('')
  const [newDays, setNewDays] = useState('365')
  const [newMax, setNewMax]   = useState('')
  const [busy, setBusy]       = useState(false)

  const load = async () => {
    const { data, error } = await adminSupabase
      .from('coupons')
      .select('code, active, max_redemptions, times_redeemed, grants_days, note, created_at')
      .order('created_at', { ascending: false })
    if (error) setErr(error.message)
    else setCoupons(data ?? [])
  }
  useEffect(() => { load() }, [])

  const create = async () => {
    const code = newCode.trim().toUpperCase()
    if (!code) return
    setBusy(true)
    const { error } = await adminSupabase.from('coupons').insert({
      code,
      active: true,
      grants_days: newDays ? parseInt(newDays, 10) : null,
      max_redemptions: newMax ? parseInt(newMax, 10) : null,
    })
    setBusy(false)
    if (error) { alert('Create failed: ' + error.message); return }
    setNewCode(''); setNewDays('365'); setNewMax('')
    load()
  }

  const toggleActive = async (c) => {
    const { error } = await adminSupabase.from('coupons').update({ active: !c.active }).eq('code', c.code)
    if (error) { alert(error.message); return }
    setCoupons(prev => prev.map(x => x.code === c.code ? { ...x, active: !c.active } : x))
  }

  if (err) return <Err msg={err} />
  if (!coupons) return <Loading />

  return (
    <>
      <Panel title="Create coupon">
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <input placeholder="CODE" value={newCode} onChange={e => setNewCode(e.target.value.toUpperCase())} style={{ ...inputStyle, margin: 0, width: 180 }} />
          <input placeholder="Grants days (blank = lifetime)" value={newDays} onChange={e => setNewDays(e.target.value)} style={{ ...inputStyle, margin: 0, width: 220 }} />
          <input placeholder="Max redemptions (blank = ∞)" value={newMax} onChange={e => setNewMax(e.target.value)} style={{ ...inputStyle, margin: 0, width: 220 }} />
          <button onClick={create} disabled={busy || !newCode.trim()} style={btnPrimaryCompact}>
            {busy ? '…' : '+ Add Coupon'}
          </button>
        </div>
      </Panel>

      <Panel title="All coupons">
        <Table
          cols={['Code', 'Status', 'Redeemed', 'Max', 'Grants', 'Created', 'Action']}
          rows={coupons.map(c => [
            <strong style={{ color: '#ffd66a' }}>{c.code}</strong>,
            c.active ? <Chip color="#7dffb0" text="ACTIVE" /> : <Chip color="#98a2b5" text="INACTIVE" />,
            c.times_redeemed ?? 0,
            c.max_redemptions ?? '∞',
            c.grants_days ? `${c.grants_days}d` : 'lifetime',
            c.created_at ? new Date(c.created_at).toLocaleDateString() : '—',
            <button onClick={() => toggleActive(c)} style={btnSmallStyle}>
              {c.active ? 'Disable' : 'Enable'}
            </button>,
          ])}
          empty="No coupons yet."
        />
      </Panel>
    </>
  )
}

/* ═══════════════════════════════════════════════════════════ */
/*  ANALYTICS                                                   */
/* ═══════════════════════════════════════════════════════════ */
function AnalyticsTab() {
  const { rows, err } = useProfiles()
  if (err) return <Err msg={err} />
  if (!rows) return <Loading />

  // Signups per day, last 30 days
  const days = 30
  const today = new Date(); today.setHours(0,0,0,0)
  const buckets = Array.from({ length: days }, (_, i) => {
    const d = new Date(today); d.setDate(d.getDate() - (days - 1 - i))
    return { date: d, label: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }), signups: 0, premium: 0 }
  })
  const startMs = buckets[0].date.getTime()
  rows.forEach(r => {
    if (!r.created_at) return
    const t = new Date(r.created_at).getTime()
    if (t < startMs) return
    const idx = Math.floor((t - startMs) / 864e5)
    if (idx >= 0 && idx < days) {
      buckets[idx].signups += 1
      if (r.is_premium) buckets[idx].premium += 1
    }
  })
  const maxV = Math.max(1, ...buckets.map(b => b.signups))

  return (
    <>
      <Panel title={`Signups — last ${days} days`}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 200, padding: '12px 4px', borderBottom: '1px solid #1d3152' }}>
          {buckets.map((b, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }} title={`${b.label}: ${b.signups} signups (${b.premium} premium)`}>
              <div style={{ fontSize: 10, color: '#98a2b5' }}>{b.signups || ''}</div>
              <div style={{ width: '100%', background: '#1d3152', borderRadius: 3, position: 'relative', height: `${(b.signups / maxV) * 160}px`, minHeight: b.signups ? 3 : 0 }}>
                {b.premium > 0 && (
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: '#ffd66a', borderRadius: 3, height: `${(b.premium / b.signups) * 100}%` }} />
                )}
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 16, marginTop: 12, fontSize: 12, color: '#98a2b5' }}>
          <span><span style={{ display: 'inline-block', width: 10, height: 10, background: '#1d3152', borderRadius: 2, marginRight: 6 }} />Signups</span>
          <span><span style={{ display: 'inline-block', width: 10, height: 10, background: '#ffd66a', borderRadius: 2, marginRight: 6 }} />Premium</span>
        </div>
      </Panel>

      <Panel title="Cumulative">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14 }}>
          <StatCard label="Total Signups (30d)" value={buckets.reduce((a, b) => a + b.signups, 0)} />
          <StatCard label="Premium (30d)" value={buckets.reduce((a, b) => a + b.premium, 0)} accent="#ffd66a" />
          <StatCard label="Avg / day" value={(buckets.reduce((a, b) => a + b.signups, 0) / days).toFixed(1)} />
        </div>
      </Panel>
    </>
  )
}

/* ═══════════════════════════════════════════════════════════ */
/*  REVENUE — actual Stripe payments                            */
/* ═══════════════════════════════════════════════════════════ */
function RevenueTab() {
  const [rows, setRows] = useState(null)
  const [err, setErr]   = useState('')
  const [range, setRange] = useState('30')   // days
  const [planFilter, setPlanFilter] = useState('all')

  useEffect(() => {
    let cancel = false
    ;(async () => {
      const { data, error } = await adminSupabase
        .from('payments')
        .select('id, email, plan, amount_cents, currency, status, granted_days, stripe_session_id, created_at')
        .order('created_at', { ascending: false })
        .limit(500)
      if (cancel) return
      if (error) setErr(error.message)
      else setRows(data ?? [])
    })()
    return () => { cancel = true }
  }, [])

  if (err) return <Err msg={err} />
  if (!rows) return <Loading />

  const days = parseInt(range, 10)
  const cutoff = Date.now() - days * 864e5
  const inRange = rows.filter(r => new Date(r.created_at).getTime() >= cutoff)
  const filtered = inRange.filter(r => planFilter === 'all' ? true : r.plan === planFilter)

  const totalAll  = rows.filter(r => r.status === 'paid').reduce((s, r) => s + (r.amount_cents || 0), 0) / 100
  const totalRng  = inRange.filter(r => r.status === 'paid').reduce((s, r) => s + (r.amount_cents || 0), 0) / 100
  const refunded  = rows.filter(r => r.status === 'refunded').reduce((s, r) => s + (r.amount_cents || 0), 0) / 100
  const numPaid   = inRange.filter(r => r.status === 'paid').length
  const aov       = numPaid ? totalRng / numPaid : 0

  // Daily revenue chart
  const today = new Date(); today.setHours(0,0,0,0)
  const buckets = Array.from({ length: days }, (_, i) => {
    const d = new Date(today); d.setDate(d.getDate() - (days - 1 - i))
    return { date: d, label: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }), revenue: 0, count: 0 }
  })
  const startMs = buckets[0].date.getTime()
  inRange.forEach(r => {
    if (r.status !== 'paid') return
    const t = new Date(r.created_at).getTime()
    if (t < startMs) return
    const idx = Math.floor((t - startMs) / 864e5)
    if (idx >= 0 && idx < days) {
      buckets[idx].revenue += (r.amount_cents || 0) / 100
      buckets[idx].count += 1
    }
  })
  const maxV = Math.max(1, ...buckets.map(b => b.revenue))

  // Per-plan breakdown
  const byPlan = inRange.reduce((acc, r) => {
    if (r.status !== 'paid') return acc
    const k = r.plan || 'unknown'
    if (!acc[k]) acc[k] = { count: 0, revenue: 0 }
    acc[k].count += 1
    acc[k].revenue += (r.amount_cents || 0) / 100
    return acc
  }, {})

  const downloadCsv = () => {
    const header = ['date','email','plan','amount','currency','status','granted_days','stripe_session_id']
    const lines = [header.join(',')]
    for (const r of filtered) {
      lines.push([
        new Date(r.created_at).toISOString(),
        JSON.stringify(r.email ?? ''),
        r.plan,
        ((r.amount_cents || 0) / 100).toFixed(2),
        r.currency,
        r.status,
        r.granted_days ?? '',
        r.stripe_session_id ?? '',
      ].join(','))
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `celpipace-revenue-${new Date().toISOString().slice(0,10)}.csv`
    document.body.appendChild(a); a.click(); a.remove()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14, marginBottom: 24 }}>
        <StatCard label="Revenue (all time)"   value={`$${totalAll.toFixed(2)}`} accent="#7dffb0" />
        <StatCard label={`Revenue (${days}d)`} value={`$${totalRng.toFixed(2)}`} accent="#7dffb0" />
        <StatCard label={`Payments (${days}d)`} value={numPaid} />
        <StatCard label="Avg order value"      value={`$${aov.toFixed(2)}`} />
        <StatCard label="Refunded"             value={`$${refunded.toFixed(2)}`} accent={refunded > 0 ? '#ff9a9a' : '#E6ECF5'} />
      </div>

      <Panel title={`Revenue — last ${days} days`}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 200, padding: '12px 4px', borderBottom: '1px solid #1d3152' }}>
          {buckets.map((b, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}
              title={`${b.label}: $${b.revenue.toFixed(2)} (${b.count} payments)`}>
              <div style={{ fontSize: 10, color: '#98a2b5' }}>{b.revenue ? `$${b.revenue.toFixed(0)}` : ''}</div>
              <div style={{ width: '100%', background: 'linear-gradient(180deg, #7dffb0, #2a9d5b)', borderRadius: 3,
                height: `${(b.revenue / maxV) * 160}px`, minHeight: b.revenue ? 3 : 0 }} />
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="By plan">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14 }}>
          {Object.entries(byPlan).length === 0 && (
            <div style={{ color: '#98a2b5', fontSize: 14 }}>No revenue in this window yet.</div>
          )}
          {Object.entries(byPlan).map(([k, v]) => (
            <StatCard key={k} label={k} value={`$${v.revenue.toFixed(2)}`} />
          ))}
        </div>
      </Panel>

      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <select value={range} onChange={e => setRange(e.target.value)} style={{ ...inputStyle, margin: 0, width: 140 }}>
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
          <option value="365">Last 365 days</option>
        </select>
        <select value={planFilter} onChange={e => setPlanFilter(e.target.value)} style={{ ...inputStyle, margin: 0, width: 160 }}>
          <option value="all">All plans</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="annual">Annual</option>
        </select>
        <button onClick={downloadCsv} style={btnPrimaryCompact}>⇣ Export CSV</button>
      </div>

      <Panel title="Recent payments">
        <Table
          cols={['Date', 'Email', 'Plan', 'Amount', 'Status', 'Stripe ID']}
          rows={filtered.slice(0, 100).map(r => [
            new Date(r.created_at).toLocaleString(),
            r.email,
            <Chip color="#ffd66a" text={(r.plan || '').toUpperCase()} />,
            <strong style={{ color: r.status === 'refunded' ? '#ff9a9a' : '#7dffb0' }}>
              ${((r.amount_cents || 0) / 100).toFixed(2)} {(r.currency || '').toUpperCase()}
            </strong>,
            r.status === 'paid'
              ? <Chip color="#7dffb0" text="PAID" />
              : <Chip color="#ff9a9a" text={(r.status || '').toUpperCase()} />,
            <code style={{ color: '#98a2b5', fontSize: 11 }}>{(r.stripe_session_id || '').slice(0, 18)}…</code>,
          ])}
          empty="No payments yet."
        />
      </Panel>
    </>
  )
}

/* ═══════════════════════════════════════════════════════════ */
/*  SHARED UI                                                   */
/* ═══════════════════════════════════════════════════════════ */
function friendlyName(email) {
  const local = (email || '').split('@')[0]
  if (!local) return 'Unknown user'
  return local
    .split(/[._-]+/)
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function formatRelativeTime(value) {
  if (!value) return 'never'
  const time = new Date(value).getTime()
  if (!Number.isFinite(time)) return 'never'
  const diff = Math.max(0, Date.now() - time)
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 30) return `${days}d ago`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months}mo ago`
  return `${Math.floor(months / 12)}y ago`
}

function StatCard({ label, value, accent = '#E6ECF5' }) {
  return (
    <div style={{ background: '#12223A', border: '1px solid #1d3152', borderRadius: 12, padding: '16px 18px' }}>
      <div style={{ fontSize: 11, color: '#98a2b5', letterSpacing: '.05em', textTransform: 'uppercase' }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 700, marginTop: 4, color: accent }}>{value}</div>
    </div>
  )
}

function Panel({ title, children }) {
  return (
    <div style={{ background: '#12223A', border: '1px solid #1d3152', borderRadius: 12, padding: 20, marginBottom: 20 }}>
      {title && <h3 style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 600, color: '#E6ECF5', letterSpacing: '.02em' }}>{title}</h3>}
      {children}
    </div>
  )
}

function Table({ cols, rows, empty }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
        <thead>
          <tr style={{ background: '#0F1F3D', textAlign: 'left' }}>
            {cols.map(c => <th key={c} style={thStyle}>{c}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} style={{ borderTop: '1px solid #1d3152' }}>
              {r.map((cell, j) => <td key={j} style={tdStyle}>{cell}</td>)}
            </tr>
          ))}
          {rows.length === 0 && (
            <tr><td colSpan={cols.length} style={{ ...tdStyle, textAlign: 'center', color: '#98a2b5', padding: 32 }}>{empty || 'No data.'}</td></tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

function Chip({ color, text }) {
  return <span style={{ background: color, color: '#0F1F3D', padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700 }}>{text}</span>
}

function Loading() { return <div style={{ color: '#98a2b5', padding: 20 }}>Loading…</div> }
function Err({ msg }) { return <div style={{ color: '#ff9a9a', padding: 20 }}>Error: {msg}</div> }

/* ═══════════════════════════════════════════════════════════ */
/*  OBSERVABILITY                                              */
/*  Per-user audit trail across:                                */
/*    - subscription_events (interpreted)                       */
/*    - cancellation_feedback                                   */
/*    - email_log                                               */
/*    - webhook_events (most recent, all users)                 */
/* ═══════════════════════════════════════════════════════════ */
function ObservabilityTab() {
  const [emailQuery, setEmailQuery] = useState('')
  const [activeEmail, setActiveEmail] = useState('')
  const [subEvents, setSubEvents] = useState(null)
  const [cancelFb, setCancelFb] = useState(null)
  const [emails, setEmails] = useState(null)
  const [webhooks, setWebhooks] = useState(null)
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  // Recent webhook_events on mount (across all users)
  useEffect(() => {
    let alive = true
    adminSupabase
      .from('webhook_events')
      .select('id, stripe_event_id, event_type, processed, processing_error, received_at, processed_at')
      .order('received_at', { ascending: false })
      .limit(50)
      .then(({ data, error }) => {
        if (!alive) return
        if (error) setErr(error.message)
        else setWebhooks(data)
      })
    return () => { alive = false }
  }, [])

  const lookup = async (e) => {
    e?.preventDefault?.()
    const target = emailQuery.trim().toLowerCase()
    if (!target) return
    setBusy(true)
    setErr('')
    setActiveEmail(target)
    try {
      const [s, c, m] = await Promise.all([
        adminSupabase.from('subscription_events')
          .select('id, created_at, event_type, prev_status, new_status, plan, amount_cents, currency, reason, stripe_event_id, stripe_invoice_id')
          .eq('email', target).order('created_at', { ascending: false }).limit(100),
        adminSupabase.from('cancellation_feedback')
          .select('id, created_at, reason, free_text, would_return, plan_at_cancel, current_period_end')
          .eq('email', target).order('created_at', { ascending: false }).limit(20),
        adminSupabase.from('email_log')
          .select('id, created_at, sent_at, kind, subject, status, provider_id, error, pdf_url')
          .eq('to_email', target).order('created_at', { ascending: false }).limit(50),
      ])
      if (s.error) throw s.error
      if (c.error) throw c.error
      if (m.error) throw m.error
      setSubEvents(s.data || [])
      setCancelFb(c.data || [])
      setEmails(m.data || [])
    } catch (ex) {
      setErr(ex.message || 'Lookup failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <h2 style={sectionTitleStyle}>Observability</h2>
      <p style={{ color: '#98a2b5', fontSize: 13, marginBottom: 20 }}>
        Per-user audit trail of subscription state changes, cancellations, and emails sent. Plus the 50 most recent Stripe webhook events.
      </p>

      <form onSubmit={lookup} style={{ display: 'flex', gap: 8, marginBottom: 20, maxWidth: 480 }}>
        <input
          type="email"
          placeholder="user@example.com"
          value={emailQuery}
          onChange={(e) => setEmailQuery(e.target.value)}
          style={{ ...inputStyle, flex: 1 }}
        />
        <button type="submit" disabled={busy || !emailQuery.trim()} style={btnPrimaryCompact}>
          {busy ? 'Loading…' : 'Lookup'}
        </button>
      </form>

      {err && <Err msg={err} />}

      {activeEmail && subEvents && (
        <div style={{ marginBottom: 28 }}>
          <h3 style={subTitleStyle}>Subscription events for {activeEmail}</h3>
          <Table
            cols={['When', 'Event', 'Prev', 'New', 'Plan', 'Amount', 'Reason', 'Stripe event']}
            rows={subEvents.map(r => [
              new Date(r.created_at).toLocaleString(),
              r.event_type,
              r.prev_status || '—',
              r.new_status || '—',
              r.plan || '—',
              r.amount_cents != null ? `${(r.currency || 'cad').toUpperCase()} $${(r.amount_cents / 100).toFixed(2)}` : '—',
              r.reason || '—',
              r.stripe_event_id || r.stripe_invoice_id || '—',
            ])}
            empty="No subscription events for this email."
          />
        </div>
      )}

      {activeEmail && cancelFb && cancelFb.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <h3 style={subTitleStyle}>Cancellation feedback</h3>
          <Table
            cols={['When', 'Reason', 'Would return?', 'Plan at cancel', 'Period end', 'Note']}
            rows={cancelFb.map(r => [
              new Date(r.created_at).toLocaleString(),
              r.reason,
              r.would_return == null ? 'Not sure' : r.would_return ? 'Yes' : 'No',
              r.plan_at_cancel || '—',
              r.current_period_end ? new Date(r.current_period_end).toLocaleDateString() : '—',
              r.free_text || '—',
            ])}
          />
        </div>
      )}

      {activeEmail && emails && (
        <div style={{ marginBottom: 28 }}>
          <h3 style={subTitleStyle}>Email log</h3>
          <Table
            cols={['When', 'Sent', 'Kind', 'Subject', 'Status', 'Error', 'PDF']}
            rows={emails.map(r => [
              new Date(r.created_at).toLocaleString(),
              r.sent_at ? new Date(r.sent_at).toLocaleString() : '—',
              r.kind,
              r.subject || '—',
              <Chip
                key={r.id}
                color={r.status === 'sent' ? '#a7f3d0' : r.status === 'failed' ? '#fecaca' : '#fde68a'}
                text={r.status}
              />,
              r.error || '—',
              r.pdf_url ? <a href={r.pdf_url} target="_blank" rel="noreferrer" style={{ color: '#ffd66a' }}>PDF</a> : '—',
            ])}
            empty="No emails sent to this address yet."
          />
        </div>
      )}

      <div>
        <h3 style={subTitleStyle}>Recent webhook events (last 50)</h3>
        {!webhooks ? <Loading /> : (
          <Table
            cols={['Received', 'Type', 'Processed', 'Stripe event id', 'Error']}
            rows={webhooks.map(r => [
              new Date(r.received_at).toLocaleString(),
              r.event_type,
              r.processed
                ? <Chip key={r.id + 'p'} color="#a7f3d0" text="ok" />
                : <Chip key={r.id + 'p'} color="#fecaca" text="pending/failed" />,
              r.stripe_event_id || '—',
              r.processing_error || '—',
            ])}
          />
        )}
      </div>
    </>
  )
}

const sectionTitleStyle = { margin: '0 0 6px', fontSize: 22, fontWeight: 700 }
const subTitleStyle = { margin: '0 0 10px', fontSize: 15, fontWeight: 600, color: '#E6ECF5' }

/* ── Styles ── */
const shellStyle = {
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #0B1626 0%, #0F1F3D 100%)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
}
const cardStyle = {
  background: '#12223A', border: '1px solid #1d3152', borderRadius: 16, padding: 32,
  width: '100%', maxWidth: 380, boxShadow: '0 30px 60px rgba(0,0,0,.4)',
}
const labelStyle = {
  display: 'block', fontSize: 12, color: '#98a2b5', letterSpacing: '.05em',
  textTransform: 'uppercase', marginBottom: 6, marginTop: 12,
}
const inputStyle = {
  width: '100%', background: '#0B1626', border: '1px solid #1d3152', borderRadius: 8,
  color: '#E6ECF5', padding: '10px 12px', fontSize: 14, outline: 'none', boxSizing: 'border-box',
}
const btnPrimaryStyle = {
  marginTop: 20, width: '100%', background: 'linear-gradient(135deg, #ffd66a, #f5b800)',
  color: '#0F1F3D', border: 'none', borderRadius: 8, padding: '11px 16px',
  fontSize: 14, fontWeight: 700, cursor: 'pointer',
}
const btnPrimaryCompact = {
  background: 'linear-gradient(135deg, #ffd66a, #f5b800)', color: '#0F1F3D', border: 'none',
  borderRadius: 8, padding: '10px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer',
}
const btnGhostStyle = {
  background: 'transparent', border: '1px solid #1d3152', color: '#E6ECF5',
  padding: '8px 14px', borderRadius: 8, fontSize: 13, cursor: 'pointer',
}
const btnSmallStyle = {
  background: '#0B1626', border: '1px solid #1d3152', color: '#ffd66a',
  padding: '6px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer',
}
const thStyle = { padding: '12px 14px', fontSize: 11, color: '#98a2b5', fontWeight: 600, letterSpacing: '.04em', textTransform: 'uppercase' }
const tdStyle = { padding: '12px 14px', color: '#E6ECF5', verticalAlign: 'middle' }
