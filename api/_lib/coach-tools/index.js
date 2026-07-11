import { getCoachProfile } from './getCoachProfile.js'
import { getRecentAttempts } from './getRecentAttempts.js'
import { getReviewBacklog } from './getReviewBacklog.js'
import { getSectionTrends } from './getSectionTrends.js'
import { suggestPractice } from './suggestPractice.js'

let profileCache = new Map()
const CACHE_TTL_MS = 15 * 60 * 1000

async function cachedProfile(supabase, userId) {
  const key = userId
  const hit = profileCache.get(key)
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) return hit.data
  const data = await getCoachProfile(supabase, userId)
  profileCache.set(key, { at: Date.now(), data })
  return data
}

export async function runCoachTool(name, args, { supabase, userId }) {
  switch (name) {
    case 'getCoachProfile':
      return cachedProfile(supabase, userId)
    case 'getRecentAttempts':
      return getRecentAttempts(supabase, userId, args || {})
    case 'getReviewBacklog':
      return getReviewBacklog(supabase, userId, args || {})
    case 'getSectionTrends':
      return getSectionTrends(supabase, userId, args || {})
    case 'suggestPractice': {
      const profile = await cachedProfile(supabase, userId)
      return suggestPractice(profile, args || {})
    }
    default:
      return { error: `Unknown tool: ${name}` }
  }
}

export { getCoachProfile, getRecentAttempts, getReviewBacklog, getSectionTrends, suggestPractice }
export { COACH_SYSTEM, COACH_TOOLS, SUPPORT_SYSTEM } from './prompts.js'
