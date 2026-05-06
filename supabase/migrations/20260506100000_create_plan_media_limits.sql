create table if not exists public.plan_media_limits (
  plan_key text primary key,
  display_name text not null,
  max_photos integer not null check (max_photos >= 0),
  max_videos integer not null check (max_videos >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.plan_media_limits (plan_key, display_name, max_photos, max_videos)
values
  ('basico', 'Basico', 5, 0),
  ('premium', 'Premium', 10, 1),
  ('top_prive', 'Top Prive', 15, 2)
on conflict (plan_key) do update
set
  display_name = excluded.display_name,
  max_photos = excluded.max_photos,
  max_videos = excluded.max_videos,
  updated_at = now();

alter table public.plan_media_limits enable row level security;

drop policy if exists "Plan media limits are public" on public.plan_media_limits;

create policy "Plan media limits are public"
on public.plan_media_limits
for select
using (true);
