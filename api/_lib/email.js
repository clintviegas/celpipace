/* global process, Buffer */
// /api/_lib/email.js
// Transactional email helper backed by Brevo, with email_log audit.
//
// All sends go through sendEmail() which:
//   1. Inserts a row in public.email_log (status='queued') BEFORE attempting send.
//   2. Calls Brevo transactional API (same BREVO_API_KEY already used for contacts).
//   3. Updates the row to status='sent' (with provider_id) or 'failed' (with error).
// This guarantees every send attempt is auditable even if Brevo errors out.
//
// Env required:
//   BREVO_API_KEY           — Brevo API key (shared with contact/list sync)
//   EMAIL_FROM              — verified sender, e.g. 'CELPIPACE <hello@celpipace.ca>'
//   PUBLIC_SITE_URL         — used in email links (no trailing slash)
//
// Templates exported:
//   renderSignupWelcome, renderWelcome, renderReceipt, renderCancelScheduled, renderCancelFinal, renderPastDue

import { sendBrevoEmail } from './brevo.js'
import crypto from 'crypto'

const SITE = (process.env.PUBLIC_SITE_URL || 'https://www.celpipace.ca').replace(/\/$/, '')

// Mailing address for CASL footer compliance. Override via env if you move.
const MAILING_ADDRESS = process.env.MAILING_ADDRESS || 'CELPIPACE, Toronto, ON, Canada'

// ─── Unsubscribe tokens ────────────────────────────────────────────────
// Stateless HMAC tokens so unsubscribe links work without a DB lookup.
// Token = base64url(`${userId}.${ts}.${hmac}`)

function unsubSecret() {
  return process.env.UNSUBSCRIBE_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || ''
}

