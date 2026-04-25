import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

/* ─────────────────────────────────────────────────────────────
   AuthContext — global auth state
   Exposes: user, profile, isPremium, isAdmin, loading,
            signInWithGoogle, signUpWithEmail, signInWithEmail,
            resetPassword, signOut, refreshProfile
───────────────────────────────────────────────────────────── */
const AuthContext = createContext(null)

const ADMIN_EMAIL = 'sales@celpipace.com'

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [profileLoaded, setProfileLoaded] = useState(false)

  /* ── Load / refresh profile row ── */
  const loadProfile = useCallback(async (currentUser) => {
    if (!currentUser) { setProfile(null); setProfileLoaded(true); return }
    setProfileLoaded(false)

    // NOTE: profile row is created by the `handle_new_user` trigger
    // (see auth_premium.sql). We don't upsert here because that path runs on
    // every auth state change and could deadlock with the billing-column
    // guard trigger if something goes wrong. Use `select('*')` so we don't
    // crash if the subscriptions_schema migration hasn't been run yet.
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .maybeSingle()

      if (error) {
        console.warn('[auth] profile load failed:', error.message)
        setProfile(null)
        return
      }

      // If no profile row exists yet (e.g. trigger hasn't fired yet for legacy
      // users), do a one-time best-effort upsert with safe columns only.
      if (!data) {
        await supabase.from('profiles').upsert({
          id:         currentUser.id,
          email:      currentUser.email,
          full_name:  currentUser.user_metadata?.full_name  ?? null,
          avatar_url: currentUser.user_metadata?.avatar_url ?? null,
        }, { onConflict: 'id' }).catch(() => {})
        const { data: created } = await supabase
          .from('profiles').select('*').eq('id', currentUser.id).maybeSingle()
        setProfile(created || null)
        return
      }
      setProfile(data)
    } catch (e) {
      console.warn('[auth] profile load exception:', e?.message)
      setProfile(null)
    } finally {
      setProfileLoaded(true)
    }
  }, [])

  /* ── Session bootstrap + subscribe ── */
  useEffect(() => {
    let mounted = true
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return
      const currentUser = session?.user ?? null
      setUser(currentUser)
      setLoading(false)            // unblock UI immediately
      loadProfile(currentUser)     // hydrate profile in background
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const currentUser = session?.user ?? null
        setUser(currentUser)
        setLoading(false)
        loadProfile(currentUser)
      }
    )

    return () => { mounted = false; subscription.unsubscribe() }
  }, [loadProfile])

  /* ── Google OAuth ── */
  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })
    if (error) console.error('Google sign-in error:', error.message)
  }

  /* ── Email + Password Sign Up ── */
  const signUpWithEmail = async (email, password, displayName) => {
    const { data: signUpData, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: displayName ? { full_name: displayName } : undefined,
      },
    })
    if (error) {
      console.error('Sign-up error:', error.message)
      return { error: error.message }
    }
    if (signUpData?.user?.identities?.length === 0) {
      return { error: 'An account with this email already exists. Try signing in instead.' }
    }
    return { success: true, needsConfirmation: !signUpData.session }
  }

  /* ── Email + Password Sign In ── */
  const signInWithEmail = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      console.error('Sign-in error:', error.message)
      return { error: error.message }
    }
    return { success: true }
  }

  /* ── Forgot Password ── */
  const resetPassword = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) {
      console.error('Reset password error:', error.message)
      return { error: error.message }
    }
    return { success: true }
  }

  /* ── Sign out ── */
  const signOut = () => {
    setUser(null)
    setProfile(null)
    setProfileLoaded(true)
    supabase.auth.signOut({ scope: 'local' }).catch(() => {})
  }

  const refreshProfile = useCallback(() => loadProfile(user), [loadProfile, user])

  /* ── Derived flags ── */
  const isAdmin = !!user && user.email === ADMIN_EMAIL

  // Premium is true iff the profile flag is set AND we're still inside the
  // paid window. The DB sweep + webhook eventually flip is_premium=false on
  // expiry, but this client-side guard prevents a momentary access leak.
  const expiresAt = profile?.premium_expires_at ? new Date(profile.premium_expires_at) : null
  const withinWindow = !expiresAt || expiresAt.getTime() > Date.now()
  const isPremium = isAdmin || (!!profile?.is_premium && withinWindow)

  const subscriptionStatus = isAdmin ? 'active' : (profile?.subscription_status || 'none')
  const currentPlan        = isAdmin ? 'admin'  : (profile?.current_plan || 'free')
  const premiumExpiresAt   = profile?.premium_expires_at || null
  const cancelAtPeriodEnd  = !!profile?.cancel_at_period_end

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        profileLoaded,
        isPremium,
        isAdmin,
        subscriptionStatus,
        currentPlan,
        premiumExpiresAt,
        cancelAtPeriodEnd,
        signInWithGoogle,
        signUpWithEmail,
        signInWithEmail,
        resetPassword,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
