-- ====================================================================
-- QUICK FIX: Run this SQL in your Supabase SQL Editor
-- ====================================================================
-- This fixes the permission issue with the subscription tables
-- by disabling Row Level Security (RLS)
-- ====================================================================

-- Disable Row Level Security on subscription tables
alter table nexai_subscriptions disable row level security;
alter table elevenone_subscriptions disable row level security;

-- Verify tables exist and show record count
select 'nexai_subscriptions' as table_name, count(*) as record_count
from nexai_subscriptions
union all
select 'elevenone_subscriptions' as table_name, count(*) as record_count
from elevenone_subscriptions;
