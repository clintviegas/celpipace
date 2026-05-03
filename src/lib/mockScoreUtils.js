export const MOCK_SECTION_ORDER = ['listening', 'reading', 'writing', 'speaking']

export const MOCK_SECTION_PARTS = {
  listening: ['L1', 'L2', 'L3', 'L4', 'L5', 'L6'],
  reading: ['R1', 'R2', 'R3', 'R4'],
  writing: ['W1', 'W2'],
  speaking: ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8'],
}

const BAND_META = {
  12: { level: 12, num: 12, label: 'Advanced Proficiency', color: '#166534', tier: 'expert' },
  11: { level: 11, num: 11, label: 'Advanced Proficiency', color: '#166534', tier: 'expert' },
  10: { level: 10, num: 10, label: 'Highly Effective Proficiency', color: '#15803D', tier: 'expert' },
  9: { level: 9, num: 9, label: 'Effective Proficiency', color: '#16A34A', tier: 'strong' },
  8: { level: 8, num: 8, label: 'Good Proficiency', color: '#2D8A56', tier: 'strong' },
  7: { level: 7, num: 7, label: 'Adequate Proficiency', color: '#4A90D9', tier: 'strong' },
  6: { level: 6, num: 6, label: 'Developing Proficiency', color: '#4A90D9', tier: 'fair' },
  5: { level: 5, num: 5, label: 'Acquiring Proficiency', color: '#C8972A', tier: 'fair' },
  4: { level: 4, num: 4, label: 'Adequate for Daily Life', color: '#C8972A', tier: 'weak' },
  3: { level: 3, num: 3, label: 'Some Proficiency', color: '#D97706', tier: 'weak' },
  2: { level: 2, num: 2, label: 'Limited Proficiency', color: '#DC2626', tier: 'weak' },
  1: { level: 1, num: 1, label: 'Minimal Proficiency', color: '#C8102E', tier: 'weak' },
  0: { level: 'M', num: 0, label: 'Minimal (very little/no ability)', color: '#991B1B', tier: 'weak' },
}

function toNumber(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null
  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value.replace('+', ''))
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

export function roundBand(value) {
  const number = toNumber(value)
  if (number == null) return null
  return Math.max(0, Math.min(12, Math.round(number)))
}

export function getAiBand(aiResult) {
  if (!aiResult || aiResult.error) return null
  const overallBand = roundBand(aiResult.overall)
  if (overallBand != null) return overallBand
  return roundBand(aiResult.clbBand)
}

export function normalizeAiResult(aiResult) {
  if (!aiResult || aiResult.error) return aiResult
  const band = getAiBand(aiResult)
  const scores = aiResult.scores && typeof aiResult.scores === 'object'
    ? Object.fromEntries(Object.entries(aiResult.scores).map(([key, value]) => [key, roundBand(value) ?? value]))
    : aiResult.scores

  return {
    ...aiResult,
    rawOverall: aiResult.rawOverall ?? aiResult.overall,
    overall: band ?? aiResult.overall,
    clbBand: band ?? aiResult.clbBand,
    scores,
  }
}

export function formatBandScore(band) {
  return band == null ? '-/12' : `${band}/12`
}

export function getCelpipLevel(correct, total) {
  const raw = total === 38 ? correct : Math.round((correct / Math.max(total, 1)) * 38)
  if (raw >= 37) return BAND_META[12]
  if (raw >= 35) return BAND_META[11]
  if (raw >= 33) return BAND_META[10]
  if (raw >= 31) return BAND_META[9]
  if (raw >= 28) return BAND_META[8]
  if (raw >= 25) return BAND_META[7]
  if (raw >= 21) return BAND_META[6]
  if (raw >= 17) return BAND_META[5]
  if (raw >= 13) return BAND_META[4]
  if (raw >= 9) return BAND_META[3]
  if (raw >= 5) return BAND_META[2]
  if (raw >= 1) return BAND_META[1]
  return BAND_META[0]
}

export function getCelpipBandMeta(level) {
  const band = roundBand(level)
  return BAND_META[band ?? 0] || BAND_META[0]
}

export function summarizeSubjectiveSection(scores, parts) {
  const submitted = parts.filter(part => scores?.[part])
  const bands = parts
    .map(part => getAiBand(scores?.[part]?.aiResult))
    .filter(band => band != null)
  const band = bands.length ? roundBand(bands.reduce((sum, value) => sum + value, 0) / bands.length) : null

  return {
    submittedParts: submitted.length,
    scoredParts: bands.length,
    totalParts: parts.length,
    band,
    hasData: submitted.length > 0,
  }
}

export function summarizeMockScores(scores = {}) {
  const sections = MOCK_SECTION_ORDER.map(section => {
    const parts = MOCK_SECTION_PARTS[section]
    const objective = section === 'listening' || section === 'reading'

    if (objective) {
      let correct = 0
      let total = 0
      let hasData = false
      parts.forEach(part => {
        const score = scores?.[part]
        if (score && typeof score.correct === 'number' && typeof score.total === 'number') {
          correct += score.correct
          total += score.total
          hasData = true
        }
      })
      const pct = total > 0 ? Math.round((correct / total) * 100) : 0
      const band = total > 0 ? getCelpipLevel(correct, total) : null
      return { section, objective, parts, correct, total, pct, band, hasData }
    }

    const subjective = summarizeSubjectiveSection(scores, parts)
    return { section, objective, parts, ...subjective }
  })

  const sectionBands = sections
    .map(section => section.objective ? section.band?.num : section.band)
    .filter(band => typeof band === 'number' && band > 0)
  const overallBand = sectionBands.length
    ? getCelpipBandMeta(sectionBands.reduce((sum, value) => sum + value, 0) / sectionBands.length)
    : null

  return { sections, overallBand }
}

export function buildMockReportCard(examNumber, scores = {}) {
  const summary = summarizeMockScores(scores)
  return {
    examNumber,
    generatedAt: new Date().toISOString(),
    overallBand: summary.overallBand?.level ?? null,
    sections: summary.sections.map(section => ({
      section: section.section,
      band: section.objective ? section.band?.level ?? null : section.band,
      correct: section.objective ? section.correct : null,
      total: section.objective ? section.total : null,
      scoredParts: section.objective ? null : section.scoredParts,
      totalParts: section.objective ? section.parts.length : section.totalParts,
    })),
  }
}