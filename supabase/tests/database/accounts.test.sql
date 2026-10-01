begin;

create extension if not exists pgtap with schema extensions;

select plan(66);

create schema tests;

create function tests.create_user(user_id uuid, user_email text)
returns void
language sql
set search_path = ''
as $$
  insert into auth.users (id, email)
  values (user_id, user_email);
$$;

create function tests.authenticate_as(user_id uuid)
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

create function tests.authenticate_as_anon()
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

insert into auth.users (id, email)
values (
  '11111111-1111-1111-1111-111111111111',
  'account-types@example.test'
);

select tests.create_user(
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'account-owner-a@example.test'
);
select tests.create_user(
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  'account-owner-b@example.test'
);

select has_table(
  'public',
  'accounts',
  'public.accounts should exist'
);

select columns_are(
  'public',
  'accounts',
  ARRAY[
    'id',
    'user_id',
    'account_name',
    'account_type',
    'currency',
    'opening_balance_cents',
    'archived_at',
    'created_at',
    'updated_at'
  ],
  'accounts should have exactly the expected columns'
);

select col_type_is('public', 'accounts', 'id', 'uuid', 'accounts.id should be uuid');
select col_is_pk('public', 'accounts', 'id', 'accounts.id should be the primary key');
select col_has_default(
  'public',
  'accounts',
  'id',
  'accounts.id should have a generated default'
);

select col_type_is(
  'public',
  'accounts',
  'user_id',
  'uuid',
  'accounts.user_id should be uuid'
);
select col_not_null(
  'public',
  'accounts',
  'user_id',
  'accounts.user_id should be required'
);
select fk_ok(
  'public',
  'accounts',
  'user_id',
  'auth',
  'users',
  'id',
  'accounts.user_id should reference auth.users.id'
);
select has_index(
  'public',
  'accounts',
  'accounts_user_id_idx',
  ARRAY['user_id'],
  'accounts.user_id should be indexed'
);

select is(
  (
    select relrowsecurity
    from pg_catalog.pg_class
    where oid = 'public.accounts'::regclass
  ),
  true,
  'accounts should have row level security enabled'
);

select results_eq(
  $$
    select policyname
    from pg_catalog.pg_policies
    where schemaname = 'public'
      and tablename = 'accounts'
    order by policyname
  $$,
  $$
    values
      ('Users can create their own accounts'::name),
      ('Users can delete their own accounts'::name),
      ('Users can update their own accounts'::name),
      ('Users can view their own accounts'::name)
  $$,
  'accounts should have one explicit policy per operation'
);

select ok(
  not has_table_privilege('anon', 'public.accounts', 'select'),
  'anon should not have select privileges on accounts'
);
select ok(
  not has_table_privilege('anon', 'public.accounts', 'insert'),
  'anon should not have insert privileges on accounts'
);
select ok(
  has_table_privilege('authenticated', 'public.accounts', 'select')
    and has_table_privilege('authenticated', 'public.accounts', 'insert')
    and has_table_privilege('authenticated', 'public.accounts', 'update')
    and has_table_privilege('authenticated', 'public.accounts', 'delete'),
  'authenticated should have account CRUD privileges'
);

select col_type_is(
  'public',
  'accounts',
  'account_name',
  'text',
  'accounts.account_name should be text'
);
select col_not_null(
  'public',
  'accounts',
  'account_name',
  'accounts.account_name should be required'
);
select col_has_check(
  'public',
  'accounts',
  'account_name',
  'accounts should constrain account names'
);

select col_type_is(
  'public',
  'accounts',
  'account_type',
  'text',
  'accounts.account_type should be text'
);
select col_not_null(
  'public',
  'accounts',
  'account_type',
  'accounts.account_type should be required'
);

select col_type_is(
  'public',
  'accounts',
  'currency',
  'text',
  'accounts.currency should be text'
);
select col_not_null(
  'public',
  'accounts',
  'currency',
  'accounts.currency should be required'
);
select col_default_is(
  'public',
  'accounts',
  'currency',
  'USD',
  'accounts.currency should default to USD'
);
select col_has_check(
  'public',
  'accounts',
  'currency',
  'accounts should constrain currency values'
);

select col_type_is(
  'public',
  'accounts',
  'opening_balance_cents',
  'bigint',
  'accounts.opening_balance_cents should be bigint'
);
select col_not_null(
  'public',
  'accounts',
  'opening_balance_cents',
  'accounts.opening_balance_cents should be required'
);
select col_default_is(
  'public',
  'accounts',
  'opening_balance_cents',
  '0',
  'accounts.opening_balance_cents should default to zero'
);