function b64url(buf) {
  return Buffer.from(buf).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function b64urlDecode(s) {
  const pad = '='.repeat((4 - (s.length % 4)) % 4)
  return Buffer.from(s.replace(/-/g, '+').replace(/_/g, '/') + pad, 'base64').toString('utf8')
}

export function buildUnsubscribeToken(userId) {
  const secret = unsubSecret()
  if (!secret) return null
  const ts = Math.floor(Date.now() / 1000)
  const payload = `${userId}.${ts}`
  const sig = crypto.createHmac('sha256', secret).update(payload).digest()
  return b64url(`${payload}.${b64url(sig)}`)
}

export function verifyUnsubscribeToken(token, { maxAgeSec = 60 * 60 * 24 * 365 } = {}) {
  const secret = unsubSecret()
  if (!secret || !token) return null
  let raw
  try { raw = b64urlDecode(token) } catch { return null }
  const parts = raw.split('.')
  if (parts.length !== 3) return null
  const [userId, tsStr, sig] = parts
  const ts = Number(tsStr)
  if (!Number.isFinite(ts)) return null
  if (Date.now() / 1000 - ts > maxAgeSec) return null
  const expected = b64url(crypto.createHmac('sha256', secret).update(`${userId}.${tsStr}`).digest())
  if (sig.length !== expected.length) return null
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null
  return { userId, issuedAt: ts }
}

function unsubscribeUrl(userId) {
  const token = buildUnsubscribeToken(userId)
  return token ? `${SITE}/api/email-unsubscribe?token=${token}` : `${SITE}/subscription`
}

/**
 * Send a transactional email and log the attempt to public.email_log.
 *
 * @param {object} args
 * @param {object} args.supabase   - service-role Supabase client (writes bypass RLS)
 * @param {string} args.userId     - profile/user id (nullable)
 * @param {string} args.toEmail    - destination email
 * @param {string} args.kind       - 'welcome' | 'receipt' | 'cancel_scheduled' | 'cancel_final' | 'past_due' | ...
 * @param {string} args.subject
 * @param {string} args.html
 * @param {string} [args.text]
 * @param {string} [args.pdfUrl]   - hosted invoice PDF (Stripe)
 * @param {object} [args.metadata]
 * @returns {Promise<{ ok: boolean, providerId?: string, error?: string, logId?: string }>}
 */
export async function sendEmail({ supabase, userId, toEmail, kind, subject, html, text, pdfUrl, metadata }) {
  if (!toEmail) return { ok: false, error: 'no_to_email' }

  const { data: logRow } = await supabase
    .from('email_log')
    .insert({
      user_id:  userId || null,
      to_email: toEmail,
      kind,
      subject,
      provider: 'brevo',
      pdf_url:  pdfUrl || null,
      status:   'queued',
      metadata: metadata || {},
    })
    .select('id')
    .single()

  const logId = logRow?.id || null

  try {
    const result = await sendBrevoEmail({ toEmail, subject, html, text })
    if (!result.ok) throw new Error(result.error || 'brevo_send_failed')

    if (logId) {
      await supabase.from('email_log').update({
        status:      'sent',
        provider_id: result.messageId || null,
        sent_at:     new Date().toISOString(),
      }).eq('id', logId)
    }
    return { ok: true, providerId: result.messageId, logId }
  } catch (err) {
    const errMsg = err?.message || String(err)
    if (logId) await supabase.from('email_log').update({ status: 'failed', error: errMsg }).eq('id', logId)
    console.error('[email] send failed:', kind, errMsg)
    return { ok: false, error: errMsg, logId }
  }
}

// ─── Templates ─────────────────────────────────────────────────────────
// Shared, email-client-safe base layout. Both the transactional shell() and
// the marketing marketingShell() render through this so branding stays
// consistent. `preheader` is the hidden inbox-preview text (big open-rate
// lever); `footer` is the per-type legal/footer block.
const HOST = SITE.replace(/^https?:\/\//, '')

function baseShell({ heading, body, ctaUrl, ctaLabel, preheader, footer }) {
  const preview = preheader
    ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all">${escapeHtml(preheader)}</div>`
    : ''
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><meta name="color-scheme" content="light"/></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,Arial,sans-serif;background:#eef1f6;color:#0f172a">
  ${preview}
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#eef1f6;padding:28px 16px">
    <tr><td align="center">
      <table role="presentation" width="560" cellspacing="0" cellpadding="0" style="width:560px;max-width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 6px 28px rgba(15,23,42,0.08)">
        <tr><td style="background:#0f1f3d;padding:22px 32px">
          <span style="font-size:18px;font-weight:800;letter-spacing:.02em;color:#ffffff">CELPIP<span style="color:#e23b46">ACE</span></span>
        </td></tr>
        <tr><td style="height:4px;background:#c8102e;font-size:0;line-height:0">&nbsp;</td></tr>
        <tr><td style="padding:32px 32px 8px">
          <div style="font-size:22px;font-weight:700;line-height:1.3;color:#0f172a">${escapeHtml(heading)}</div>
        </td></tr>
        <tr><td style="padding:8px 32px 0;font-size:15px;line-height:1.6;color:#334155">${body}</td></tr>
        ${ctaUrl ? `<tr><td style="padding:26px 32px 4px">
          <a href="${escapeAttr(ctaUrl)}" style="display:inline-block;background:#c8102e;color:#ffffff;padding:13px 26px;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px">${escapeHtml(ctaLabel || 'Open CELPIPACE')}</a>
        </td></tr>` : ''}
        <tr><td style="padding:30px 32px 26px">
          <div style="border-top:1px solid #e2e8f0;padding-top:18px;font-size:12px;line-height:1.7;color:#94a3b8">${footer}</div>
        </td></tr>
      </table>
      <table role="presentation" width="560" cellspacing="0" cellpadding="0" style="width:560px;max-width:100%">
        <tr><td style="padding:16px 8px;text-align:center;font-size:11px;color:#aab3c2">
          CELPIPACE · CELPIP practice &amp; real-time AI scoring · <a href="${SITE}" style="color:#aab3c2;text-decoration:underline">${HOST}</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`
}

function shell({ heading, body, ctaUrl, ctaLabel, preheader }) {
  const footer = `Need help? Just reply to this email or visit <a href="${SITE}/contact" style="color:#94a3b8;text-decoration:underline">${HOST}/contact</a>.<br/>
    You're receiving this because you have a CELPIPACE account.`
  return baseShell({ heading, body, ctaUrl, ctaLabel, preheader, footer })
}

function escapeHtml(s = '') {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')
}
function escapeAttr(s = '') { return escapeHtml(s) }

function fmtMoney(amountCents, currency = 'cad') {
  if (!Number.isFinite(amountCents)) return '—'
  const value = (amountCents / 100).toFixed(2)
  return `${currency.toUpperCase()} $${value}`
}

function fmtDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' })
}

// Signup welcome — sent once to new free users right after Google OAuth signup.
export function renderSignupWelcome({ name }) {
  const subject = `Welcome to CELPIPACE — let's find your weakest section`
  const preheader = `Your free account is ready. Here's the fastest way to start raising your CLB band.`
  const heading = `You're in. Let's get your score up.`
  const body = `<p>Hi ${escapeHtml(name || 'there')},</p>
    <p>Welcome to CELPIPACE. Your free account is ready — here's what you can do right now:</p>
    <ul style="padding-left:20px;margin:8px 0 16px">
      <li><strong>Practice sets</strong> — Reading, Writing, Speaking, Listening drills with answer explanations</li>
      <li><strong>AI scoring</strong> — get instant CLB-band feedback on Writing and Speaking responses</li>
      <li><strong>Mock exams</strong> — full-length timed tests that mirror the real CELPIP format</li>
    </ul>
    <p>Most people find their weakest section in the first 10-minute drill. Start there.</p>`
  return { subject, html: shell({ heading, body, ctaUrl: `${SITE}/dashboard`, ctaLabel: 'Go to Dashboard', preheader }) }
}

export function renderWelcome({ name, plan }) {
  const subject = `Your CELPIPACE Premium is live — start with a diagnostic`
  const preheader = `Full mock exams, real-time AI scoring, and saved CLB reports are now unlocked.`
  const heading = `You're in. Let's get you to CLB 9.`
  const body = `<p>Hi ${escapeHtml(name || 'there')},</p>
    <p>Your <strong>${escapeHtml(plan || 'Premium')}</strong> subscription is active. You now have full access to mock exams, real-time scoring, all practice sets, and saved CLB reports.</p>
    <p>Start with a diagnostic mock exam to see where you stand, then drill the lowest-scoring section.</p>`
  return { subject, html: shell({ heading, body, ctaUrl: `${SITE}/dashboard`, ctaLabel: 'Open Dashboard', preheader }) }
}

export function renderReceipt({ name, plan, amountCents, currency, invoiceNumber, invoicePdfUrl, hostedInvoiceUrl, periodEnd }) {
  const subject = `Your CELPIPACE receipt — ${fmtMoney(amountCents, currency)}`
  const heading = `Payment received`
  const body = `<p>Hi ${escapeHtml(name || 'there')},</p>
    <p>Thanks for renewing your CELPIPACE Premium subscription. Here are the details:</p>
    <table cellspacing="0" cellpadding="0" style="width:100%;font-size:14px;margin-top:8px">
      <tr><td style="color:#64748b;padding:6px 0">Plan</td><td style="padding:6px 0;text-align:right;font-weight:600">${escapeHtml(plan || 'Premium')}</td></tr>
      <tr><td style="color:#64748b;padding:6px 0">Amount</td><td style="padding:6px 0;text-align:right;font-weight:600">${fmtMoney(amountCents, currency)}</td></tr>
      ${invoiceNumber ? `<tr><td style="color:#64748b;padding:6px 0">Invoice</td><td style="padding:6px 0;text-align:right">${escapeHtml(invoiceNumber)}</td></tr>` : ''}
      ${periodEnd ? `<tr><td style="color:#64748b;padding:6px 0">Renews</td><td style="padding:6px 0;text-align:right">${escapeHtml(fmtDate(periodEnd))}</td></tr>` : ''}
    </table>
    ${invoicePdfUrl ? `<p style="margin-top:18px"><a href="${escapeAttr(invoicePdfUrl)}" style="color:#0ea5e9">Download PDF receipt</a>${hostedInvoiceUrl ? ` &middot; <a href="${escapeAttr(hostedInvoiceUrl)}" style="color:#0ea5e9">View online</a>` : ''}</p>` : ''}`
  return { subject, html: shell({ heading, body, ctaUrl: `${SITE}/subscription`, ctaLabel: 'Manage Subscription' }) }
}

export function renderCancelScheduled({ name, plan, periodEnd }) {
  const subject = `We've scheduled your CELPIPACE cancellation`
  const heading = `Cancellation scheduled`
  const body = `<p>Hi ${escapeHtml(name || 'there')},</p>
    <p>We've stopped renewals on your <strong>${escapeHtml(plan || 'Premium')}</strong> subscription. You keep full Premium access until <strong>${escapeHtml(fmtDate(periodEnd))}</strong> — after that your account will switch back to the free plan automatically.</p>
    <p>If you requested a refund review, support will reply by email. Approved refunds are processed to the original payment method and usually appear within 3-4 business days, depending on the bank or card issuer.</p>
    <p>Changed your mind? You can resume your subscription anytime before that date from the manage page.</p>`
  return { subject, html: shell({ heading, body, ctaUrl: `${SITE}/subscription`, ctaLabel: 'Manage Subscription' }) }
}

function fmtWouldReturn(value) {
  if (value === true) return 'Yes'
  if (value === false) return 'No'
  return 'Not sure'
}

export function renderCancellationFeedbackNotice({ name, email, userId, plan, periodEnd, reason, feedback, wouldReturn, refundReview, stripeSubscriptionId }) {
  const subject = `CELPIPACE cancellation feedback: ${email || userId || 'unknown user'}`
  const heading = `Cancellation feedback received`
  const body = `<p>A user scheduled a subscription cancellation and submitted feedback.</p>
    <table cellspacing="0" cellpadding="0" style="width:100%;font-size:14px;margin-top:8px">
      <tr><td style="color:#64748b;padding:6px 0">Name</td><td style="padding:6px 0;text-align:right;font-weight:600">${escapeHtml(name || '-')}</td></tr>
      <tr><td style="color:#64748b;padding:6px 0">Email</td><td style="padding:6px 0;text-align:right;font-weight:600">${escapeHtml(email || '-')}</td></tr>
      <tr><td style="color:#64748b;padding:6px 0">User ID</td><td style="padding:6px 0;text-align:right;font-weight:600">${escapeHtml(userId || '-')}</td></tr>
      <tr><td style="color:#64748b;padding:6px 0">Plan</td><td style="padding:6px 0;text-align:right;font-weight:600">${escapeHtml(plan || '-')}</td></tr>
      <tr><td style="color:#64748b;padding:6px 0">Access ends</td><td style="padding:6px 0;text-align:right;font-weight:600">${escapeHtml(fmtDate(periodEnd))}</td></tr>
      <tr><td style="color:#64748b;padding:6px 0">Reason</td><td style="padding:6px 0;text-align:right;font-weight:600">${escapeHtml(reason || '-')}</td></tr>
      <tr><td style="color:#64748b;padding:6px 0">Would return</td><td style="padding:6px 0;text-align:right;font-weight:600">${escapeHtml(fmtWouldReturn(wouldReturn))}</td></tr>
      <tr><td style="color:#64748b;padding:6px 0">Refund review</td><td style="padding:6px 0;text-align:right;font-weight:600">${refundReview ? 'Requested' : 'Not requested'}</td></tr>
      <tr><td style="color:#64748b;padding:6px 0">Stripe subscription</td><td style="padding:6px 0;text-align:right;font-weight:600">${escapeHtml(stripeSubscriptionId || '-')}</td></tr>
    </table>
    ${feedback ? `<p style="margin-top:18px"><strong>Feedback:</strong><br/>${escapeHtml(feedback).replace(/\n/g, '<br/>')}</p>` : ''}
    ${refundReview ? '<p style="margin-top:18px"><strong>Refund note:</strong> The user requested a refund review. Approved refunds should be processed to the original payment method; the user-facing copy says credits usually appear within 3-4 business days.</p>' : ''}`
  return { subject, html: shell({ heading, body, ctaUrl: `${SITE}/admin`, ctaLabel: 'Open Admin' }) }
}

export function renderCancelFinal({ name }) {
  const subject = `Your CELPIPACE Premium has ended`
  const heading = `Your Premium access has ended`
  const body = `<p>Hi ${escapeHtml(name || 'there')},</p>
    <p>Your CELPIPACE Premium subscription has now ended. You can still sign in and use the free practice features. Your saved progress and CLB reports stay in your account.</p>
    <p>If you want to come back, the door's open.</p>`
  return { subject, html: shell({ heading, body, ctaUrl: `${SITE}/pricing`, ctaLabel: 'See Plans' }) }
}

export function renderRefundProcessed({ name, amountCents, currency, isPartial, grossCents = null, feeCents = null }) {
  const label = isPartial ? `A partial refund of ${fmtMoney(amountCents, currency)}` : `Your refund of ${fmtMoney(amountCents, currency)}`
  const subject = `${isPartial ? 'Partial refund' : 'Refund'} processed — ${fmtMoney(amountCents, currency)}`
  const heading = isPartial ? `Partial refund processed` : `Refund processed`
  const feeNote = (feeCents && feeCents > 0 && grossCents)
    ? `<p style="font-size:14px;color:#475569">Original charge ${fmtMoney(grossCents, currency)} − non-refundable payment processing fee ${fmtMoney(feeCents, currency)} = ${fmtMoney(amountCents, currency)} refunded.</p>`
    : ``
  const body = `<p>Hi ${escapeHtml(name || 'there')},</p>
    <p>${label} has been processed back to your original payment method. Most banks and card issuers post the credit within 3–4 business days — some take up to 10 days depending on the bank.</p>
    ${feeNote}
    ${isPartial
      ? `<p>Your Premium access remains active until the end of your current billing period. We've kept your progress and CLB reports either way.</p>`
      : `<p>Your Premium access has been ended and your account is back on the free plan. We've kept your progress and CLB reports — sign in any time to pick up where you left off.</p>`
    }
    <p>If you don't see the credit after 10 business days, reply to this email with your bank statement and we'll help track it down.</p>`
  return { subject, html: shell({ heading, body, ctaUrl: `${SITE}/dashboard`, ctaLabel: 'Open Dashboard' }) }
}

// ─── Marketing email shell (with CASL-required unsubscribe + address) ───
function marketingShell({ heading, body, ctaUrl, ctaLabel, userId, preheader }) {
  const unsub = unsubscribeUrl(userId)
  const footer = `${escapeHtml(MAILING_ADDRESS)}<br/>
    You're receiving this because you opted in to CELPIPACE study tips. <a href="${escapeAttr(unsub)}" style="color:#94a3b8;text-decoration:underline">Unsubscribe</a> &middot; <a href="${SITE}/subscription" style="color:#94a3b8;text-decoration:underline">Email preferences</a>`
  return baseShell({ heading, body, ctaUrl, ctaLabel, preheader, footer })
}

