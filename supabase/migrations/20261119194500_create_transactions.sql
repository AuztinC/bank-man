alter table public.accounts
  add constraint accounts_id_user_id_key unique (id, user_id);

create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  account_id uuid not null,
  transaction_type text not null,
  amount_cents bigint not null,
  currency text not null default 'USD',
  transaction_date date not null,
  description text not null,
  notes text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint transactions_account_owner_fkey
    foreign key (account_id, user_id)
    references public.accounts (id, user_id)
    on delete restrict,
  constraint transactions_transaction_type_check
    check (transaction_type in ('income', 'expense')),
  constraint transactions_amount_cents_check
    check (
      amount_cents between -9007199254740991 and 9007199254740991
      and (
        (transaction_type = 'income' and amount_cents > 0)
        or (transaction_type = 'expense' and amount_cents < 0)
      )
    ),
  constraint transactions_currency_check
    check (currency = 'USD'),
  constraint transactions_description_check
    check (
      description = btrim(description)
      and description <> ''
      and char_length(description) <= 200
    ),
  constraint transactions_notes_check
    check (
      notes is null
      or (
        notes = btrim(notes)
        and notes <> ''
        and char_length(notes) <= 1000
      )
    )
);

create index transactions_user_id_idx
  on public.transactions (user_id);

create index transactions_account_owner_date_idx
  on public.transactions (account_id, user_id, transaction_date desc, id);

alter table public.transactions enable row level security;

revoke all on table public.transactions from anon;
grant select, insert, update, delete on table public.transactions to authenticated;

create policy "Users can view their own transactions"
on public.transactions
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can create their own transactions"
on public.transactions
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update their own transactions"
on public.transactions
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can delete their own transactions"
on public.transactions
for delete
to authenticated
using ((select auth.uid()) = user_id);
