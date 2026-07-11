export async function getCoachProfile(supabase, userId, targetClb = null) {
  const { data, error } = await supabase.rpc('get_user_coach_profile', {
    p_user_id: userId,
    p_target_clb: targetClb,
  })
  if (error) throw new Error(error.message)
  return data || {}
}
