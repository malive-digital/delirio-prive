alter table public.profiles
add column if not exists user_document_back_path text,
add column if not exists user_document_back_name text,
add column if not exists user_document_back_mime text;

update storage.buckets
set allowed_mime_types = array['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
where id = 'user-documents';
