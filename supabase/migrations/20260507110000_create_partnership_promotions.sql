create extension if not exists pgcrypto;

create table if not exists public.partnership_promotions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  partner_name text not null,
  description text not null,
  promotion_label text,
  image_url text not null,
  link_url text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.partnership_promotions enable row level security;

drop policy if exists "Public can read active partnerships" on public.partnership_promotions;
drop policy if exists "Admins can manage partnerships" on public.partnership_promotions;

create policy "Public can read active partnerships"
on public.partnership_promotions
for select
using (
  is_active = true
  and (starts_at is null or starts_at <= now())
  and (ends_at is null or ends_at >= now())
);

create policy "Admins can manage partnerships"
on public.partnership_promotions
for all
to authenticated
using (
  exists (
    select 1
    from public.user_roles
    where user_roles.user_id = auth.uid()
      and user_roles.role = 'admin'::public.app_role
  )
)
with check (
  exists (
    select 1
    from public.user_roles
    where user_roles.user_id = auth.uid()
      and user_roles.role = 'admin'::public.app_role
  )
);
