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

function initSupabase() {
  if (supabaseInstance) return supabaseInstance
  
  supabaseInstance = createClient(supabaseUrl, supabaseAnon, {
    auth: {
      persistSession: true,        // save session to localStorage
      autoRefreshToken: true,      // keep the token alive
      detectSessionInUrl: true,    // pick up the OAuth token from the redirect URL
    },
  })
  
  return supabaseInstance
}

export const supabase = (() => {
  try {
    return initSupabase()
  } catch (err) {
    console.error('Failed to initialize Supabase:', err)
    throw err
  }
})()
