/* global process, Buffer */
// /api/_lib/email.js
// Transactional email helper backed by Resend, with email_log audit.
//
// All sends go through sendEmail() which:
//   1. Inserts a row in public.email_log (status='queued') BEFORE attempting send.
//   2. Calls Resend.
//   3. Updates the row to status='sent' (with provider_id) or 'failed' (with error).
// This guarantees every send attempt is auditable even if Resend errors out.
//
// Env required:
//   RESEND_API_KEY          — Resend secret API key
//   EMAIL_FROM              — verified sender, e.g. 'CELPIPACE <hello@celpipace.ca>'
//   PUBLIC_SITE_URL         — used in email links (no trailing slash)
//
// Templates exported:
//   renderWelcome, renderReceipt, renderCancelScheduled, renderCancelFinal, renderPastDue

import { Resend } from 'resend'
import crypto from 'crypto'

const FROM = process.env.EMAIL_FROM || 'CELPIPACE <hello@celpipace.ca>'
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

let resendInstance = null
function getResend() {
  if (resendInstance) return resendInstance
  const key = process.env.RESEND_API_KEY
  if (!key) return null
  resendInstance = new Resend(key)
  return resendInstance
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
      provider: 'resend',
      pdf_url:  pdfUrl || null,
      status:   'queued',
      metadata: metadata || {},
    })
    .select('id')
    .single()

  const logId = logRow?.id || null
  const resend = getResend()

  if (!resend) {
    if (logId) await supabase.from('email_log').update({ status: 'failed', error: 'resend_not_configured' }).eq('id', logId)
    console.warn('[email] RESEND_API_KEY missing — skipping send for', kind, '→', toEmail)
    return { ok: false, error: 'resend_not_configured', logId }
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM,
      to:   toEmail,
      subject,
      html,
      text,
    })
    if (error) throw new Error(error.message || JSON.stringify(error))

    if (logId) {
      await supabase.from('email_log').update({
        status:      'sent',
        provider_id: data?.id || null,
        sent_at:     new Date().toISOString(),
      }).eq('id', logId)
    }
    return { ok: true, providerId: data?.id, logId }
  } catch (err) {
    const errMsg = err?.message || String(err)
    if (logId) await supabase.from('email_log').update({ status: 'failed', error: errMsg }).eq('id', logId)
    console.error('[email] send failed:', kind, errMsg)
    return { ok: false, error: errMsg, logId }
  }
}

