/* ══════════════════════════════════════════════════════════════
   studyPlan — adaptive, multi-week CELPIP study plan
   - Config (target date, target CLB, days/week) persists to localStorage
     per user and syncs to the `study_plans` Supabase table.
   - The week-by-week plan is generated deterministically from the config
     plus the user's live section stats, so it adapts as scores improve.
   - Task completion is tracked locally, keyed to the plan version so that
     editing the config starts a fresh checklist.
══════════════════════════════════════════════════════════════ */
import { supabase } from './supabase'

const CONFIG_KEY = 'celpipiq_studyplan'
const DONE_KEY = 'celpipiq_studyplan_done'
const GUEST = 'guest'

export const PLAN_SECTIONS = [
  { key: 'listening', label: 'Listening', icon: '🎧', color: '#4A90D9', route: '/celpip-listening-practice', parts: ['L1', 'L2', 'L3', 'L4', 'L5', 'L6'] },
  { key: 'reading', label: 'Reading', icon: '📖', color: '#2D8A56', route: '/celpip-reading-practice', parts: ['R1', 'R2', 'R3', 'R4'] },
  { key: 'writing', label: 'Writing', icon: '✍️', color: '#C8972A', route: '/celpip-writing-practice', parts: ['W1', 'W2'] },
  { key: 'speaking', label: 'Speaking', icon: '🎙️', color: '#C8102E', route: '/celpip-speaking-practice', parts: ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8'] },
]

const SECTION_BY_KEY = Object.fromEntries(PLAN_SECTIONS.map(s => [s.key, s]))

/* ── storage helpers ── */
function uid(userId) { return userId || GUEST }
function configKey(userId) { return `${CONFIG_KEY}:${uid(userId)}` }
function doneKey(userId) { return `${DONE_KEY}:${uid(userId)}` }

export function loadPlanConfig(userId = null) {
  try {
    const raw = localStorage.getItem(configKey(userId))
    if (!raw) return null
    const c = JSON.parse(raw)
    if (!c || !c.targetDate) return null
    return c
  } catch { return null }
}

export function savePlanConfigLocal(userId, config) {
  try { localStorage.setItem(configKey(userId), JSON.stringify(config)) } catch { void 0 }
}

export function clearPlanConfigLocal(userId) {
  try {
    localStorage.removeItem(configKey(userId))
    localStorage.removeItem(doneKey(userId))
  } catch { void 0 }
}

/* version stamp ties the task checklist to a specific config */
export function planVersion(config) {
  if (!config) return ''
  return `${config.targetDate}|${config.targetCLB}|${config.daysPerWeek}|${config.createdAt || ''}`
}

export function loadDoneTasks(userId, version) {
  try {
    const raw = localStorage.getItem(doneKey(userId))
    if (!raw) return {}
    const obj = JSON.parse(raw)
    if (obj.version !== version) return {}
    return obj.done || {}
  } catch { return {} }
}

export function saveDoneTasks(userId, version, done) {
  try { localStorage.setItem(doneKey(userId), JSON.stringify({ version, done })) } catch { void 0 }
}

/* ── cloud sync ── */
export async function fetchPlanConfigCloud() {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) return null
    const { data, error } = await supabase
      .from('study_plans')
      .select('target_date, target_clb, days_per_week, created_at')
      .eq('user_id', session.user.id)
      .maybeSingle()
    if (error || !data) return null
    return {
      targetDate: data.target_date,
      targetCLB: data.target_clb,
      daysPerWeek: data.days_per_week,
      createdAt: data.created_at,
    }
  } catch { return null }
}

export async function savePlanConfigCloud(config) {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) return
    await supabase.from('study_plans').upsert({
      user_id: session.user.id,
      target_date: config.targetDate,
      target_clb: config.targetCLB,
      days_per_week: config.daysPerWeek,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })
  } catch { void 0 }
}

export async function deletePlanConfigCloud() {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) return
    await supabase.from('study_plans').delete().eq('user_id', session.user.id)
  } catch { void 0 }
}

