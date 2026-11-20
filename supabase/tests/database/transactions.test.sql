begin;

create extension if not exists pgtap with schema extensions;

select plan(75);

create schema transaction_tests;

create function transaction_tests.create_user(user_id uuid, user_email text)
returns void
language sql
set search_path = ''
as $$
  insert into auth.users (id, email)
  values (user_id, user_email);
$$;

create function transaction_tests.authenticate_as(user_id uuid)
returns void
language sql
set search_path = ''
as $$
  select set_config(
    'request.jwt.claims',
    json_build_object(
      'sub', user_id,
      'role', 'authenticated'
    )::text,
    true
  );
$$;

create function transaction_tests.authenticate_as_anon()
returns void
language sql
set search_path = ''
as $$
  select set_config(
    'request.jwt.claims',
    json_build_object('role', 'anon')::text,
    true
  );
$$;

select transaction_tests.create_user(
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'transaction-owner-a@example.test'
);
select transaction_tests.create_user(
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  'transaction-owner-b@example.test'
);

insert into public.accounts (
  id,
  user_id,
  account_name,
  account_type,
  opening_balance_as_of
)
values
  (
    'aaaaaaaa-0000-0000-0000-000000000001',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'User A Checking',
    'checking',
    '2026-11-19'
  ),
  (
    'bbbbbbbb-0000-0000-0000-000000000001',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'User B Checking',
    'checking',
    '2026-11-19'
  );

select has_table(
  'public',
  'transactions',
  'public.transactions should exist'
);

select columns_are(
  'public',
  'transactions',
  ARRAY[
    'id',
    'user_id',
    'account_id',
    'transaction_type',
    'amount_cents',
    'currency',
    'transaction_date',
    'description',
    'notes',
    'created_at',
    'updated_at'
  ],
  'transactions should have exactly the expected columns'
);

select col_type_is('public', 'transactions', 'id', 'uuid', 'transactions.id should be uuid');
select col_is_pk('public', 'transactions', 'id', 'transactions.id should be the primary key');
select col_has_default('public', 'transactions', 'id', 'transactions.id should have a generated default');

select col_type_is('public', 'transactions', 'user_id', 'uuid', 'transactions.user_id should be uuid');
select col_not_null('public', 'transactions', 'user_id', 'transactions.user_id should be required');
select fk_ok(
  'public',
  'transactions',
  'user_id',
  'auth',
  'users',
  'id',
  'transactions.user_id should reference auth.users.id'
);

select col_type_is('public', 'transactions', 'account_id', 'uuid', 'transactions.account_id should be uuid');
select col_not_null('public', 'transactions', 'account_id', 'transactions.account_id should be required');
select fk_ok(
  'public',
  'transactions',
  ARRAY['account_id', 'user_id'],
  'public',
  'accounts',
  ARRAY['id', 'user_id'],
  'transactions should reference an account owned by the same user'
);

select col_type_is('public', 'transactions', 'transaction_type', 'text', 'transactions.transaction_type should be text');
select col_not_null('public', 'transactions', 'transaction_type', 'transactions.transaction_type should be required');
select col_has_check('public', 'transactions', 'transaction_type', 'transactions should constrain transaction types');

select col_type_is('public', 'transactions', 'amount_cents', 'bigint', 'transactions.amount_cents should be bigint');
select col_not_null('public', 'transactions', 'amount_cents', 'transactions.amount_cents should be required');
select ok(
  exists (
    select 1
    from pg_catalog.pg_constraint
    where conrelid = 'public.transactions'::regclass
      and conname = 'transactions_amount_cents_check'
      and contype = 'c'
  ),
  'transactions should constrain monetary amounts and their signs'
);

select col_type_is('public', 'transactions', 'currency', 'text', 'transactions.currency should be text');
select col_not_null('public', 'transactions', 'currency', 'transactions.currency should be required');
select col_default_is('public', 'transactions', 'currency', 'USD', 'transactions.currency should default to USD');
select col_has_check('public', 'transactions', 'currency', 'transactions should constrain currency values');

select col_type_is('public', 'transactions', 'transaction_date', 'date', 'transactions.transaction_date should be date');
select col_not_null('public', 'transactions', 'transaction_date', 'transactions.transaction_date should be required');