// ─── Templates ─────────────────────────────────────────────────────────
function shell({ heading, body, ctaUrl, ctaLabel }) {
  return `<!doctype html>
<html><body style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,Arial,sans-serif;background:#f7f8fa;color:#0f172a">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f7f8fa;padding:32px 16px">
    <tr><td align="center">
      <table role="presentation" width="560" cellspacing="0" cellpadding="0" style="background:#fff;border-radius:18px;padding:32px;box-shadow:0 4px 24px rgba(15,23,42,0.06)">
        <tr><td style="font-size:13px;letter-spacing:.16em;color:#94a3b8">CELPIPACE</td></tr>
        <tr><td style="height:8px"></td></tr>
        <tr><td style="font-size:22px;font-weight:700;color:#0f172a">${escapeHtml(heading)}</td></tr>
        <tr><td style="height:18px"></td></tr>
        <tr><td style="font-size:15px;line-height:1.55;color:#334155">${body}</td></tr>
        ${ctaUrl ? `<tr><td style="height:24px"></td></tr>
        <tr><td><a href="${escapeAttr(ctaUrl)}" style="display:inline-block;background:#0f172a;color:#fff;padding:12px 22px;border-radius:10px;text-decoration:none;font-weight:600;font-size:14px">${escapeHtml(ctaLabel || 'Open CELPIPACE')}</a></td></tr>` : ''}
        <tr><td style="height:30px"></td></tr>
        <tr><td style="font-size:12px;color:#94a3b8;border-top:1px solid #e2e8f0;padding-top:18px">
          CELPIPACE · CELPIP practice and real-time scoring · <a href="${SITE}" style="color:#94a3b8">${SITE.replace(/^https?:\/\//, '')}</a><br/>
          Need help? Reply to this email or visit <a href="${SITE}/contact" style="color:#94a3b8">${SITE.replace(/^https?:\/\//, '')}/contact</a>.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`
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

export function renderWelcome({ name, plan }) {
  const subject = `Welcome to CELPIPACE Premium`
  const heading = `You're in. Let's get you to CLB 9.`
  const body = `<p>Hi ${escapeHtml(name || 'there')},</p>
    <p>Your <strong>${escapeHtml(plan || 'Premium')}</strong> subscription is active. You now have full access to mock exams, real-time scoring, all practice sets, and saved CLB reports.</p>
    <p>Start with a diagnostic mock exam to see where you stand, then drill the lowest-scoring section.</p>`
  return { subject, html: shell({ heading, body, ctaUrl: `${SITE}/dashboard`, ctaLabel: 'Open Dashboard' }) }
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

// ─── Marketing email shell (with CASL-required unsubscribe + address) ───
function marketingShell({ heading, body, ctaUrl, ctaLabel, userId }) {
  const unsub = unsubscribeUrl(userId)
  return `<!doctype html>
<html><body style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,Arial,sans-serif;background:#f7f8fa;color:#0f172a">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f7f8fa;padding:32px 16px">
    <tr><td align="center">
      <table role="presentation" width="560" cellspacing="0" cellpadding="0" style="background:#fff;border-radius:18px;padding:32px;box-shadow:0 4px 24px rgba(15,23,42,0.06)">
        <tr><td style="font-size:13px;letter-spacing:.16em;color:#94a3b8">CELPIPACE</td></tr>
        <tr><td style="height:8px"></td></tr>
        <tr><td style="font-size:22px;font-weight:700;color:#0f172a">${escapeHtml(heading)}</td></tr>
        <tr><td style="height:18px"></td></tr>
        <tr><td style="font-size:15px;line-height:1.55;color:#334155">${body}</td></tr>
        ${ctaUrl ? `<tr><td style="height:24px"></td></tr>
        <tr><td><a href="${escapeAttr(ctaUrl)}" style="display:inline-block;background:#0f172a;color:#fff;padding:12px 22px;border-radius:10px;text-decoration:none;font-weight:600;font-size:14px">${escapeHtml(ctaLabel || 'Open CELPIPACE')}</a></td></tr>` : ''}
        <tr><td style="height:30px"></td></tr>
        <tr><td style="font-size:12px;color:#94a3b8;border-top:1px solid #e2e8f0;padding-top:18px;line-height:1.6">
          ${escapeHtml(MAILING_ADDRESS)}<br/>
          You're receiving this because you opted in to CELPIPACE study tips. <a href="${escapeAttr(unsub)}" style="color:#94a3b8">Unsubscribe</a> &middot; <a href="${SITE}/subscription" style="color:#94a3b8">Email preferences</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`
}

// Drip step 1 (day 2 after signup): study tips + nudge to first practice set.
export function renderFreeNudgeDay2({ name, userId }) {
  const subject = `5 quick wins for your CELPIP score`
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
  return { subject, html: marketingShell({ heading, body, ctaUrl: `${SITE}/practice`, ctaLabel: 'Try a practice set', userId }) }
}

// Drip step 2 (day 5): show what AI scoring looks like — drives mock-test sign-up
export function renderFreeNudgeDay5({ name, userId }) {
  const subject = `What a CLB 11 mock report looks like`
  const heading = `See your score the way an examiner does`
  const body = `<p>Hi ${escapeHtml(name || 'there')},</p>
    <p>Our AI scorer breaks each Writing and Speaking response into four dimensions — Task Fulfillment, Coherence, Vocabulary, Readability — with specific suggestions tied to the text you wrote.</p>
    <p>It's calibrated against high-scoring exemplars, so the band you see is close to what an examiner would give. Most users find their weakest dimension is <em>not</em> the one they expected.</p>
    <p>Take a 60-minute mock to see where you actually stand.</p>`
  return { subject, html: marketingShell({ heading, body, ctaUrl: `${SITE}/exam`, ctaLabel: 'Start a mock exam', userId }) }
}

// Drip step 3 (day 14): first-time discount.
export function renderFreeNudgeDay14({ name, userId }) {
  const subject = `25% off your first CELPIPACE Premium month`
  const heading = `Ready to drill the section that's holding you back?`
  const body = `<p>Hi ${escapeHtml(name || 'there')},</p>
    <p>Premium unlocks every mock exam, real-time AI scoring on every Writing/Speaking attempt, and saved CLB reports so you can see your trajectory week over week.</p>
    <p>Use code <strong style="background:#0f172a;color:#fff;padding:2px 8px;border-radius:6px;letter-spacing:.05em">CELPIP25</strong> at checkout for <strong>25% off your first subscription</strong>. First-time only.</p>`
  return { subject, html: marketingShell({ heading, body, ctaUrl: `${SITE}/pricing`, ctaLabel: 'See plans', userId }) }
}

export function renderPastDue({ name, amountCents, currency, hostedInvoiceUrl }) {
  const subject = `Your CELPIPACE payment couldn't be charged`
  const heading = `We couldn't process your payment`
  const body = `<p>Hi ${escapeHtml(name || 'there')},</p>
    <p>We tried to charge ${fmtMoney(amountCents, currency)} for your CELPIPACE Premium renewal but the payment didn't go through. Stripe will retry automatically over the next few days. You can also pay the invoice now, or update your card to avoid losing access.</p>
    ${hostedInvoiceUrl ? `<p style="margin-top:14px"><a href="${escapeAttr(hostedInvoiceUrl)}" style="color:#0ea5e9">Pay outstanding invoice</a></p>` : ''}`
  return { subject, html: shell({ heading, body, ctaUrl: `${SITE}/subscription`, ctaLabel: 'Update Payment Method' }) }
}
