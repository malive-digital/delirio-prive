drop policy if exists "Users can delete own profile media" on public.profile_media;

create policy "Users can delete own profile media"
on public.profile_media
for delete
to authenticated
using (user_id = auth.uid() and profile_id = auth.uid());

drop policy if exists "Users can delete own profile media files" on storage.objects;

create policy "Users can delete own profile media files"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'profile-media'
  and (storage.foldername(name))[1] = auth.uid()::text
);
