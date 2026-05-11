import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion as Motion } from 'framer-motion'
import { Crown, ExternalLink, Calendar, CreditCard, Shield, AlertCircle, CheckCircle2, HelpCircle, Receipt, XCircle, Mail } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { BRAND_NAME, PRODUCT_STATS } from '../data/constants'
import { supabase } from '../lib/supabase'
import { authedFetch } from '../lib/apiClient'

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

async function readApiJson(res) {
  const text = await res.text()
  if (!text) return {}
  try {
    return JSON.parse(text)
  } catch {
    throw new Error(res.ok
      ? 'Billing service returned an invalid response.'
      : 'Billing service returned an invalid response. Please try again or contact support.')
  }
}

export default function ManageSubscriptionPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const {
    user, profile, isPremium, isAdmin,
    subscriptionStatus, currentPlan, premiumExpiresAt, cancelAtPeriodEnd,
    refreshProfile,
  } = useAuth()

  const [busy, setBusy]   = useState(false)
  const [cancelBusy, setCancelBusy] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [cancelFeedback, setCancelFeedback] = useState('')
  const [cancelWouldReturn, setCancelWouldReturn] = useState(null)
  const [cancelRefundReview, setCancelRefundReview] = useState(false)
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
      <main style={{ padding: '120px 24px', textAlign: 'center' }}>
        <h1>Please sign in</h1>
        <button className="btn" onClick={() => navigate('/')}>Go Home</button>
      </main>
    )
  }

  const openPortal = async () => {
    setBusy(true); setError('')
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token
      const res  = await fetch('/api/customer-portal', {
        method:  'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body:    JSON.stringify({ userId: user.id }),
      })
      const data = await readApiJson(res)
      if (!res.ok || !data.url) throw new Error(data.error || data.message || 'Could not open portal')
      window.location.href = data.url
    } catch (e) {
      setError(e.message || 'Could not open the billing portal.')
      setBusy(false)
    }
  }

  const openCancelFlow = () => {
    setCancelReason('')
    setCancelFeedback('')
    setCancelWouldReturn(null)
    setCancelRefundReview(false)
    setError('')
    setCancelOpen(true)
  }

  const submitCancellation = async () => {
    if (!cancelReason) {
      setError('Please pick a reason so we know how to improve.')
      return
    }
    setCancelBusy(true)
    setError('')
    setBanner('')
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token
      if (!token) throw new Error('Please sign in again before changing your subscription.')

      const res = await fetch('/api/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: user.id,
          reason: cancelReason,
          feedback: cancelFeedback || null,
          wouldReturn: cancelWouldReturn,
          refundReview: cancelRefundReview,
        }),
      })
      const data = await readApiJson(res)
      if (!res.ok) throw new Error(data.message || data.error || 'Could not cancel subscription')
      setBanner(data.message || 'Cancellation scheduled. Your Premium access remains active until the end of the paid billing period.')
      setCancelOpen(false)
      refreshProfile?.()
      window.setTimeout(() => refreshProfile?.(), 1500)
    } catch (e) {
      setError(e.message || 'Could not cancel the subscription.')
    } finally {
      setCancelBusy(false)
    }
  }

  const status   = subscriptionStatus || (isPremium ? 'active' : 'none')
  const meta     = STATUS_META[status] || STATUS_META.none
  const StatusIcon = meta.icon
  const showPlanRow = isPremium || status !== 'none'
  const hasStripeAccount = !!profile?.stripe_customer_id
  const hasStripeSubscription = !!profile?.stripe_subscription_id
  const isLifetimeAccess = !isAdmin && isPremium && !hasStripeSubscription && !hasStripeAccount
  const canOpenPortal = !isAdmin && hasStripeAccount

  return (
    <main style={{ minHeight: '70vh', padding: '120px 24px 80px', background: '#fafafa' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <Motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <h1 style={{ fontSize: 32, marginBottom: 8 }}>Manage Subscription</h1>
            <p style={{ color: '#6b7280', marginBottom: 32 }}>
              View your plan, update payment details, download invoices, or cancel securely. Approved refund credits usually appear within 3-4 business days.
            </p>
          </Motion.div>

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
          <Motion.div
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
                    {isAdmin ? 'Admin' : isLifetimeAccess ? `${BRAND_NAME} Lifetime` : isPremium ? `${BRAND_NAME} Premium` : 'Free Plan'}
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
                  label={(isAdmin || isLifetimeAccess) ? 'Expires' : 'Access ends'}
                  value={(isAdmin || isLifetimeAccess) ? 'Never' : fmtDate(premiumExpiresAt)}
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
          </Motion.div>

          {/* ── Email preferences ── */}
          <EmailPreferencesCard
            initialConsent={!!profile?.marketing_consent}
            onChanged={refreshProfile}
          />

          {/* ── Actions ── */}
          {isAdmin || isLifetimeAccess ? (
            <div style={{ background: '#fff', borderRadius: 20, padding: 32, boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
              <Shield size={24} style={{ color: '#0ea5e9', marginBottom: 12 }} />
              <h3 style={{ marginBottom: 8 }}>{isAdmin ? 'Admin Account' : 'Lifetime Access'}</h3>
              <p style={{ color: '#6b7280' }}>
                This account is paid and active. No recurring Stripe subscription is attached, so there is no renewal to stop.
              </p>
              {!isAdmin && (
                <button
                  className="btn btn-outline"
                  onClick={() => navigate('/contact')}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 12 }}
                >
                  Request account change <HelpCircle size={16} />
                </button>
              )}
            </div>
          ) : canOpenPortal ? (
            <Motion.div
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              style={{ background: '#fff', borderRadius: 20, padding: 32, boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}
            >
              <h3 style={{ marginBottom: 8 }}>Manage your billing</h3>
              <p style={{ color: '#6b7280', marginBottom: 20 }}>
                Stripe handles card updates, plan changes, and invoices. If you cancel, access continues until the end of the paid billing period; refund reviews are sent to support.
              </p>
              <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
                <BillingAction
                  icon={<XCircle size={17} />}
                  label="Cancel subscription"
                  busy={cancelBusy}
                  tone="danger"
                  onClick={openCancelFlow}
                />
                <BillingAction icon={<CreditCard size={17} />} label="Update card" busy={busy} onClick={openPortal} />
                <BillingAction icon={<Receipt size={17} />} label="View invoices" busy={busy} onClick={openPortal} />
              </div>
              <button
                className="btn"
                onClick={openPortal}
                disabled={busy}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 18 }}
              >
                {busy ? 'Opening…' : <>Open Billing Portal <ExternalLink size={16} /></>}
              </button>
              <button
                className="btn btn-outline"
                onClick={() => navigate('/contact')}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 18, marginLeft: 10 }}
              >
                Ask a Question <HelpCircle size={16} />
              </button>
            </Motion.div>
          ) : (
            <Motion.div
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              style={{ background: '#fff', borderRadius: 20, padding: 32, boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}
            >
              <h3 style={{ marginBottom: 8 }}>Upgrade to Premium</h3>
              <p style={{ color: '#6b7280', marginBottom: 20 }}>
                Unlock all {PRODUCT_STATS.mockExams} mock exams, {PRODUCT_STATS.questionItems} question items and prompts, real-time scoring, and more.
              </p>
              <button className="btn" onClick={() => navigate('/#pricing')}>See Plans</button>
            </Motion.div>
          )}
      </div>

      {cancelOpen && (
        <CancelModal
          busy={cancelBusy}
          reason={cancelReason}
          setReason={setCancelReason}
          feedback={cancelFeedback}
          setFeedback={setCancelFeedback}
          wouldReturn={cancelWouldReturn}
          setWouldReturn={setCancelWouldReturn}
          refundReview={cancelRefundReview}
          setRefundReview={setCancelRefundReview}
          periodEnd={premiumExpiresAt}
          onClose={() => setCancelOpen(false)}
          onSubmit={submitCancellation}
        />
      )}
    </main>
  )
}

