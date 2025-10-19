-- Create table for logging webhook forwarding attempts
-- Used by the NeXAI Paystack router to track HTTP forwarding to external apps

create table if not exists public.webhook_forward_logs (
  id bigserial primary key,
  created_at timestamptz not null default now(),
  app text not null,
  target_url text not null,
  ok boolean not null,
  status_code int,
  attempt_count int default 1,
  error_message text,
  reference text
);

-- Create indexes for better query performance
create index if not exists idx_webhook_forward_logs_created_at
  on public.webhook_forward_logs(created_at desc);

create index if not exists idx_webhook_forward_logs_app
  on public.webhook_forward_logs(app);

create index if not exists idx_webhook_forward_logs_reference
  on public.webhook_forward_logs(reference);

create index if not exists idx_webhook_forward_logs_ok
  on public.webhook_forward_logs(ok);

-- Disable Row Level Security (RLS) for admin-only table
-- This table is accessed only by the service role via webhook handler
alter table public.webhook_forward_logs disable row level security;

-- Add helpful comment
comment on table public.webhook_forward_logs is
  'Logs all webhook forwarding attempts from NeXAI router to external apps';

comment on column public.webhook_forward_logs.app is
  'Target app identifier (e.g., elevenone)';

comment on column public.webhook_forward_logs.target_url is
  'Full URL where webhook was forwarded';

comment on column public.webhook_forward_logs.ok is
  'Whether forwarding was successful (true) or failed (false)';

comment on column public.webhook_forward_logs.status_code is
  'HTTP status code from forwarding response (null if network error)';

comment on column public.webhook_forward_logs.attempt_count is
  'Number of retry attempts made before success/failure';

comment on column public.webhook_forward_logs.error_message is
  'Error details if forwarding failed';

comment on column public.webhook_forward_logs.reference is
  'Paystack transaction reference for correlation';
