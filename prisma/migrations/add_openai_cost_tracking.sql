-- Create OpenAICost table for tracking OpenAI API usage and costs
-- Run this SQL in your Supabase SQL editor or pgAdmin

CREATE TABLE IF NOT EXISTS "OpenAICost" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "model" TEXT NOT NULL,
    "prompt_tokens" INTEGER NOT NULL DEFAULT 0,
    "completion_tokens" INTEGER NOT NULL DEFAULT 0,
    "total_tokens" INTEGER NOT NULL DEFAULT 0,
    "estimated_cost" DOUBLE PRECISION NOT NULL,
    "feature" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OpenAICost_pkey" PRIMARY KEY ("id")
);

-- Create index for efficient queries by user and date
CREATE INDEX IF NOT EXISTS "OpenAICost_user_id_created_at_idx" ON "OpenAICost"("user_id", "created_at");

-- Optional: Add comment for documentation
COMMENT ON TABLE "OpenAICost" IS 'Tracks OpenAI API usage and estimated costs per user';
COMMENT ON COLUMN "OpenAICost"."feature" IS 'Feature type: chat, image, or voice';
COMMENT ON COLUMN "OpenAICost"."estimated_cost" IS 'Estimated cost in USD';
