alter table public.accounts enable row level security;

revoke all on table public.accounts from anon;
grant select, insert, update, delete on table public.accounts to authenticated;

create policy "Users can view their own accounts"
on public.accounts
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can create their own accounts"
on public.accounts
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update their own accounts"
on public.accounts
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can delete their own accounts"
on public.accounts
for delete
to authenticated
using ((select auth.uid()) = user_id);
