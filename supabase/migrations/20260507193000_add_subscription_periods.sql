alter table public.subscriptions
add column if not exists current_period_start timestamptz not null default now(),
add column if not exists current_period_end timestamptz;

update public.subscriptions
set current_period_end = coalesce(created_at, now()) + interval '30 days'
where current_period_end is null
  and lower(coalesce(status, '')) in ('active', 'paid', 'approved', 'current');

create index if not exists subscriptions_current_period_end_idx
on public.subscriptions (current_period_end);
