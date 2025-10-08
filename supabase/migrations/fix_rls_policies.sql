-- Fix Row Level Security policies for subscription tables
-- This disables RLS to allow service role full access
-- Since these are internal admin tables accessed only by the service role, this is safe

-- Disable Row Level Security on both tables
alter table nexai_subscriptions disable row level security;
alter table elevenone_subscriptions disable row level security;
