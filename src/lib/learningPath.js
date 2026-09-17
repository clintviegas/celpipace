/* ══════════════════════════════════════════════════════════════
   learningPath — turns a journey intake into a gamified, adaptive
   sequence of practice "nodes" the user walks step by step.

   - Weakness-first: the weakest skills get the most nodes, front-loaded.
   - Premium-aware: free users are routed to free parts (first set);
     premium unlocks the harder parts of every section.
   - Each node carries XP; review + mock "boss" nodes punctuate the path.

   Pure module (no network). Persistence helpers live in lib/studyPlan.js.
══════════════════════════════════════════════════════════════ */
import { FREE_PARTS } from '../data/constants'
import { generateSprintPlan, SPRINT_SECTIONS } from './sprintPlan'

const SECTION_BY_KEY = Object.fromEntries(SPRINT_SECTIONS.map(s => [s.key, s]))

// Difficulty ladder per section (easy → hard). Free users only ever see
// the parts in FREE_PARTS; premium unlocks the rest.
const PART_LADDER = {
  listening: ['L1', 'L2', 'L3', 'L4', 'L5', 'L6'],
  reading: ['R1', 'R2', 'R3', 'R4'],
  writing: ['W1', 'W2'],
  speaking: ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8'],
}

const PART_LABELS = {
  L1: 'Problem Solving', L2: 'Daily Life Conversation', L3: 'Information',
  L4: 'News Item', L5: 'Discussion', L6: 'Viewpoints',
  R1: 'Correspondence', R2: 'Diagram', R3: 'Information', R4: 'Viewpoints',
  W1: 'Email', W2: 'Survey Response',
  S1: 'Advice', S2: 'Personal Experience', S3: 'Describing a Scene',
  S4: 'Predictions', S5: 'Comparing & Persuading', S6: 'Difficult Situation',
  S7: 'Opinions', S8: 'Unusual Situation',
}

const XP = { practice: 20, review: 15, mock: 60, rest: 10 }

export const LEVEL_TIERS = [
  { name: 'Rookie', min: 0, icon: '🌱' },
  { name: 'Riser', min: 80, icon: '⚡' },
  { name: 'Achiever', min: 200, icon: '🔥' },
  { name: 'Contender', min: 380, icon: '💪' },
  { name: 'Pro', min: 600, icon: '🏆' },
  { name: 'Ace', min: 900, icon: '👑' },
]

export function tierForXp(xp = 0) {
  let tier = LEVEL_TIERS[0]
  for (const t of LEVEL_TIERS) if (xp >= t.min) tier = t
  const idx = LEVEL_TIERS.indexOf(tier)
  const next = LEVEL_TIERS[idx + 1] || null
  return { ...tier, level: idx + 1, next }
}

function partRoute(sectionKey, partId) {
  return `${SECTION_BY_KEY[sectionKey].route}/${partId}`
}