select col_type_is('public', 'transactions', 'description', 'text', 'transactions.description should be text');
select col_not_null('public', 'transactions', 'description', 'transactions.description should be required');
select col_has_check('public', 'transactions', 'description', 'transactions should constrain descriptions');

select col_type_is('public', 'transactions', 'notes', 'text', 'transactions.notes should be text');
select col_has_check('public', 'transactions', 'notes', 'transactions should constrain notes');

select col_type_is('public', 'transactions', 'created_at', 'timestamp with time zone', 'transactions.created_at should be a timestamp with time zone');
select col_not_null('public', 'transactions', 'created_at', 'transactions.created_at should be required');
select col_has_default('public', 'transactions', 'created_at', 'transactions.created_at should have a default');

select col_type_is('public', 'transactions', 'updated_at', 'timestamp with time zone', 'transactions.updated_at should be a timestamp with time zone');
select col_not_null('public', 'transactions', 'updated_at', 'transactions.updated_at should be required');
select col_has_default('public', 'transactions', 'updated_at', 'transactions.updated_at should have a default');

select has_index('public', 'transactions', 'transactions_user_id_idx', ARRAY['user_id'], 'transactions.user_id should be indexed');
select has_index(
  'public',
  'transactions',
  'transactions_account_owner_date_idx',
  ARRAY['account_id', 'user_id', 'transaction_date', 'id'],
  'transactions should support account history queries and the composite foreign key'
);

select is(
  (
    select relrowsecurity
    from pg_catalog.pg_class
    where oid = 'public.transactions'::regclass
  ),
  true,
  'transactions should have row level security enabled'
);

select results_eq(
  $$
    select policyname
    from pg_catalog.pg_policies
    where schemaname = 'public'
      and tablename = 'transactions'
    order by policyname
  $$,
  $$
    values
      ('Users can create their own transactions'::name),
      ('Users can delete their own transactions'::name),
      ('Users can update their own transactions'::name),
      ('Users can view their own transactions'::name)
  $$,
  'transactions should have one explicit policy per operation'
);

select ok(
  not has_table_privilege('anon', 'public.transactions', 'select'),
  'anon should not have select privileges on transactions'
);
select ok(
  not has_table_privilege('anon', 'public.transactions', 'insert'),
  'anon should not have insert privileges on transactions'
);
select ok(
  has_table_privilege('authenticated', 'public.transactions', 'select')
    and has_table_privilege('authenticated', 'public.transactions', 'insert')
    and has_table_privilege('authenticated', 'public.transactions', 'update')
    and has_table_privilege('authenticated', 'public.transactions', 'delete'),
  'authenticated should have transaction CRUD privileges'
);

select lives_ok(
  $$
    insert into public.transactions (
      user_id,
      account_id,
      transaction_type,
      amount_cents,
      transaction_date,
      description
    )
    values (
      'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      'aaaaaaaa-0000-0000-0000-000000000001',
      'income',
      125000,
      '2026-11-19',
      'Monthly payroll'
    )
  $$,
  'transactions should accept income with a positive amount'
);
select lives_ok(
  $$
    insert into public.transactions (
      user_id,
      account_id,
      transaction_type,
      amount_cents,
      transaction_date,
      description,
      notes
    )
    values (
      'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      'aaaaaaaa-0000-0000-0000-000000000001',
      'expense',
      -4250,
      '2026-11-19',
      'Grocery Market',
      'Weekly groceries'
    )
  $$,
  'transactions should accept expenses with negative amounts'
);