select col_type_is(
  'public',
  'accounts',
  'archived_at',
  'timestamp with time zone',
  'accounts.archived_at should be a timestamp with time zone'
);

select col_type_is(
  'public',
  'accounts',
  'created_at',
  'timestamp with time zone',
  'accounts.created_at should be a timestamp with time zone'
);
select col_not_null(
  'public',
  'accounts',
  'created_at',
  'accounts.created_at should be required'
);
select col_has_default(
  'public',
  'accounts',
  'created_at',
  'accounts.created_at should have a default'
);

select col_type_is(
  'public',
  'accounts',
  'updated_at',
  'timestamp with time zone',
  'accounts.updated_at should be a timestamp with time zone'
);
select col_not_null(
  'public',
  'accounts',
  'updated_at',
  'accounts.updated_at should be required'
);
select col_has_default(
  'public',
  'accounts',
  'updated_at',
  'accounts.updated_at should have a default'
);

select lives_ok(
  $$
    insert into public.accounts (user_id, account_type)
    values ('11111111-1111-1111-1111-111111111111', 'checking')
  $$,
  'accounts should accept the checking account type'
);
select lives_ok(
  $$
    insert into public.accounts (user_id, account_type)
    values ('11111111-1111-1111-1111-111111111111', 'savings')
  $$,
  'accounts should accept the savings account type'
);
select lives_ok(
  $$
    insert into public.accounts (user_id, account_type)
    values ('11111111-1111-1111-1111-111111111111', 'cash')
  $$,
  'accounts should accept the cash account type'
);
select lives_ok(
  $$
    insert into public.accounts (
      user_id,
      account_name,
      account_type,
      currency
    )
    values (
      '11111111-1111-1111-1111-111111111111',
      'Everyday Checking',
      'checking',
      'USD'
    )
  $$,
  'accounts should accept a trimmed name and USD currency'
);

select throws_ok(
  $$
    insert into public.accounts (user_id, account_name, account_type)
    values ('11111111-1111-1111-1111-111111111111', '', 'checking')
  $$,
  '23514',
  null,
  'accounts should reject an empty account name'
);
select throws_ok(
  $$
    insert into public.accounts (user_id, account_name, account_type)
    values ('11111111-1111-1111-1111-111111111111', '   ', 'checking')
  $$,
  '23514',
  null,
  'accounts should reject a whitespace-only account name'
);
select throws_ok(
  $$
    insert into public.accounts (user_id, account_name, account_type)
    values ('11111111-1111-1111-1111-111111111111', ' Checking ', 'checking')
  $$,
  '23514',
  null,
  'accounts should reject a whitespace-padded account name'
);
select throws_ok(
  $$
    insert into public.accounts (user_id, account_type, currency)
    values ('11111111-1111-1111-1111-111111111111', 'checking', 'EUR')
  $$,
  '23514',
  null,
  'accounts should reject non-USD currency values'
);

select throws_ok(
  $$
    insert into public.accounts (user_id, account_type)
    values ('11111111-1111-1111-1111-111111111111', '')
  $$,
  '23514',
  null,
  'accounts should reject an empty account type'
);
select throws_ok(
  $$
    insert into public.accounts (user_id, account_type)
    values ('11111111-1111-1111-1111-111111111111', 'credit')
  $$,
  '23514',
  null,
  'accounts should reject credit until debt accounts are supported'
);
select throws_ok(
  $$
    insert into public.accounts (user_id, account_type)
    values ('11111111-1111-1111-1111-111111111111', 'investment')
  $$,
  '23514',
  null,
  'accounts should reject investment accounts outside the MVP'
);
select throws_ok(
  $$
    insert into public.accounts (user_id, account_type)
    values ('11111111-1111-1111-1111-111111111111', 'CHECKING')
  $$,
  '23514',
  null,
  'accounts should reject uppercase account types'
);
select throws_ok(
  $$
    insert into public.accounts (user_id, account_type)
    values ('11111111-1111-1111-1111-111111111111', ' checking ')
  $$,
  '23514',
  null,
  'accounts should reject whitespace-padded account types'
);

