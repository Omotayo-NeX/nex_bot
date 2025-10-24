-- Manual Migration for Expensa Tables
-- Run this in your Supabase SQL Editor

-- Create Expense table
CREATE TABLE IF NOT EXISTS "Expense" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "team_id" UUID,
    "project_name" TEXT,
    "category" TEXT NOT NULL,
    "amount" DECIMAL(12, 2) NOT NULL,
    "currency" TEXT DEFAULT 'NGN' NOT NULL,
    "description" TEXT,
    "receipt_url" TEXT,
    "merchant_name" TEXT,
    "expense_date" TIMESTAMPTZ NOT NULL,
    "status" TEXT DEFAULT 'pending' NOT NULL,
    "approved_by" UUID,
    "approved_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    "updated_at" TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes for Expense table
CREATE INDEX IF NOT EXISTS "Expense_user_id_created_at_idx" ON "Expense"("user_id", "created_at");
CREATE INDEX IF NOT EXISTS "Expense_status_idx" ON "Expense"("status");

-- Create Reimbursement table
CREATE TABLE IF NOT EXISTS "Reimbursement" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "expense_id" UUID UNIQUE NOT NULL REFERENCES "Expense"("id") ON DELETE CASCADE,
    "amount" DECIMAL(12, 2) NOT NULL,
    "recipient_email" TEXT,
    "recipient_bank" TEXT,
    "account_number" TEXT,
    "paystack_ref" TEXT,
    "status" TEXT DEFAULT 'pending' NOT NULL,
    "paid_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    "updated_at" TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create Budget table
CREATE TABLE IF NOT EXISTS "Budget" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "team_id" UUID,
    "project_name" TEXT,
    "category" TEXT,
    "limit_amount" DECIMAL(12, 2) NOT NULL,
    "spent_amount" DECIMAL(12, 2) DEFAULT 0 NOT NULL,
    "period" TEXT DEFAULT 'monthly' NOT NULL,
    "start_date" TIMESTAMPTZ NOT NULL,
    "end_date" TIMESTAMPTZ NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    "updated_at" TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create index for Budget table
CREATE INDEX IF NOT EXISTS "Budget_user_id_idx" ON "Budget"("user_id");

-- Optional: Create RLS policies (Row Level Security)
-- Enable RLS on tables
ALTER TABLE "Expense" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Reimbursement" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Budget" ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own expenses
CREATE POLICY "Users can view own expenses" ON "Expense"
    FOR SELECT
    USING (auth.uid() = user_id);

-- Allow users to insert their own expenses
CREATE POLICY "Users can insert own expenses" ON "Expense"
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own pending expenses
CREATE POLICY "Users can update own pending expenses" ON "Expense"
    FOR UPDATE
    USING (auth.uid() = user_id AND status = 'pending');

-- Allow users to delete their own pending expenses
CREATE POLICY "Users can delete own pending expenses" ON "Expense"
    FOR DELETE
    USING (auth.uid() = user_id AND status = 'pending');

-- Grant permissions
GRANT ALL ON "Expense" TO authenticated;
GRANT ALL ON "Reimbursement" TO authenticated;
GRANT ALL ON "Budget" TO authenticated;

-- Success message
SELECT 'Expensa tables created successfully!' as message;