// ─── Free → Premium onboarding drip (days 1 / 2 / 5 / 7 / 14 / 21) ───────────

// Drip step 0 (day 1): orientation — set expectations, get the first action.
export function renderFreeNudgeDay1({ name, userId }) {
  const subject = `Your first 10 minutes on CELPIPACE`
  const preheader = `A quick map of where to start so you don't waste your prep time.`
  const heading = `Here's exactly where to start`
  const body = `<p>Hi ${escapeHtml(name || 'there')},</p>
    <p>Prep works best when it's targeted. Here's the fastest path on CELPIPACE:</p>
    <ol style="padding-left:20px;margin:8px 0 16px">
      <li><strong>Take one timed practice set</strong> in the section you're least confident about.</li>
      <li><strong>Read the answer explanations</strong> — that's where the score gains hide.</li>
      <li><strong>Come back tomorrow</strong> and do a different section. Consistency beats cramming.</li>
    </ol>
    <p>Ten focused minutes today will tell you more than an hour of passive reading.</p>`
  return { subject, html: marketingShell({ heading, body, ctaUrl: `${SITE}/practice`, ctaLabel: 'Start my first set', userId, preheader }) }
}

// Drip step 1 (day 2 after signup): study tips + nudge to first practice set.
export function renderFreeNudgeDay2({ name, userId }) {
  const subject = `5 quick wins for your CELPIP score`
  const preheader = `The five mistakes we see most — fix these and most learners gain a band.`
  const heading = `Welcome — start with these 5 wins`
  const body = `<p>Hi ${escapeHtml(name || 'there')},</p>
    <p>Most learners gain 1–2 CLB bands just by fixing the same handful of mistakes. Here are the five we see most often:</p>
    <ol style="padding-left:20px;margin:8px 0 16px">
      <li><strong>Writing Task 1:</strong> open with the purpose in sentence 1, not paragraph 2.</li>
      <li><strong>Writing Task 2:</strong> answer the question in sentence 1; reasons after.</li>
      <li><strong>Speaking Task 3:</strong> describe people + actions, not just objects.</li>
      <li><strong>Reading Part 4:</strong> match viewpoints by tone, not by keyword.</li>
      <li><strong>Listening Part 5:</strong> read the questions during the prep window — every time.</li>
    </ol>
    <p>Pick one section and try a real practice set today — it takes ~10 minutes and you'll see your score live.</p>`
  return { subject, html: marketingShell({ heading, body, ctaUrl: `${SITE}/practice`, ctaLabel: 'Try a practice set', userId, preheader }) }
}