insert into public.accounts (
  id,
  user_id,
  account_name,
  account_type
)
values
  (
    'aaaaaaaa-0000-0000-0000-000000000001',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'User A Checking',
    'checking'
  ),
  (
    'bbbbbbbb-0000-0000-0000-000000000001',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'User B Checking',
    'checking'
  );

select tests.authenticate_as_anon();
set local role anon;

select throws_ok(
  $$ select * from public.accounts $$,
  '42501',
  null,
  'anon should not have permission to read accounts'
);
select throws_ok(
  $$
    insert into public.accounts (user_id, account_name, account_type)
    values (
      'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      'Anonymous Account',
      'checking'
    )
  $$,
  '42501',
  null,
  'anon should not be able to create accounts'
);
select throws_ok(
  $$ update public.accounts set account_name = account_name $$,
  '42501',
  null,
  'anon should not be able to update accounts'
);
select throws_ok(
  $$ delete from public.accounts $$,
  '42501',
  null,
  'anon should not be able to delete accounts'
);

reset role;
select tests.authenticate_as('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa');
set local role authenticated;

select is(
  (select count(*) from public.accounts),
  1::bigint,
  'an authenticated user should see only their own accounts'
);
select is(
  (
    select account_name
    from public.accounts
    where id = 'aaaaaaaa-0000-0000-0000-000000000001'
  ),
  'User A Checking',
  'an authenticated user should be able to read their own account'
);
select is_empty(
  $$
    select account_name
    from public.accounts
    where id = 'bbbbbbbb-0000-0000-0000-000000000001'
  $$,
  'an authenticated user should not read another user account'
);
select results_eq(
  $$
    insert into public.accounts (user_id, account_name, account_type)
    values (
      'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      'User A Savings',
      'savings'
    )
    returning account_name
  $$,
  array['User A Savings'],
  'an authenticated user should be able to create their own account'
);
select throws_ok(
  $$
    insert into public.accounts (user_id, account_name, account_type)
    values (
      'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
      'Account for User B',
      'checking'
    )
  $$,
  '42501',
  null,
  'an authenticated user should not create an account for another user'
);
select results_eq(
  $$
    update public.accounts
    set account_name = 'User A Daily Checking'
    where id = 'aaaaaaaa-0000-0000-0000-000000000001'
    returning account_name
  $$,
  array['User A Daily Checking'],
  'an authenticated user should be able to update their own account'
);
select throws_ok(
  $$
    update public.accounts
    set user_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
    where id = 'aaaaaaaa-0000-0000-0000-000000000001'
  $$,
  '42501',
  null,
  'an authenticated user should not change account ownership'
);
select is_empty(
  $$
    update public.accounts
    set account_name = 'Changed by User A'
    where id = 'bbbbbbbb-0000-0000-0000-000000000001'
    returning account_name
  $$,
  'an authenticated user update should not expose another user account'
);
select is_empty(
  $$
    delete from public.accounts
    where id = 'bbbbbbbb-0000-0000-0000-000000000001'
    returning account_name
  $$,
  'an authenticated user delete should not expose another user account'
);
select results_eq(
  $$
    delete from public.accounts
    where account_name = 'User A Savings'
    returning account_name
  $$,
  array['User A Savings'],
  'an authenticated user should be able to delete their own account'
);

reset role;

select is(
  (
    select account_name
    from public.accounts
    where id = 'aaaaaaaa-0000-0000-0000-000000000001'
  ),
  'User A Daily Checking',
  'an authenticated user update should persist for their own account'
);
select is(
  (
    select account_name
    from public.accounts
    where id = 'bbbbbbbb-0000-0000-0000-000000000001'
  ),
  'User B Checking',
  'an authenticated user should not update another user account'
);
select is(
  (
    select count(*)
    from public.accounts
    where id = 'bbbbbbbb-0000-0000-0000-000000000001'
  ),
  1::bigint,
  'an authenticated user should not delete another user account'
);
select is(
  (
    select user_id
    from public.accounts
    where id = 'aaaaaaaa-0000-0000-0000-000000000001'
  ),
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid,
  'account ownership should remain unchanged'
);

select tests.authenticate_as('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb');
set local role authenticated;

select is(
  (select count(*) from public.accounts),
  1::bigint,
  'switching identities should expose only the new user accounts'
);
select is(
  (
    select account_name
    from public.accounts
    where id = 'bbbbbbbb-0000-0000-0000-000000000001'
  ),
  'User B Checking',
  'User B should be able to read User B account'
);

reset role;

select * from finish();

rollback;
