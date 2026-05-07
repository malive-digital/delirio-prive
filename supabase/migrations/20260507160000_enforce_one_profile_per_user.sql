do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_id_unique_per_user'
  ) then
    alter table public.profiles
    add constraint profiles_id_unique_per_user unique (id);
  end if;
end $$;
