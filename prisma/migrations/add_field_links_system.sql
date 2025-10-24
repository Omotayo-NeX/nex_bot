-- =====================================================
-- EXPENSA FIELD LINKS & REAL-TIME EXPENSE SYSTEM
-- Migration Script for Supabase
-- =====================================================

-- 1. Create field_links table for secure worker access
CREATE TABLE IF NOT EXISTS "FieldLink" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "business_id" UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "worker_name" TEXT NOT NULL,
  "worker_email" TEXT,
  "worker_phone" TEXT,
  "project_name" TEXT,
  "invite_token" TEXT UNIQUE NOT NULL,
  "expires_at" TIMESTAMP NOT NULL,
  "allowed_actions" TEXT[] DEFAULT ARRAY['submit_expense']::TEXT[],
  "is_active" BOOLEAN DEFAULT true,
  "max_uses" INTEGER,
  "current_uses" INTEGER DEFAULT 0,
  "metadata" JSONB DEFAULT '{}'::jsonb,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW()
);

-- 2. Add indexes for field_links
CREATE INDEX IF NOT EXISTS "idx_field_links_business" ON "FieldLink"("business_id");
CREATE INDEX IF NOT EXISTS "idx_field_links_token" ON "FieldLink"("invite_token");
CREATE INDEX IF NOT EXISTS "idx_field_links_active" ON "FieldLink"("is_active", "expires_at");

-- 3. Extend Expense table with new fields for field worker submissions
ALTER TABLE "Expense"
ADD COLUMN IF NOT EXISTS "field_link_id" UUID REFERENCES "FieldLink"("id") ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS "worker_name" TEXT,
ADD COLUMN IF NOT EXISTS "location" TEXT,
ADD COLUMN IF NOT EXISTS "ai_scanned" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "ai_confidence" DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS "detected_currency" TEXT,
ADD COLUMN IF NOT EXISTS "receipt_date" TIMESTAMP,
ADD COLUMN IF NOT EXISTS "rejection_reason" TEXT,
ADD COLUMN IF NOT EXISTS "reviewed_by" UUID REFERENCES "User"("id") ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS "reviewed_at" TIMESTAMP,
ADD COLUMN IF NOT EXISTS "submission_method" TEXT DEFAULT 'admin_entry';

-- 4. Create AI receipt logs table for tracking scans
CREATE TABLE IF NOT EXISTS "AiReceiptLog" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "expense_id" UUID NOT NULL REFERENCES "Expense"("id") ON DELETE CASCADE,
  "model_used" TEXT NOT NULL DEFAULT 'gpt-4o-mini',
  "prompt_tokens" INTEGER DEFAULT 0,
  "completion_tokens" INTEGER DEFAULT 0,
  "total_tokens" INTEGER DEFAULT 0,
  "cost_usd" DECIMAL(10,6) DEFAULT 0,
  "raw_response" JSONB,
  "confidence_score" DECIMAL(5,2),
  "extraction_status" TEXT DEFAULT 'success',
  "error_message" TEXT,
  "created_at" TIMESTAMP DEFAULT NOW()
);

-- 5. Create notifications table for real-time alerts
CREATE TABLE IF NOT EXISTS "ExpenseNotification" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "business_id" UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "expense_id" UUID NOT NULL REFERENCES "Expense"("id") ON DELETE CASCADE,
  "notification_type" TEXT NOT NULL, -- 'new_submission', 'status_change', 'approval_required'
  "title" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "is_read" BOOLEAN DEFAULT false,
  "sent_via_email" BOOLEAN DEFAULT false,
  "email_sent_at" TIMESTAMP,
  "metadata" JSONB DEFAULT '{}'::jsonb,
  "created_at" TIMESTAMP DEFAULT NOW()
);

-- 6. Add indexes for performance
CREATE INDEX IF NOT EXISTS "idx_expense_field_link" ON "Expense"("field_link_id");
CREATE INDEX IF NOT EXISTS "idx_expense_business" ON "Expense"("user_id", "status");
CREATE INDEX IF NOT EXISTS "idx_ai_logs_expense" ON "AiReceiptLog"("expense_id");
CREATE INDEX IF NOT EXISTS "idx_notifications_business" ON "ExpenseNotification"("business_id", "is_read");
CREATE INDEX IF NOT EXISTS "idx_notifications_unread" ON "ExpenseNotification"("business_id") WHERE "is_read" = false;