// Drip step 2 (day 5): show what AI scoring looks like — drives mock-test sign-up
export function renderFreeNudgeDay5({ name, userId }) {
  const subject = `What a CLB 11 mock report looks like`
  const preheader = `See your Writing and Speaking scored across four dimensions, like a real examiner.`
  const heading = `See your score the way an examiner does`
  const body = `<p>Hi ${escapeHtml(name || 'there')},</p>
    <p>Our AI scorer breaks each Writing and Speaking response into four dimensions — Task Fulfillment, Coherence, Vocabulary, Readability — with specific suggestions tied to the text you wrote.</p>
    <p>It's calibrated against high-scoring exemplars, so the band you see is close to what an examiner would give. Most users find their weakest dimension is <em>not</em> the one they expected.</p>
    <p>Take a 60-minute mock to see where you actually stand.</p>`
  return { subject, html: marketingShell({ heading, body, ctaUrl: `${SITE}/exam`, ctaLabel: 'Start a mock exam', userId, preheader }) }
}

// Drip step 3 (day 7): how serious learners study — soft social proof.
export function renderFreeNudgeDay7({ name, userId }) {
  const subject = `How learners who pass actually study`
  const preheader = `Short, daily, targeted. The 3-part routine behind most CLB 9+ results.`
  const heading = `The routine behind most CLB 9+ results`
  const body = `<p>Hi ${escapeHtml(name || 'there')},</p>
    <p>The learners who hit their target band rarely study the longest — they study the smartest. The pattern looks like this:</p>
    <ul style="padding-left:20px;margin:8px 0 16px">
      <li><strong>Daily, not marathon.</strong> 15–20 focused minutes beats a three-hour weekend session.</li>
      <li><strong>Weakest section first.</strong> They drill where they lose marks, not where they're already strong.</li>
      <li><strong>Score, review, repeat.</strong> Every attempt gets reviewed against the explanation before moving on.</li>
    </ul>
    <p>You've got everything you need to do this for free today. A few minutes now keeps the momentum going.</p>`
  return { subject, html: marketingShell({ heading, body, ctaUrl: `${SITE}/dashboard`, ctaLabel: 'Open my dashboard', userId, preheader }) }
}

