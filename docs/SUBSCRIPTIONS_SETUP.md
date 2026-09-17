# Subscription System Setup

This document covers the recurring subscription system: Stripe + Supabase + RLS.

---

## 1. Run the SQL migrations (in order)

```sql
-- Existing
\i supabase/auth_premium.sql
\i supabase/payments_schema.sql
\i supabase/coupons.sql

-- NEW
\i supabase/subscriptions_schema.sql
```

`subscriptions_schema.sql` is **idempotent** — re-running it is safe.

It adds these columns to `profiles`:

| Column | Purpose |
| --- | --- |
| `subscription_status` | `active` / `trialing` / `past_due` / `canceled` / `expired` / `incomplete` |
| `stripe_subscription_id` | Stripe `sub_xxx` |
| `cancel_at_period_end` | True if user clicked Cancel via portal |
| `current_period_start` / `current_period_end` | Current billing window |
| `last_payment_at` | Set on each `invoice.paid` |

It also adds:

- `is_premium_active(uid)` — single source of truth
- `am_i_premium()` — same, for the current user
- `assert_premium()` — raises in any RPC that should be premium-gated
- `expire_premium_users()` — sweeps stale rows (call from cron)
- `my_subscription` view — for the manage page (RLS-safe)
- A trigger on `profiles` that **rejects any client UPDATE** that touches billing columns. Only the service role (webhook) can mutate them.

### Optional: enable pg_cron for auto-expiry

```sql
CREATE EXTENSION IF NOT EXISTS pg_cron;
SELECT cron.schedule('expire-premium-users', '*/15 * * * *',
  $$SELECT public.expire_premium_users();$$);
```

The webhook also calls `expire_premium_users()` on every event as a backstop, so cron is optional.

---

## 2. Stripe Dashboard setup

### a) Create RECURRING prices

The plans must now be **recurring**, not one-time.

| Plan | Interval | Amount |
| --- | --- | --- |
| Weekly | Every 1 week | $12.99 USD |
| Monthly | Every 1 month | $24.99 USD |
| Annual | Every 1 year | $49.99 USD |

Copy the new price IDs into Vercel:

```
STRIPE_PRICE_WEEKLY=price_xxx
STRIPE_PRICE_MONTHLY=price_xxx
STRIPE_PRICE_ANNUAL=price_xxx
```

### b) Create the first-time coupon

Stripe → Product catalog → Coupons → Create coupon:

- Coupon: 25% off
- Duration: once
- Promotion code: `CELPIP25`
- Active: yes

Optional but recommended: copy the promotion code ID (`promo_xxx`) into Vercel as:

```
STRIPE_PROMOTION_CODE_CELPIP25=promo_xxx
```

If this env var is not set, the checkout API looks up an active Stripe promotion code named `CELPIP25`. The API verifies the user has no previous paid/refunded payment before applying it.

### c) Configure the Customer Portal

Stripe → Settings → Billing → Customer portal.

Enable:
- ✅ Customers can cancel subscriptions
- ✅ **Cancel mode: At end of billing period** (so users keep access until expiry — matches the spec)
- ✅ Customers can update payment method
- ✅ Show invoice history

### d) Webhook endpoint

Point Stripe → Developers → Webhooks at:

```
https://YOUR-DOMAIN/api/stripe-webhook
```

Subscribe to these events:

- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.paid`
- `invoice.payment_failed`
- `charge.refunded`

Copy the signing secret to:

```
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

---

## 3. Vercel env vars (final list)

```
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_WEEKLY=price_...
STRIPE_PRICE_MONTHLY=price_...
STRIPE_PRICE_ANNUAL=price_...
STRIPE_PROMOTION_CODE_CELPIP25=promo_... # optional; see coupon setup
PUBLIC_SITE_URL=https://celpipace.com
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

---

## 4. Lifecycle behavior

| Event | DB result |
| --- | --- |
| User checks out | `is_premium=true`, `subscription_status='active'`, `current_period_end` = end of first period |
| Renewal succeeds (`invoice.paid`) | `current_period_end` extended, `last_payment_at` updated |
| User clicks Cancel in portal | `cancel_at_period_end=true`, status stays `active` until period ends |
| Period ends after cancel (`customer.subscription.deleted`) | `is_premium=false`, `subscription_status='expired'`, `current_plan='free'` |
| Payment fails (`invoice.payment_failed`) | `subscription_status='past_due'`, premium kept temporarily |
| Stripe gives up retries | Stripe sends `customer.subscription.deleted` → expired |

Progress data (test_sessions, user_attempts) is **never deleted** — users can resume after resubscribing.

---

## 5. Security model

1. **Frontend never writes billing columns.** A trigger on `profiles` rejects any non-service-role UPDATE that touches `is_premium`, `subscription_status`, etc.
2. **Webhook signature verified** with `STRIPE_WEBHOOK_SECRET` before any DB write.
3. **RPC gating**: any premium-only RPC should call `PERFORM public.assert_premium();` at the top.
4. **Client gate** (`isPremium` in AuthContext) is a UX optimization only — the real gate lives in `is_premium_active(uid)`.
5. **Idempotency**: `payments` table has a unique index on `stripe_session_id`; webhook upserts on conflict so Stripe retries are safe.

---

## 6. Frontend additions

- `src/pages/ManageSubscriptionPage.jsx` → `/subscription` route
- `src/components/Pricing.jsx` → if `isPremium`, renders a "Manage Subscription" card instead of plan tiles
- `src/components/DashboardNavbar.jsx` → PRO badge now links to `/subscription`
- `src/context/AuthContext.jsx` → exposes `subscriptionStatus`, `currentPlan`, `premiumExpiresAt`, `cancelAtPeriodEnd`. `isPremium` is now expiry-aware.

---

## 7. Testing checklist

- [ ] Run `subscriptions_schema.sql` on Supabase
- [ ] Recreate Stripe prices as recurring
- [ ] Update `STRIPE_PRICE_*` env vars in Vercel
- [ ] Add new webhook events in Stripe
- [ ] Configure customer portal cancel mode = "end of period"
- [ ] Test purchase with `4242 4242 4242 4242` → profile flips to `is_premium=true`, `subscription_status='active'`
- [ ] Open `/subscription`, click Open Billing Portal, click Cancel → `cancel_at_period_end=true`
- [ ] Use Stripe CLI to advance the clock or wait for period end → user lands on `is_premium=false`
- [ ] Confirm `am_i_premium()` returns the expected boolean at each step
