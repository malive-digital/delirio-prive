do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'subscriptions'
      and column_name = 'payment_method'
  ) then
    alter table public.subscriptions
    alter column payment_method set default 'manual_admin';
  end if;
end $$;
