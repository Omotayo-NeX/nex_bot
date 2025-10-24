# 🚨 Run This Migration NOW to Fix the Error

## The Error You're Seeing:
```
Failed to fetch profile
GET http://localhost:3000/api/expensa/profile
500 (Internal Server Error)
```

**Cause**: The `OrganizationProfile` table doesn't exist in the database yet.

---

## ✅ Quick Fix - Run This SQL in Supabase

### Step 1: Open Supabase SQL Editor
1. Go to your Supabase project
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"

### Step 2: Paste and Run This SQL
```sql
-- Create OrganizationProfile table
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

-- Create unique index on user_id
CREATE UNIQUE INDEX IF NOT EXISTS "OrganizationProfile_user_id_key"
ON "OrganizationProfile"("user_id");

-- Add foreign key constraint to User table
ALTER TABLE "OrganizationProfile"
ADD CONSTRAINT "OrganizationProfile_user_id_fkey"
FOREIGN KEY ("user_id")
REFERENCES "User"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

-- Create trigger for updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_organizationprofile_updated_at
BEFORE UPDATE ON "OrganizationProfile"
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

### Step 3: Click "Run" button in Supabase

### Step 4: Refresh your browser
The error will be gone! ✅

---

## What This Does:
1. Creates the `OrganizationProfile` table with all required fields
2. Links it to the `User` table with a foreign key
3. Creates a unique index to ensure one profile per user
4. Adds automatic timestamp updates

---

## After Migration:
- ✅ The console error will disappear
- ✅ Profile page will work correctly
- ✅ Onboarding modal will work for new users
- ✅ You can manage organization details and budget

---

## Verify It Worked:
Run this query in Supabase SQL Editor:
```sql
SELECT * FROM "OrganizationProfile";
```

You should see the table (empty at first, that's normal).

---

**Note**: The code has been updated to handle this gracefully, so even without the migration, you won't see the error anymore. But you NEED the migration to actually use the profile features!
