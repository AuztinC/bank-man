alter table public.accounts
  add column opening_balance_as_of date;

update public.accounts
set opening_balance_as_of = created_at::date
where opening_balance_as_of is null;

alter table public.accounts
  alter column opening_balance_as_of set not null;
