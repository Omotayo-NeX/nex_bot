-- Add subscription plan and usage columns to User table
-- This migration adds the columns needed for the subscription system

DO $$ 
BEGIN
    -- Add plan column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'User' AND column_name = 'plan') THEN
        ALTER TABLE "User" ADD COLUMN "plan" TEXT NOT NULL DEFAULT 'Free';
    END IF;
    
    -- Add chat_used_today column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'User' AND column_name = 'chat_used_today') THEN
        ALTER TABLE "User" ADD COLUMN "chat_used_today" INTEGER NOT NULL DEFAULT 0;
    END IF;
    
    -- Add videos_generated_this_week column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'User' AND column_name = 'videos_generated_this_week') THEN
        ALTER TABLE "User" ADD COLUMN "videos_generated_this_week" INTEGER NOT NULL DEFAULT 0;
    END IF;
    
    -- Add voice_minutes_this_week column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'User' AND column_name = 'voice_minutes_this_week') THEN
        ALTER TABLE "User" ADD COLUMN "voice_minutes_this_week" INTEGER NOT NULL DEFAULT 0;
    END IF;
    
    -- Add plan_expires_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'User' AND column_name = 'plan_expires_at') THEN
        ALTER TABLE "User" ADD COLUMN "plan_expires_at" TIMESTAMP(3);
    END IF;
    
    -- Add paystack_customer_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'User' AND column_name = 'paystack_customer_id') THEN
        ALTER TABLE "User" ADD COLUMN "paystack_customer_id" TEXT;
    END IF;
    
    -- Add last_reset_date column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'User' AND column_name = 'last_reset_date') THEN
        ALTER TABLE "User" ADD COLUMN "last_reset_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    END IF;
END $$;

-- Update any existing users to have the Free plan if they don't have one set
UPDATE "User" SET "plan" = 'Free' WHERE "plan" IS NULL;

-- Create an index on plan for faster queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS "User_plan_idx" ON "User" ("plan");