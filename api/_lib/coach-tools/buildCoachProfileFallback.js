function pctToClb(pct) {
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

function attemptClb(row) {
  if (!row) return null
  if ((row.section === 'writing' || row.section === 'speaking') && row.total >= 12) {
    return Number(row.score)
  }
  return pctToClb(row.pct)
}

async function weaknessProfileFromEmbeddings(supabase, userId, section, window = 10) {
  const { data: rows, error } = await supabase
    .from('essay_embeddings')
    .select('dim_scores, overall_score')
    .eq('user_id', userId)
    .eq('is_exemplar', false)
    .eq('section', section)
    .not('dim_scores', 'is', null)
    .order('created_at', { ascending: false })
    .limit(window)

  if (error || !rows?.length) {
    return { sample_count: 0, dimensions: {} }
  }

  const dimMap = {}
  for (const row of rows) {
    for (const [dim, val] of Object.entries(row.dim_scores || {})) {
      const n = Number(val)
      if (!Number.isFinite(n)) continue
      if (!dimMap[dim]) dimMap[dim] = []
      dimMap[dim].push(n)
    }
  }

  const dimensions = {}
  let weakest = null
  let strongest = null
  let weakestAvg = Infinity
  let strongestAvg = -Infinity

  for (const [dim, scores] of Object.entries(dimMap)) {
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length
    dimensions[dim] = {
      avg: Math.round(avg * 100) / 100,
      min: Math.min(...scores),
      max: Math.max(...scores),
      count: scores.length,
    }
    if (avg < weakestAvg) {
      weakestAvg = avg
      weakest = dim
    }
    if (avg > strongestAvg) {
      strongestAvg = avg
      strongest = dim
    }
  }

  const overallScores = rows
    .map((r) => Number(r.overall_score))
    .filter((n) => Number.isFinite(n))

  return {
    sample_count: rows.length,
    avg_overall: overallScores.length
      ? Math.round((overallScores.reduce((a, b) => a + b, 0) / overallScores.length) * 10) / 10
      : null,
    dimensions,
    weakest,
    strongest,
  }
}

function buildPainPoints({ writingProfile, speakingProfile, lrSkills, reviewDue, reviewTotal }) {
  const points = []

  for (const [section, wp] of [['writing', writingProfile], ['speaking', speakingProfile]]) {
    if ((wp?.sample_count || 0) >= 2 && wp?.weakest && wp.dimensions?.[wp.weakest]) {
      const dim = wp.dimensions[wp.weakest]
      points.push({
        kind: 'dimension',
        section,
        label: wp.weakest,
        detail: `${section.charAt(0).toUpperCase() + section.slice(1)} ${wp.weakest} averaging CLB ${dim.avg} over ${wp.sample_count} attempts`,
        metric: dim.avg,
        samples: wp.sample_count,
        priority: 1,
      })
    }
  }

  for (const skill of (lrSkills || []).slice(0, 3)) {
    if ((skill.missPct || 0) >= 35) {
      points.push({
        kind: 'skill',
        section: skill.section,
        label: skill.skill,
        detail: `${skill.section.charAt(0).toUpperCase() + skill.section.slice(1)} ${String(skill.skill).replace(/_/g, ' ')}: ${skill.missPct}% miss rate over ${skill.totalQuestions} questions`,
        metric: skill.missPct,
        samples: skill.totalQuestions,
        priority: 2,
      })
    }
  }

  if (reviewDue > 0) {
    points.push({
      kind: 'review',
      section: 'reading',
      label: 'review_backlog',
      detail: `${reviewDue} review mistakes due now (${reviewTotal} total in queue)`,
      metric: reviewDue,
      samples: reviewTotal,
      priority: 3,
    })
  }

  return points.sort((a, b) => (a.priority - b.priority) || (b.metric - a.metric))
}

function aggregateLrSkills(attempts) {
  const buckets = {}
  for (const row of attempts) {
    const questions = row.payload?.questions || []
    for (const q of questions) {
      if (q.isCorrect !== false && q.isCorrect !== true) continue
      const skill = q.skill || 'general'
      const key = `${row.section}:${skill}`
      if (!buckets[key]) buckets[key] = { section: row.section, skill, total: 0, missed: 0 }
      buckets[key].total += 1
      if (q.isCorrect !== true) buckets[key].missed += 1
    }
  }

  return Object.values(buckets)
    .filter((b) => b.total >= 3)
    .map((b) => ({
      section: b.section,
      skill: b.skill,
      totalQuestions: b.total,
      missedQuestions: b.missed,
      missPct: Math.round((100 * b.missed) / b.total),
    }))
    .sort((a, b) => b.missPct - a.missPct)
}

/** Client-side coach profile when get_user_coach_profile RPC is unavailable. */
export async function buildCoachProfileFallback(supabase, userId, targetClb = null) {
  const since90 = new Date(Date.now() - 90 * 86400000).toISOString()
  const since180 = new Date(Date.now() - 180 * 86400000).toISOString()

  const [
    planRes,
    attemptsRes,
    lrAttemptsRes,
    reviewRes,
    embedCountRes,
    attemptCountRes,
    writingProfile,
    speakingProfile,
  ] = await Promise.all([
    supabase.from('study_plans').select('target_clb, target_date, days_per_week').eq('user_id', userId).maybeSingle(),
    supabase
      .from('practice_attempts')
      .select('section, score, total, pct, part_id, set_number, created_at')
      .eq('user_id', userId)
      .in('section', ['listening', 'reading', 'writing', 'speaking'])
      .gte('created_at', since90)
      .order('created_at', { ascending: false }),
    supabase
      .from('practice_attempts')
      .select('section, payload')
      .eq('user_id', userId)
      .in('section', ['listening', 'reading'])
      .gte('created_at', since180)
      .order('created_at', { ascending: false })
      .limit(40),
    supabase.from('review_items').select('status, due_at').eq('user_id', userId),
    supabase.from('essay_embeddings').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('is_exemplar', false),
    supabase.from('practice_attempts').select('id', { count: 'exact', head: true }).eq('user_id', userId),
    weaknessProfileFromEmbeddings(supabase, userId, 'writing'),
    weaknessProfileFromEmbeddings(supabase, userId, 'speaking'),
  ])

  const target = targetClb ?? planRes.data?.target_clb ?? 9
  const attempts = attemptsRes.data || []

  const latestBySection = {}
  const bestBySection = {}
  const countBySection = {}

  for (const row of attempts) {
    countBySection[row.section] = (countBySection[row.section] || 0) + 1
    const clb = attemptClb(row)
    if (clb == null) continue
    if (!latestBySection[row.section]) latestBySection[row.section] = { clb, row }
    bestBySection[row.section] = Math.max(bestBySection[row.section] ?? 0, clb)
  }

  const sections = {}
  for (const section of ['listening', 'reading', 'writing', 'speaking']) {
    const latest = latestBySection[section]
    if (!latest) continue
    sections[section] = {
      latestCLB: latest.clb,
      bestCLB: bestBySection[section] ?? latest.clb,
      attemptCount: countBySection[section] || 0,
      gapToTarget: Math.max(0, target - latest.clb),
      lastPartId: latest.row.part_id,
      lastSetNumber: latest.row.set_number,
    }
  }

  const reviewRows = reviewRes.data || []
  const now = Date.now()
  const reviewDue = reviewRows.filter((r) => r.status !== 'mastered' && r.due_at && new Date(r.due_at).getTime() <= now).length
  const reviewTotal = reviewRows.length
  const lrSkills = aggregateLrSkills(lrAttemptsRes.data || [])

  let weakestSection = null
  let weakestCLB = null
  for (const [sec, data] of Object.entries(sections)) {
    if (data.latestCLB == null) continue
    if (weakestCLB == null || data.latestCLB < weakestCLB) {
      weakestCLB = data.latestCLB
      weakestSection = sec
    }
  }

  const painPoints = buildPainPoints({ writingProfile, speakingProfile, lrSkills, reviewDue, reviewTotal })
  const dataRich = (attemptCountRes.count ?? 0) >= 3 || (embedCountRes.count ?? 0) >= 2

  return {
    targetCLB: target,
    targetDate: planRes.data?.target_date ?? null,
    daysPerWeek: planRes.data?.days_per_week ?? null,
    sections,
    lrSkills,
    writingProfile,
    speakingProfile,
    reviewDue,
    reviewTotal,
    painPoints,
    weakestSection,
    weakestCLB,
    dataRich,
    profileSource: 'fallback',
  }
}