/* ── date helpers ── */
function startOfDay(d) { const x = new Date(d); x.setHours(0, 0, 0, 0); return x }
function addDays(d, n) { const x = new Date(d); x.setDate(x.getDate() + n); return x }
function fmtDate(d) {
  return new Date(d).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })
}
function isoDate(d) { return new Date(d).toISOString().slice(0, 10) }

export function daysUntil(targetDate) {
  const today = startOfDay(new Date())
  const target = startOfDay(new Date(targetDate))
  return Math.round((target - today) / 86400000)
}

/* ══════════════════════════════════════════════════════════════
   generatePlan(config, sectionsStats)
   sectionsStats: stats.sections from useProgress (may be partial/empty)
   Returns { weeks, weeksLeft, daysLeft, overdue, focusOrder, startCLB }
══════════════════════════════════════════════════════════════ */
export function generatePlan(config, sectionsStats = {}) {
  const target = config.targetCLB || 9
  const perWeek = Math.min(7, Math.max(1, config.daysPerWeek || 5))
  const dLeft = daysUntil(config.targetDate)
  const overdue = dLeft < 0
  const daysLeft = Math.max(0, dLeft)
  // At least one week of plan; cap horizon so it stays readable.
  const weeksLeft = overdue ? 1 : Math.min(16, Math.max(1, Math.ceil(daysLeft / 7)))

  // Current band per section (null → not practised yet, assume a low start).
  const ASSUMED_START = 5
  const sectionInfo = PLAN_SECTIONS.map(s => {
    const ss = sectionsStats[s.key] || {}
    const current = ss.avgCLB != null ? ss.avgCLB : null
    const effective = current != null ? current : ASSUMED_START
    const gap = Math.max(0, target - effective)
    return { ...s, current, effective, gap, done: ss.done || 0, total: ss.total || 0 }
  })

  // Overall starting band = mean of effective bands.
  const startCLB = Math.round(
    sectionInfo.reduce((a, s) => a + s.effective, 0) / sectionInfo.length
  )

  // Priority order: largest gap first; tie-break by least-practised.
  const focusOrder = [...sectionInfo].sort((a, b) => (b.gap - a.gap) || (a.done - b.done))

  // Build a rotation that front-loads weak sections but covers everything.
  const rotation = []
  const ranked = focusOrder.map(s => s.key)
  for (let i = 0; i < weeksLeft; i++) {
    const primary = ranked[i % ranked.length]
    const secondary = ranked[(i + 1) % ranked.length]
    rotation.push([primary, secondary])
  }

  const today = startOfDay(new Date())
  const weeks = []
  for (let i = 0; i < weeksLeft; i++) {
    const wStart = addDays(today, i * 7)
    const wEnd = addDays(wStart, 6)
    const status = i === 0 ? 'current' : 'upcoming'
    const [primaryKey, secondaryKey] = rotation[i]
    const primary = SECTION_BY_KEY[primaryKey]
    const secondary = SECTION_BY_KEY[secondaryKey]

    // Interpolated milestone band for this week.
    const milestone = Math.min(
      target,
      Math.round(startCLB + ((target - startCLB) * (i + 1)) / weeksLeft)
    )

    // Distribute the week's sessions across focus + review + mock.
    const isFinalStretch = i >= weeksLeft - 2 && weeksLeft > 1
    const primarySets = Math.max(2, Math.round(perWeek * 0.5))
    const secondarySets = Math.max(1, Math.round(perWeek * 0.3))

    const tasks = []
    tasks.push({
      type: 'practice',
      label: `${primarySets} ${primary.label} sets — focus ${suggestParts(primary, 2)}`,
      route: primary.route,
      icon: primary.icon,
    })
    tasks.push({
      type: 'practice',
      label: `${secondarySets} ${secondary.label} sets — ${suggestParts(secondary, 1)}`,
      route: secondary.route,
      icon: secondary.icon,
    })
    tasks.push({
      type: 'review',
      label: 'Review your missed questions (spaced repetition)',
      route: '/review',
      icon: '🔁',
    })
    if (isFinalStretch) {
      tasks.push({
        type: 'mock',
        label: i === weeksLeft - 1 ? 'Final full timed mock exam' : '1 full timed mock exam',
        route: '/exam',
        icon: '📝',
      })
    } else if (perWeek >= 5) {
      tasks.push({
        type: 'mock',
        label: 'Optional: 1 half-length timed practice',
        route: '/exam',
        icon: '⏱️',
      })
    }

    weeks.push({
      index: i + 1,
      label: `Week ${i + 1}`,
      startDate: isoDate(wStart),
      endDate: isoDate(wEnd),
      rangeLabel: `${fmtDate(wStart)} – ${fmtDate(wEnd)}`,
      status,
      focus: [primaryKey, secondaryKey],
      milestoneCLB: milestone,
      tasks,
    })
  }

  return { weeks, weeksLeft, daysLeft, overdue, focusOrder, startCLB, target, perWeek }
}

