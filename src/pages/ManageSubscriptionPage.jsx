import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Crown, ExternalLink, Calendar, CreditCard, Shield, AlertCircle, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

/* ─────────────────────────────────────────────────────────────
   Manage Subscription
   • Shows plan, status, next billing/expiry date
   • Opens Stripe Customer Portal for cancel / update card / invoices
───────────────────────────────────────────────────────────── */

const STATUS_META = {
  active:      { label: 'Active',      color: '#16a34a', icon: CheckCircle2 },
  trialing:    { label: 'Trial',       color: '#0ea5e9', icon: CheckCircle2 },
  past_due:    { label: 'Past Due',    color: '#f59e0b', icon: AlertCircle },
  canceled:    { label: 'Canceling',   color: '#f59e0b', icon: AlertCircle },
  expired:     { label: 'Expired',     color: '#dc2626', icon: AlertCircle },
  incomplete:  { label: 'Incomplete',  color: '#6b7280', icon: AlertCircle },
  none:        { label: 'No Plan',     color: '#6b7280', icon: AlertCircle },
}

function fmtDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric', month: 'long', day: 'numeric',
  })
}

export default function ManageSubscriptionPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const {
    user, isPremium, isAdmin,
    subscriptionStatus, currentPlan, premiumExpiresAt, cancelAtPeriodEnd,
    refreshProfile,
  } = useAuth()

  const [busy, setBusy]   = useState(false)
  const [error, setError] = useState('')
  const [banner, setBanner] = useState('')

  // Refresh after returning from checkout
  useEffect(() => {
    if (params.get('checkout') === 'success') {
      setBanner('🎉 Welcome to Premium! Your subscription is now active.')
      // Webhook lag — refresh a couple of times
      const t1 = setTimeout(() => refreshProfile?.(), 1500)
      const t2 = setTimeout(() => refreshProfile?.(), 5000)
      return () => { clearTimeout(t1); clearTimeout(t2) }
    }
  }, [params, refreshProfile])

  if (!user) {
    return (
      <>
        <Navbar />
        <main style={{ padding: '120px 24px', textAlign: 'center' }}>
          <h1>Please sign in</h1>
          <button className="btn" onClick={() => navigate('/')}>Go Home</button>
        </main>
        <Footer />
      </>
    )
  }

  const openPortal = async () => {
    setBusy(true); setError('')
    try {
      const res  = await fetch('/api/customer-portal', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ userId: user.id }),
      })
      const data = await res.json()
      if (!res.ok || !data.url) throw new Error(data.error || data.message || 'Could not open portal')
      window.location.href = data.url
    } catch (e) {
      setError(e.message || 'Could not open the billing portal.')
      setBusy(false)
    }
  }

  const status   = subscriptionStatus || 'none'
  const meta     = STATUS_META[status] || STATUS_META.none
  const StatusIcon = meta.icon
  const showPlanRow = isPremium || status !== 'none'

  return (
    <>
      <Navbar />
      <main style={{ minHeight: '70vh', padding: '120px 24px 80px', background: '#fafafa' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <h1 style={{ fontSize: 32, marginBottom: 8 }}>Manage Subscription</h1>
            <p style={{ color: '#6b7280', marginBottom: 32 }}>
              View your plan, billing date, and cancel anytime. You keep access until the period ends.
            </p>
          </motion.div>

          {banner && (
            <div style={{
              padding: 14, marginBottom: 20, borderRadius: 12,
              background: '#dcfce7', color: '#166534', fontWeight: 500,
            }}>{banner}</div>
          )}
          {error && (
            <div style={{
              padding: 14, marginBottom: 20, borderRadius: 12,
              background: '#fee2e2', color: '#991b1b', fontWeight: 500,
            }}>{error}</div>
          )}

          {/* ── Status card ── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            style={{
              background: '#fff', borderRadius: 20, padding: 32,
              boxShadow: '0 4px 24px rgba(0,0,0,0.06)', marginBottom: 20,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 12,
                  background: isPremium ? 'linear-gradient(135deg,#fbbf24,#f59e0b)' : '#e5e7eb',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Crown size={24} color={isPremium ? '#fff' : '#6b7280'} />
                </div>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 700 }}>
                    {isAdmin ? 'Admin' : isPremium ? 'celpipAce Premium' : 'Free Plan'}
                  </div>
                  <div style={{ color: '#6b7280', fontSize: 14, textTransform: 'capitalize' }}>
                    {currentPlan} plan
                  </div>
                </div>
              </div>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '6px 12px', borderRadius: 999,
                background: `${meta.color}15`, color: meta.color, fontWeight: 600, fontSize: 13,
              }}>
                <StatusIcon size={14} />
                {meta.label}
              </div>
            </div>

            {showPlanRow && (
              <div style={{ display: 'grid', gap: 16, gridTemplateColumns: '1fr 1fr' }}>
                <Row
                  icon={<Calendar size={18} />}
                  label={cancelAtPeriodEnd || status === 'canceled' ? 'Access ends' : isAdmin ? 'Expires' : 'Next billing date'}
                  value={isAdmin ? 'Never' : fmtDate(premiumExpiresAt)}
                />
                <Row
                  icon={<CreditCard size={18} />}
                  label="Plan"
                  value={currentPlan === 'free' ? 'Free' : currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}
                />
              </div>
            )}

            {cancelAtPeriodEnd && status !== 'expired' && (
              <div style={{
                marginTop: 24, padding: 14, borderRadius: 12,
                background: '#fef3c7', color: '#92400e', fontSize: 14,
              }}>
                <strong>Cancellation scheduled.</strong> Your subscription will end on {fmtDate(premiumExpiresAt)}.
                You'll keep full access until then.
              </div>
            )}
          </motion.div>

          {/* ── Actions ── */}
          {isAdmin ? (
            <div style={{ background: '#fff', borderRadius: 20, padding: 32, boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
              <Shield size={24} style={{ color: '#0ea5e9', marginBottom: 12 }} />
              <h3 style={{ marginBottom: 8 }}>Admin Account</h3>
              <p style={{ color: '#6b7280' }}>You have lifetime access — no billing applies to this account.</p>
            </div>
          ) : isPremium ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              style={{ background: '#fff', borderRadius: 20, padding: 32, boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}
            >
              <h3 style={{ marginBottom: 8 }}>Manage your billing</h3>
              <p style={{ color: '#6b7280', marginBottom: 20 }}>
                Update your card, view invoices, or cancel — securely through Stripe.
              </p>
              <button
                className="btn"
                onClick={openPortal}
                disabled={busy}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
              >
                {busy ? 'Opening…' : <>Open Billing Portal <ExternalLink size={16} /></>}
              </button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              style={{ background: '#fff', borderRadius: 20, padding: 32, boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}
            >
              <h3 style={{ marginBottom: 8 }}>Upgrade to Premium</h3>
              <p style={{ color: '#6b7280', marginBottom: 20 }}>
                Unlock all 8 mock exams, 344+ practice questions, AI scoring, and more.
              </p>
              <button className="btn" onClick={() => navigate('/#pricing')}>See Plans</button>
            </motion.div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}

function Row({ icon, label, value }) {
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
      <div style={{ color: '#9ca3af', marginTop: 2 }}>{icon}</div>
      <div>
        <div style={{ fontSize: 12, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</div>
        <div style={{ fontWeight: 600 }}>{value}</div>
      </div>
    </div>
  )
}
