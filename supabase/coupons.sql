-- Coupons + premium tracking extensions
-- Run AFTER supabase/auth_premium.sql

-- 1. Extend profiles with premium source + timestamps
alter table public.profiles
  add column if not exists premium_source   text,
  add column if not exists premium_granted_at timestamptz,
  add column if not exists premium_expires_at timestamptz;

-- 2. Coupons table
create table if not exists public.coupons (
  code              text primary key,
  active            boolean not null default true,
  max_redemptions   integer,             -- null = unlimited
  times_redeemed    integer not null default 0,
  grants_days       integer,             -- null = lifetime
  note              text,
  created_at        timestamptz not null default now()
);

-- 3. Redemption log
create table if not exists public.coupon_redemptions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  coupon_code text not null references public.coupons(code) on delete cascade,
  redeemed_at timestamptz not null default now(),
  unique (user_id, coupon_code)
);

-- 4. Seed master coupon (idempotent)
insert into public.coupons (code, active, grants_days, note)
values ('CELPIP2026', true, 365, 'Launch promo - 1 year premium')
on conflict (code) do nothing;

-- 5. Redemption RPC (SECURITY DEFINER so users can redeem against their own auth.uid)
create or replace function public.redeem_coupon(p_code text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_coupon public.coupons%rowtype;
  v_expires timestamptz;
begin
  if v_user is null then
    return jsonb_build_object('ok', false, 'error', 'not_authenticated');
  end if;

  select * into v_coupon from public.coupons where code = upper(trim(p_code));
  if not found then
    return jsonb_build_object('ok', false, 'error', 'invalid_code');
  end if;

  if not v_coupon.active then
    return jsonb_build_object('ok', false, 'error', 'inactive');
  end if;

  if v_coupon.max_redemptions is not null and v_coupon.times_redeemed >= v_coupon.max_redemptions then
    return jsonb_build_object('ok', false, 'error', 'exhausted');
  end if;

  if exists (select 1 from public.coupon_redemptions where user_id = v_user and coupon_code = v_coupon.code) then
    return jsonb_build_object('ok', false, 'error', 'already_redeemed');
  end if;

  if v_coupon.grants_days is not null then
    v_expires := now() + (v_coupon.grants_days || ' days')::interval;
  end if;

  insert into public.coupon_redemptions (user_id, coupon_code) values (v_user, v_coupon.code);
  update public.coupons set times_redeemed = times_redeemed + 1 where code = v_coupon.code;

  update public.profiles
    set is_premium         = true,
        premium_source     = 'coupon:' || v_coupon.code,
        premium_granted_at = now(),
        premium_expires_at = v_expires
  where id = v_user;

  return jsonb_build_object('ok', true, 'expires_at', v_expires);
end;
$$;

grant execute on function public.redeem_coupon(text) to authenticated;

-- 6. RLS for coupons tables
alter table public.coupons enable row level security;
alter table public.coupon_redemptions enable row level security;

-- Coupons: only admin can read/write
drop policy if exists "coupons_admin_all" on public.coupons;
create policy "coupons_admin_all" on public.coupons
  for all using (
    exists (select 1 from auth.users u where u.id = auth.uid() and u.email = 'sales@celpipace.com')
  );

-- Redemptions: user reads own; admin reads all
drop policy if exists "redemptions_self_read" on public.coupon_redemptions;
create policy "redemptions_self_read" on public.coupon_redemptions
  for select using (
    user_id = auth.uid()
    or exists (select 1 from auth.users u where u.id = auth.uid() and u.email = 'sales@celpipace.com')
  );

drop policy if exists "redemptions_admin_write" on public.coupon_redemptions;
create policy "redemptions_admin_write" on public.coupon_redemptions
  for insert with check (
    exists (select 1 from auth.users u where u.id = auth.uid() and u.email = 'sales@celpipace.com')
  );