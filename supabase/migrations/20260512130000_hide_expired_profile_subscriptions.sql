create or replace function public.profile_has_active_subscription(target_profile_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.subscriptions
    where (subscriptions.profile_id = target_profile_id or subscriptions.user_id = target_profile_id)
      and lower(coalesce(subscriptions.status, '')) in ('active', 'paid', 'approved', 'current')
      and (
        subscriptions.current_period_end is null
        or subscriptions.current_period_end >= now()
      )
  );
$$;

create or replace function public.profile_can_be_published(target_profile_id uuid, target_created_at timestamptz)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.profile_has_active_subscription(target_profile_id)
    or target_created_at >= now() - interval '7 days';
$$;

create or replace function public.sync_expired_profile_publication(target_profile_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if target_profile_id is null then
    return;
  end if;

  update public.profiles
  set
    is_online = false,
    updated_at = now()
  where profiles.id = target_profile_id
    and profiles.is_online is true
    and profiles.profile_approval_status = 'approved'
    and not public.profile_can_be_published(profiles.id, profiles.created_at);
end;
$$;

create or replace function public.sync_subscription_profile_publication()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.sync_expired_profile_publication(coalesce(new.profile_id, new.user_id));
  return new;
end;
$$;

drop trigger if exists sync_subscription_profile_publication_on_change on public.subscriptions;

create trigger sync_subscription_profile_publication_on_change
after insert or update of status, current_period_end, profile_id, user_id on public.subscriptions
for each row
execute function public.sync_subscription_profile_publication();

update public.profiles
set
  is_online = false,
  updated_at = now()
where profiles.is_online is true
  and profiles.profile_approval_status = 'approved'
  and not public.profile_can_be_published(profiles.id, profiles.created_at);

create or replace view public.published_profiles as
select
  id,
  type,
  name,
  whatsapp,
  location,
  state_uf,
  headline,
  age,
  neighborhood,
  price_15,
  price_30,
  price_60,
  overnight_price,
  serves,
  has_place,
  availability,
  payment_methods,
  services,
  specialties,
  restrictions,
  appearance,
  languages,
  description,
  active_plan,
  is_online,
  profile_verified,
  created_at,
  updated_at
from public.profiles
where profile_approval_status = 'approved'
  and public.profile_can_be_published(id, created_at);

grant execute on function public.profile_has_active_subscription(uuid) to anon, authenticated;
grant execute on function public.profile_can_be_published(uuid, timestamptz) to anon, authenticated;
grant execute on function public.sync_expired_profile_publication(uuid) to authenticated;
grant select on public.published_profiles to anon, authenticated;
