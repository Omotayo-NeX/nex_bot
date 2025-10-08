-- ====================================================================
-- ADMIN AUTHENTICATION SETUP
-- ====================================================================
-- Run this SQL in your Supabase SQL Editor to enable admin-only access
-- ====================================================================

-- Step 1: Enable Row Level Security
alter table nexai_subscriptions enable row level security;
alter table elevenone_subscriptions enable row level security;

-- Step 2: Create policies for admin read access
create policy "Admin read access on nexai_subscriptions"
  on nexai_subscriptions
  for select
  using (
    auth.jwt() ->> 'email' = 'adetolaodunubi@gmail.com'
  );

create policy "Admin read access on elevenone_subscriptions"
  on elevenone_subscriptions
  for select
  using (
    auth.jwt() ->> 'email' = 'adetolaodunubi@gmail.com'
  );

-- Step 3: Create policies for service role (webhook) to insert/update
create policy "Service role write access on nexai_subscriptions"
  on nexai_subscriptions
  for all
  using (true)
  with check (true);

create policy "Service role write access on elevenone_subscriptions"
  on elevenone_subscriptions
  for all
  using (true)
  with check (true);

-- Verification query (optional - shows all policies)
select tablename, policyname, cmd
from pg_policies
where tablename in ('nexai_subscriptions', 'elevenone_subscriptions')
order by tablename;
