-- Create OrganizationProfile table
CREATE TABLE IF NOT EXISTS "OrganizationProfile" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL UNIQUE,
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
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrganizationProfile_pkey" PRIMARY KEY ("id")
);

-- Add foreign key constraint (if User table exists)
-- ALTER TABLE "OrganizationProfile" ADD CONSTRAINT "OrganizationProfile_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Create index
CREATE UNIQUE INDEX IF NOT EXISTS "OrganizationProfile_user_id_key" ON "OrganizationProfile"("user_id");