select throws_ok(
  $$ insert into public.transactions (user_id, account_id, transaction_type, amount_cents, transaction_date, description)
     values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'aaaaaaaa-0000-0000-0000-000000000001', 'income', 0, '2026-11-19', 'Zero') $$,
  '23514', null, 'transactions should reject zero amounts'
);
select throws_ok(
  $$ insert into public.transactions (user_id, account_id, transaction_type, amount_cents, transaction_date, description)
     values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'aaaaaaaa-0000-0000-0000-000000000001', 'income', -100, '2026-11-19', 'Wrong sign') $$,
  '23514', null, 'transactions should reject negative income'
);
select throws_ok(
  $$ insert into public.transactions (user_id, account_id, transaction_type, amount_cents, transaction_date, description)
     values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'aaaaaaaa-0000-0000-0000-000000000001', 'expense', 100, '2026-11-19', 'Wrong sign') $$,
  '23514', null, 'transactions should reject positive expenses'
);
select throws_ok(
  $$ insert into public.transactions (user_id, account_id, transaction_type, amount_cents, transaction_date, description)
     values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'aaaaaaaa-0000-0000-0000-000000000001', 'income', 9007199254740992, '2026-11-19', 'Unsafe amount') $$,
  '23514', null, 'transactions should reject amounts above the safe integer range'
);
select throws_ok(
  $$ insert into public.transactions (user_id, account_id, transaction_type, amount_cents, transaction_date, description)
     values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'aaaaaaaa-0000-0000-0000-000000000001', 'expense', -9007199254740992, '2026-11-19', 'Unsafe amount') $$,
  '23514', null, 'transactions should reject amounts below the safe integer range'
);
select throws_ok(
  $$ insert into public.transactions (user_id, account_id, transaction_type, amount_cents, transaction_date, description)
     values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'aaaaaaaa-0000-0000-0000-000000000001', 'transfer', 100, '2026-11-19', 'Transfer') $$,
  '23514', null, 'transactions should reject unsupported transaction types'
);
select throws_ok(
  $$ insert into public.transactions (user_id, account_id, transaction_type, amount_cents, currency, transaction_date, description)
     values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'aaaaaaaa-0000-0000-0000-000000000001', 'income', 100, 'EUR', '2026-11-19', 'Foreign currency') $$,
  '23514', null, 'transactions should reject non-USD currency values'
);

select throws_ok(
  $$ insert into public.transactions (user_id, account_id, transaction_type, amount_cents, transaction_date, description)
     values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'aaaaaaaa-0000-0000-0000-000000000001', 'expense', -100, '2026-11-19', '') $$,
  '23514', null, 'transactions should reject empty descriptions'
);
select throws_ok(
  $$ insert into public.transactions (user_id, account_id, transaction_type, amount_cents, transaction_date, description)
     values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'aaaaaaaa-0000-0000-0000-000000000001', 'expense', -100, '2026-11-19', '   ') $$,
  '23514', null, 'transactions should reject whitespace-only descriptions'
);
select throws_ok(
  $$ insert into public.transactions (user_id, account_id, transaction_type, amount_cents, transaction_date, description)
     values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'aaaaaaaa-0000-0000-0000-000000000001', 'expense', -100, '2026-11-19', ' Padded ') $$,
  '23514', null, 'transactions should reject whitespace-padded descriptions'
);
select throws_ok(
  $$ insert into public.transactions (user_id, account_id, transaction_type, amount_cents, transaction_date, description)
     values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'aaaaaaaa-0000-0000-0000-000000000001', 'expense', -100, '2026-11-19', repeat('a', 201)) $$,
  '23514', null, 'transactions should reject descriptions longer than 200 characters'
);
select throws_ok(
  $$ insert into public.transactions (user_id, account_id, transaction_type, amount_cents, transaction_date, description, notes)
     values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'aaaaaaaa-0000-0000-0000-000000000001', 'expense', -100, '2026-11-19', 'Notes test', '   ') $$,
  '23514', null, 'transactions should reject whitespace-only notes'
);
select throws_ok(
  $$ insert into public.transactions (user_id, account_id, transaction_type, amount_cents, transaction_date, description, notes)
     values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'aaaaaaaa-0000-0000-0000-000000000001', 'expense', -100, '2026-11-19', 'Notes test', repeat('a', 1001)) $$,
  '23514', null, 'transactions should reject notes longer than 1000 characters'
);
select throws_ok(
  $$ insert into public.transactions (user_id, account_id, transaction_type, amount_cents, transaction_date, description)
     values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'bbbbbbbb-0000-0000-0000-000000000001', 'expense', -100, '2026-11-19', 'Wrong owner') $$,
  '23503', null, 'transactions should reject an account owned by another user'
);