const CANCEL_REASONS = [
  { value: 'too_expensive',     label: 'Too expensive' },
  { value: 'missing_features',  label: 'Missing a feature I need' },
  { value: 'unused',            label: 'Not using it enough' },
  { value: 'switched_service',  label: 'Switched to another service' },
  { value: 'low_quality',       label: 'Quality / accuracy issues' },
  { value: 'too_complex',       label: 'Too hard to use' },
  { value: 'finished_studying', label: 'Done preparing for the test' },
  { value: 'other',             label: 'Other' },
]

function CancelModal({ busy, reason, setReason, feedback, setFeedback, wouldReturn, setWouldReturn, refundReview, setRefundReview, periodEnd, onClose, onSubmit }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20, zIndex: 50,
      }}
    >
      <Motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        style={{ background: '#fff', borderRadius: 18, maxWidth: 520, width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: 28, boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }}
      >
        <h2 style={{ fontSize: 20, marginBottom: 6 }}>Cancel your subscription</h2>
        <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 20 }}>
          We're sorry to see you go. Your Premium access will continue until {periodEnd ? new Date(periodEnd).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'the end of your current billing period'}. Your feedback is emailed to support.
        </p>

        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8, color: '#374151' }}>
          Reason for cancelling
        </label>
        <div style={{ display: 'grid', gap: 6, marginBottom: 18 }}>
          {CANCEL_REASONS.map(opt => (
            <label
              key={opt.value}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', borderRadius: 10, cursor: 'pointer',
                border: `1px solid ${reason === opt.value ? '#0ea5e9' : '#e5e7eb'}`,
                background: reason === opt.value ? '#f0f9ff' : '#fafafa',
                fontSize: 14,
              }}
            >
              <input
                type="radio"
                name="cancel-reason"
                value={opt.value}
                checked={reason === opt.value}
                onChange={() => setReason(opt.value)}
              />
              {opt.label}
            </label>
          ))}
        </div>

        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#374151' }}>
          Anything else? (optional)
        </label>
        <textarea
          rows={3}
          maxLength={2000}
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="What could we have done better?"
          style={{
            width: '100%', padding: 12, fontSize: 14, borderRadius: 10,
            border: '1px solid #e5e7eb', resize: 'vertical', marginBottom: 12, fontFamily: 'inherit',
          }}
        />

        <label
          style={{
            display: 'flex', alignItems: 'flex-start', gap: 10, padding: 12,
            borderRadius: 10, background: refundReview ? '#fff7ed' : '#f9fafb',
            border: `1px solid ${refundReview ? '#fed7aa' : '#e5e7eb'}`,
            color: '#374151', fontSize: 13, lineHeight: 1.45, marginBottom: 18, cursor: 'pointer',
          }}
        >
          <input
            type="checkbox"
            checked={refundReview}
            onChange={(e) => setRefundReview(e.target.checked)}
            style={{ width: 17, height: 17, marginTop: 1, flexShrink: 0 }}
          />
          <span>
            Request a refund review. Approved refunds are credited to the original payment method and usually appear within 3-4 business days.
          </span>
        </label>

        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8, color: '#374151' }}>
          Would you consider coming back later?
        </label>
        <div style={{ display: 'flex', gap: 8, marginBottom: 22 }}>
          {[
            { v: true,  label: 'Yes' },
            { v: false, label: 'No' },
            { v: null,  label: 'Not sure' },
          ].map(opt => (
            <button
              key={String(opt.v)}
              type="button"
              onClick={() => setWouldReturn(opt.v)}
              style={{
                padding: '8px 16px', borderRadius: 999, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                border: `1px solid ${wouldReturn === opt.v ? '#0ea5e9' : '#e5e7eb'}`,
                background: wouldReturn === opt.v ? '#0ea5e9' : '#fff',
                color: wouldReturn === opt.v ? '#fff' : '#374151',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            style={{
              padding: '10px 18px', borderRadius: 10, fontWeight: 600, fontSize: 14,
              border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer',
            }}
          >
            Keep subscription
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={busy || !reason}
            style={{
              padding: '10px 18px', borderRadius: 10, fontWeight: 700, fontSize: 14,
              border: 'none', cursor: busy || !reason ? 'not-allowed' : 'pointer',
              background: !reason ? '#fca5a5' : '#dc2626', color: '#fff',
              opacity: busy ? 0.7 : 1,
            }}
          >
            {busy ? 'Cancelling…' : 'Confirm cancellation'}
          </button>
        </div>
      </Motion.div>
    </div>
  )
}

function EmailPreferencesCard({ initialConsent, onChanged }) {
  const [consent, setConsent] = useState(!!initialConsent)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')

  useEffect(() => { setConsent(!!initialConsent) }, [initialConsent])

  const toggle = async (next) => {
    setBusy(true); setMsg(''); setErr('')
    try {
      const res = await authedFetch('/api/auth-consent', { body: { consent: next } })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Could not update preference.')
      setConsent(!!data.consent)
      setMsg(next ? 'Subscribed to study tips.' : 'Unsubscribed from marketing emails.')
      onChanged?.()
    } catch (e) {
      setErr(e.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Motion.div
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
      style={{ background: '#fff', borderRadius: 20, padding: 28, boxShadow: '0 4px 24px rgba(0,0,0,0.06)', marginBottom: 20 }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Mail size={20} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
            <h3 style={{ margin: 0, fontSize: 18 }}>Email preferences</h3>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: busy ? 'wait' : 'pointer' }}>
              <input
                type="checkbox"
                checked={consent}
                disabled={busy}
                onChange={(e) => toggle(e.target.checked)}
                style={{ width: 18, height: 18, cursor: 'inherit' }}
              />
              <span style={{ fontSize: 14, fontWeight: 600, color: consent ? '#16a34a' : '#6b7280' }}>
                {consent ? 'On' : 'Off'}
              </span>
            </label>
          </div>
          <p style={{ color: '#6b7280', fontSize: 14, margin: '6px 0 0', lineHeight: 1.5 }}>
            Receive CELPIP study tips, mock-test reminders, and occasional product updates from CELPIPACE. You can unsubscribe at any time from any email or here. Transactional messages (receipts, password resets) are sent regardless.
          </p>
          {msg && <div style={{ marginTop: 10, fontSize: 13, color: '#16a34a' }}>{msg}</div>}
          {err && <div style={{ marginTop: 10, fontSize: 13, color: '#dc2626' }}>{err}</div>}
        </div>
      </div>
    </Motion.div>
  )
}

function BillingAction({ icon, label, busy, tone = 'default', onClick }) {
  const danger = tone === 'danger'
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      style={{
        border: danger ? '1px solid #fecaca' : '1px solid #e5e7eb',
        background: danger ? '#fff1f2' : '#f9fafb', borderRadius: 14,
        padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 8, fontWeight: 700, color: danger ? '#b91c1c' : '#111827', cursor: busy ? 'wait' : 'pointer',
      }}
    >
      {icon}
      {busy ? 'Opening...' : label}
    </button>
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