/* Suggest the weakest n parts of a section by simple heuristic (first n parts
   when no finer data is available). Kept deterministic for stable plans. */
function suggestParts(section, n) {
  const parts = section.parts.slice(0, n)
  return parts.join(' & ')
}

/* ══════════════════════════════════════════════════════════════
   Learning-path persistence — the full journey intake + gamified
   path progress (XP, completed step ids). Cloud rows live on the
   same study_plans table (journey + path_progress JSONB columns),
   with a localStorage mirror so guests and offline users keep state.
══════════════════════════════════════════════════════════════ */
const JOURNEY_KEY = 'celpipiq_journey'
const PATH_KEY = 'celpipiq_pathprogress'

function journeyKey(userId) { return `${JOURNEY_KEY}:${uid(userId)}` }
function pathKey(userId) { return `${PATH_KEY}:${uid(userId)}` }

function deriveTargetDate(journey) {
  if (journey?.examDate) return journey.examDate
  const d = new Date(); d.setDate(d.getDate() + 14)
  return d.toISOString().slice(0, 10)
}

export function saveJourneyLocal(userId, journey) {
  try { localStorage.setItem(journeyKey(userId), JSON.stringify(journey)) } catch { void 0 }
}
export function loadJourneyLocal(userId = null) {
  try {
    const raw = localStorage.getItem(journeyKey(userId))
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}
export function savePathProgressLocal(userId, progress) {
  try { localStorage.setItem(pathKey(userId), JSON.stringify(progress)) } catch { void 0 }
}
export function loadPathProgressLocal(userId = null) {
  try {
    const raw = localStorage.getItem(pathKey(userId))
    return raw ? JSON.parse(raw) : { xp: 0, completed: [] }
  } catch { return { xp: 0, completed: [] } }
}

export async function saveJourneyCloud(journey) {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) return
    await supabase.from('study_plans').upsert({
      user_id: session.user.id,
      target_date: deriveTargetDate(journey),
      target_clb: journey?.targetCLB || 9,
      days_per_week: (journey?.hoursPerDay || 2) >= 2 ? 7 : 5,
      journey,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })
  } catch { void 0 }
}

export async function savePathProgressCloud(progress) {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) return
    await supabase.from('study_plans')
      .update({ path_progress: progress, updated_at: new Date().toISOString() })
      .eq('user_id', session.user.id)
  } catch { void 0 }
}

export async function fetchJourneyCloud() {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) return null
    const { data, error } = await supabase
      .from('study_plans')
      .select('journey, path_progress, target_date, target_clb')
      .eq('user_id', session.user.id)
      .maybeSingle()
    if (error || !data) return null
    return {
      journey: data.journey || null,
      pathProgress: data.path_progress && Object.keys(data.path_progress).length
        ? data.path_progress
        : { xp: 0, completed: [] },
    }
  } catch { return null }
}