// Drip step 4 (day 14): first-time discount.
export function renderFreeNudgeDay14({ name, userId }) {
  const subject = `25% off your first CELPIPACE Premium month`
  const preheader = `Unlock every mock exam and real-time AI scoring. Code CELPIP25, first-time only.`
  const heading = `Ready to drill the section that's holding you back?`
  const body = `<p>Hi ${escapeHtml(name || 'there')},</p>
    <p>Premium unlocks every mock exam, real-time AI scoring on every Writing/Speaking attempt, and saved CLB reports so you can see your trajectory week over week.</p>
    <p>Use code <strong style="background:#0f1f3d;color:#fff;padding:2px 8px;border-radius:6px;letter-spacing:.05em">CELPIP25</strong> at checkout for <strong>25% off your first subscription</strong>. First-time only.</p>`
  return { subject, html: marketingShell({ heading, body, ctaUrl: `${SITE}/pricing`, ctaLabel: 'See plans', userId, preheader }) }
}

// Drip step 5 (day 21): final nudge — coupon still available, gentle urgency.
export function renderFreeNudgeDay21({ name, userId }) {
  const subject = `Last call: your 25% Premium discount`
  const preheader = `Still preparing? Your first-time CELPIP25 discount is here when you're ready.`
  const heading = `Your discount is still on the table`
  const body = `<p>Hi ${escapeHtml(name || 'there')},</p>
    <p>You've been practising for a few weeks now — that's exactly the point where Premium pays off. Full mocks and AI scoring show you precisely which section to push next, so you stop guessing.</p>
    <p>Your first-time offer is still active: <strong style="background:#0f1f3d;color:#fff;padding:2px 8px;border-radius:6px;letter-spacing:.05em">CELPIP25</strong> takes <strong>25% off your first subscription</strong>. This is the last reminder we'll send about it.</p>`
  return { subject, html: marketingShell({ heading, body, ctaUrl: `${SITE}/pricing`, ctaLabel: 'Claim 25% off', userId, preheader }) }
}

