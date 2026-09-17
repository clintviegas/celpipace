function compactPayload(payload, section) {
  if (!payload || typeof payload !== 'object') return {}
  if (section === 'writing' || section === 'speaking') {
    const ai = payload.aiResult || {}
    return {
      prompt: (payload.prompt || '').slice(0, 200),
      wordCount: payload.wordCount,
      scores: ai.scores || null,
      overall: ai.overall ?? ai.clbBand,
      feedback: (ai.feedback || '').slice(0, 300),
      suggestions: (ai.suggestions || []).slice(0, 3),
    }
  }
  const questions = (payload.questions || []).slice(0, 12).map((q) => ({
    num: q.number ?? q.questionId,
    skill: q.skill || null,
    isCorrect: q.isCorrect,
    text: (q.text || '').slice(0, 120),
    explanation: q.explanation ? String(q.explanation).slice(0, 160) : null,
  }))
  const missed = questions.filter((q) => q.isCorrect === false).length
  return {
    setTitle: payload.setTitle || payload.set_title,
    missedCount: missed,
    questionCount: questions.length,
    questions,
  }
}

export async function getRecentAttempts(supabase, userId, { limit = 8, section = null } = {}) {
  let query = supabase
    .from('practice_attempts')
    .select('section, part_id, set_number, score, total, pct, payload, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(Math.min(limit, 20))

  if (section) query = query.eq('section', section)

  const { data, error } = await query
  if (error) throw new Error(error.message)

  return (data || []).map((row) => ({
    section: row.section,
    partId: row.part_id,
    setNumber: row.set_number,
    score: row.score,
    total: row.total,
    pct: row.pct,
    at: row.created_at,
    summary: compactPayload(row.payload, row.section),
  }))
}
