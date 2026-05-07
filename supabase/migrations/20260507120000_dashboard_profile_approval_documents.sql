do $$
begin
  if not exists (select 1 from pg_type where typname = 'app_role') then
    create type public.app_role as enum ('admin', 'model');
  end if;
end
$$;

alter table public.profiles
add column if not exists profile_approval_status text not null default 'pending'
  check (profile_approval_status in ('pending', 'approved', 'rejected')),
add column if not exists user_document_path text,
add column if not exists user_document_name text,
add column if not exists user_document_mime text,
add column if not exists document_uploaded_at timestamptz,
add column if not exists reviewed_at timestamptz,
add column if not exists reviewed_by uuid references auth.users(id);

alter table public.profiles enable row level security;

drop policy if exists "Public can read approved profiles" on public.profiles;
drop policy if exists "Users can read own profile" on public.profiles;
drop policy if exists "Users can insert own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Admins can manage profiles" on public.profiles;

create policy "Public can read approved profiles"
on public.profiles
for select
using (profile_approval_status = 'approved');

create policy "Users can read own profile"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

create policy "Users can insert own profile"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

create policy "Users can update own profile"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "Admins can manage profiles"
on public.profiles
for all
to authenticated
using (
  exists (
    select 1
    from public.user_roles
    where user_roles.user_id = auth.uid()
      and user_roles.role = 'admin'::public.app_role
  )
)
with check (
  exists (
    select 1
    from public.user_roles
    where user_roles.user_id = auth.uid()
      and user_roles.role = 'admin'::public.app_role
  )
);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('user-documents', 'user-documents', false, 10485760, array['application/pdf'])
on conflict (id) do update
set
  public = false,
  file_size_limit = 10485760,
  allowed_mime_types = array['application/pdf'];

drop policy if exists "Users can upload own documents" on storage.objects;
drop policy if exists "Users can read own documents" on storage.objects;
drop policy if exists "Users can update own documents" on storage.objects;
drop policy if exists "Admins can read user documents" on storage.objects;

create policy "Users can upload own documents"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'user-documents'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users can read own documents"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'user-documents'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users can update own documents"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'user-documents'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'user-documents'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Admins can read user documents"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'user-documents'
  and exists (
    select 1
    from public.user_roles
    where user_roles.user_id = auth.uid()
      and user_roles.role = 'admin'::public.app_role
  )
);