select throws_ok(
  $$ delete from public.accounts where id = 'aaaaaaaa-0000-0000-0000-000000000001' $$,
  '23503',
  null,
  'accounts with transactions should not be deleted'
);

insert into public.transactions (
  id,
  user_id,
  account_id,
  transaction_type,
  amount_cents,
  transaction_date,
  description
)
values (
  'bbbbbbbb-1000-0000-0000-000000000001',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  'bbbbbbbb-0000-0000-0000-000000000001',
  'income',
  50000,
  '2026-11-19',
  'User B Income'
);

select transaction_tests.authenticate_as_anon();
set local role anon;

select throws_ok($$ select * from public.transactions $$, '42501', null, 'anon should not read transactions');
select throws_ok(
  $$ insert into public.transactions (user_id, account_id, transaction_type, amount_cents, transaction_date, description)
     values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'aaaaaaaa-0000-0000-0000-000000000001', 'income', 100, '2026-11-19', 'Anonymous') $$,
  '42501', null, 'anon should not create transactions'
);
select throws_ok($$ update public.transactions set description = description $$, '42501', null, 'anon should not update transactions');
select throws_ok($$ delete from public.transactions $$, '42501', null, 'anon should not delete transactions');

reset role;
select transaction_tests.authenticate_as('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa');
set local role authenticated;

select is((select count(*) from public.transactions), 2::bigint, 'user A should see only their two transactions');
select is(
  (select description from public.transactions where transaction_type = 'income' limit 1),
  'Monthly payroll',
  'user A should read their own transaction'
);
select is_empty(
  $$ select description from public.transactions where id = 'bbbbbbbb-1000-0000-0000-000000000001' $$,
  'user A should not read user B transactions'
);
select results_eq(
  $$
    insert into public.transactions (user_id, account_id, transaction_type, amount_cents, transaction_date, description)
    values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'aaaaaaaa-0000-0000-0000-000000000001', 'expense', -2500, '2026-11-19', 'User A Expense')
    returning description
  $$,
  array['User A Expense'],
  'user A should create their own transaction'
);
select throws_ok(
  $$
    insert into public.transactions (user_id, account_id, transaction_type, amount_cents, transaction_date, description)
    values ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'bbbbbbbb-0000-0000-0000-000000000001', 'expense', -2500, '2026-11-19', 'Transaction for B')
  $$,
  '42501', null, 'user A should not create a transaction for user B'
);
select throws_ok(
  $$
    insert into public.transactions (user_id, account_id, transaction_type, amount_cents, transaction_date, description)
    values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'bbbbbbbb-0000-0000-0000-000000000001', 'expense', -2500, '2026-11-19', 'Wrong account')
  $$,
  '23503', null, 'user A should not attach a transaction to user B account'
);
select results_eq(
  $$
    update public.transactions
    set description = 'Updated by User A'
    where description = 'User A Expense'
    returning description
  $$,
  array['Updated by User A'],
  'user A should update their own transaction'
);
select throws_ok(
  $$
    update public.transactions
    set user_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
    where description = 'Updated by User A'
  $$,
  '42501', null, 'user A should not change transaction ownership'
);
select is_empty(
  $$
    update public.transactions
    set description = 'Changed by User A'
    where id = 'bbbbbbbb-1000-0000-0000-000000000001'
    returning description
  $$,
  'user A should not update user B transactions'
);
select is_empty(
  $$
    delete from public.transactions
    where id = 'bbbbbbbb-1000-0000-0000-000000000001'
    returning description
  $$,
  'user A should not delete user B transactions'
);
select results_eq(
  $$
    delete from public.transactions
    where description = 'Updated by User A'
    returning description
  $$,
  array['Updated by User A'],
  'user A should delete their own transaction'
);

reset role;

select is(
  (select description from public.transactions where id = 'bbbbbbbb-1000-0000-0000-000000000001'),
  'User B Income',
  'user A should not update user B transactions'
);
select is(
  (select count(*) from public.transactions where id = 'bbbbbbbb-1000-0000-0000-000000000001'),
  1::bigint,
  'user A should not delete user B transactions'
);

select * from finish();
rollback;
