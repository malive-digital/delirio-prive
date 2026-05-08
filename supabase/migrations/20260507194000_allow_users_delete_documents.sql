drop policy if exists "Users can delete own documents" on storage.objects;

create policy "Users can delete own documents"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'user-documents'
  and (storage.foldername(name))[1] = auth.uid()::text
);
