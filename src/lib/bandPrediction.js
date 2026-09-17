/* ══════════════════════════════════════════════════════════════
   bandPrediction — estimate the CELPIP CLB band a learner is likely
   to score, per section and overall, from their practice history.

   Method (read-only; reuses progressHistory / practice_attempts):
   - Recency-weighted average of the most recent attempts per section
     (newer attempts count more — exponential decay).
   - Linear-regression trend (CLB change per week) over recent attempts.
   - A short forward projection (a few weeks out) using that trend.
   - A confidence rating from how many attempts exist and how long
     they span.
   No new tables. No guarantees — this is an estimate, clearly labelled.
══════════════════════════════════════════════════════════════ */
import { fetchProgressHistory, TRACKED_SECTIONS, SECTION_STYLE } from './progressHistory'

export { TRACKED_SECTIONS, SECTION_STYLE }

const RECENCY_DECAY = 0.78   // weight multiplier per step back in time
const RECENT_WINDOW = 8      // attempts considered for the estimate
const TREND_WINDOW = 12      // attempts considered for the trend line
const PROJECT_WEEKS = 4      // how far ahead the projection looks

const round1 = (n) => Math.round(n * 10) / 10
const clampCLB = (n) => Math.max(0, Math.min(12, n))

const CONFIDENCE_LABEL = {
  high: 'High confidence',
  medium: 'Moderate confidence',
  low: 'Low confidence',
  none: 'No data',
}

/* Recency-weighted average. points oldest → newest, each has .clb */
function weightedAvg(points) {
  const n = points.length
  if (!n) return null
  let wsum = 0, vsum = 0
  points.forEach((p, i) => {
    const w = Math.pow(RECENCY_DECAY, n - 1 - i)
    wsum += w
    vsum += w * p.clb
  })
  return wsum ? vsum / wsum : null
}

/* Least-squares slope of CLB vs time, expressed as CLB change per week. */
function slopePerWeek(points) {
  if (points.length < 2) return 0
  const t0 = points[0].ts
  const xs = points.map(p => (p.ts - t0) / 86400000) // days since first
  const ys = points.map(p => p.clb)
  const n = xs.length
  const mx = xs.reduce((a, b) => a + b, 0) / n
  const my = ys.reduce((a, b) => a + b, 0) / n
  let num = 0, den = 0
  for (let i = 0; i < n; i++) {
    num += (xs[i] - mx) * (ys[i] - my)
    den += (xs[i] - mx) ** 2
  }
  if (den === 0) return 0
  return (num / den) * 7
}

function confidenceFor(attempts, spanDays) {
  if (attempts === 0) return 'none'
  if (attempts >= 6 && spanDays >= 10) return 'high'
  if (attempts >= 3) return 'medium'
  return 'low'
}

function predictSection(points) {
  const attempts = points.length
  if (attempts === 0) {
    return {
      attempts: 0, predictedCLB: null, predictedBand: null,
      recentCLB: null, bestCLB: null, slopePerWeek: 0,
      projectedCLB: null, confidence: 'none',
    }
  }
  const recent = points.slice(-RECENT_WINDOW)
  const predicted = weightedAvg(recent)
  const slope = slopePerWeek(points.slice(-TREND_WINDOW))
  const projected = clampCLB(predicted + slope * PROJECT_WEEKS)
  const spanDays = (points[attempts - 1].ts - points[0].ts) / 86400000
  return {
    attempts,
    predictedCLB: round1(predicted),
    predictedBand: Math.round(predicted),
    recentCLB: points[attempts - 1].clb,
    bestCLB: Math.max(...points.map(p => p.clb)),
    slopePerWeek: round1(slope),
    projectedCLB: round1(projected),
    confidence: confidenceFor(attempts, spanDays),
  }
}

/* Build a full prediction object from an already-fetched history. */
export function buildPrediction(history) {
  const perSection = {}
  for (const sec of TRACKED_SECTIONS) {
    perSection[sec] = predictSection(history.attempts.filter(a => a.section === sec))
  }

  const withData = TRACKED_SECTIONS.filter(s => perSection[s].attempts > 0)
  const vals = withData.map(s => perSection[s].predictedCLB)
  const avg = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null
  const min = vals.length ? Math.min(...vals) : null

  let weakest = null
  for (const s of withData) {
    if (weakest == null || perSection[s].predictedCLB < perSection[weakest].predictedCLB) weakest = s
  }

  return {
    perSection,
    overall: {
      avgCLB: avg != null ? round1(avg) : null,
      predictedBand: avg != null ? Math.round(avg) : null,   // average across sections
      guaranteedCLB: min != null ? Math.floor(min) : null,    // weakest-link band you can rely on
      weakest,
      sectionsCovered: withData.length,
      totalAttempts: history.attempts.length,
    },
  }
}

/* Fetch history and build the prediction in one call. */
export async function fetchBandPrediction() {
  const history = await fetchProgressHistory()
  return buildPrediction(history)
}

/* Compare a prediction against a target CLB for exam-readiness. */
export function readinessFor(prediction, targetCLB) {
  const sections = {}
  let ready = 0, total = 0
  for (const sec of TRACKED_SECTIONS) {
    const ps = prediction.perSection[sec]
    if (ps.attempts === 0) { sections[sec] = { state: 'unknown', gap: null }; continue }
    total++
    const gap = round1(targetCLB - ps.predictedCLB)
    let state
    if (ps.predictedCLB >= targetCLB) { state = 'ready'; ready++ }
    else if (ps.predictedCLB >= targetCLB - 1) state = 'close'
    else state = 'below'
    sections[sec] = { state, gap }
  }
  return {
    sections,
    ready,
    total,
    pct: total ? Math.round((ready / total) * 100) : 0,
    allReady: total > 0 && ready === total,
  }
}

export function confidenceLabel(level) {
  return CONFIDENCE_LABEL[level] || ''
}
