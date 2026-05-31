# Auth Domain Setup

The app now defaults auth redirects to `https://celpipace.ca`, even when `VITE_SITE_URL` is not set locally.

## Vercel env

Set this in Vercel for clarity:

```bash
VITE_SITE_URL=https://celpipace.ca
```

## Supabase Auth URLs

In Supabase Dashboard -> Authentication -> URL Configuration:

- Site URL: `https://celpipace.ca`
- Additional Redirect URLs:
  - `https://celpipace.ca/**`
  - `https://www.celpipace.ca/**`
  - `https://celpipace.ca/dashboard`
  - `https://www.celpipace.ca/dashboard`
  - `http://localhost:5173/**` only if local login testing is needed

The public app now passes a sanitized same-origin redirect path to Google OAuth, so users return to the exact practice or mock route they attempted after sign-in. The client only trusts `celpipace.ca`, `www.celpipace.ca`, and localhost origins for OAuth redirects.

## Public Sign-In Providers

Public user sign-in is Google-only in the React client. Keep Google enabled in Supabase Authentication -> Providers.

The admin console uses an isolated admin Supabase client and still relies on its own admin credentials. Do not disable Supabase Email provider globally unless the admin login is migrated to Google as well.

## Google OAuth Domain Display

If Google still shows the Supabase project domain (`ljwnzakoqlydgcyxuqny.supabase.co`) as the app domain, that comes from Supabase's hosted auth callback domain. To show a branded auth domain there, configure a Supabase custom auth domain and add that callback URL in Google Cloud OAuth settings.