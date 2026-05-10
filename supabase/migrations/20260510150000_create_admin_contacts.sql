create extension if not exists pgcrypto;

create table if not exists public.admin_contacts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  phone_normalized text not null,
  sale_closed boolean not null default false,
  admin_user_id uuid references auth.users(id) on delete set null,
  admin_name text not null,
  admin_email text,
  sale_closed_at timestamptz,
  sale_closed_by_admin_user_id uuid references auth.users(id) on delete set null,
  sale_closed_by_admin_name text,
  sale_closed_by_admin_email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.admin_contacts
add column if not exists phone_normalized text;

update public.admin_contacts
set phone_normalized = regexp_replace(phone, '\D', '', 'g')
where phone_normalized is null;

alter table public.admin_contacts
alter column phone_normalized set not null;

alter table public.admin_contacts
add column if not exists sale_closed_at timestamptz,
add column if not exists sale_closed_by_admin_user_id uuid references auth.users(id) on delete set null,
add column if not exists sale_closed_by_admin_name text,
add column if not exists sale_closed_by_admin_email text;

update public.admin_contacts
set
  sale_closed_at = coalesce(sale_closed_at, updated_at, created_at),
  sale_closed_by_admin_user_id = coalesce(sale_closed_by_admin_user_id, admin_user_id),
  sale_closed_by_admin_name = coalesce(sale_closed_by_admin_name, admin_name),
  sale_closed_by_admin_email = coalesce(sale_closed_by_admin_email, admin_email)
where sale_closed = true;

alter table public.admin_contacts enable row level security;

drop policy if exists "Admins can manage contacts" on public.admin_contacts;

create policy "Admins can manage contacts"
on public.admin_contacts
for all
to authenticated
using (
  exists (
    select 1
    from public.user_roles
    where user_roles.user_id = auth.uid()
      and user_roles.role = 'admin'::public.app_role
  )
  or exists (
    select 1
    from public.admin_users
    where admin_users.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.user_roles
    where user_roles.user_id = auth.uid()
      and user_roles.role = 'admin'::public.app_role
  )
  or exists (
    select 1
    from public.admin_users
    where admin_users.user_id = auth.uid()
  )
);

create index if not exists admin_contacts_created_at_idx
on public.admin_contacts (created_at desc);

create index if not exists admin_contacts_sale_closed_idx
on public.admin_contacts (sale_closed);

create unique index if not exists admin_contacts_phone_normalized_key
on public.admin_contacts (phone_normalized);
