# Brevo Automation Setup

CELPIPACE uses Brevo for transactional email and list-triggered lifecycle workflows. The app updates Brevo contacts from signup, marketing consent, unsubscribe, and Stripe subscription events.

## 1. Configure Environment Variables

Set these in Vercel project settings and in `.env.local` for local testing:

```bash
BREVO_API_KEY=xkeysib-xxx
EMAIL_FROM=CELPIPACE <hello@celpipace.ca>
BREVO_LIST_ID=123
BREVO_LIST_PREMIUM=456
BREVO_LIST_CANCELLED=789
MAILING_ADDRESS=CELPIPACE, your mailing address
UNSUBSCRIBE_SECRET=generated-32-byte-secret
```

`EMAIL_FROM` must use a sender or domain verified in Brevo.

## 2. Create Brevo Lists

Create these lists in Brevo under Contacts -> Lists:

| Env var | Suggested list name | App trigger |
| --- | --- | --- |
| `BREVO_LIST_ID` | CELPIPACE Users | New signup or marketing opt-in |
| `BREVO_LIST_PREMIUM` | CELPIPACE Premium | Stripe checkout completes |
| `BREVO_LIST_CANCELLED` | CELPIPACE Cancelled | Subscription fully expires |

Copy each numeric list ID from the Brevo list URL into the matching env var.

## 3. Build Workflows In Brevo

Create Automation workflows that start when a contact is added to each list:

| Workflow | Entry list | Recommended purpose |
| --- | --- | --- |
| Welcome drip | CELPIPACE Users | Welcome, study tips, first practice CTA |
| Premium onboarding | CELPIPACE Premium | Unlock reminder, mock exam CTA, support note |
| Win-back | CELPIPACE Cancelled | Renewal reminder and value recap |

Keep marketing workflows restricted to non-blacklisted contacts. The app sets `emailBlacklisted` when users unsubscribe or decline marketing consent.

## 4. Verify The Connection

After deployment, sign in as the admin user and POST to `/api/admin` with your Supabase access token:

```json
{ "action": "brevo-status" }
```

To create or update a test contact and add it to a trigger list:

```json
{ "action": "brevo-test-contact", "email": "hello@celpipace.ca", "name": "CELPIPACE Test", "list": "users" }
```

Allowed list values are `users`, `premium`, and `cancelled`. This may trigger the matching Brevo automation, so use a test address first.

## 5. App Events Already Wired

- New signup: upserts a Brevo contact, applies the main users list when consent is present, and sends the signup welcome email.
- Marketing consent: subscribes or blacklists the Brevo contact.
- One-click unsubscribe: updates Supabase, blacklists the Brevo contact, and removes them from the main list.
- Paid checkout: adds the contact to the premium list.
- Subscription expired: adds the contact to the cancelled list.
- Contact form and transactional emails: send through Brevo SMTP API.