export function renderPastDue({ name, amountCents, currency, hostedInvoiceUrl }) {
  const subject = `Your CELPIPACE payment couldn't be charged`
  const heading = `We couldn't process your payment`
  const body = `<p>Hi ${escapeHtml(name || 'there')},</p>
    <p>We tried to charge ${fmtMoney(amountCents, currency)} for your CELPIPACE Premium renewal but the payment didn't go through. Stripe will retry automatically over the next few days. You can also pay the invoice now, or update your card to avoid losing access.</p>
    ${hostedInvoiceUrl ? `<p style="margin-top:14px"><a href="${escapeAttr(hostedInvoiceUrl)}" style="color:#0ea5e9">Pay outstanding invoice</a></p>` : ''}`
  return { subject, html: shell({ heading, body, ctaUrl: `${SITE}/subscription`, ctaLabel: 'Update Payment Method' }) }
}

// ─── Study reminder / re-engagement (days 3 / 7 / 14 since last practice) ────
// Short, encouraging nudges for learners who practised before but went quiet.

// Day 3 — gentle, momentum-focused.
export function renderStudyReminderD3({ name, userId }) {
  const subject = `Keep your CELPIP streak going`
  const heading = `One set today keeps your momentum`
  const body = `<p>Hi ${escapeHtml(name || 'there')},</p>
    <p>You were making real progress — don't let it cool off. A single 10-minute practice set today keeps your skills sharp and your score climbing.</p>
    <p>Pick the section you find hardest. That's where the fastest gains are.</p>`
  return { subject, html: marketingShell({ heading, body, ctaUrl: `${SITE}/practice`, ctaLabel: 'Practise 10 minutes', userId }) }
}

// Day 7 — re-engagement with a concrete reason to return.
export function renderStudyReminderD7({ name, userId }) {
  const subject = `Your CELPIP score won't wait`
  const heading = `A week off is a week your competition gained`
  const body = `<p>Hi ${escapeHtml(name || 'there')},</p>
    <p>It's been a week since your last practice. Language skills fade fast when they're idle — but they come back even faster once you restart.</p>
    <p>Jump back in with one quick set today. Your saved progress and CLB reports are exactly where you left them.</p>`
  return { subject, html: marketingShell({ heading, body, ctaUrl: `${SITE}/dashboard`, ctaLabel: 'Resume practising', userId }) }
}

// Day 14 — stronger nudge, points at mock + progress proof.
export function renderStudyReminderD14({ name, userId }) {
  const subject = `Still aiming for that CELPIP band?`
  const heading = `Two weeks out — let's get you back on track`
  const body = `<p>Hi ${escapeHtml(name || 'there')},</p>
    <p>Your target band is still within reach, but it gets harder the longer you wait. The quickest way to restart is a full timed mock — it shows you exactly which section needs the most work right now.</p>
    <p>30–60 minutes today can put you right back on pace.</p>`
  return { subject, html: marketingShell({ heading, body, ctaUrl: `${SITE}/exam`, ctaLabel: 'Take a mock exam', userId }) }
}

// ─── Win-back sequence (days 3 / 14 / 30 after premium_expires_at) ────────────

// Day 3 — empathy + "your progress is saved"
export function renderWinbackDay3({ name, userId }) {
  const subject = `Your CELPIPACE progress is still here`
  const heading = `Everything you built is still here.`
  const body = `<p>Hi ${escapeHtml(name || 'there')},</p>
    <p>Your Premium access ended a few days ago, but your CLB reports, saved scores, and practice history are all still in your account. Nothing was deleted.</p>
    <p>If the timing wasn't right, no pressure — come back whenever you're ready. If you want to keep drilling before your test, you can pick up exactly where you left off.</p>`
  return { subject, html: marketingShell({ heading, body, ctaUrl: `${SITE}/dashboard`, ctaLabel: 'Open my dashboard', userId }) }
}

// Day 14 — value recap + discount offer
export function renderWinbackDay14({ name, userId }) {
  const subject = `Still preparing for CELPIP? 25% off to come back`
  const heading = `Your CLB target is still reachable.`
  const body = `<p>Hi ${escapeHtml(name || 'there')},</p>
    <p>A lot can change in two weeks of focused practice. If you're still working toward your CELPIP target, Premium gives you:</p>
    <ul style="padding-left:20px;margin:8px 0 16px">
      <li>Full-length timed mock exams with instant CLB reports</li>
      <li>Real-time AI scoring on every Writing and Speaking attempt</li>
      <li>Section drills targeting exactly where you're losing marks</li>
    </ul>
    <p>Use code <strong style="background:#0f172a;color:#fff;padding:2px 8px;border-radius:6px;letter-spacing:.05em">CELPIP25</strong> for <strong>25% off your first month back</strong>.</p>`
  return { subject, html: marketingShell({ heading, body, ctaUrl: `${SITE}/pricing`, ctaLabel: 'Reactivate Premium', userId }) }
}

// Day 30 — final check-in, no hard sell
export function renderWinbackDay30({ name, userId }) {
  const subject = `One last check-in from CELPIPACE`
  const heading = `Rooting for you either way.`
  const body = `<p>Hi ${escapeHtml(name || 'there')},</p>
    <p>This is the last email we'll send about your subscription. If you've already passed your CELPIP — congratulations. If you're still preparing, we'll be here.</p>
    <p>Your saved CLB reports and practice history will stay in your account. Sign in any time — no subscription needed to access your past results.</p>
    <p>Good luck with the test. You've got this.</p>`
  return { subject, html: marketingShell({ heading, body, ctaUrl: `${SITE}/dashboard`, ctaLabel: 'Sign in', userId }) }
}

