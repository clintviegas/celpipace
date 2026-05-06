import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { PUBLIC_SITE_URL } from '../data/constants'

/* ─────────────────────────────────────────────────────────────
   AuthContext — global auth state
   Exposes: user, profile, isPremium, isAdmin, loading,
            signInWithGoogle, signUpWithEmail, signInWithEmail,
            resetPassword, signOut, refreshProfile
───────────────────────────────────────────────────────────── */
const AuthContext = createContext(null)

const ADMIN_EMAIL = 'sales@celpipace.com'
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function normalizeEmail(email) {
  return (email || '').trim().toLowerCase()
}

function normalizeDisplayName(displayName) {
  return (displayName || '').trim().replace(/\s+/g, ' ')
}

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [profileLoaded, setProfileLoaded] = useState(false)
  const lastSeenTouchRef = useRef(0)

  const touchUserActivity = useCallback(async (currentUser) => {
    if (!currentUser?.id) return
    const now = Date.now()
    if (now - lastSeenTouchRef.current < 5 * 60 * 1000) return
    lastSeenTouchRef.current = now
    try {
      const { error } = await supabase.rpc('touch_user_activity')
      if (!error) return
      await supabase
        .from('profiles')
        .update({ last_seen_at: new Date().toISOString() })
        .eq('id', currentUser.id)
        .catch(() => {})
    } catch { void 0 }
  }, [])

  /* ── Load / refresh profile row ── */
  const loadProfile = useCallback(async (currentUser) => {
    if (!currentUser) { setProfile(null); setProfileLoaded(true); return }
    setProfileLoaded(false)

    // NOTE: profile row is created by the `handle_new_user` trigger
    // (see supabase/admin_hardening.sql). We don't upsert here because that path runs on
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
      touchUserActivity(currentUser)
      loadProfile(currentUser)     // hydrate profile in background
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const currentUser = session?.user ?? null
        setUser(currentUser)
        setLoading(false)
        touchUserActivity(currentUser)
        loadProfile(currentUser)
      }
    )

    return () => { mounted = false; subscription.unsubscribe() }
  }, [loadProfile, touchUserActivity])

  /* ── Google OAuth ── */
  const appBaseUrl = PUBLIC_SITE_URL

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${appBaseUrl}/dashboard` },
    })
    if (error) console.error('Google sign-in error:', error.message)
  }

  /* ── Email + Password Sign Up ── */
  const signUpWithEmail = async (email, password, displayName) => {
    const normalizedEmail = normalizeEmail(email)
    const cleanName = normalizeDisplayName(displayName)

    if (!EMAIL_RE.test(normalizedEmail)) {
      return { error: 'Please enter a valid email address.' }
    }
    if (!password || password.length < 8) {
      return { error: 'Password must be at least 8 characters.' }
    }

    const { data: signUpData, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        emailRedirectTo: `${appBaseUrl}/dashboard`,
        data: cleanName ? { full_name: cleanName, name: cleanName } : undefined,
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
    const { error } = await supabase.auth.signInWithPassword({ email: normalizeEmail(email), password })
    if (error) {
      console.error('Sign-in error:', error.message)
      return { error: error.message }
    }
    return { success: true }
  }

  /* ── Forgot Password ── */
  const resetPassword = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(normalizeEmail(email), {
      redirectTo: `${appBaseUrl}/reset-password`,
    })
    if (error) {
      console.error('Reset password error:', error.message)
      return { error: error.message }
    }
    return { success: true }
  }

  /* ── Sign out ── */
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut({ scope: 'local' })
      if (error) {
        console.warn('[auth] sign out failed:', error.message)
        return { error: error.message }
      }
      return { success: true }
    } catch (e) {
      console.warn('[auth] sign out exception:', e?.message)
      return { error: e?.message || 'Unable to sign out right now.' }
    } finally {
      setUser(null)
      setProfile(null)
      setProfileLoaded(true)
      setLoading(false)
    }
  }

  const refreshProfile = useCallback(() => loadProfile(user), [loadProfile, user])

  /* ── Derived flags ── */
  const isAdmin = !!user && user.email?.toLowerCase() === ADMIN_EMAIL

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
