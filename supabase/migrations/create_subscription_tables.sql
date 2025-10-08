-- Create table for NeX AI subscriptions
create table if not exists nexai_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_email text,
  user_id text,
  plan text,
  amount numeric,
  status text,
  reference text unique,
  transaction_id text,
  paystack_customer_code text,
  metadata jsonb,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- Create table for ElevenOne subscriptions
create table if not exists elevenone_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_email text,
  user_id text,
  plan text,
  amount numeric,
  status text,
  reference text unique,
  transaction_id text,
  paystack_customer_code text,
  metadata jsonb,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- Create indexes for better query performance
create index if not exists idx_nexai_user_email on nexai_subscriptions(user_email);
create index if not exists idx_nexai_reference on nexai_subscriptions(reference);
create index if not exists idx_nexai_created_at on nexai_subscriptions(created_at desc);
create index if not exists idx_nexai_status on nexai_subscriptions(status);

create index if not exists idx_elevenone_user_email on elevenone_subscriptions(user_email);
create index if not exists idx_elevenone_reference on elevenone_subscriptions(reference);
create index if not exists idx_elevenone_created_at on elevenone_subscriptions(created_at desc);
create index if not exists idx_elevenone_status on elevenone_subscriptions(status);

-- Disable Row Level Security (RLS) for admin-only tables
-- These tables are accessed only by the service role via webhooks and admin dashboard
-- No user-facing queries, so RLS is not needed
alter table nexai_subscriptions disable row level security;
alter table elevenone_subscriptions disable row level security;

-- Add trigger to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_nexai_subscriptions_updated_at
  before update on nexai_subscriptions
  for each row
  execute function update_updated_at_column();

create trigger update_elevenone_subscriptions_updated_at
  before update on elevenone_subscriptions
  for each row
  execute function update_updated_at_column();