/* ══════════════════════════════════════════════════════════════
   buildLearningPath({ journey, isPremium })
   Returns { steps, stages, totalXp, weakest, daysLeft, target }
   - steps: flat ordered array of nodes (each has a stable id)
   - stages: steps grouped into visual stages with a milestone CLB
══════════════════════════════════════════════════════════════ */
export function buildLearningPath({ journey, isPremium = false } = {}) {
  const j = journey || {}
  const sprint = generateSprintPlan({
    daysLeft: j.notBooked ? null : daysLeftFrom(j.examDate),
    targetCLB: j.targetCLB || 9,
    levels: j.levelMode === 'scores' ? (j.levels || {}) : {},
    weakAreas: j.levelMode === 'areas' ? (j.weakAreas || []) : [],
    hoursPerDay: j.hoursPerDay || 2,
  })

  const focusOrder = sprint.focusOrder // weakest → strongest
  const target = sprint.target
  const startCLB = sprint.startCLB

  // Flatten every (section, part) into one list, then sort so that the
  // first parts of every section come first (weakest section leading
  // within each depth tier). This front-loads weak skills while still
  // covering everything.
  const flat = []
  focusOrder.forEach((s, rank) => {
    const parts = PART_LADDER[s.key].filter(p => isPremium || FREE_PARTS.has(p))
    parts.forEach((partId, depth) => flat.push({ sectionKey: s.key, rank, depth, partId }))
  })
  flat.sort((a, b) => a.depth - b.depth || a.rank - b.rank)

  // Build the node sequence, punctuating with review + mock nodes.
  const steps = []
  let practiceCount = 0
  flat.forEach((f, i) => {
    const sec = SECTION_BY_KEY[f.sectionKey]
    steps.push({
      id: `p-${f.sectionKey}-${f.partId}`,
      kind: 'practice',
      sectionKey: f.sectionKey,
      partId: f.partId,
      route: partRoute(f.sectionKey, f.partId),
      icon: sec.icon,
      color: sec.color,
      title: `${sec.label} · ${f.partId}`,
      sub: PART_LABELS[f.partId] || sec.label,
      xp: XP.practice,
      premium: !FREE_PARTS.has(f.partId),
    })
    practiceCount++

    // A review checkpoint every 3 practice nodes.
    if (practiceCount % 3 === 0) {
      steps.push({
        id: `r-${practiceCount}`,
        kind: 'review',
        route: '/review',
        icon: '🔁',
        color: '#6366F1',
        title: 'Review checkpoint',
        sub: 'Redo your missed questions — lock in the gains',
        xp: XP.review,
        premium: false,
      })
    }

    // A mid-path mock "boss" around the 55% mark.
    if (i === Math.floor(flat.length * 0.55) && flat.length >= 4) {
      steps.push({
        id: 'mock-mid',
        kind: 'mock',
        route: '/exam',
        icon: '📝',
        color: '#C8972A',
        title: 'Mini-Mock — Boss Round',
        sub: 'A timed mock to test your stamina under pressure',
        xp: XP.mock,
        premium: false,
        boss: true,
      })
    }
  })

  // Final boss: full mock, then a rest node if the test is booked.
  steps.push({
    id: 'mock-final',
    kind: 'mock',
    route: '/exam',
    icon: '👑',
    color: '#D91B1B',
    title: 'Final Mock — Boss Battle',
    sub: 'Full timed simulation. Beat this and you’re exam-ready.',
    xp: XP.mock,
    premium: false,
    boss: true,
  })
  if (!j.notBooked) {
    steps.push({
      id: 'rest',
      kind: 'rest',
      route: null,
      icon: '⭐',
      color: '#10B981',
      title: 'Rest & logistics',
      sub: 'Pack ID, confirm your centre, sleep early. You’ve got this.',
      xp: XP.rest,
      premium: false,
    })
  }

  // Stamp a sequential order index and group into visual stages.
  steps.forEach((s, i) => { s.order = i })
  const totalXp = steps.reduce((a, s) => a + s.xp, 0)

  const STAGE_SIZE = 5
  const stages = []
  for (let i = 0; i < steps.length; i += STAGE_SIZE) {
    const chunk = steps.slice(i, i + STAGE_SIZE)
    const stageIdx = stages.length
    const stageCount = Math.ceil(steps.length / STAGE_SIZE)
    const milestone = Math.min(
      target,
      Math.round(startCLB + ((target - startCLB) * (stageIdx + 1)) / stageCount)
    )
    stages.push({
      index: stageIdx + 1,
      label: `Stage ${stageIdx + 1}`,
      milestoneCLB: milestone,
      steps: chunk,
    })
  }

  return {
    steps,
    stages,
    totalXp,
    weakest: focusOrder[0],
    daysLeft: sprint.booked ? sprint.daysLeft : null,
    target,
    startCLB,
  }
}

/* derive completion + xp from a progress record against a built path */
export function decorateProgress(steps, progress = {}) {
  const done = new Set(progress.completed || [])
  let earnedXp = 0
  let currentId = null
  const decorated = steps.map(s => {
    const completed = done.has(s.id)
    if (completed) earnedXp += s.xp
    return { ...s, completed }
  })
  // current = first non-completed, non-premium-locked step
  for (const s of decorated) {
    if (!s.completed) { currentId = s.id; break }
  }
  return { steps: decorated, earnedXp, currentId, doneCount: done.size }
}

function daysLeftFrom(dateStr) {
  if (!dateStr) return null
  const ms = new Date(`${dateStr}T00:00:00`) - new Date(new Date().toDateString())
  const d = Math.round(ms / 86400000)
  return Number.isFinite(d) ? d : null
}
