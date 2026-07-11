/* global process */
import { getServiceSupabase, getClientIp, requireUser } from './_lib/auth.js'
import { checkRateLimit } from './_lib/rateLimit.js'
import {
  runCoachTool,
  getCoachProfile,
  suggestPractice,
  COACH_SYSTEM,
  COACH_TOOLS,
  SUPPORT_SYSTEM,
} from './_lib/coach-tools/index.js'
import { checkAndIncrementCoachUsage, getCoachUsage } from './_lib/coach-tools/usage.js'

const MAX_MESSAGES = 12
const MAX_MESSAGE_CHARS = 1200
const MAX_TOOL_ROUNDS = 3
const COACH_MODEL = 'gpt-4o-mini'

function cleanMessages(messages) {
  if (!Array.isArray(messages)) return []
  return messages
    .slice(-MAX_MESSAGES)
    .map((message) => ({
      role: message?.role === 'assistant' ? 'assistant' : 'user',
      content: String(message?.content || '').trim().slice(0, MAX_MESSAGE_CHARS),
    }))
    .filter((message) => message.content)
}

async function getOptionalUserId(req) {
  const header = req.headers.authorization || req.headers.Authorization || ''
  const match = String(header).match(/^Bearer\s+(.+)$/i)
  const token = match?.[1]
  if (!token) return null
  try {
    const sb = getServiceSupabase()
    const { data } = await sb.auth.getUser(token)
    return data?.user?.id || null
  } catch {
    return null
  }
}

async function fetchPremium(supabase, userId) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_premium, premium_expires_at, subscription_status')
    .eq('id', userId)
    .maybeSingle()

  return !!(profile?.is_premium &&
    profile?.subscription_status !== 'canceled' &&
    (!profile?.premium_expires_at || new Date(profile.premium_expires_at) > new Date()))
}

async function handleSupport(req, res, apiKey) {
  const messages = cleanMessages(req.body?.messages)
  if (!messages.length) {
    return res.status(400).json({ error: 'Message is required.' })
  }

  let supabase
  try { supabase = getServiceSupabase() } catch { /* fail-open */ }
  if (supabase) {
    const userId = await getOptionalUserId(req)
    const rlKey = userId || getClientIp(req)
    const rl = await checkRateLimit({ supabase, scope: 'chatbot', key: rlKey, limit: 30, windowSec: 3600 })
    if (!rl.ok) return res.status(429).json({ error: 'too_many_requests', message: rl.message })
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: COACH_MODEL,
        messages: [{ role: 'system', content: SUPPORT_SYSTEM }, ...messages],
        temperature: 0.35,
        max_tokens: 450,
      }),
    })

    if (!response.ok) {
      const detail = await response.text()
      console.error('[assist/support] OpenAI error:', response.status, detail)
      return res.status(502).json({ error: 'Chat service is unavailable right now.' })
    }

    const data = await response.json()
    const reply = data.choices?.[0]?.message?.content?.trim()
    if (!reply) return res.status(502).json({ error: 'Chat service returned an empty response.' })
    return res.status(200).json({ reply, mode: 'support' })
  } catch (err) {
    console.error('[assist/support] error:', err)
    return res.status(500).json({ error: 'Chat failed. Please try again.' })
  }
}

async function runCoachToolLoop(apiKey, messages, { supabase, userId }) {
  const chatMessages = [{ role: 'system', content: COACH_SYSTEM }, ...messages]

  for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: COACH_MODEL,
        messages: chatMessages,
        tools: COACH_TOOLS,
        tool_choice: 'auto',
        temperature: 0.25,
        max_tokens: 800,
      }),
    })

    if (!response.ok) {
      const detail = await response.text()
      throw new Error(`OpenAI ${response.status}: ${detail.slice(0, 200)}`)
    }

    const data = await response.json()
    const choice = data.choices?.[0]?.message
    if (!choice) throw new Error('Empty coach response')

    if (choice.tool_calls?.length) {
      chatMessages.push(choice)
      for (const call of choice.tool_calls) {
        let args = {}
        try { args = JSON.parse(call.function.arguments || '{}') } catch { args = {} }
        let result
        try {
          result = await runCoachTool(call.function.name, args, { supabase, userId })
        } catch (err) {
          result = { error: err.message }
        }
        chatMessages.push({
          role: 'tool',
          tool_call_id: call.id,
          content: JSON.stringify(result),
        })
      }
      continue
    }

    const reply = choice.content?.trim()
    if (!reply) throw new Error('Coach returned empty content')
    return reply
  }

  throw new Error('Coach needed too many tool rounds')
}

