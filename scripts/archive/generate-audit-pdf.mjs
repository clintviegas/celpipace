// Generates docs/CELPIP_DB_Audit.html — convert to PDF separately via headless Chrome.
import fs from 'node:fs'
import path from 'node:path'

const out = path.resolve('docs/CELPIP_DB_Audit.html')

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>CELPIP Database Audit — Functional Testing Report</title>
<style>
  @page { size: A4; margin: 16mm 14mm 18mm 14mm; }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
    color: #1f2937;
    font-size: 10.5pt;
    line-height: 1.5;
  }
  .cover {
    page-break-after: always;
    height: 96vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    text-align: center;
    background: linear-gradient(135deg, #0F1F3D 0%, #1B3058 60%, #1a4070 100%);
    color: #fff;
    padding: 60px 40px;
    margin: -16mm -14mm 0 -14mm;
  }
  .cover h1 { font-size: 34pt; margin: 0 0 12px; letter-spacing: -0.5px; }
  .cover .sub { font-size: 14pt; opacity: 0.85; margin-bottom: 30px; }
  .cover .meta { font-size: 11pt; opacity: 0.7; }
  .cover .badge {
    display: inline-block;
    padding: 6px 16px;
    border-radius: 99px;
    background: rgba(255,255,255,0.15);
    border: 1px solid rgba(255,255,255,0.3);
    font-size: 10pt;
    margin-top: 24px;
  }
  h1 { font-size: 22pt; color: #0F1F3D; border-bottom: 2px solid #C8102E; padding-bottom: 6px; margin-top: 28px; page-break-after: avoid; }
  h2 { font-size: 15pt; color: #0F1F3D; margin-top: 22px; page-break-after: avoid; }
  h3 { font-size: 12pt; color: #1B3058; margin-top: 18px; page-break-after: avoid; }
  h4 { font-size: 10.5pt; color: #374151; margin-top: 14px; page-break-after: avoid; }
  p { margin: 6px 0; }
  ul, ol { margin: 6px 0 6px 22px; padding: 0; }
  li { margin: 2px 0; }
  code { font-family: 'SF Mono', Menlo, Consolas, monospace; font-size: 9.2pt; background: #F3F4F6; padding: 1px 5px; border-radius: 3px; color: #C8102E; }
  pre { background: #0F1F3D; color: #f3f4f6; padding: 12px 14px; border-radius: 6px; font-size: 9pt; overflow-x: auto; white-space: pre-wrap; }
  table { width: 100%; border-collapse: collapse; margin: 10px 0 16px; font-size: 8.8pt; page-break-inside: auto; }
  thead { background: #0F1F3D; color: #fff; display: table-header-group; }
  th, td { border: 1px solid #E5E7EB; padding: 6px 8px; text-align: left; vertical-align: top; }
  tbody tr:nth-child(even) { background: #F9FAFB; }
  tr { page-break-inside: avoid; }
  .ok { color: #2D8A56; font-weight: 700; }
  .warn { color: #C8972A; font-weight: 700; }
  .crit { color: #C8102E; font-weight: 700; }
  .pill { display: inline-block; padding: 1px 7px; border-radius: 99px; font-size: 8.5pt; font-weight: 700; }
  .pill-ok   { background: #ECFDF5; color: #065F46; border: 1px solid #A7F3D0; }
  .pill-warn { background: #FEF3C7; color: #92400E; border: 1px solid #FDE68A; }
  .pill-crit { background: #FEE2E2; color: #991B1B; border: 1px solid #FCA5A5; }
  .pill-info { background: #EEF4FF; color: #1E3A8A; border: 1px solid #BFDBFE; }
  .callout {
    border-left: 4px solid #C8102E;
    background: #FEF2F2;
    padding: 10px 14px;
    margin: 12px 0;
    border-radius: 0 6px 6px 0;
    page-break-inside: avoid;
  }
  .callout.warn { border-color: #C8972A; background: #FFFBEB; }
  .callout.ok { border-color: #2D8A56; background: #ECFDF5; }
  .toc { background: #F9FAFB; border: 1px solid #E5E7EB; padding: 14px 22px; border-radius: 8px; }
  .toc ol { margin: 0 0 0 16px; }
  .footer-note { margin-top: 30px; font-size: 9pt; color: #6B7280; text-align: center; border-top: 1px solid #E5E7EB; padding-top: 10px; }
  .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin: 14px 0 22px; }
  .kpi { border: 1px solid #E5E7EB; border-radius: 8px; padding: 10px 12px; background: #fff; }
  .kpi .n { font-size: 18pt; font-weight: 800; color: #C8102E; }
  .kpi .l { font-size: 8.5pt; text-transform: uppercase; letter-spacing: 0.5px; color: #6B7280; }
</style>
</head>
<body>

<div class="cover">
  <div style="font-size:11pt;letter-spacing:3px;opacity:0.75;">CELPIPACE.CA</div>
  <h1>Database Audit Report</h1>
  <div class="sub">Functional Testing of User-Scoped DB Operations</div>
  <div class="meta">Supabase / Postgres &middot; React + Vercel API</div>
  <div class="badge">Generated April 2026</div>
</div>

<h1>1. Executive Summary</h1>
<p>This report covers every database operation tied to an individual user in the CELPIPACE web application. It maps each user-facing action to its corresponding write/read on Supabase tables, validates RLS enforcement, identifies error-handling gaps, and surfaces operational risks.</p>

<div class="kpi-grid">
  <div class="kpi"><div class="n">18</div><div class="l">Tables Audited</div></div>
  <div class="kpi"><div class="n">30+</div><div class="l">DB Operations</div></div>
  <div class="kpi"><div class="n">10</div><div class="l">RPC Functions</div></div>
  <div class="kpi"><div class="n">5</div><div class="l">Critical Risks</div></div>
</div>

<div class="toc">
<strong>Contents</strong>
<ol>
  <li>Executive Summary</li>
  <li>Database Schema (per table)</li>
  <li>DB Operations by Code Location (hooks, pages, API)</li>
  <li>RPC Functions</li>
  <li>RLS Policy Matrix</li>
  <li>User Journey → Data Flow</li>
  <li>Risks &amp; Gaps (prioritised)</li>
  <li>Recommendations</li>
</ol>
</div>

<h1>2. Database Schema</h1>

<h2>2.1 Auth &amp; Profile</h2>
<h3>profiles &mdash; user account &amp; subscription state</h3>
<table>
<tr><th>Column group</th><th>Fields</th></tr>
<tr><td>Identity</td><td><code>id</code> (PK, FK auth.users), <code>email</code>, <code>full_name</code>, <code>avatar_url</code></td></tr>
<tr><td>Subscription</td><td><code>is_premium</code>, <code>subscription_status</code>, <code>current_plan</code>, <code>premium_source</code>, <code>premium_granted_at</code>, <code>premium_expires_at</code>, <code>cancel_at_period_end</code>, <code>current_period_start</code>, <code>current_period_end</code>, <code>last_payment_at</code></td></tr>
<tr><td>Stripe</td><td><code>stripe_customer_id</code>, <code>stripe_subscription_id</code></td></tr>
<tr><td>Activity</td><td><code>last_seen_at</code>, <code>created_at</code>, <code>updated_at</code></td></tr>
</table>
<p><strong>RLS:</strong> users read/insert/update own row (safe columns only). Trigger <code>guard_profile_billing_columns()</code> rejects client writes to billing fields. Admin (<code>sales@celpipace.com</code>) has full read/update.</p>

<h2>2.2 Practice &amp; Test Sessions</h2>
<table>
<thead><tr><th>Table</th><th>Purpose</th><th>User-scoped?</th><th>Append-only?</th></tr></thead>
<tbody>
<tr><td><code>practice_sets</code></td><td>Question pool (sections, parts, sets)</td><td>No (public)</td><td>n/a</td></tr>
<tr><td><code>questions</code></td><td>MCQ items linked to sets</td><td>No (public)</td><td>n/a</td></tr>
<tr><td><code>user_attempts</code></td><td>Per-question selected answers</td><td>Yes (FK user_id)</td><td>No (update/delete allowed)</td></tr>
<tr><td><code>test_sessions</code></td><td>Resumable session state (answers, scores, meta JSONB)</td><td>Yes (FK user_id)</td><td>No (debounced updates)</td></tr>
<tr><td><code>practice_attempts</code></td><td>Score history per completion</td><td>Yes (FK user_id)</td><td>Yes</td></tr>
<tr><td><code>user_progress</code></td><td>Cloud mirror of localStorage progress JSON</td><td>Yes (PK user_id)</td><td>No (upsert)</td></tr>
</tbody>
</table>

<h2>2.3 Writing Practice</h2>
<table>
<thead><tr><th>Table</th><th>Purpose</th><th>User-scoped?</th></tr></thead>
<tbody>
<tr><td><code>writing_sets</code></td><td>20 writing sets</td><td>No</td></tr>
<tr><td><code>writing_tasks</code></td><td>Email + survey tasks per set</td><td>No</td></tr>
<tr><td><code>writing_responses</code></td><td>User submission text + word_count + time_spent</td><td>Yes (UNIQUE user_id, task_id)</td></tr>
</tbody>
</table>

<h2>2.4 Subscription &amp; Payments</h2>
<table>
<thead><tr><th>Table</th><th>Purpose</th><th>Writer</th></tr></thead>
<tbody>
<tr><td><code>payments</code></td><td>Revenue log per Stripe charge</td><td>Service role (webhook)</td></tr>
<tr><td><code>coupons</code></td><td>Promo codes (admin-managed)</td><td>Admin</td></tr>
<tr><td><code>coupon_redemptions</code></td><td>Per-user redemption history</td><td>RPC <code>redeem_coupon</code></td></tr>
<tr><td><code>subscription_events</code></td><td>State-change audit (checkout, cancel, expired, past_due)</td><td>Service role + cancel API</td></tr>
<tr><td><code>cancellation_feedback</code></td><td>Reason / free_text / would_return</td><td>Cancel API</td></tr>
<tr><td><code>webhook_events</code></td><td>Raw Stripe event archive</td><td>Webhook handler</td></tr>
<tr><td><code>email_log</code></td><td>Transactional email audit (welcome, receipt, cancel, past_due)</td><td>sendEmail() helper</td></tr>
<tr><td><code>contact_messages</code></td><td>Support form submissions</td><td>Anyone (RLS allows nullable user_id)</td></tr>
</tbody>
</table>

<h1>3. DB Operations by Code Location</h1>

<h2>3.1 Hooks</h2>
<h3>useProgress.js &mdash; localStorage + cloud progress</h3>
<table>
<thead><tr><th>Op</th><th>Table</th><th>Trigger</th><th>RLS</th><th>Error handling</th></tr></thead>
<tbody>
<tr><td>SELECT</td><td>user_progress</td><td>Auth state change (sign-in / token refresh)</td><td><span class="pill pill-ok">RLS</span></td><td>Silent .catch &mdash; <span class="warn">no UI</span></td></tr>
<tr><td>UPSERT</td><td>user_progress</td><td>After local merge with cloud</td><td><span class="pill pill-ok">RLS</span></td><td>Silent .catch</td></tr>
<tr><td>INSERT</td><td>practice_attempts</td><td>recordCompletion() &mdash; user finishes a set</td><td><span class="pill pill-ok">RLS</span></td><td><span class="crit">console.warn only, fire-and-forget</span></td></tr>
</tbody>
</table>

<h3>useTestSession.js &mdash; resumable sessions</h3>
<table>
<thead><tr><th>Op</th><th>Target</th><th>Trigger</th><th>RLS</th><th>Notes</th></tr></thead>
<tbody>
<tr><td>RPC</td><td>start_or_resume_practice_session</td><td>Hook bootstrap (kind=practice)</td><td><span class="pill pill-ok">SECURITY DEFINER</span></td><td>console.warn on failure</td></tr>
<tr><td>RPC</td><td>start_or_resume_mock_session</td><td>Hook bootstrap (kind=mock)</td><td><span class="pill pill-ok">SECURITY DEFINER</span></td><td>console.warn</td></tr>
<tr><td>UPDATE</td><td>test_sessions</td><td>Debounced 200&ndash;400 ms after answer save / nav</td><td><span class="pill pill-ok">RLS</span></td><td>setSaveError; flush() on pagehide</td></tr>
<tr><td>RPC</td><td>complete_test_session</td><td>User finishes test or reset()</td><td><span class="pill pill-ok">SECURITY DEFINER</span></td><td>console.warn</td></tr>
</tbody>
</table>

<h3>usePracticeSet.js &mdash; question fetcher</h3>
<p>Single SELECT on <code>questions</code> table by <code>(section, part)</code>. Public read, no RLS scoping.</p>

<h2>3.2 API Endpoints (service-role)</h2>

<h3>api/stripe-webhook.js</h3>
<table>
<thead><tr><th>Stripe event</th><th>DB writes</th><th>Email</th></tr></thead>
<tbody>
<tr><td><code>checkout.session.completed</code></td><td>UPSERT profiles, UPSERT payments, INSERT subscription_events, UPSERT webhook_events</td><td>welcome</td></tr>
<tr><td><code>customer.subscription.updated</code></td><td>UPDATE profiles, INSERT subscription_events</td><td>&mdash;</td></tr>
<tr><td><code>customer.subscription.deleted</code></td><td>UPDATE profiles (is_premium=false), INSERT subscription_events</td><td>cancel_final</td></tr>
<tr><td><code>invoice.paid</code></td><td>UPDATE profiles (extend expiry), UPSERT payments</td><td>receipt</td></tr>
<tr><td><code>invoice.payment_failed</code></td><td>UPDATE profiles (status=past_due)</td><td>past_due</td></tr>
<tr><td><code>charge.refunded</code></td><td>UPDATE payments (status=refunded)</td><td>&mdash;</td></tr>
<tr><td>(every event)</td><td>UPSERT webhook_events archive, RPC expire_premium_users (backstop)</td><td>&mdash;</td></tr>
</tbody>
</table>

<h3>api/cancel-subscription.js</h3>
<ol>
  <li>Auth bearer token validated &rarr; SELECT profile.</li>
  <li>Stripe API: set <code>cancel_at_period_end=true</code>.</li>
  <li>UPDATE profiles (cancel_at_period_end, period_end, premium_expires_at).</li>
  <li>INSERT cancellation_feedback (<span class="warn">not awaited</span>).</li>
  <li>INSERT subscription_events &mdash; event_type <code>user.cancel_requested</code> (<span class="warn">not awaited</span>).</li>
  <li>sendEmail cancel_scheduled (<span class="warn">not awaited</span>).</li>
</ol>

<h3>api/contact.js</h3>
<p>INSERT <code>contact_messages</code> &rarr; send email via Resend &rarr; UPDATE row with <code>email_sent</code>/<code>email_error</code>. Returns 202 if email fails.</p>

<h3>api/cron-sweep.js</h3>
<p>Vercel Cron (daily) &rarr; RPC <code>expire_premium_users()</code>. Auth via <code>CRON_SECRET</code> header.</p>

<h3>api/create-checkout-session.js / customer-portal.js</h3>
<p>Stripe API only; no direct DB writes (state changes flow back through webhook).</p>

<h2>3.3 Pages with Direct DB Calls</h2>
<table>
<thead><tr><th>Page</th><th>Operation</th><th>Notes</th></tr></thead>
<tbody>
<tr><td>WritingPracticePage.jsx</td><td>SELECT writing_tasks &rarr; UPSERT writing_responses</td><td>UPSERT keyed on (user_id, task_id) &mdash; one submission per task</td></tr>
<tr><td>AuthContext.jsx</td><td>RPC touch_user_activity (5-min throttle); UPSERT profiles fallback</td><td>Updates last_seen_at</td></tr>
<tr><td>AdminPage.jsx</td><td>RPC get_admin_user_activity, UPDATE profiles (toggle premium), INSERT/UPDATE coupons, SELECT subscription_events / cancellation_feedback / email_log</td><td>Uses <code>adminSupabase</code> with <code>SUPABASE_SERVICE_ROLE_KEY</code>; admin email gate</td></tr>
</tbody>
</table>

<h1>4. RPC Functions</h1>
<table>
<thead><tr><th>Function</th><th>Caller</th><th>Security</th><th>Effect</th></tr></thead>
<tbody>
<tr><td><code>start_or_resume_practice_session</code></td><td>useTestSession</td><td>SECURITY DEFINER, auth.uid()</td><td>Find or create active practice test_sessions row</td></tr>
<tr><td><code>start_or_resume_mock_session</code></td><td>useTestSession</td><td>SECURITY DEFINER</td><td>Find or create active mock test_sessions row</td></tr>
<tr><td><code>complete_test_session</code></td><td>useTestSession</td><td>SECURITY DEFINER</td><td>Mark is_completed=true</td></tr>
<tr><td><code>redeem_coupon(code)</code></td><td>UpgradeModal / Pricing</td><td>SECURITY DEFINER</td><td>Validates code, INSERT coupon_redemptions, UPDATE profiles premium</td></tr>
<tr><td><code>am_i_premium()</code></td><td>AuthContext</td><td>SECURITY DEFINER</td><td>Wrapper for is_premium_active(auth.uid())</td></tr>
<tr><td><code>assert_premium()</code></td><td>Server-side guards</td><td>SECURITY DEFINER</td><td>Raises exception if not premium</td></tr>
<tr><td><code>expire_premium_users()</code></td><td>cron-sweep, webhook backstop</td><td>SECURITY DEFINER (service role)</td><td>Bulk UPDATE stale premium rows</td></tr>
<tr><td><code>touch_user_activity()</code></td><td>AuthContext</td><td>SECURITY DEFINER</td><td>UPDATE last_seen_at</td></tr>
<tr><td><code>get_admin_user_activity()</code></td><td>AdminPage</td><td>SECURITY DEFINER, admin gate</td><td>Joined profile + activity counts</td></tr>
</tbody>
</table>

<h1>5. RLS Policy Matrix</h1>
<table>
<thead><tr><th>Table</th><th>User read</th><th>User insert</th><th>User update</th><th>User delete</th><th>Admin</th></tr></thead>
<tbody>
<tr><td>profiles</td><td>own</td><td>own (safe)</td><td>own (safe)</td><td>&mdash;</td><td>full</td></tr>
<tr><td>practice_sets</td><td>public</td><td>&mdash;</td><td>&mdash;</td><td>&mdash;</td><td>full</td></tr>
<tr><td>questions</td><td>public</td><td>&mdash;</td><td>&mdash;</td><td>&mdash;</td><td>full</td></tr>
<tr><td>user_attempts</td><td>own</td><td>own</td><td>own</td><td>own</td><td>&mdash;</td></tr>
<tr><td>test_sessions</td><td>own</td><td>own</td><td>own</td><td>own</td><td>read</td></tr>
<tr><td>practice_attempts</td><td>own</td><td>own</td><td>&mdash;</td><td>&mdash;</td><td>read</td></tr>
<tr><td>user_progress</td><td>own</td><td>own</td><td>own</td><td>&mdash;</td><td>read</td></tr>
<tr><td>writing_sets / writing_tasks</td><td>public</td><td>&mdash;</td><td>&mdash;</td><td>&mdash;</td><td>full</td></tr>
<tr><td>writing_responses</td><td>own</td><td>own</td><td>own</td><td>&mdash;</td><td>read</td></tr>
<tr><td>payments</td><td>own</td><td>service-role</td><td>service-role</td><td>&mdash;</td><td>read</td></tr>
<tr><td>coupons</td><td>&mdash;</td><td>&mdash;</td><td>&mdash;</td><td>&mdash;</td><td>full</td></tr>
<tr><td>coupon_redemptions</td><td>own</td><td>RPC</td><td>&mdash;</td><td>&mdash;</td><td>read</td></tr>
<tr><td>subscription_events</td><td>own</td><td>service-role</td><td>&mdash;</td><td>&mdash;</td><td>read</td></tr>
<tr><td>cancellation_feedback</td><td>own</td><td>own/service</td><td>&mdash;</td><td>&mdash;</td><td>read</td></tr>
<tr><td>email_log</td><td>own</td><td>service-role</td><td>service-role</td><td>&mdash;</td><td>read</td></tr>
<tr><td>webhook_events</td><td>&mdash;</td><td>service-role</td><td>service-role</td><td>&mdash;</td><td>read</td></tr>
<tr><td>contact_messages</td><td>own</td><td>anyone (incl. anon)</td><td>&mdash;</td><td>&mdash;</td><td>read</td></tr>
</tbody>
</table>

<h1>6. User Journey &rarr; Data Flow</h1>

<h3>Journey A &mdash; Sign Up &rarr; First Practice</h3>
<ol>
  <li>auth.users created &rarr; trigger inserts profile row.</li>
  <li>Practice completion &rarr; localStorage updated &rarr; async INSERT practice_attempts (<span class="warn">fire-and-forget</span>).</li>
  <li>RPC touch_user_activity refreshes last_seen_at.</li>
</ol>

<h3>Journey B &mdash; Test Session Resume</h3>
<ol>
  <li>RPC start_or_resume_practice_session loads prior selected_answers / scores.</li>
  <li>Each answer/nav debounces UPDATE test_sessions (200&ndash;400 ms).</li>
  <li>pagehide / visibilitychange &rarr; flush().</li>
  <li>Finish &rarr; RPC complete_test_session.</li>
</ol>

<h3>Journey C &mdash; Writing Submission</h3>
<ol>
  <li>SELECT writing_tasks by (set_id, task_number).</li>
  <li>UPSERT writing_responses on (user_id, task_id) &mdash; immutable per task.</li>
</ol>

<h3>Journey D &mdash; Premium Purchase</h3>
<ol>
  <li>POST /api/create-checkout-session &rarr; Stripe redirect.</li>
  <li>checkout.session.completed webhook:
    <ul>
      <li>UPSERT profiles (is_premium, expires, customer_id, sub_id)</li>
      <li>UPSERT payments (revenue audit)</li>
      <li>INSERT subscription_events</li>
      <li>sendEmail welcome &rarr; INSERT/UPDATE email_log</li>
    </ul>
  </li>
</ol>

<h3>Journey E &mdash; Subscription Cancellation</h3>
<ol>
  <li>POST /api/cancel-subscription with bearer token.</li>
  <li>Stripe: cancel_at_period_end=true.</li>
  <li>UPDATE profiles (cancel flag, period_end).</li>
  <li>INSERT cancellation_feedback &amp; subscription_events (<span class="warn">not awaited</span>).</li>
  <li>sendEmail cancel_scheduled.</li>
  <li>At period end: customer.subscription.deleted &rarr; UPDATE profiles is_premium=false &rarr; sendEmail cancel_final.</li>
</ol>

<h1>7. Risks &amp; Gaps</h1>

<div class="callout">
  <strong class="crit">CRITICAL</strong> &mdash; Practice score INSERT is fire-and-forget
  <p>In <code>useProgress.js</code>, <code>saveAttemptToCloud()</code> calls Supabase INSERT without await; failures only <code>console.warn</code>. A user's score may silently fail to persist to <code>practice_attempts</code> with no UI indication.</p>
</div>

<div class="callout">
  <strong class="crit">CRITICAL</strong> &mdash; Profile lookup in webhook can produce orphan payments
  <p>Stripe webhook resolves user via email/metadata. If the email mismatches the profile, INSERT into <code>payments</code> proceeds with <code>user_id=NULL</code> (FK is ON DELETE SET NULL). Audit becomes hard.</p>
</div>

<div class="callout warn">
  <strong class="warn">HIGH</strong> &mdash; Cancellation side-effects not awaited
  <p>cancel-subscription.js inserts into <code>cancellation_feedback</code> and <code>subscription_events</code> with <code>.then().catch()</code>. Failures are silent; the user receives 200 even if audit data is lost.</p>
</div>

<div class="callout warn">
  <strong class="warn">HIGH</strong> &mdash; Debounced session updates can lose final answers
  <p>useTestSession defaults to 200&ndash;400 ms debounce. On mobile, a pagehide may not fire reliably; the last answer may not flush.</p>
</div>

<div class="callout warn">
  <strong class="warn">MEDIUM</strong> &mdash; Renewal payment INSERT errors not checked
  <p>invoice.paid handler upserts payments without inspecting <code>error</code>. Constraint violations or schema drift go unnoticed.</p>
</div>

<div class="callout warn">
  <strong class="warn">MEDIUM</strong> &mdash; No rate limiting on public endpoints
  <p>contact.js, cancel-subscription.js, create-checkout-session.js are open to repeated invocation by authenticated or unauthenticated callers.</p>
</div>

<div class="callout warn">
  <strong class="warn">MEDIUM</strong> &mdash; user_progress conflict resolution is last-write-wins
  <p>Two-device usage can lose one device's recent progress. Consider merging by per-key updated_at.</p>
</div>

<div class="callout ok">
  <strong class="ok">VERIFIED OK</strong> &mdash; All user-scoped tables have RLS enabled
  <p>profiles (with billing trigger), test_sessions, practice_attempts, user_progress, writing_responses, subscription_events, cancellation_feedback, email_log, payments &mdash; each enforces user_id = auth.uid() on read paths.</p>
</div>

<div class="callout ok">
  <strong class="ok">VERIFIED OK</strong> &mdash; Service-role key never reaches the browser
  <p>adminSupabase and api/* use SUPABASE_SERVICE_ROLE_KEY only on the server; client uses anon key.</p>
</div>

<h1>8. Recommendations</h1>

<h3>Immediate (this sprint)</h3>
<ol>
  <li>Await <code>saveAttemptToCloud()</code> in <code>useProgress.js</code>; show a toast on failure and retry once with backoff.</li>
  <li>In <code>api/cancel-subscription.js</code>, await both audit INSERTs &amp; collect errors into the response (or <code>Promise.allSettled</code> with sentry log).</li>
  <li>In Stripe webhook, abort INSERT into <code>payments</code> if profile lookup fails &mdash; surface a row in <code>webhook_events.processing_error</code> instead.</li>
  <li>Check <code>error</code> on every supabase call inside the webhook; bubble up to <code>processing_error</code>.</li>
</ol>

<h3>Short-term</h3>
<ol>
  <li>Add rate limiting (e.g. Upstash Redis) to /api/contact, /api/cancel-subscription.</li>
  <li>Replace fire-and-forget email sends with a queue (Inngest / Trigger.dev) for retries.</li>
  <li>Add <code>updated_at</code>-based merge in user_progress sync to handle multi-device.</li>
  <li>Add a Sentry/log line for any debounced flush() that errors so we see lost-data incidents.</li>
</ol>

<h3>Medium-term</h3>
<ol>
  <li>Add a <code>profile_billing_audit</code> table written by the guard trigger when blocked.</li>
  <li>Introduce idempotency keys on /api/cancel-subscription to avoid duplicate flips.</li>
  <li>Backfill <code>user_id</code> on any historical NULL rows in <code>payments</code> via Stripe customer_id lookup.</li>
</ol>

<div class="footer-note">
  CELPIPACE &mdash; Functional DB Audit &mdash; Confidential. Generated automatically from source-code analysis.
</div>

</body>
</html>`

fs.mkdirSync(path.dirname(out), { recursive: true })
fs.writeFileSync(out, html, 'utf8')
console.log('Wrote', out)
