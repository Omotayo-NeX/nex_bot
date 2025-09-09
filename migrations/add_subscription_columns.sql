-- Add subscription plan and usage tracking columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS plan text DEFAULT 'Free';
ALTER TABLE users ADD COLUMN IF NOT EXISTS chat_used_today int DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS videos_generated_this_week int DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS voice_minutes_this_week int DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS plan_expires_at timestamp;
ALTER TABLE users ADD COLUMN IF NOT EXISTS paystack_customer_id text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_reset_date timestamp DEFAULT now();

-- Create index for efficient queries
CREATE INDEX IF NOT EXISTS idx_users_plan ON users(plan);
CREATE INDEX IF NOT EXISTS idx_users_last_reset ON users(last_reset_date);