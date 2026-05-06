import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft,
  BadgePercent,
  Check,
  CheckCircle2,
  CreditCard,
  Crown,
  LockKeyhole,
  ReceiptText,
  ShieldCheck,
  Sparkles,
  Tag,
  Zap,
} from 'lucide-react'
import SEO from '../components/SEO'
import { useAuth } from '../context/AuthContext'
import {
  BILLING_PLANS,
  PREMIUM_FEATURES,
  WELCOME_COUPON_CODE,
  WELCOME_DISCOUNT,
  formatPlanPrice,
  getBillingPlan,
} from '../data/paymentPlans'
import { BRAND_NAME } from '../data/constants'

const PLAN_ICONS = {
  weekly: <Zap size={19} />,
  monthly: <Sparkles size={19} />,
  annual: <Crown size={19} />,
}

const TRUST_ITEMS = [
  { label: 'Stripe checkout', icon: <CreditCard size={16} /> },
  { label: 'Encrypted payment', icon: <LockKeyhole size={16} /> },
  { label: 'Self-serve billing', icon: <ReceiptText size={16} /> },
]

function normalizeCoupon(value) {
  return String(value || '').trim().toUpperCase()
}

async function readApiJson(res) {
  const text = await res.text()
  if (!text) return {}
  try {
    return JSON.parse(text)
  } catch {
    throw new Error(res.ok
      ? 'Payment service returned an invalid response.'
      : 'Payment service returned an invalid response. Please try again or contact support.')
  }
}

