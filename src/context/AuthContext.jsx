import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

/* ─────────────────────────────────────────────────────────────
   AuthContext — global auth state for the entire app
   Provides: user, loading, signInWithGoogle, signInWithMagicLink, signOut
───────────────────────────────────────────────────────────── */
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  /* ── Listen for auth state changes (login / logout / token refresh) ── */
  useEffect(() => {
    // Get current session on first load
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Subscribe to future changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const currentUser = session?.user ?? null
        setUser(currentUser)
        setLoading(false)

        // ── Save user profile on first sign-up ──
        // This inserts a row into our `profiles` table (email marketing list)
        if (currentUser) {
          await supabase
            .from('profiles')
            .upsert(
              {
                id:         currentUser.id,
                email:      currentUser.email,
                full_name:  currentUser.user_metadata?.full_name  ?? null,
                avatar_url: currentUser.user_metadata?.avatar_url ?? null,
              },
              { onConflict: 'id', ignoreDuplicates: true }
            )
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  /* ── Google OAuth ── */
  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,   // returns to same page after login
      },
    })
    if (error) console.error('Google sign-in error:', error.message)
  }

  /* ── Magic Link (passwordless email) ── */
  const signInWithMagicLink = async (email) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin,
      },
    })
    if (error) {
      console.error('Magic link error:', error.message)
      return { error: error.message }
    }
    return { success: true }
  }

  /* ── Sign out ── */
  const signOut = () => {
    setUser(null)
    supabase.auth.signOut({ scope: 'local' }).catch(() => {})
  }

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signInWithMagicLink, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

/* ── Custom hook — useAuth() ── */
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
