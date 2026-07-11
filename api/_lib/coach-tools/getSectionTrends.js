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
  if (row.section === 'writing' || row.section === 'speaking') {
    if (row.total >= 12 && row.score != null) return Math.round(Number(row.score))
    return null
  }
  return pctToClb(row.pct)
}

export async function getSectionTrends(supabase, userId, { days = 60 } = {}) {
  const since = new Date(Date.now() - days * 86400000).toISOString()
  const { data, error } = await supabase
    .from('practice_attempts')
    .select('section, score, total, pct, created_at')
    .eq('user_id', userId)
    .in('section', ['listening', 'reading', 'writing', 'speaking'])
    .gte('created_at', since)
    .order('created_at', { ascending: true })
    .limit(500)

  if (error) throw new Error(error.message)

  const sections = {}
  for (const row of data || []) {
    const clb = attemptClb(row)
    if (clb == null) continue
    if (!sections[row.section]) sections[row.section] = []
    sections[row.section].push({
      date: row.created_at.slice(0, 10),
      clb,
    })
  }

  return { sections, days }
}
