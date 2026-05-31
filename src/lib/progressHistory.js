/* ══════════════════════════════════════════════════════════════
   progressHistory — time-series analytics from practice_attempts.
   Builds per-section and overall CLB trends over time so the
   Progress page can render charts. Read-only; no new tables.

   Scoring:
   - Listening/Reading store pct (0-100) → mapped to CLB (3-12).
   - Writing/Speaking store the CLB band directly as `score` (total 12).
══════════════════════════════════════════════════════════════ */
import { supabase } from './supabase'

export const TRACKED_SECTIONS = ['listening', 'reading', 'writing', 'speaking']

export const SECTION_STYLE = {
  listening: { label: 'Listening', icon: '🎧', color: '#4A90D9' },
  reading:   { label: 'Reading',   icon: '📖', color: '#2D8A56' },
  writing:   { label: 'Writing',   icon: '✍️',  color: '#C8972A' },
  speaking:  { label: 'Speaking',  icon: '🎙️', color: '#C8102E' },
}

const CLB_SECTIONS = new Set(['writing', 'speaking'])

export function pctToCLB(pct) {
  if (pct == null) return null
  if (pct >= 95) return 12
  if (pct >= 90) return 11
  if (pct >= 85) return 10
  if (pct >= 78) return 9
  if (pct >= 70) return 8
  if (pct >= 60) return 7
  if (pct >= 50) return 6
  if (pct >= 40) return 5
  if (pct >= 30) return 4
  return 3
}

/* Convert a raw attempt row into a CLB band (0-12) on a common scale. */
function attemptCLB(row) {
  if (CLB_SECTIONS.has(row.section)) {
    const v = Number(row.score)
    return Number.isFinite(v) ? Math.max(0, Math.min(12, Math.round(v))) : null
  }
  const pct = row.pct != null
    ? Number(row.pct)
    : (Number(row.total) > 0 ? Math.round((Number(row.score) / Number(row.total)) * 100) : null)
  return pctToCLB(pct)
}

function dayKey(d) { return new Date(d).toISOString().slice(0, 10) }

/* ══════════════════════════════════════════════════════════════
   fetchProgressHistory()
   Returns {
     attempts:   normalized rows (oldest → newest),
     sections:   { [section]: [{ date, clb, pct }] }   // per-attempt points
     daily:      { [section]: [{ date, clb }] }         // daily averages
     overallDaily: [{ date, clb }]                      // overall daily avg
     volume:     [{ date, count }]                      // attempts/day (last 30d)
     summary:    per-section { attempts, latestCLB, bestCLB, firstCLB, trend }
   }
══════════════════════════════════════════════════════════════ */
export async function fetchProgressHistory() {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) return emptyHistory()

  const { data, error } = await supabase
    .from('practice_attempts')
    .select('section, part_id, score, total, pct, created_at')
    .eq('user_id', session.user.id)
    .in('section', TRACKED_SECTIONS)
    .order('created_at', { ascending: true })
    .limit(2000)

  if (error || !data) {
    if (error) console.warn('[progressHistory] fetch error:', error.message)
    return emptyHistory()
  }

  const attempts = data
    .map(r => {
      const clb = attemptCLB(r)
      if (clb == null) return null
      return {
        section: r.section,
        date: dayKey(r.created_at),
        ts: new Date(r.created_at).getTime(),
        clb,
        pct: r.pct != null ? Number(r.pct) : null,
      }
    })
    .filter(Boolean)

  // Per-section attempt points + daily averages
  const sections = {}
  const daily = {}
  const summary = {}
  for (const sec of TRACKED_SECTIONS) {
    const pts = attempts.filter(a => a.section === sec)
    sections[sec] = pts.map(p => ({ date: p.date, clb: p.clb, pct: p.pct }))
    daily[sec] = averageByDay(pts)
    summary[sec] = summarize(pts)
  }

  // Overall daily average across sections (mean of all attempts that day)
  const overallDaily = averageByDay(attempts)

  // Volume over the last 30 days
  const volume = volumeByDay(attempts, 30)

  return { attempts, sections, daily, overallDaily, volume, summary }
}

function averageByDay(points) {
  const byDay = new Map()
  for (const p of points) {
    const cur = byDay.get(p.date) || { sum: 0, n: 0 }
    cur.sum += p.clb
    cur.n += 1
    byDay.set(p.date, cur)
  }
  return [...byDay.entries()]
    .sort((a, b) => (a[0] < b[0] ? -1 : 1))
    .map(([date, { sum, n }]) => ({ date, clb: Math.round((sum / n) * 10) / 10 }))
}

function volumeByDay(points, days) {
  const out = []
  const today = new Date()
  const counts = new Map()
  for (const p of points) counts.set(p.date, (counts.get(p.date) || 0) + 1)
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    out.push({ date: key, count: counts.get(key) || 0 })
  }
  return out
}

function summarize(points) {
  if (points.length === 0) {
    return { attempts: 0, latestCLB: null, bestCLB: null, firstCLB: null, trend: 0 }
  }
  const first = points[0].clb
  const latest = points[points.length - 1].clb
  const best = Math.max(...points.map(p => p.clb))
  // Trend: average of last 3 vs first 3 (rounded to 0.1)
  const head = points.slice(0, 3)
  const tail = points.slice(-3)
  const headAvg = head.reduce((a, p) => a + p.clb, 0) / head.length
  const tailAvg = tail.reduce((a, p) => a + p.clb, 0) / tail.length
  const trend = Math.round((tailAvg - headAvg) * 10) / 10
  return { attempts: points.length, latestCLB: latest, bestCLB: best, firstCLB: first, trend }
}

function emptyHistory() {
  const sections = {}, daily = {}, summary = {}
  for (const sec of TRACKED_SECTIONS) {
    sections[sec] = []
    daily[sec] = []
    summary[sec] = { attempts: 0, latestCLB: null, bestCLB: null, firstCLB: null, trend: 0 }
  }
  return { attempts: [], sections, daily, overallDaily: [], volume: [], summary }
}
