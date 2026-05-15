create table if not exists public.profile_analytics (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  profile_views bigint not null default 0 check (profile_views >= 0),
  whatsapp_clicks bigint not null default 0 check (whatsapp_clicks >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profile_analytics enable row level security;

drop policy if exists "Users can read own profile analytics" on public.profile_analytics;
drop policy if exists "Admins can read profile analytics" on public.profile_analytics;

create policy "Users can read own profile analytics"
on public.profile_analytics
for select
to authenticated
using (profile_id = auth.uid());

create policy "Admins can read profile analytics"
on public.profile_analytics
for select
to authenticated
using (
  exists (
    select 1
    from public.user_roles
    where user_roles.user_id = auth.uid()
      and user_roles.role = 'admin'::public.app_role
  )
);

create or replace function public.increment_profile_view(target_profile_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if target_profile_id is null then
    return;
  end if;

  insert into public.profile_analytics (profile_id, profile_views, updated_at)
  select target_profile_id, 1, now()
  where exists (
    select 1
    from public.published_profiles
    where published_profiles.id = target_profile_id
  )
  on conflict (profile_id) do update
  set
    profile_views = public.profile_analytics.profile_views + 1,
    updated_at = now();
end;
$$;

create or replace function public.increment_whatsapp_click(target_profile_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if target_profile_id is null then
    return;
  end if;

  insert into public.profile_analytics (profile_id, whatsapp_clicks, updated_at)
  select target_profile_id, 1, now()
  where exists (
    select 1
    from public.published_profiles
    where published_profiles.id = target_profile_id
      and nullif(regexp_replace(coalesce(published_profiles.whatsapp, ''), '\D', '', 'g'), '') is not null
  )
  on conflict (profile_id) do update
  set
    whatsapp_clicks = public.profile_analytics.whatsapp_clicks + 1,
    updated_at = now();
end;
$$;

grant select on public.profile_analytics to authenticated;
grant execute on function public.increment_profile_view(uuid) to anon, authenticated;
grant execute on function public.increment_whatsapp_click(uuid) to anon, authenticated;
