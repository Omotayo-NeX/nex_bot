-- CreateTable: Income
-- This migration adds the Income table for tracking income/revenue in Expensa

CREATE TABLE IF NOT EXISTS "Income" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "source" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'NGN',
    "description" TEXT,
    "receipt_url" TEXT,
    "income_date" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'received',
    "project_name" TEXT,
    "client_name" TEXT,
    "invoice_number" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Income_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Income_user_id_created_at_idx" ON "Income"("user_id", "created_at");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Income_status_idx" ON "Income"("status");

-- AddForeignKey
ALTER TABLE "Income" ADD CONSTRAINT "Income_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
