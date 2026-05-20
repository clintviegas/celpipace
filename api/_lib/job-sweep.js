// /api/cron-sweep.js
// Scheduled sweep that calls public.expire_premium_users() to demote any
// profiles whose premium_expires_at has elapsed but webhook delivery missed
// the customer.subscription.deleted event. Runs hourly via Vercel cron.
//
// Vercel auto-protects scheduled invocations with the CRON_SECRET header,
// but we also accept manual GET when no secret is set (dev/admin trigger).

import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY
  const cronSecret  = process.env.CRON_SECRET

  if (!supabaseUrl || !serviceKey) {
    return res.status(500).json({ error: 'Server not configured' })
  }

  if (cronSecret) {
    const auth = req.headers.authorization || ''
    if (auth !== `Bearer ${cronSecret}`) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  try {
    const [{ data: expired, error: expErr }, { data: pruned, error: pruneErr }] = await Promise.all([
      supabase.rpc('expire_premium_users'),
      supabase.rpc('prune_api_rate_log', { retain_days: 30 }),
    ])
    if (expErr)   console.error('[cron-sweep] expire_premium_users error:', expErr.message)
    if (pruneErr) console.error('[cron-sweep] prune_api_rate_log error:',  pruneErr.message)

    return res.status(200).json({
      ok:           true,
      expired:      expired || [],
      expiredCount: (expired || []).length,
      ratePruned:   typeof pruned === 'number' ? pruned : 0,
    })
  } catch (err) {
    console.error('[cron-sweep] error:', err)
    return res.status(500).json({ error: err.message || 'sweep failed' })
  }
}
