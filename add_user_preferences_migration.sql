-- SQL script to add user preferences fields to the User table
-- Run this in the Supabase SQL Editor

-- Add preferred_model column with default value
ALTER TABLE "User" 
ADD COLUMN IF NOT EXISTS "preferred_model" VARCHAR(50) NOT NULL DEFAULT 'gpt-4o-mini';

-- Add preferred_temperature column with default value
ALTER TABLE "User" 
ADD COLUMN IF NOT EXISTS "preferred_temperature" DECIMAL(3,2) NOT NULL DEFAULT 0.7;

-- Add check constraint to ensure temperature is between 0 and 1
ALTER TABLE "User" 
ADD CONSTRAINT IF NOT EXISTS "temperature_range_check" 
CHECK ("preferred_temperature" >= 0 AND "preferred_temperature" <= 1);

-- Create index for performance on preferred_model queries
CREATE INDEX IF NOT EXISTS "idx_user_preferred_model" ON "User" ("preferred_model");

-- Verify the new columns were added
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'User' 
  AND column_name IN ('preferred_model', 'preferred_temperature')
ORDER BY ordinal_position;