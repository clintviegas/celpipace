import { supabase } from './supabase'
import { authedFetch } from './apiClient'

export async function fetchCoachDashboard() {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.access_token) {
    return { error: 'sign_in_required' }
  }

  const res = await authedFetch('/api/assist?mode=coach', { method: 'GET' })
  const data = await res.json()
  if (!res.ok) {
    throw new Error(data.error || 'Could not load coach profile')
  }
  return data
}

export async function sendCoachMessage(messages) {
  const res = await authedFetch('/api/assist', {
    body: { mode: 'coach', messages },
  })
  const data = await res.json()
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
