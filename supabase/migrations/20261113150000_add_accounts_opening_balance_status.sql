alter table public.accounts
  add column opening_balance_status text not null default 'unverified',
  add constraint accounts_opening_balance_status_check
    check (opening_balance_status in ('unverified', 'verified', 'disputed')),
  add constraint accounts_account_name_length_check
    check (char_length(account_name) <= 100);
