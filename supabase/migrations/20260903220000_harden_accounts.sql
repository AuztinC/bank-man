alter table public.accounts
  add constraint accounts_account_name_check
    check (
      account_name = btrim(account_name)
      and account_name <> ''
    ),
  add constraint accounts_currency_check
    check (currency = 'USD');

create index accounts_user_id_idx
  on public.accounts (user_id);
