create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

drop policy if exists "Admin users can read own role" on public.admin_users;

create policy "Admin users can read own role"
on public.admin_users
for select
to authenticated
using (auth.uid() = user_id);

comment on table public.admin_users is
  'Admin role registry. Create the Supabase Auth user first, then insert its auth.users.id here.';