export default function PaymentPage({ onSignIn }) {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { user, isPremium } = useAuth()
  const requestedPlan = params.get('plan') || 'annual'
  const requestedCoupon = normalizeCoupon(params.get('coupon'))
  const [selected, setSelected] = useState(getBillingPlan(requestedPlan).id)
  const [coupon, setCoupon] = useState(requestedCoupon || WELCOME_COUPON_CODE)
  const [couponApplied, setCouponApplied] = useState(requestedCoupon === WELCOME_COUPON_CODE)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('info')
  const [busy, setBusy] = useState(false)

  const plan = useMemo(() => getBillingPlan(selected), [selected])
  const discountAmount = couponApplied ? plan.price * WELCOME_DISCOUNT : 0
  const dueToday = plan.price - discountAmount

  useEffect(() => {
    setSelected(getBillingPlan(requestedPlan).id)
  }, [requestedPlan])

  const handleApplyCoupon = () => {
    const code = normalizeCoupon(coupon)
    setMessage('')
    setMessageType('info')
    if (!code) {
      setCouponApplied(false)
      return
    }
    if (code !== WELCOME_COUPON_CODE) {
      setCouponApplied(false)
      setMessageType('error')
      setMessage('Enter CELPIP25 here, or enter another Stripe promotion code on the Stripe checkout screen.')
      return
    }
    setCoupon(WELCOME_COUPON_CODE)
    setCouponApplied(true)
    setMessageType('success')
    setMessage('CELPIP25 will be verified for first-time subscription eligibility in Stripe.')
  }

  const startCheckout = async () => {
    if (!user) {
      onSignIn?.()
      return
    }
    setBusy(true)
    setMessage('')
    setMessageType('info')
    try {
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: selected,
          userId: user.id,
          email: user.email,
          couponCode: couponApplied ? WELCOME_COUPON_CODE : undefined,
        }),
      })
      const data = await readApiJson(res)
      if (!res.ok || !data.url) throw new Error(data.message || data.error || 'Could not start checkout')
      window.location.href = data.url
    } catch (error) {
      setMessageType('error')
      setMessage(error.message || 'Could not start checkout. Please try again.')
      setBusy(false)
    }
  }

  if (isPremium) {
    return (
      <main className="payment-page payment-page--simple">
        <SEO title="Premium Active" description={`Manage your ${BRAND_NAME} Premium subscription.`} canonical="/payment" />
        <section className="payment-active-panel">
          <div className="payment-active-icon"><Crown size={28} /></div>
          <h1>You already have Premium</h1>
          <p>Manage your current subscription, invoices, cancellation, and payment method in one place.</p>
          <button className="btn btn-primary" onClick={() => navigate('/subscription')}>Manage Subscription</button>
        </section>
      </main>
    )
  }

  return (
    <main className="payment-page">
      <SEO
        title="Secure Payment"
        description={`Complete your ${BRAND_NAME} Premium subscription with secure Stripe checkout.`}
        canonical="/payment"
      />

      <section className="payment-shell">
        <div className="payment-heading">
          <button className="payment-back" type="button" onClick={() => navigate('/pricing')}>
            <ArrowLeft size={17} /> Plans
          </button>
          <span className="payment-kicker"><ShieldCheck size={15} /> Secure Stripe payment</span>
          <h1>Complete your Premium upgrade</h1>
          <p>Review your plan, apply your first-time offer, and continue to Stripe for card, Apple Pay, Google Pay, or Link.</p>
        </div>

        <div className="payment-layout">
          <section className="payment-main-panel">
            <div className="payment-panel-head">
              <div>
                <span>Plan</span>
                <h2>Choose Premium access</h2>
              </div>
              <Crown size={24} />
            </div>

            <div className="payment-plan-grid" role="radiogroup" aria-label="Premium plans">
              {BILLING_PLANS.map(option => {
                const active = selected === option.id
                return (
                  <button
                    key={option.id}
                    type="button"
                    className={`payment-plan-card${active ? ' payment-plan-card--active' : ''}`}
                    role="radio"
                    aria-checked={active}
                    onClick={() => setSelected(option.id)}
                  >
                    {option.popular && <span className="payment-plan-badge">Best value</span>}
                    <span className="payment-plan-icon">{PLAN_ICONS[option.id] || PLAN_ICONS.monthly}</span>
                    <strong>{option.label}</strong>
                    <span className="payment-plan-price">{formatPlanPrice(option.price)}<small>{option.period}</small></span>
                    <span className="payment-plan-note">{option.badge}</span>
                  </button>
                )
              })}
            </div>

            <div className="payment-coupon-row">
              <div className="payment-coupon-copy">
                <Tag size={18} />
                <span><strong>First-time offer</strong> 25% off with {WELCOME_COUPON_CODE}</span>
              </div>
              <div className="payment-coupon-control">
                <input
                  value={coupon}
                  onChange={event => { setCoupon(event.target.value); setCouponApplied(false) }}
                  onKeyDown={event => { if (event.key === 'Enter') handleApplyCoupon() }}
                  placeholder={WELCOME_COUPON_CODE}
                  aria-label="Coupon code"
                />
                <button type="button" onClick={handleApplyCoupon}>Apply</button>
              </div>
            </div>

            {message && (
              <div className={`payment-message${messageType === 'success' ? ' payment-message--success' : ''}`}>
                {messageType === 'success' ? <CheckCircle2 size={16} /> : <BadgePercent size={16} />}
                {message}
              </div>
            )}

            <div className="payment-feature-list" aria-label="Premium includes">
              {PREMIUM_FEATURES.slice(0, 6).map(feature => (
                <span key={feature}><Check size={15} />{feature}</span>
              ))}
            </div>
          </section>

          <aside className="payment-summary">
            <div className="payment-summary-top">
              <span>Order summary</span>
              <h2>{BRAND_NAME} Premium</h2>
              <p>{plan.blurb}</p>
            </div>

            <div className="payment-summary-lines">
              <div>
                <span>{plan.label} plan</span>
                <strong>{formatPlanPrice(plan.price)}</strong>
              </div>
              {couponApplied && (
                <div className="payment-discount-line">
                  <span>{WELCOME_COUPON_CODE}</span>
                  <strong>-{formatPlanPrice(discountAmount)}</strong>
                </div>
              )}
              <div className="payment-total-line">
                <span>Due today</span>
                <strong>{formatPlanPrice(dueToday)}</strong>
              </div>
              <p>{plan.cadence}. Cancel any time in the Stripe customer portal.</p>
            </div>

            <button className="payment-pay-button" type="button" onClick={startCheckout} disabled={busy}>
              <LockKeyhole size={18} />
              {busy ? 'Opening Stripe...' : user ? 'Continue to Stripe' : 'Sign in to continue'}
            </button>

            <div className="payment-user-box">
              <span>Account</span>
              <strong>{user?.email || 'Sign in required'}</strong>
            </div>

            <div className="payment-trust-grid">
              {TRUST_ITEMS.map(({ label, icon }) => (
                <span key={label}>{icon}{label}</span>
              ))}
            </div>

            <div className="payment-policy-links">
              <button type="button" onClick={() => navigate('/terms')}>Terms</button>
              <button type="button" onClick={() => navigate('/privacy')}>Privacy</button>
              <button type="button" onClick={() => navigate('/refund')}>Refund</button>
            </div>
          </aside>
        </div>
      </section>
    </main>
  )
}