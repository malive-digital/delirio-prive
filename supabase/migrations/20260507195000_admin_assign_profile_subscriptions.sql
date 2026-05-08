alter table public.subscriptions
add column if not exists user_id uuid references auth.users(id) on delete cascade,
add column if not exists profile_id uuid references public.profiles(id) on delete cascade,
add column if not exists plan text,
add column if not exists plan_key text,
add column if not exists status text not null default 'active',
add column if not exists current_period_start timestamptz not null default now(),
add column if not exists current_period_end timestamptz;

create index if not exists subscriptions_user_id_idx
on public.subscriptions (user_id);

create index if not exists subscriptions_profile_id_idx
on public.subscriptions (profile_id);

drop policy if exists "Admins can manage subscriptions" on public.subscriptions;

create policy "Admins can manage subscriptions"
on public.subscriptions
for all
to authenticated
using (
  exists (
    select 1
    from public.user_roles
    where user_roles.user_id = auth.uid()
      and user_roles.role = 'admin'
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
      and user_roles.role = 'admin'
  )
  or exists (
    select 1
    from public.admin_users
    where admin_users.user_id = auth.uid()
  )
);
