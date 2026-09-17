/* ══════════════════════════════════════════════════════════════
   sprintPlan — day-aware CELPIP plan for the landing-page journey.

   Unlike lib/studyPlan.js (which is week-based and reads tracked
   section stats), this is a PURE module with no network deps. It
   takes what a first-time visitor can actually tell us — test date,
   a previous CELPIP score OR self-flagged weak areas, target band,
   and time per day — and returns a concrete plan.

   Most visitors arrive with only 3–4 days left, so short windows get
   a DAY-BY-DAY plan (with the day before the test reserved for light
   review + logistics). Longer windows fall back to a weekly view.
══════════════════════════════════════════════════════════════ */

export const SPRINT_SECTIONS = [
  { key: 'listening', label: 'Listening', icon: '🎧', color: '#4A90D9', route: '/celpip-listening-practice', kind: 'receptive' },
  { key: 'reading', label: 'Reading', icon: '📖', color: '#2D8A56', route: '/celpip-reading-practice', kind: 'receptive' },
  { key: 'writing', label: 'Writing', icon: '✍️', color: '#C8972A', route: '/celpip-writing-practice', kind: 'productive' },
  { key: 'speaking', label: 'Speaking', icon: '🎙️', color: '#C8102E', route: '/celpip-speaking-practice', kind: 'productive' },
]

const SECTION_BY_KEY = Object.fromEntries(SPRINT_SECTIONS.map(s => [s.key, s]))

// When we don't know a section's level, assume a low-ish start so the
// plan errs toward more practice. A flagged weak area starts lower still.
const ASSUMED_UNKNOWN = 6
const ASSUMED_WEAK = 4

const MOCK_ROUTE = '/exam'
const REVIEW_ROUTE = '/review'

const clampCLB = (n) => Math.min(12, Math.max(3, Math.round(n)))
const numOrNull = (v) => (Number.isFinite(Number(v)) && v !== '' && v != null ? Number(v) : null)

/* ── date helpers (local-time safe) ── */
function startOfDay(d) { const x = new Date(d); x.setHours(0, 0, 0, 0); return x }
function addDays(d, n) { const x = new Date(d); x.setDate(x.getDate() + n); return x }
function fmtDay(d) {
  return new Date(d).toLocaleDateString('en-CA', { weekday: 'short', month: 'short', day: 'numeric' })
}

export function daysUntil(targetDate) {
  if (!targetDate) return null
  const diff = Math.round((startOfDay(new Date(targetDate)) - startOfDay(new Date())) / 86400000)
  return Number.isFinite(diff) ? diff : null
}

/* How many work items to put on a study day, by time budget. */
function tasksForHours(hoursPerDay) {
  if (hoursPerDay >= 3) return 4
  if (hoursPerDay >= 2) return 3
  return 2
}

/* ── per-section task templates ── */
function deepWorkTask(section, hoursPerDay) {
  const sets = hoursPerDay >= 3 ? 3 : 2
  if (section.kind === 'productive') {
    return {
      type: 'practice',
      icon: section.icon,
      route: section.route,
      label: `Write/record ${sets} timed ${section.label} tasks — get instant AI feedback`,
    }
  }
  return {
    type: 'practice',
    icon: section.icon,
    route: section.route,
    label: `${sets} timed ${section.label} sets — full focus`,
  }
}

function lightTask(section) {
  if (section.kind === 'productive') {
    return {
      type: 'study',
      icon: section.icon,
      route: section.route,
      label: `Study one high-band ${section.label} model answer and copy its structure`,
    }
  }
  return {
    type: 'practice',
    icon: section.icon,
    route: section.route,
    label: `1 quick ${section.label} set to keep it warm`,
  }
}

const REVIEW_TASK = {
  type: 'review',
  icon: '🔁',
  route: REVIEW_ROUTE,
  label: 'Review every wrong answer — note the trap that caught you',
}

const MOCK_TASK = {
  type: 'mock',
  icon: '📝',
  route: MOCK_ROUTE,
  label: 'One timed mini-mock to build exam stamina',
}

