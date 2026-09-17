export async function getReviewBacklog(supabase, userId, { limit = 15 } = {}) {
  const now = new Date().toISOString()
  const { data, error } = await supabase
    .from('review_items')
    .select('section, part_id, set_number, question_id, question_text, skill, due_at, status, times_seen, times_correct')
    .eq('user_id', userId)
    .neq('status', 'mastered')
    .lte('due_at', now)
    .order('due_at', { ascending: true })
    .limit(Math.min(limit, 30))

  if (error) throw new Error(error.message)

  const bySkill = {}
  for (const item of data || []) {
    const key = item.skill || 'general'
    if (!bySkill[key]) bySkill[key] = { skill: key, count: 0, sections: new Set() }
    bySkill[key].count++
    bySkill[key].sections.add(item.section)
  }

  return {
    dueCount: (data || []).length,
    items: (data || []).map((item) => ({
      section: item.section,
      partId: item.part_id,
      setNumber: item.set_number,
      questionId: item.question_id,
      skill: item.skill,
      text: (item.question_text || '').slice(0, 140),
    })),
    bySkill: Object.values(bySkill).map((g) => ({
      skill: g.skill,
      count: g.count,
      sections: [...g.sections],
    })),
  }
}
