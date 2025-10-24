-- ⚠️ RUN THIS IN SUPABASE SQL EDITOR NOW! ⚠️
-- This will fix the "Please enter a URL" error and persistence issue

-- Step 1: Create the OrganizationProfile table
CREATE TABLE IF NOT EXISTS "OrganizationProfile" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "organization_name" TEXT NOT NULL,
    "website" TEXT,
    "phone_number" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "representative_name" TEXT NOT NULL,
    "business_email" TEXT NOT NULL,
    "monthly_budget" DECIMAL(12, 2) NOT NULL DEFAULT 100000,
    "currency" TEXT NOT NULL DEFAULT 'NGN',
    "onboarding_completed" BOOLEAN NOT NULL DEFAULT FALSE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrganizationProfile_pkey" PRIMARY KEY ("id")
);

-- Step 2: Create unique index on user_id
CREATE UNIQUE INDEX IF NOT EXISTS "OrganizationProfile_user_id_key"
ON "OrganizationProfile"("user_id");

-- Step 3: Add foreign key constraint
ALTER TABLE "OrganizationProfile"
DROP CONSTRAINT IF EXISTS "OrganizationProfile_user_id_fkey";

ALTER TABLE "OrganizationProfile"
ADD CONSTRAINT "OrganizationProfile_user_id_fkey"
FOREIGN KEY ("user_id")
REFERENCES "User"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

-- Step 4: Create function for auto-updating timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Step 5: Create trigger
DROP TRIGGER IF EXISTS update_organizationprofile_updated_at ON "OrganizationProfile";

CREATE TRIGGER update_organizationprofile_updated_at
BEFORE UPDATE ON "OrganizationProfile"
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Done! Now refresh your browser and the onboarding will work correctly ✅
