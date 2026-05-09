import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { AUTH_CONSENT_STORAGE_KEY, PUBLIC_SITE_URL, TERMS_VERSION } from '../data/constants'

// Fire once per session for brand-new accounts (created_at within last 2 min).
// Uses sessionStorage so it doesn't repeat on tab focus within the same session.
async function maybeSyncNewUser(profile) {
  if (!profile?.created_at) return
  const isNew = Date.now() - new Date(profile.created_at).getTime() < 2 * 60 * 1000
  if (!isNew) return
  const flag = `loops_signup_fired_${profile.id}`
  if (sessionStorage.getItem(flag)) return
  sessionStorage.setItem(flag, '1')
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.access_token) return
    await fetch('/api/on-signup', {
      method: 'POST',
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
  } catch { /* non-blocking */ }
}

function readPendingAuthConsent() {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(AUTH_CONSENT_STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function clearPendingAuthConsent() {
  if (typeof window === 'undefined') return
  try { window.localStorage.removeItem(AUTH_CONSENT_STORAGE_KEY) } catch { void 0 }
}

async function syncPendingAuthConsent(profile) {
  if (!profile?.id) return profile
  const pending = readPendingAuthConsent()
  if (!pending?.termsAccepted) return profile

  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.access_token) return profile

    const res = await fetch('/api/auth-consent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        termsAccepted: true,
        termsVersion: pending.termsVersion || TERMS_VERSION,
        marketingConsent: pending.marketingConsent === true,
      }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data.error || 'Could not save sign-in consent.')
    clearPendingAuthConsent()
    return {
      ...profile,
      terms_accepted_at: data.termsAcceptedAt || profile.terms_accepted_at,
      terms_version: data.termsVersion || profile.terms_version,
      marketing_consent: typeof data.marketingConsent === 'boolean' ? data.marketingConsent : profile.marketing_consent,
      marketing_consent_at: data.marketingConsentAt || profile.marketing_consent_at,
    }
  } catch (error) {
    console.warn('[auth] consent sync failed:', error?.message || error)
    return profile
  }
}

/* ─────────────────────────────────────────────────────────────
   AuthContext — global auth state
   Exposes: user, profile, isPremium, isAdmin, loading,
            signInWithGoogle, signOut, refreshProfile
───────────────────────────────────────────────────────────── */
const AuthContext = createContext(null)

const ADMIN_EMAIL = 'clint.viegas@gmail.com'

function normalizeRedirectPath(redirectPath) {
  if (typeof redirectPath !== 'string') return '/dashboard'
  if (!redirectPath.startsWith('/') || redirectPath.startsWith('//')) return '/dashboard'
  return redirectPath.slice(0, 512) || '/dashboard'
}

function getTrustedRedirectOrigin(fallbackOrigin) {
  if (typeof window === 'undefined') return fallbackOrigin
  const { hostname, origin } = window.location
  const trustedHosts = new Set(['localhost', '127.0.0.1', 'celpipace.ca', 'www.celpipace.ca'])
  return trustedHosts.has(hostname) ? origin : fallbackOrigin
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
        const syncedCreated = await syncPendingAuthConsent(created)
        setProfile(syncedCreated || null)
        maybeSyncNewUser(syncedCreated)
        return
      }
      const syncedProfile = await syncPendingAuthConsent(data)
      setProfile(syncedProfile)
      maybeSyncNewUser(syncedProfile)
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

  const signInWithGoogle = async (redirectPath = '/dashboard') => {
    const safeRedirectPath = normalizeRedirectPath(redirectPath)
    const redirectOrigin = getTrustedRedirectOrigin(appBaseUrl)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${redirectOrigin}${safeRedirectPath}` },
    })
    if (error) {
      console.error('Google sign-in error:', error.message)
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
