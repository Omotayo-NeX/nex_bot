# Quick Fix for Dashboard Access Issue

## Problem
The dashboard shows "No transactions found" because of Row Level Security (RLS) permission errors on the Supabase tables.

## Solution
Run the following SQL in your Supabase SQL Editor to fix the permissions.

---

## Step-by-Step Instructions

### 1. Open Supabase SQL Editor
1. Go to https://app.supabase.com
2. Select your project: `gxthnrdeuhiykybpfrae`
3. Click on **SQL Editor** in the left sidebar
4. Click **New query**

### 2. Run This SQL

Copy and paste the following SQL and click **RUN**:

```sql
-- Disable Row Level Security on subscription tables
alter table nexai_subscriptions disable row level security;
alter table elevenone_subscriptions disable row level security;

-- Verify tables are accessible (should return 0 for both if empty)
select 'nexai_subscriptions' as table_name, count(*) as record_count
from nexai_subscriptions
union all
select 'elevenone_subscriptions' as table_name, count(*) as record_count
from elevenone_subscriptions;
```

### 3. Verify the Fix

After running the SQL:
1. The query should succeed without errors
2. You'll see a result showing both tables with 0 records (since no payments yet)
3. Refresh your dashboard at `localhost:3003/dashboard/subscriptions`
4. The dashboard should now load without errors

---

## What This Does

- **Disables RLS**: Since these are admin-only tables accessed via service role, RLS is not needed
- **Allows Access**: Your dashboard and webhook can now read/write to the tables
- **Secure**: Service role key is only used server-side, never exposed to clients

---

## Test the Fix

Run this command to verify the tables are accessible:

```bash
node scripts/test-supabase-tables.js
```

You should see:
```
✅ nexai_subscriptions: 0 records found
✅ elevenone_subscriptions: 0 records found
```

---

## Alternative: Copy from File

The same SQL is available in: `QUICK_FIX.sql`

Just copy its contents and run in Supabase SQL Editor.

---

## Need Help?

If you still see errors:
1. Check that you ran the migration: `supabase/migrations/create_subscription_tables.sql` first
2. Verify your `SUPABASE_SERVICE_ROLE_KEY` is correct in `.env`
3. Check Supabase logs for detailed error messages
