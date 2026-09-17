import { practiceDeepLink, reviewDeepLink, studyPlanDeepLink } from './deepLinks.js'

const PART_ROTATION = {
  listening: ['L1', 'L2', 'L3', 'L4', 'L5', 'L6'],
  reading: ['R1', 'R2', 'R3', 'R4'],
  writing: ['W1', 'W2'],
  speaking: ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8'],
}

function pickPart(section, profile) {
  const sec = profile?.sections?.[section]
  if (sec?.lastPartId) return sec.lastPartId
  return PART_ROTATION[section]?.[0]
}

export function suggestPractice(profile, { max = 4 } = {}) {
  const suggestions = []
  const painPoints = profile?.painPoints || []

  for (const pp of painPoints.slice(0, 3)) {
    const section = pp.section || profile.weakestSection
    if (!section || section === 'reading' && pp.kind === 'review') continue
    const partId = pickPart(section, profile)
    suggestions.push({
      title: `Drill ${section}: ${(pp.label || '').replace(/_/g, ' ')}`,
      reason: pp.detail,
      href: practiceDeepLink(section, partId, 1),
      section,
      partId,
      setNumber: '1',
    })
  }

  if ((profile?.reviewDue || 0) > 0) {
    suggestions.push({
      title: 'Review missed questions',
      reason: `${profile.reviewDue} items due in your spaced-repetition queue`,
      href: reviewDeepLink(),
      section: 'review',
    })
  }

  const weakest = profile?.weakestSection
  if (weakest && !suggestions.some((s) => s.section === weakest)) {
    suggestions.push({
      title: `Practice ${weakest} (weakest section)`,
      reason: profile.sections?.[weakest]?.gapToTarget
        ? `Gap of ${profile.sections[weakest].gapToTarget} CLB points to your target`
        : 'Lowest section band in your recent attempts',
      href: practiceDeepLink(weakest, pickPart(weakest, profile), 1),
      section: weakest,
      partId: pickPart(weakest, profile),
    })
  }

  if (!profile?.dataRich) {
    suggestions.unshift({
      title: 'Complete diagnostic sets',
      reason: 'Do at least 2 writing + 2 speaking scored tasks and 1 listening + 1 reading set so your coach can pinpoint weaknesses',
      href: studyPlanDeepLink(),
      section: 'all',
    })
  }

  return { suggestions: suggestions.slice(0, max) }
}