// ─── Exam-date countdown (T-14 / T-7 / T-3 / T-1 before exam_date) ────────────
// Timed prep emails leading up to a learner's chosen test date. Each step is
// keyed per exam date so booking a new exam later starts a fresh sequence.

// T-14 — two weeks out: build the plan.
export function renderExamCountdownT14({ name, userId, examDate }) {
  const dateStr = examDate ? fmtDate(examDate) : 'your test'
  const subject = `2 weeks to your CELPIP test — here's the plan`
  const preheader = `A simple 14-day structure so you walk in calm and ready.`
  const heading = `14 days out — let's build your run-up`
  const body = `<p>Hi ${escapeHtml(name || 'there')},</p>
    <p>Your CELPIP test is on <strong>${escapeHtml(dateStr)}</strong>. Two weeks is plenty — if you spend it on the right things. Here's a simple structure:</p>
    <ul style="padding-left:20px;margin:8px 0 16px">
      <li><strong>Days 1–7:</strong> one full timed mock, then drill your two weakest sections.</li>
      <li><strong>Days 8–12:</strong> a second mock, focusing on pacing and Writing/Speaking structure.</li>
      <li><strong>Days 13–14:</strong> light review, no cramming. Confidence over content.</li>
    </ul>
    <p>Start with a diagnostic mock today so you know exactly where to aim.</p>`
  return { subject, html: marketingShell({ heading, body, ctaUrl: `${SITE}/exam`, ctaLabel: 'Take a diagnostic mock', userId, preheader }) }
}

// T-7 — one week out: focus on weak section + timing.
export function renderExamCountdownT7({ name, userId, examDate }) {
  const dateStr = examDate ? fmtDate(examDate) : 'your test'
  const subject = `1 week to go — drill your weakest section now`
  const preheader = `The final week is for targeting, not cramming. Here's where to spend it.`
  const heading = `7 days out — sharpen, don't cram`
  const body = `<p>Hi ${escapeHtml(name || 'there')},</p>
    <p>One week until <strong>${escapeHtml(dateStr)}</strong>. This is the highest-leverage week — spend it on the section that's costing you the most marks, and on timing.</p>
    <ul style="padding-left:20px;margin:8px 0 16px">
      <li>Do every drill <strong>under the clock</strong> — exam pacing is its own skill.</li>
      <li>For Writing &amp; Speaking, rehearse your <strong>structure</strong> so you don't waste planning time.</li>
      <li>Review your saved CLB reports to see which dimension still needs work.</li>
    </ul>`
  return { subject, html: marketingShell({ heading, body, ctaUrl: `${SITE}/practice`, ctaLabel: 'Drill my weak section', userId, preheader }) }
}

// T-3 — three days out: logistics + confidence.
export function renderExamCountdownT3({ name, userId, examDate }) {
  const dateStr = examDate ? fmtDate(examDate) : 'your test'
  const subject = `3 days out — your CELPIP test-day checklist`
  const preheader = `Lock in your routine now so test day feels familiar, not stressful.`
  const heading = `3 days to go — get your routine set`
  const body = `<p>Hi ${escapeHtml(name || 'there')},</p>
    <p><strong>${escapeHtml(dateStr)}</strong> is almost here. Heavy studying is behind you now — these last days are about staying sharp and arriving calm.</p>
    <ul style="padding-left:20px;margin:8px 0 16px">
      <li>One short timed set per day to keep your reflexes warm.</li>
      <li>Confirm your test location, ID, and start time.</li>
      <li>Sleep is a performance tool — protect it the night before.</li>
    </ul>
    <p>You've put in the work. Trust it.</p>`
  return { subject, html: marketingShell({ heading, body, ctaUrl: `${SITE}/dashboard`, ctaLabel: 'Quick warm-up set', userId, preheader }) }
}

// T-1 — day before: calm + encouragement.
export function renderExamCountdownT1({ name, userId, examDate }) {
  const subject = `You've got this — CELPIP test tomorrow`
  const preheader = `A few final reminders, then rest. You're ready.`
  const heading = `Tomorrow's the day — you're ready`
  const body = `<p>Hi ${escapeHtml(name || 'there')},</p>
    <p>Your CELPIP test is tomorrow. No new material tonight — your brain consolidates what you've already learned while you rest.</p>
    <ul style="padding-left:20px;margin:8px 0 16px">
      <li>Pack your ID and anything the test centre requires tonight.</li>
      <li>In Writing &amp; Speaking, answer the question directly in your first sentence.</li>
      <li>If a question stumps you, move on and come back — don't let it cost you others.</li>
    </ul>
    <p>You've prepared for this. Go show what you can do.</p>`
  return { subject, html: marketingShell({ heading, body, ctaUrl: `${SITE}/dashboard`, ctaLabel: 'Review my progress', userId }) }
}

// ─── Abandoned-checkout recovery (1 / 3 days after an un-converted checkout) ──