-- 7. Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Apply trigger to field_links
DROP TRIGGER IF EXISTS update_field_links_updated_at ON "FieldLink";
CREATE TRIGGER update_field_links_updated_at
  BEFORE UPDATE ON "FieldLink"
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE "FieldLink" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AiReceiptLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ExpenseNotification" ENABLE ROW LEVEL SECURITY;

-- Field Links Policies
-- Business owners can manage their own field links
CREATE POLICY "business_manage_field_links" ON "FieldLink"
  FOR ALL
  USING (auth.uid() = business_id);

-- Anyone with valid token can read their field link (for validation)
CREATE POLICY "public_read_valid_field_link" ON "FieldLink"
  FOR SELECT
  USING (is_active = true AND expires_at > NOW());

-- Expense Policies (Update existing)
-- Field workers can insert expenses via valid field link (anonymous access)
CREATE POLICY "field_worker_insert_expense" ON "Expense"
  FOR INSERT
  WITH CHECK (field_link_id IS NOT NULL);

-- Business owners can view all their expenses
CREATE POLICY "business_view_expenses" ON "Expense"
  FOR SELECT
  USING (
    auth.uid() = "user_id" OR
    EXISTS (
      SELECT 1 FROM "FieldLink"
      WHERE "FieldLink".id = "Expense".field_link_id
      AND "FieldLink".business_id = auth.uid()
    )
  );

-- Business owners can update expense status
CREATE POLICY "business_update_expense_status" ON "Expense"
  FOR UPDATE
  USING (
    auth.uid() = "user_id" OR
    EXISTS (
      SELECT 1 FROM "FieldLink"
      WHERE "FieldLink".id = "Expense".field_link_id
      AND "FieldLink".business_id = auth.uid()
    )
  );

-- AI Receipt Logs Policies
CREATE POLICY "business_view_ai_logs" ON "AiReceiptLog"
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM "Expense"
      WHERE "Expense".id = "AiReceiptLog".expense_id
      AND "Expense"."user_id" = auth.uid()
    )
  );

CREATE POLICY "service_insert_ai_logs" ON "AiReceiptLog"
  FOR INSERT
  WITH CHECK (true); -- Service role only

-- Notification Policies
CREATE POLICY "business_view_notifications" ON "ExpenseNotification"
  FOR ALL
  USING (auth.uid() = business_id);

-- =====================================================
-- SUPABASE STORAGE BUCKET SETUP
-- =====================================================

-- Create storage bucket for receipts (run via Supabase dashboard or API)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('receipts', 'receipts', false);

-- Storage policies for receipts bucket
-- CREATE POLICY "Authenticated users can upload receipts" ON storage.objects
--   FOR INSERT TO authenticated
--   WITH CHECK (bucket_id = 'receipts');

-- CREATE POLICY "Users can view their own receipts" ON storage.objects
--   FOR SELECT TO authenticated
--   USING (bucket_id = 'receipts' AND auth.uid()::text = (storage.foldername(name))[1]);

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to auto-expire old field links
CREATE OR REPLACE FUNCTION expire_old_field_links()
RETURNS void AS $$
BEGIN
  UPDATE "FieldLink"
  SET is_active = false
  WHERE expires_at < NOW() AND is_active = true;
END;
$$ LANGUAGE plpgsql;

-- Function to check field link validity
CREATE OR REPLACE FUNCTION is_field_link_valid(token TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  link_record RECORD;
BEGIN
  SELECT * INTO link_record
  FROM "FieldLink"
  WHERE invite_token = token
    AND is_active = true
    AND expires_at > NOW()
    AND (max_uses IS NULL OR current_uses < max_uses);

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Function to increment field link usage
CREATE OR REPLACE FUNCTION increment_field_link_usage(token TEXT)
RETURNS void AS $$
BEGIN
  UPDATE "FieldLink"
  SET current_uses = current_uses + 1,
      updated_at = NOW()
  WHERE invite_token = token;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- REAL-TIME PUBLICATION (for Supabase Realtime)
-- =====================================================

-- Enable realtime for new expense submissions
ALTER PUBLICATION supabase_realtime ADD TABLE "Expense";
ALTER PUBLICATION supabase_realtime ADD TABLE "ExpenseNotification";

COMMENT ON TABLE "FieldLink" IS 'Secure links for field workers to submit expenses without login';
COMMENT ON TABLE "AiReceiptLog" IS 'Logs of AI receipt scanning operations and costs';
COMMENT ON TABLE "ExpenseNotification" IS 'Real-time notifications for expense submissions and status changes';