function diagnosticTask(weakKeys) {
  const labels = weakKeys.map(k => SECTION_BY_KEY[k].label).join(' & ')
  return {
    type: 'diagnostic',
    icon: '🧭',
    route: SECTION_BY_KEY[weakKeys[0]].route,
    label: `Quick diagnostic: one short set in ${labels} to confirm your real starting point`,
  }
}

/* The day before the exam — protect it. No heavy new practice. */
function eveDay(dateObj, target) {
  return {
    isRestDay: true,
    focusKeys: [],
    milestoneCLB: target,
    tasks: [
      { type: 'review', icon: '🗒️', route: REVIEW_ROUTE, label: 'Light review only — skim your saved mistakes, no new sets' },
      { type: 'study', icon: '✍️', route: '/celpip-writing-practice', label: 'Re-read one Writing and one Speaking template you trust' },
      { type: 'logistics', icon: '🎒', route: null, label: 'Pack ID, confirm centre & time, then sleep early — you peak rested' },
    ],
  }
}

function testDay() {
  return {
    isRestDay: true,
    focusKeys: [],
    milestoneCLB: null,
    tasks: [
      { type: 'logistics', icon: '☕', route: null, label: 'Light 10-min warm-up on your strongest section — just to switch your brain on' },
      { type: 'logistics', icon: '🧘', route: null, label: 'Arrive early, breathe, and trust your prep. You\'ve done the work.' },
    ],
  }
}

/* ══════════════════════════════════════════════════════════════
   generateSprintPlan(input)
   input: {
     daysLeft,            // integer >= 0, or null/NaN when "not booked"
     targetCLB = 9,
     levels = {},         // { listening, reading, writing, speaking } CLB or null
     weakAreas = [],      // section keys the user flagged as weak
     hoursPerDay = 2,
   }
   Returns { mode, daysLeft, booked, focusOrder, target, startCLB,
             summary, days?: [...], weeks?: [...] }
══════════════════════════════════════════════════════════════ */
export function generateSprintPlan({
  daysLeft,
  targetCLB = 9,
  levels = {},
  weakAreas = [],
  hoursPerDay = 2,
} = {}) {
  const target = clampCLB(targetCLB)

  // Score each section: bigger gap + a flagged-weak bump = higher priority.
  const sections = SPRINT_SECTIONS.map(s => {
    const lvl = numOrNull(levels[s.key])
    const flaggedWeak = weakAreas.includes(s.key)
    const effective = lvl != null ? lvl : (flaggedWeak ? ASSUMED_WEAK : ASSUMED_UNKNOWN)
    const gap = Math.max(0, target - effective)
    const priority = gap + (flaggedWeak ? 1.5 : 0)
    return { ...s, level: lvl, effective, gap, flaggedWeak, priority }
  })

  const focusOrder = [...sections].sort(
    (a, b) => b.priority - a.priority || a.label.localeCompare(b.label)
  )
  const startCLB = clampCLB(
    sections.reduce((a, s) => a + s.effective, 0) / sections.length
  )

  const booked = Number.isFinite(daysLeft)
  const n = booked ? Math.max(0, Math.floor(daysLeft)) : 14
  const top = focusOrder.slice(0, 2).map(s => s.label)
  const summary = `Your plan front-loads ${top.join(' and ')} — your biggest gaps to CLB ${target}.`

  // Long horizon → weekly view; short (the common case) → day-by-day.
  if (n > 12) {
    return { mode: 'standard', booked, daysLeft: n, focusOrder, target, startCLB, summary, weeks: buildWeeks(n, focusOrder, target, startCLB, hoursPerDay) }
  }

  return { mode: 'sprint', booked, daysLeft: n, focusOrder, target, startCLB, summary, days: buildDays(n, focusOrder, target, startCLB, weakAreas, hoursPerDay) }
}