// Day 1 — gentle reminder, address the most common blocker (price/uncertainty).
export function renderAbandonedCheckoutD1({ name, userId, plan }) {
  const planLabel = plan ? `${escapeHtml(plan)} ` : ''
  const subject = `You're one step from CELPIPACE Premium`
  const preheader = `Your checkout is still open — pick up right where you left off.`
  const heading = `Still thinking it over?`
  const body = `<p>Hi ${escapeHtml(name || 'there')},</p>
    <p>You started signing up for CELPIPACE Premium ${planLabel}but didn't finish. No worries — your spot is still here and it only takes a minute to complete.</p>
    <p>Premium gives you every full mock exam, real-time AI scoring on Writing and Speaking, and saved CLB reports to track your progress to test day.</p>
    <p>Cancel anytime — there's no long-term commitment.</p>`
  return { subject, html: marketingShell({ heading, body, ctaUrl: `${SITE}/pricing`, ctaLabel: 'Finish signing up', userId, preheader }) }
}

// Day 3 — stronger nudge with the first-time discount.
export function renderAbandonedCheckoutD3({ name, userId }) {
  const subject = `Here's 25% off to finish your CELPIPACE upgrade`
  const preheader = `Your first-time discount, code CELPIP25 — in case price was the holdup.`
  const heading = `In case the timing wasn't right`
  const body = `<p>Hi ${escapeHtml(name || 'there')},</p>
    <p>You were about to upgrade to Premium a couple of days ago. If price was the thing holding you back, here's a hand:</p>
    <p>Use code <strong style="background:#0f1f3d;color:#fff;padding:2px 8px;border-radius:6px;letter-spacing:.05em">CELPIP25</strong> for <strong>25% off your first subscription</strong> — first-time only.</p>
    <p>Every mock exam, real-time AI scoring, and your saved CLB reports are waiting the moment you're in.</p>`
  return { subject, html: marketingShell({ heading, body, ctaUrl: `${SITE}/pricing`, ctaLabel: 'Claim 25% off', userId, preheader }) }
}

// ─── Weekly progress digest ──────────────────────────────────────────────────
// Personalised recap of the last 7 days of practice. `stats` is computed by the
// digest job from weekly_digest_candidates().
//   stats = { sets, avgPct, weakest: {section, avgPct}|null, strongest: {section, avgPct}|null }
const SECTION_LABEL = { listening: 'Listening', reading: 'Reading', writing: 'Writing', speaking: 'Speaking', mock: 'Mock exams' }

export function renderWeeklyDigest({ name, userId, stats }) {
  const sets = stats?.sets || 0
  const avgPct = Number.isFinite(stats?.avgPct) ? Math.round(stats.avgPct) : null
  const weakest = stats?.weakest || null
  const strongest = stats?.strongest || null
  const subject = `Your CELPIP week: ${sets} ${sets === 1 ? 'set' : 'sets'} done${avgPct != null ? `, ${avgPct}% avg` : ''}`
  const preheader = `Your personalised practice recap and the one section to focus on next.`
  const heading = `Your week in review`

  const statRow = (label, value) => `<td style="padding:14px 16px;background:#f3f6fb;border-radius:12px;text-align:center">
      <div style="font-size:24px;font-weight:800;color:#0f1f3d">${value}</div>
      <div style="font-size:12px;color:#64748b;margin-top:2px">${label}</div>
    </td>`

  const focusLine = weakest
    ? `<p>This week your toughest section was <strong>${escapeHtml(SECTION_LABEL[weakest.section] || weakest.section)}</strong> (${Math.round(weakest.avgPct)}% avg). That's exactly where your next practice will pay off most.</p>`
    : `<p>Keep mixing up your sections — variety is what builds a balanced band score.</p>`
  const strongLine = strongest
    ? `<p>Nice work on <strong>${escapeHtml(SECTION_LABEL[strongest.section] || strongest.section)}</strong> (${Math.round(strongest.avgPct)}% avg) — your strongest area this week.</p>`
    : ''

  const body = `<p>Hi ${escapeHtml(name || 'there')},</p>
    <p>Here's what your last 7 days of CELPIP practice looked like:</p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:6px 0 14px">
      <tr>
        ${statRow('sets completed', sets)}
        <td style="width:12px"></td>
        ${statRow('average score', avgPct != null ? avgPct + '%' : '—')}
      </tr>
    </table>
    ${strongLine}
    ${focusLine}
    <p>Consistency is what moves the needle. Keep your streak going with one more set today.</p>`
  return { subject, html: marketingShell({ heading, body, ctaUrl: `${SITE}/practice`, ctaLabel: 'Practise now', userId, preheader }) }
}

// ─── Educational broadcast / newsletter ──────────────────────────────────────
// Generic wrapper for one-off newsletters stored in the broadcasts table.
export function renderBroadcast({ userId, subject, preheader, heading, bodyHtml, ctaUrl, ctaLabel }) {
  return {
    subject,
    html: marketingShell({
      heading: heading || subject,
      body: bodyHtml || '',
      ctaUrl: ctaUrl || null,
      ctaLabel: ctaLabel || 'Open CELPIPACE',
      userId,
      preheader: preheader || null,
    }),
  }
}
