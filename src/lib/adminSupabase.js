import { createClient } from '@supabase/supabase-js'

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL
const supabaseAnon = import.meta.env.VITE_SUPABASE_ANON_KEY

let adminSupabaseInstance = null

function initAdminSupabase() {
  if (adminSupabaseInstance) return adminSupabaseInstance

  adminSupabaseInstance = createClient(supabaseUrl, supabaseAnon, {
    auth: {
      storageKey: 'celpipace-admin-auth',
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  })

  return adminSupabaseInstance
}

export const adminSupabase = (() => {
  try {
    return initAdminSupabase()
  } catch (err) {
    console.error('Failed to initialize admin Supabase client:', err)
    throw err
  }
})()