async function handleCoachGet(req, res, auth) {
  const userId = auth.user.id
  try {
    const isPremium = await fetchPremium(auth.supabase, userId)
    const [profile, usage] = await Promise.all([
      getCoachProfile(auth.supabase, userId),
      getCoachUsage(auth.supabase, userId, isPremium),
    ])
    const practice = suggestPractice(profile, { max: 4 })
    return res.status(200).json({
      mode: 'coach',
      profile,
      usage,
      weeklyFocus: practice.suggestions,
      profileWarning: profile.profileError || null,
    })
  } catch (err) {
    console.error('[assist/coach GET] error:', err)
    const isPremium = await fetchPremium(auth.supabase, userId).catch(() => false)
    const usage = await getCoachUsage(auth.supabase, userId, isPremium).catch(() => ({
      remaining: null,
      limit: null,
      premium: isPremium,
      used: 0,
    }))
    return res.status(200).json({
      mode: 'coach',
      profile: {
        targetCLB: 9,
        sections: {},
        painPoints: [],
        dataRich: false,
        reviewDue: 0,
        reviewTotal: 0,
        profileError: err.message,
      },
      usage,
      weeklyFocus: [],
      profileWarning: 'Coach profile is temporarily limited. Chat still works — complete a few practice sets for richer insights.',
    })
  }
}

async function handleCoachPost(req, res, apiKey, auth) {
  const messages = cleanMessages(req.body?.messages)
  if (!messages.length) {
    return res.status(400).json({ error: 'Message is required.' })
  }

  const userId = auth.user.id
  const isPremium = await fetchPremium(auth.supabase, userId)

  const rl = await checkRateLimit({
    supabase: auth.supabase,
    scope: 'coach',
    key: userId,
    limit: isPremium ? 60 : 20,
    windowSec: 3600,
  })
  if (!rl.ok) return res.status(429).json({ error: 'too_many_requests', message: rl.message })

  const usage = await checkAndIncrementCoachUsage(auth.supabase, userId, isPremium)
  if (!usage.allowed) {
    return res.status(429).json({
      error: 'coach_limit_reached',
      message: `You've used your ${usage.limit} free coach messages this week. Upgrade to Premium for unlimited coaching.`,
      usage,
    })
  }

  try {
    const reply = await runCoachToolLoop(apiKey, messages, { supabase: auth.supabase, userId })
    const practice = suggestPractice(await getCoachProfile(auth.supabase, userId), { max: 3 })
    return res.status(200).json({
      reply,
      mode: 'coach',
      usage,
      actions: practice.suggestions,
    })
  } catch (err) {
    console.error('[assist/coach] error:', err)
    return res.status(500).json({ error: 'Coach failed. Please try again.' })
  }
}

export default async function handler(req, res) {
  const mode = String(req.body?.mode || req.query?.mode || 'support').toLowerCase()

  if (mode === 'coach') {
    const auth = await requireUser(req)
    if (!auth.ok) return res.status(auth.status).json({ error: auth.error })

    if (req.method === 'GET') return handleCoachGet(req, res, auth)
    if (req.method === 'POST') {
      const apiKey = process.env.OPENAI_API_KEY
      if (!apiKey) return res.status(503).json({ error: 'Coach is not configured yet.' })
      return handleCoachPost(req, res, apiKey, auth)
    }
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return res.status(503).json({ error: 'Chat is not configured yet.' })
  }

  return handleSupport(req, res, apiKey)
}
