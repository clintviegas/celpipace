import { createClient } from '@supabase/supabase-js'
import { checkRateLimit } from './_lib/rateLimit.js'

const SUPPORT_EMAIL = process.env.CONTACT_TO_EMAIL || 'info@celpipace.ca'
const MAX_MESSAGE_CHARS = 5000

function getBearerToken(req) {
  const header = req.headers.authorization || req.headers.Authorization || ''
  const match = String(header).match(/^Bearer\s+(.+)$/i)
  return match?.[1] || ''
}

function getBody(req) {
  if (!req.body) return {}
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body) } catch { return {} }
  }
  return req.body
}

function clean(value, max = 400) {
  return String(value || '').trim().slice(0, max)
}

async function sendEmail(payload) {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.CONTACT_FROM_EMAIL
  if (!apiKey || !from) {
    return { sent: false, error: 'email_provider_not_configured' }
  }

  const subject = `CELPIPACE ${payload.type}: ${payload.section}`
  const text = [
    `Request type: ${payload.type}`,
    `Section: ${payload.section}`,
    `Urgency: ${payload.urgency}`,
    `Name: ${payload.name || '-'}`,
    `Account email: ${payload.email || '-'}`,
    `User ID: ${payload.userId || '-'}`,
    '',
    'Message:',
    payload.message,
  ].join('\n')

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: SUPPORT_EMAIL,
      reply_to: payload.email || undefined,
      subject,
      text,
    }),
  })

  const result = await response.json().catch(() => ({}))
  if (!response.ok) {
    return { sent: false, error: result.message || result.error || 'email_send_failed' }
  }
  return { sent: true, id: result.id || null }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const supaUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const svcKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supaUrl || !svcKey) return res.status(500).json({ error: 'Server not configured' })

  const body = getBody(req)
  const payload = {
    type: clean(body.type || 'Ask a question'),
    section: clean(body.section || 'Not section-specific'),
    urgency: clean(body.urgency || 'Normal'),
    name: clean(body.name),
    email: clean(body.email, 320).toLowerCase(),
    message: clean(body.message, MAX_MESSAGE_CHARS),
  }

  if (!payload.message) return res.status(400).json({ error: 'message_required', message: 'Please enter a message.' })

  const supabase = createClient(supaUrl, svcKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  let userId = null
  const token = getBearerToken(req)
  if (token) {
    const { data: authData, error: authError } = await supabase.auth.getUser(token)
    if (authError || !authData?.user) return res.status(401).json({ error: 'Invalid session' })
    userId = authData.user.id
  }

  // Rate limit: 5 contact messages per hour per actor.
  // Key: signed-in user_id; falls back to email; falls back to client IP.
  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown'
  const rlKey = userId || payload.email || ip
  const rl = await checkRateLimit({ supabase, scope: 'contact', key: rlKey, limit: 5, windowSec: 3600 })
  if (!rl.ok) return res.status(429).json({ error: 'too_many_requests', message: rl.message })

  const { data: row, error: insertError } = await supabase
    .from('contact_messages')
    .insert({
      user_id: userId,
      request_type: payload.type,
      section: payload.section,
      urgency: payload.urgency,
      name: payload.name || null,
      email: payload.email || null,
      message: payload.message,
      user_agent: req.headers['user-agent'] || null,
    })
    .select('id')
    .single()

  if (insertError) return res.status(500).json({ error: insertError.message })

  const emailResult = await sendEmail({ ...payload, userId })
  await supabase
    .from('contact_messages')
    .update({
      email_sent: emailResult.sent,
      email_error: emailResult.error || null,
    })
    .eq('id', row.id)

  return res.status(emailResult.sent ? 200 : 202).json({
    success: true,
    id: row.id,
    emailSent: emailResult.sent,
    emailError: emailResult.error || null,
  })
}