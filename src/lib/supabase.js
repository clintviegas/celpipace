import { createClient } from '@supabase/supabase-js'

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL
const supabaseAnon = import.meta.env.VITE_SUPABASE_ANON_KEY

// Suppress the auth lock warning in development
if (typeof window !== 'undefined') {
  const originalWarn = console.warn
  console.warn = function(...args) {
    if (args[0]?.includes?.('Lock') || args[0]?.includes?.('auth-token')) {
      return // Silently ignore Supabase auth lock warnings
    }
    originalWarn.apply(console, args)
  }
}

let supabaseInstance = null

export function getSupabase() {
  if (supabaseInstance) return supabaseInstance
  if (!supabaseUrl || !supabaseAnon) {
    throw new Error('Supabase is not configured (missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY)')
  }
  supabaseInstance = createClient(supabaseUrl, supabaseAnon, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  })
  return supabaseInstance
}

// Lazy proxy — importing this module must not throw; callers fail only on first use.
export const supabase = new Proxy({}, {
  get(_target, prop) {
    const client = getSupabase()
    const value = client[prop]
    return typeof value === 'function' ? value.bind(client) : value
  },
})
