-- Fix Support tab: contact_messages admin policy must not query auth.users
-- (authenticated role gets "permission denied for table users").
-- Safe to re-run. Requires public.is_app_admin() from admin_hardening.sql.

DROP POLICY IF EXISTS "contact_admin_select" ON public.contact_messages;
CREATE POLICY "contact_admin_select" ON public.contact_messages
  FOR SELECT USING (public.is_app_admin());
