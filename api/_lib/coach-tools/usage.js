const FREE_WEEKLY_LIMIT = 5

export async function checkAndIncrementCoachUsage(supabase, userId, isPremium) {
  if (isPremium) {
    return { allowed: true, remaining: null, limit: null, premium: true, limitReached: false }
  }

  const weekStart = startOfWeek(new Date())
  const { data: row } = await supabase
    .from('coach_usage')
    .select('message_count')
    .eq('user_id', userId)
    .eq('week_start', weekStart)
    .maybeSingle()

  const current = row?.message_count || 0
  if (current >= FREE_WEEKLY_LIMIT) {
    return {
      allowed: false,
      remaining: 0,
      limit: FREE_WEEKLY_LIMIT,
      premium: false,
      limitReached: true,
    }
  }

  const { error } = await supabase.from('coach_usage').upsert(
    {
      user_id: userId,
      week_start: weekStart,
      message_count: current + 1,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,week_start' },
  )

  if (error) {
    console.warn('[coach] usage upsert failed:', error.message)
  }

  return {
    allowed: true,
    remaining: FREE_WEEKLY_LIMIT - current - 1,
    limit: FREE_WEEKLY_LIMIT,
    premium: false,
    limitReached: false,
  }
}

export async function getCoachUsage(supabase, userId, isPremium) {
  if (isPremium) {
    return { remaining: null, limit: null, premium: true, used: 0 }
  }
  const weekStart = startOfWeek(new Date())
  const { data: row } = await supabase
    .from('coach_usage')
    .select('message_count')
    .eq('user_id', userId)
    .eq('week_start', weekStart)
    .maybeSingle()

  const used = row?.message_count || 0
  return {
    remaining: Math.max(0, FREE_WEEKLY_LIMIT - used),
    limit: FREE_WEEKLY_LIMIT,
    premium: false,
    used,
  }
}

function startOfWeek(d) {
  const x = new Date(d)
  const day = x.getDay()
  const diff = day === 0 ? -6 : 1 - day
  x.setDate(x.getDate() + diff)
  x.setHours(0, 0, 0, 0)
  return x.toISOString().slice(0, 10)
}
