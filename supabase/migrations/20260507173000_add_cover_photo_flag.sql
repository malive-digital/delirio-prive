alter table public.profile_media
add column if not exists is_cover boolean not null default false;

create index if not exists profile_media_cover_idx
on public.profile_media (profile_id, is_cover, approval_status);
