begin;

create extension if not exists pgtap with schema extensions;

select plan(1);

select has_table(
  'public',
  'accounts',
  'public.accounts should exist'
);

select * from finish();

rollback;
