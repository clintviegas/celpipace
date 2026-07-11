export function emptyCoachProfile({ targetClb = 9, rpcError = null } = {}) {
  return {
    targetCLB: targetClb,
    targetDate: null,
    daysPerWeek: null,
    sections: {},
    lrSkills: [],
    writingProfile: { sample_count: 0, dimensions: {} },
    speakingProfile: { sample_count: 0, dimensions: {} },
    reviewDue: 0,
    reviewTotal: 0,
    painPoints: [],
    weakestSection: null,
    weakestCLB: null,
    dataRich: false,
    ...(rpcError ? { profileError: rpcError } : {}),
  }
}

export async function getCoachProfile(supabase, userId, targetClb = null) {
  const { data, error } = await supabase.rpc('get_user_coach_profile', {
    p_user_id: userId,
    p_target_clb: targetClb,
  })

  if (error) {
    console.error('[coach] get_user_coach_profile failed:', error.message)
    return emptyCoachProfile({ targetClb: targetClb || 9, rpcError: error.message })
  }

  if (!data || typeof data !== 'object') {
    return emptyCoachProfile({ targetClb: targetClb || 9 })
  }

  return data
}
