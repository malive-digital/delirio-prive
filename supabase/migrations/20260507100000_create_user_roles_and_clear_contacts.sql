do $$
begin
  if not exists (select 1 from pg_type where typname = 'app_role') then
    create type public.app_role as enum ('admin', 'model');
  end if;
end
$$;

create table if not exists public.user_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role public.app_role not null default 'model',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  role public.app_role not null default 'admin',
  created_at timestamptz not null default now()
);

alter table public.admin_users
add column if not exists role public.app_role not null default 'admin';

alter table public.user_roles enable row level security;

drop policy if exists "Users can read own role" on public.user_roles;

create policy "Users can read own role"
on public.user_roles
for select
to authenticated
using (auth.uid() = user_id);

insert into public.user_roles (user_id, role, created_at, updated_at)
select user_id, 'admin'::public.app_role, created_at, now()
from public.admin_users
on conflict (user_id) do update
set
  role = 'admin'::public.app_role,
  updated_at = now();

update public.admin_users
set role = 'admin'::public.app_role
where role is distinct from 'admin'::public.app_role;

update public.profiles
set
  whatsapp = null,
  updated_at = now()
where whatsapp is not null;

comment on table public.user_roles is
  'Application roles for authenticated users. Set role=admin here to grant /admin access.';
