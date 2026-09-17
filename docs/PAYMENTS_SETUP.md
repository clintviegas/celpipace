# Payments Setup (Stripe)

celpipAce uses **Stripe Checkout** with recurring subscriptions. Weekly, monthly, and annual plans unlock Premium access; users can manage or cancel billing through the Stripe Customer Portal.

---

## 1. Run the SQL migration

In Supabase Dashboard → SQL Editor → New Query, run:

```
supabase/payments_schema.sql
```

This creates the `payments` table, augments `profiles` with subscription columns, and sets up RLS so only the user (and `sales@celpipace.com`) can read payment rows.

---

## 2. Create Stripe Products

In Stripe Dashboard → **Products** → Add product (one product, three prices works fine, or three separate products):

| Plan        | Price (USD) | Type       | Description                       |
|-------------|-------------|------------|-----------------------------------|
| Weekly      | $12.99      | Recurring  | celpipAce Premium — weekly        |
| Monthly     | $24.99      | Recurring  | celpipAce Premium — monthly       |
| Annual      | $49.99      | Recurring  | celpipAce Premium — 1 year        |

> **Currency:** Use **USD** for all three prices. Stripe will auto-convert to the buyer's local currency at checkout when needed, and USD is the cleanest baseline for global users.

Copy each Price ID (starts with `price_`).

> Tip: Use **Stripe Promotion codes** (Dashboard → Coupons → Promotion codes) so users can enter discount codes directly at checkout — `allow_promotion_codes` is already enabled.

---

## 3. Set Vercel environment variables

In Vercel → Project → Settings → Environment Variables, add **all environments**:

| Variable                    | Value                                 |
|-----------------------------|---------------------------------------|
| `STRIPE_SECRET_KEY`         | `sk_live_...` (or `sk_test_...`)      |
| `STRIPE_WEBHOOK_SECRET`     | `whsec_...` (from step 4)             |
| `STRIPE_PRICE_WEEKLY`       | `price_...`                           |
| `STRIPE_PRICE_MONTHLY`      | `price_...`                           |
| `STRIPE_PRICE_ANNUAL`       | `price_...`                           |
| `STRIPE_PROMOTION_CODE_CELPIP25` | `promo_...` (optional but recommended) |
| `SUPABASE_URL`              | `https://xxx.supabase.co`             |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role JWT (Supabase → API)     |
| `PUBLIC_SITE_URL`           | `https://celpipace.com` (no trailing /)|

Create a Stripe coupon for first-time users: 25% off, duration once, promotion code `CELPIP25`. The checkout API verifies the user has no previous paid/refunded payment before applying the discount.

⚠️ **`SUPABASE_SERVICE_ROLE_KEY` must NEVER be exposed to the browser** — it bypasses RLS. It is only used server-side by `/api/stripe-webhook.js`.

---

## 4. Configure the Stripe webhook

In Stripe Dashboard → **Developers → Webhooks → Add endpoint**:

- **Endpoint URL**: `https://YOUR-DOMAIN/api/stripe-webhook`
- **Events to send**:
  - `checkout.session.completed`
        - `customer.subscription.created`
        - `customer.subscription.updated`
        - `customer.subscription.deleted`
        - `invoice.paid`
        - `invoice.payment_failed`
  - `charge.refunded`

After saving, click the endpoint and reveal the **Signing secret** — paste this as `STRIPE_WEBHOOK_SECRET` in Vercel and redeploy.

---

## 5. Test locally with Stripe CLI

```bash
# 1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
stripe login

# 2. Forward webhooks to local dev (in one terminal)
stripe listen --forward-to localhost:3000/api/stripe-webhook
# → copy the whsec_... it prints into your local .env as STRIPE_WEBHOOK_SECRET

# 3. Trigger a test event (in another terminal)
stripe trigger checkout.session.completed
```

For local end-to-end: deploy to a Vercel preview branch — Stripe Checkout cannot redirect to localhost reliably.

---

## 6. How it flows

```
[ User on /pricing ]
        │ chooses a plan
        ▼
[ Payment page: /payment?plan=annual ]
        │ confirms coupon + account
        │ clicks "Continue to Stripe"
        ▼
[ POST /api/create-checkout-session ]  ── creates Stripe Session
        │ returns { url }
        ▼
[ Stripe-hosted Checkout page ]  ── user pays with card / Apple Pay / Link
        │ on success: redirect to /subscription?checkout=success
        ▼
[ Stripe Webhook → /api/stripe-webhook ]  ── async, may take seconds
        │ verifies signature, then:
        │   1. INSERT INTO payments (idempotent on stripe_session_id)
        │   2. UPDATE profiles SET is_premium=true, premium_expires_at=now+Ndays
        ▼
[ AdminPage → Revenue tab ]  ── reads payments via RLS
```

The user's profile is refreshed client-side after returning to `/subscription`, so the navbar flips to "Premium" without a manual reload after the webhook lands.

---

## 7. Admin Revenue dashboard

`/admin → Revenue tab` shows:

- Total revenue (all time + selectable window)
- Daily revenue chart
- Per-plan breakdown
- Recent payments table (filterable, CSV export)
- Refunded total

It reads directly from `public.payments` — RLS only allows `sales@celpipace.com` to read all rows.

---

## 8. Refunds

Issue refunds from the Stripe Dashboard. The `charge.refunded` webhook will mark the row as `refunded` automatically. To revoke premium for the refunded user, use **Admin → Users → Revoke**.

---

## 9. Why recurring subscriptions?

- Weekly, monthly, and annual plans match different CELPIP study timelines.
- Stripe handles card storage, SCA/3DS, Apple Pay, Google Pay, Link, invoices, and cancellation.
- The Customer Portal gives users self-serve billing without exposing card details to the app.
- Webhooks keep Supabase `profiles` and `payments` in sync with subscription lifecycle events.
