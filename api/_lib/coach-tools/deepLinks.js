const SECTION_ROUTES = {
  listening: (partId) => `/celpip-listening-practice/${partId || ''}`.replace(/\/$/, '') || '/celpip-listening-practice',
  reading: (partId) => `/celpip-reading-practice/${partId || ''}`.replace(/\/$/, '') || '/celpip-reading-practice',
  writing: (partId) => `/celpip-writing-practice/${partId || ''}`.replace(/\/$/, '') || '/celpip-writing-practice',
  speaking: (partId) => `/celpip-speaking-practice/${partId || ''}`.replace(/\/$/, '') || '/celpip-speaking-practice',
}

const DEFAULT_PART = {
  listening: 'L1',
  reading: 'R1',
  writing: 'W1',
  speaking: 'S1',
}

export function practiceDeepLink(section, partId, setNumber) {
  const pid = partId || DEFAULT_PART[section] || ''
  const base = SECTION_ROUTES[section]?.(pid) || '/dashboard'
  const params = new URLSearchParams()
  if (setNumber) params.set('set', String(setNumber))
  params.set('source', 'coach')
  const qs = params.toString()
  return qs ? `${base}?${qs}` : base
}

export function reviewDeepLink() {
  return '/review?source=coach'
}

export function studyPlanDeepLink() {
  return '/study-plan?source=coach'
}
