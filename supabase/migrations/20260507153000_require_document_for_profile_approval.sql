do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_approval_requires_document_check'
  ) then
    alter table public.profiles
    add constraint profiles_approval_requires_document_check
    check (
      profile_approval_status <> 'approved'
      or user_document_path is not null
    ) not valid;
  end if;
end $$;
