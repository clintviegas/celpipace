# Contact Form Setup

The `/contact` form posts to `/api/contact`. The endpoint saves every message in Supabase first, then sends an email notification to `hello@celpipace.ca` via Brevo.

## 1. Run the SQL migration

Run this in Supabase SQL Editor:

```sql
\i supabase/contact_messages.sql
```

This creates `public.contact_messages` with RLS, user-owned reads, and admin reads for `clint.viegas@gmail.com`.

## 2. Configure Vercel env vars

Required for saving messages:

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Required for email delivery through Brevo (shared with the rest of the
transactional email stack — Resend is no longer used):

```bash
BREVO_API_KEY=xkeysib-xxx
EMAIL_FROM=CELPIPACE <hello@celpipace.ca>
CONTACT_TO_EMAIL=hello@celpipace.ca
```

`CONTACT_TO_EMAIL` defaults to `hello@celpipace.ca` if it is not set. The
sender address in `EMAIL_FROM` must be verified in Brevo → Senders.
