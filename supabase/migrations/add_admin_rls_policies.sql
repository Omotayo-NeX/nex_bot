-- ====================================================================
-- Add Row Level Security (RLS) Policies for Admin-Only Access
-- ====================================================================
-- This ensures only the admin email can access subscription data
-- Run this in Supabase SQL Editor after disabling RLS
-- ====================================================================

-- First, enable RLS on both tables
alter table nexai_subscriptions enable row level security;
alter table elevenone_subscriptions enable row level security;

-- Drop any existing policies (if they exist)
drop policy if exists "Admin read access on nexai_subscriptions" on nexai_subscriptions;
drop policy if exists "Admin write access on nexai_subscriptions" on nexai_subscriptions;
drop policy if exists "Admin read access on elevenone_subscriptions" on elevenone_subscriptions;
drop policy if exists "Admin write access on elevenone_subscriptions" on elevenone_subscriptions;

-- Create read-only policy for admin on nexai_subscriptions
create policy "Admin read access on nexai_subscriptions"
  on nexai_subscriptions
  for select
  using (
    auth.jwt() ->> 'email' = 'adetolaodunubi@gmail.com'
  );

-- Create insert policy for webhook (service role) on nexai_subscriptions
create policy "Service role insert access on nexai_subscriptions"
  on nexai_subscriptions
  for insert
  with check (true);

-- Create update policy for webhook (service role) on nexai_subscriptions
create policy "Service role update access on nexai_subscriptions"
  on nexai_subscriptions
  for update
  using (true)
  with check (true);

-- Create read-only policy for admin on elevenone_subscriptions
create policy "Admin read access on elevenone_subscriptions"
  on elevenone_subscriptions
  for select
  using (
    auth.jwt() ->> 'email' = 'adetolaodunubi@gmail.com'
  );

-- Create insert policy for webhook (service role) on elevenone_subscriptions
create policy "Service role insert access on elevenone_subscriptions"
  on elevenone_subscriptions
  for insert
  with check (true);

-- Create update policy for webhook (service role) on elevenone_subscriptions
create policy "Service role update access on elevenone_subscriptions"
  on elevenone_subscriptions
  for update
  using (true)
  with check (true);

-- Verify policies were created
select schemaname, tablename, policyname, permissive, roles, cmd, qual
from pg_policies
where tablename in ('nexai_subscriptions', 'elevenone_subscriptions')
order by tablename, policyname;
