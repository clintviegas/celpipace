/* global process */
// /api/_lib/quota.js
// Free-tier evaluation quota enforcement, shared by score-writing and
// score-speaking.
//
// FAIL-CLOSED BY DESIGN
// ---------------------
// This gate protects both revenue and OpenAI spend, so it denies on error
// rather than granting. The previous inline version discarded the query error
// and did `(count ?? 0) >= LIMIT` — with `count` undefined that comparison is
// always false, so ANY failure granted the evaluation. Because
// `essay_embeddings` was never actually created in the database, that meant
// the free tier had no limit at all.
//
// Contrast with api/_lib/rateLimit.js, which deliberately fails OPEN: blocking
// a paying user because of a transient DB blip is worse than briefly losing
// abuse protection. The trade-off is inverted here — a free user briefly seeing
// "try again in a moment" is much cheaper than uncapped GPT-4o calls.

/**
 * Resolve whether a user currently holds active premium.
 * Returns null if the profile could not be read (caller must fail closed).
 *
 * @returns {Promise<{ isPremium: boolean } | null>}
 */
export async function resolvePremium({ supabase, userId }) {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('is_premium, premium_expires_at, subscription_status')
    .eq('id', userId)
    .single()

  if (error || !profile) {
    console.error('[quota] profile lookup failed:', error?.message || 'no row')
    return null
  }

  const isPremium = !!(
    profile.is_premium &&
    (profile.subscription_status || 'active') !== 'expired' &&
    (!profile.premium_expires_at || new Date(profile.premium_expires_at) > new Date())
  )
  return { isPremium }
}

/**
 * Enforce the lifetime free-evaluation cap for one section.
 *
 * @param {object}  args
 * @param {object}  args.supabase  service-role client
 * @param {string}  args.userId
 * @param {'writing'|'speaking'} args.section
 * @param {number}  args.limit     lifetime free evaluations for this section
 * @returns {Promise<{ allowed: true, isPremium: boolean } |
 *                   { allowed: false, status: number, body: object }>}
 */
export async function checkFreeEvalQuota({ supabase, userId, section, limit }) {
  const premium = await resolvePremium({ supabase, userId })

  // Could not determine entitlement — deny rather than hand out a paid feature.
  if (premium === null) {
    return {
      allowed: false,
      status: 503,
      body: {
        error: 'entitlement_unavailable',
        section,
        message: 'We could not verify your account just now. Please try again in a moment.',
      },
    }
  }

  if (premium.isPremium) return { allowed: true, isPremium: true }

  const { count, error } = await supabase
    .from('essay_embeddings')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('section', section)
    .eq('source', 'submission')

  // A missing table, an RLS change, or a transient error all land here. Deny:
  // we genuinely do not know how many evaluations this user has consumed.
  if (error || typeof count !== 'number') {
    console.error(`[quota] ${section} usage count failed:`, error?.message || 'count unavailable')
    return {
      allowed: false,
      status: 503,
      body: {
        error: 'quota_check_unavailable',
        section,
        message: 'We could not check your remaining free evaluations. Please try again in a moment.',
      },
    }
  }

  if (count >= limit) {
    return {
      allowed: false,
      status: 403,
      body: {
        error: 'free_limit_reached',
        section,
        message: `You've used your ${limit} free AI ${section} evaluations. Upgrade to Premium for unlimited scoring.`,
      },
    }
  }

  return { allowed: true, isPremium: false }
}
