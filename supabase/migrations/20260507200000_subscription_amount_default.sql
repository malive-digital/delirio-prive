do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'subscriptions'
      and column_name = 'amount'
  ) then
    alter table public.subscriptions
    alter column amount set default 0;
  end if;
end $$;
