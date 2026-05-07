create table if not exists public.profile_media (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  file_name text,
  media_type text not null default 'photo' check (media_type in ('photo', 'video')),
  mime_type text,
  storage_path text not null,
  public_url text,
  approval_status text not null default 'pending' check (approval_status in ('pending', 'approved', 'rejected')),
  sort_order integer not null default 0,
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profile_media_profile_id_idx on public.profile_media(profile_id);
create index if not exists profile_media_approval_status_idx on public.profile_media(approval_status);

alter table public.profile_media enable row level security;

drop policy if exists "Public can read approved profile media" on public.profile_media;
drop policy if exists "Users can read own profile media" on public.profile_media;
drop policy if exists "Users can insert own profile media" on public.profile_media;
drop policy if exists "Users can update own pending profile media" on public.profile_media;
drop policy if exists "Admins can manage profile media" on public.profile_media;

create policy "Public can read approved profile media"
on public.profile_media
for select
using (approval_status = 'approved');

create policy "Users can read own profile media"
on public.profile_media
for select
to authenticated
using (user_id = auth.uid());

create policy "Users can insert own profile media"
on public.profile_media
for insert
to authenticated
with check (user_id = auth.uid() and profile_id = auth.uid());

create policy "Users can update own pending profile media"
on public.profile_media
for update
to authenticated
using (user_id = auth.uid() and approval_status = 'pending')
with check (user_id = auth.uid() and profile_id = auth.uid());

create policy "Admins can manage profile media"
on public.profile_media
for all
to authenticated
using (
  exists (
    select 1
    from public.user_roles
    where user_roles.user_id = auth.uid()
      and user_roles.role = 'admin'
  )
)
with check (
  exists (
    select 1
    from public.user_roles
    where user_roles.user_id = auth.uid()
      and user_roles.role = 'admin'
  )
);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'profile-media',
  'profile-media',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Users can upload own profile media" on storage.objects;
drop policy if exists "Users can update own profile media files" on storage.objects;
drop policy if exists "Users can read own profile media files" on storage.objects;
drop policy if exists "Admins can manage profile media files" on storage.objects;

create policy "Users can upload own profile media"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'profile-media'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users can update own profile media files"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'profile-media'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'profile-media'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users can read own profile media files"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'profile-media'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Admins can manage profile media files"
on storage.objects
for all
to authenticated
using (
  bucket_id = 'profile-media'
  and exists (
    select 1
    from public.user_roles
    where user_roles.user_id = auth.uid()
      and user_roles.role = 'admin'
  )
)
with check (
  bucket_id = 'profile-media'
  and exists (
    select 1
    from public.user_roles
    where user_roles.user_id = auth.uid()
      and user_roles.role = 'admin'
  )
);
