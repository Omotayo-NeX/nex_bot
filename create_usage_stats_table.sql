-- SQL script to create the UsageStats table in Supabase
-- Run this in the Supabase SQL Editor

CREATE TABLE IF NOT EXISTS "UsageStats" (
    "id" SERIAL PRIMARY KEY,
    "user_id" UUID NOT NULL,
    "date" VARCHAR(10) NOT NULL, -- Format: YYYY-MM-DD
    "messages_used" INTEGER NOT NULL DEFAULT 0,
    "images_generated" INTEGER NOT NULL DEFAULT 0,
    "voice_minutes" INTEGER NOT NULL DEFAULT 0,
    "videos_generated" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UsageStats_user_id_date_key" UNIQUE ("user_id", "date"),
    CONSTRAINT "UsageStats_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS "idx_usage_stats_user_date" ON "UsageStats" ("user_id", "date");
CREATE INDEX IF NOT EXISTS "idx_usage_stats_date" ON "UsageStats" ("date");

-- Create trigger to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_usage_stats_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language plpgsql;

CREATE TRIGGER IF NOT EXISTS trigger_update_usage_stats_updated_at
    BEFORE UPDATE ON "UsageStats"
    FOR EACH ROW
    EXECUTE FUNCTION update_usage_stats_updated_at();

-- Verify table creation
SELECT 
    table_name, 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'UsageStats'
ORDER BY ordinal_position;