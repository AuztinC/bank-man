begin;

create extension if not exists pgtap with schema extensions;

select plan(25);

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

select * from finish();

rollback;
