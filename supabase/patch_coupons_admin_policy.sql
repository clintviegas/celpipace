-- Fix Coupons tab: policies must not query auth.users directly.
-- Safe to re-run. Requires public.is_app_admin() from admin_hardening.sql.

drop policy if exists "coupons_admin_all" on public.coupons;
create policy "coupons_admin_all" on public.coupons
  for all using (public.is_app_admin())
  with check (public.is_app_admin());

drop policy if exists "redemptions_self_read" on public.coupon_redemptions;
create policy "redemptions_self_read" on public.coupon_redemptions
  for select using (user_id = auth.uid() or public.is_app_admin());

drop policy if exists "redemptions_admin_write" on public.coupon_redemptions;
create policy "redemptions_admin_write" on public.coupon_redemptions
  for insert with check (public.is_app_admin());
