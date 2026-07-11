import { supabase } from './supabase'
import { authedFetch } from './apiClient'

async function parseJsonResponse(res) {
  const text = await res.text()
  if (!text) return {}
  try {
    return JSON.parse(text)
  } catch {
    const snippet = text.replace(/\s+/g, ' ').trim().slice(0, 160)
    throw new Error(
      snippet.startsWith('{')
        ? 'Coach returned invalid data.'
        : snippet || 'Coach service unavailable. Please try again in a moment.',
    )
  }
}

export async function fetchCoachDashboard() {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.access_token) {
    return { error: 'sign_in_required' }
  }

  const res = await authedFetch('/api/assist?mode=coach', { method: 'GET' })
  const data = await parseJsonResponse(res)
  if (!res.ok) {
    throw new Error(data.error || data.message || 'Could not load coach profile')
  }
  return data
}

export async function sendCoachMessage(messages) {
  const res = await authedFetch('/api/assist', {
    body: { mode: 'coach', messages },
  })
  const data = await parseJsonResponse(res)
  if (res.status === 429 && data.error === 'coach_limit_reached') {
    return { limitReached: true, message: data.message, usage: data.usage }
  }
  if (!res.ok || !data.reply) {
    throw new Error(data.message || data.error || 'Coach unavailable')
  }
  return data
}

export function formatSkillLabel(skill) {
  if (!skill) return 'General'
  return String(skill).replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}