/* ── day-by-day builder (sprints) ── */
function buildDays(n, focusOrder, target, startCLB, weakAreas, hoursPerDay) {
  const today = startOfDay(new Date())
  const ranked = focusOrder.map(s => s.key)
  const weakKeys = (weakAreas.length ? weakAreas : ranked.slice(0, 2))

  // Test today.
  if (n <= 0) {
    return [dayCard(today, 0, 'Test day', testDay())]
  }
  // Test tomorrow — one eve-style day only.
  if (n === 1) {
    return [dayCard(today, 1, '1 day to go', eveDay(today, target))]
  }

  const activeDays = n - 1 // reserve the last day as the eve
  const budget = tasksForHours(hoursPerDay)
  // Put a mini-mock on a middle day when there's room and time.
  const mockDayIdx = activeDays >= 3 && hoursPerDay >= 2 ? Math.floor(activeDays / 2) : -1

  const days = []
  for (let i = 0; i < activeDays; i++) {
    const primary = SECTION_BY_KEY[ranked[i % ranked.length]]
    const secondary = SECTION_BY_KEY[ranked[(i + 1) % ranked.length]]
    const milestone = clampCLB(startCLB + ((target - startCLB) * (i + 1)) / n)

    const tasks = []
    if (i === 0) tasks.push(diagnosticTask(weakKeys))
    tasks.push(deepWorkTask(primary, hoursPerDay))
    if (budget >= 3) tasks.push(lightTask(secondary))
    if (i === mockDayIdx) tasks.push(MOCK_TASK)
    tasks.push(REVIEW_TASK)

    days.push(dayCard(addDays(today, i), i + 1, null, {
      isRestDay: false,
      focusKeys: budget >= 3 ? [primary.key, secondary.key] : [primary.key],
      milestoneCLB: milestone,
      tasks: tasks.slice(0, budget + (i === 0 ? 1 : 0)), // diagnostic is a freebie on day 1
    }))
  }

  days.push(dayCard(addDays(today, n - 1), n, 'Day before test', eveDay(addDays(today, n - 1), target)))
  return days
}

function dayCard(dateObj, dayNumber, labelOverride, body) {
  return {
    dayNumber,
    label: labelOverride || `Day ${dayNumber}`,
    dateLabel: fmtDay(dateObj),
    ...body,
  }
}

/* ── weekly builder (longer horizons) ── */
function buildWeeks(n, focusOrder, target, startCLB, hoursPerDay) {
  const weeksLeft = Math.min(16, Math.max(1, Math.ceil(n / 7)))
  const ranked = focusOrder.map(s => s.key)
  const today = startOfDay(new Date())
  const budget = tasksForHours(hoursPerDay)
  const weeks = []

  for (let i = 0; i < weeksLeft; i++) {
    const primary = SECTION_BY_KEY[ranked[i % ranked.length]]
    const secondary = SECTION_BY_KEY[ranked[(i + 1) % ranked.length]]
    const milestone = clampCLB(startCLB + ((target - startCLB) * (i + 1)) / weeksLeft)
    const isFinalStretch = i >= weeksLeft - 2 && weeksLeft > 1

    const tasks = [deepWorkTask(primary, hoursPerDay)]
    if (budget >= 3) tasks.push(lightTask(secondary))
    tasks.push(REVIEW_TASK)
    if (isFinalStretch) tasks.push(MOCK_TASK)

    weeks.push({
      index: i + 1,
      label: `Week ${i + 1}`,
      rangeLabel: `${fmtDay(addDays(today, i * 7))} – ${fmtDay(addDays(today, i * 7 + 6))}`,
      focusKeys: [primary.key, secondary.key],
      milestoneCLB: milestone,
      tasks,
    })
  }
  return weeks
}

/* Map a journey result to the config shape lib/studyPlan.js persists,
   so a saved plan re-opens cleanly on the full Study Plan page. */
export function toPlanConfig({ targetDate, targetCLB, hoursPerDay }) {
  return {
    targetDate,
    targetCLB: clampCLB(targetCLB || 9),
    // Sprints assume daily study; map heavier days to the 7/wk ceiling.
    daysPerWeek: hoursPerDay >= 2 ? 7 : 5,
    createdAt: new Date().toISOString(),
  }
}
