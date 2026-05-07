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
//   EMAIL_FROM              — verified sender, e.g. 'CELPIPACE <info@celpipace.ca>'
//   PUBLIC_SITE_URL         — used in email links (no trailing slash)
//
// Templates exported:
//   renderWelcome, renderReceipt, renderCancelScheduled, renderCancelFinal, renderPastDue

import { Resend } from 'resend'

const FROM = process.env.EMAIL_FROM || 'CELPIPACE <info@celpipace.ca>'
const SITE = (process.env.PUBLIC_SITE_URL || 'https://www.celpipace.ca').replace(/\/$/, '')

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
    <p>Changed your mind? You can resume your subscription anytime before that date from the manage page.</p>`
  return { subject, html: shell({ heading, body, ctaUrl: `${SITE}/subscription`, ctaLabel: 'Manage Subscription' }) }
}

export function renderCancelFinal({ name }) {
  const subject = `Your CELPIPACE Premium has ended`
  const heading = `Your Premium access has ended`
  const body = `<p>Hi ${escapeHtml(name || 'there')},</p>
    <p>Your CELPIPACE Premium subscription has now ended. You can still sign in and use the free practice features. Your saved progress and CLB reports stay in your account.</p>
    <p>If you want to come back, the door's open.</p>`
  return { subject, html: shell({ heading, body, ctaUrl: `${SITE}/pricing`, ctaLabel: 'See Plans' }) }
}

export function renderPastDue({ name, amountCents, currency, hostedInvoiceUrl }) {
  const subject = `Your CELPIPACE payment couldn't be charged`
  const heading = `We couldn't process your payment`
  const body = `<p>Hi ${escapeHtml(name || 'there')},</p>
    <p>We tried to charge ${fmtMoney(amountCents, currency)} for your CELPIPACE Premium renewal but the payment didn't go through. Stripe will retry automatically over the next few days. You can also pay the invoice now, or update your card to avoid losing access.</p>
    ${hostedInvoiceUrl ? `<p style="margin-top:14px"><a href="${escapeAttr(hostedInvoiceUrl)}" style="color:#0ea5e9">Pay outstanding invoice</a></p>` : ''}`
  return { subject, html: shell({ heading, body, ctaUrl: `${SITE}/subscription`, ctaLabel: 'Update Payment Method' }) }
}
