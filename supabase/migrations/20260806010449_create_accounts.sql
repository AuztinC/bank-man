create table public.accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  account_name text not null default 'New Account',
  account_type text not null,
  currency text not null default 'USD',
  opening_balance_cents bigint not null default 0,
  archived_at timestamp with time zone,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint accounts_account_type_check
    check (account_type in ('checking', 'savings', 'cash'))
);
