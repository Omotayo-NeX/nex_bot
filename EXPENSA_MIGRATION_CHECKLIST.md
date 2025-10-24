# 📋 Expensa Field System - Migration Checklist

## Pre-Migration

- [ ] **Backup your database**
  ```bash
  # Via Supabase Dashboard → Database → Backups → Create Backup
  ```

- [ ] **Review current Expensa data**
  ```sql
  SELECT COUNT(*) FROM "Expense";
  SELECT COUNT(*) FROM "User";
  ```

- [ ] **Check Prisma version**
  ```bash
  npx prisma --version
  # Should be 6.15.0 or higher
  ```

---

## Step 1: Database Migration

### Option A: Direct SQL Execution (Recommended)

1. [ ] Open Supabase Dashboard → SQL Editor

2. [ ] Copy contents of `prisma/migrations/add_field_links_system.sql`

3. [ ] Execute the script

4. [ ] Verify tables created:
   ```sql
   SELECT table_name
   FROM information_schema.tables
   WHERE table_schema = 'public'
   AND table_name IN ('FieldLink', 'AiReceiptLog', 'ExpenseNotification');
   ```
   **Expected result:** 3 rows

5. [ ] Check new columns in Expense:
   ```sql
   SELECT column_name, data_type
   FROM information_schema.columns
   WHERE table_name = 'Expense'
   AND column_name IN ('field_link_id', 'worker_name', 'ai_scanned', 'submission_method');
   ```
   **Expected result:** 4 rows minimum

### Option B: Prisma Migrate

1. [ ] Update `prisma/schema.prisma` (already done ✅)

2. [ ] Generate migration:
   ```bash
   npx prisma migrate dev --name add_field_links_system
   ```

3. [ ] Push to database:
   ```bash
   npx prisma db push
   ```

4. [ ] Generate Prisma client:
   ```bash
   npx prisma generate
   ```

---

## Step 2: Supabase Storage Setup

1. [ ] Navigate to **Supabase Dashboard → Storage**

2. [ ] Create bucket:
   - Name: `receipts`
   - Public: `true` (or configure RLS)
   - File size limit: `10MB`
   - Allowed MIME types: `image/*`

3. [ ] Configure RLS policies (if private bucket):
   ```sql
   -- Authenticated uploads
   CREATE POLICY "auth_upload_receipts"
   ON storage.objects FOR INSERT
   TO authenticated
   WITH CHECK (bucket_id = 'receipts');

   -- Public field worker uploads
   CREATE POLICY "public_upload_field_receipts"
   ON storage.objects FOR INSERT
   TO public
   WITH CHECK (
     bucket_id = 'receipts' AND
     (storage.foldername(name))[1] = 'field-submissions'
   );

   -- Users view own receipts
   CREATE POLICY "users_view_receipts"
   ON storage.objects FOR SELECT
   TO authenticated
   USING (bucket_id = 'receipts');
   ```

4. [ ] Test upload via API:
   ```bash
   curl -X POST http://localhost:3000/api/expensa/upload \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -F "receipt=@test-receipt.jpg"
   ```

---

## Step 3: Install Dependencies

1. [ ] Install jose:
   ```bash
   pnpm add jose
   ```

2. [ ] Verify installation:
   ```bash
   pnpm list jose
   # Should show: jose 6.1.0 or higher
   ```

3. [ ] Generate Prisma client:
   ```bash
   npx prisma generate
   ```

4. [ ] Verify TypeScript types:
   ```typescript
   // In any file, test import:
   import { FieldLink, AiReceiptLog } from '@prisma/client';
   // Should not show errors
   ```

---

## Step 4: Environment Variables

1. [ ] Add to `.env.local`:
   ```bash
   # Field Link Security (optional, uses AUTH_SECRET if not set)
   FIELD_LINK_SECRET="<generate-random-32-char-string>"

   # Site URL for link generation
   NEXT_PUBLIC_SITE_URL="http://localhost:3000"  # Update for prod
   ```

2. [ ] Generate a secure secret:
   ```bash
   # Option 1: OpenSSL
   openssl rand -base64 32

   # Option 2: Node.js
   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
   ```

3. [ ] Verify environment variables loaded:
   ```bash
   # In your Next.js app
   console.log('FIELD_LINK_SECRET:', process.env.FIELD_LINK_SECRET ? '✅ Set' : '❌ Missing');
   ```

---

## Step 5: Build & Test

1. [ ] Build the project:
   ```bash
   pnpm run build
   ```
   **Expected:** No TypeScript errors

2. [ ] Start development server:
   ```bash
   pnpm run dev
   ```

3. [ ] Test navigation:
   - [ ] Open http://localhost:3000/expensa
   - [ ] Open http://localhost:3000/expensa/field-links
   - **Expected:** Both pages load without errors

---

## Step 6: Functional Testing

### Test 1: Create Field Link

1. [ ] Login as business owner
2. [ ] Navigate to `/expensa/field-links`
3. [ ] Click **"Create Field Link"**
4. [ ] Fill form:
   - Worker Name: "Test Worker"
   - Project: "Test Project"
   - Expiry: 7 days
5. [ ] Click **"Create Link"**
6. [ ] **Expected:** Share modal appears with link
7. [ ] Copy the link URL

### Test 2: Validate Field Link

1. [ ] Open link in incognito/private browser
2. [ ] **Expected:** Form loads with worker name and project
3. [ ] Check console for errors
4. [ ] **Expected:** No errors

### Test 3: Submit Expense

1. [ ] Upload a test receipt image
2. [ ] Enter:
   - Amount: 5000
   - Category: Transport
   - Description: "Test submission"
3. [ ] Click **"Submit Expense"**
4. [ ] **Expected:** Success screen appears

### Test 4: Verify Submission

1. [ ] Login as business owner
2. [ ] Navigate to `/expensa`
3. [ ] **Expected:** New expense visible with:
   - Status: "Pending"
   - Worker name: "Test Worker"
   - Amount: 5000
   - Category: Transport

### Test 5: AI Scanning (Optional - requires OpenAI key)

1. [ ] In expense list, click **"Scan with AI"** (if available)
2. [ ] **Expected:** Expense updates with extracted data
3. [ ] Check database:
   ```sql
   SELECT * FROM "AiReceiptLog" ORDER BY created_at DESC LIMIT 1;
   ```
   **Expected:** 1 row with expense_id

### Test 6: Notifications

1. [ ] Check notifications:
   ```sql
   SELECT * FROM "ExpenseNotification" ORDER BY created_at DESC LIMIT 5;
   ```
   **Expected:** Notification created for test submission

2. [ ] Test notifications API:
   ```bash
   curl http://localhost:3000/api/expensa/notifications \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```
   **Expected:** JSON with notifications array

---

## Step 7: Verify Database Integrity

Run these queries to ensure everything is connected:

### Check Relations
```sql
-- Field links with expenses
SELECT
  fl.worker_name,
  fl.project_name,
  COUNT(e.id) as expense_count
FROM "FieldLink" fl
LEFT JOIN "Expense" e ON e.field_link_id = fl.id
GROUP BY fl.id;
```

### Check Indexes
```sql
SELECT
  tablename,
  indexname
FROM pg_indexes
WHERE tablename IN ('FieldLink', 'Expense', 'AiReceiptLog', 'ExpenseNotification');
```

### Check RLS Policies
```sql
SELECT
  schemaname,
  tablename,
  policyname
FROM pg_policies
WHERE tablename IN ('FieldLink', 'Expense', 'ExpenseNotification');
```

---

## Step 8: Production Deployment

### Pre-deployment
- [ ] All tests passed
- [ ] No console errors
- [ ] Database migration completed on production
- [ ] Storage bucket created on production
- [ ] Environment variables set on Vercel/hosting

### Update Production Env Vars
```bash
# On Vercel Dashboard → Project → Settings → Environment Variables
FIELD_LINK_SECRET="<production-secret>"
NEXT_PUBLIC_SITE_URL="https://yourdomain.com"
```

### Deploy
```bash
git add .
git commit -m "feat: add Expensa field worker system"
git push origin main
```

### Post-deployment Verification
- [ ] Test field link creation on production
- [ ] Test field worker submission on production
- [ ] Check production database for new records
- [ ] Monitor for errors in Vercel logs

---

## Rollback Plan (If Something Goes Wrong)

### Option 1: Revert Migration
```sql
-- Drop new tables
DROP TABLE IF EXISTS "ExpenseNotification";
DROP TABLE IF EXISTS "AiReceiptLog";
DROP TABLE IF EXISTS "FieldLink";

-- Remove new columns from Expense
ALTER TABLE "Expense"
  DROP COLUMN IF EXISTS field_link_id,
  DROP COLUMN IF EXISTS worker_name,
  DROP COLUMN IF EXISTS location,
  DROP COLUMN IF EXISTS ai_scanned,
  DROP COLUMN IF EXISTS ai_confidence,
  DROP COLUMN IF EXISTS detected_currency,
  DROP COLUMN IF EXISTS receipt_date,
  DROP COLUMN IF EXISTS rejection_reason,
  DROP COLUMN IF EXISTS reviewed_by,
  DROP COLUMN IF EXISTS reviewed_at,
  DROP COLUMN IF EXISTS submission_method;
```

### Option 2: Restore from Backup
1. Go to Supabase Dashboard → Database → Backups
2. Select backup from before migration
3. Click "Restore"

---

## Troubleshooting

### Issue: Migration fails with "relation already exists"
**Solution:** Table might be partially created. Check existing tables and drop manually before retrying.

### Issue: Prisma client outdated
**Solution:**
```bash
npx prisma generate --force
rm -rf node_modules/.prisma
pnpm install
```

### Issue: Field link token validation fails
**Solution:** Check that `FIELD_LINK_SECRET` matches between creation and validation environments.

### Issue: Storage upload returns 403
**Solution:** Check RLS policies and bucket public access settings.

### Issue: AI scan returns error
**Solution:** Verify `OPENAI_API_KEY` is set and has GPT-4o access.

---

## Success Criteria

Migration is successful when:

✅ All new tables exist in database
✅ All new columns added to Expense
✅ RLS policies created and active
✅ Storage bucket configured
✅ Dependencies installed
✅ No TypeScript errors
✅ Can create field link
✅ Can submit expense via field link
✅ Notification created in database
✅ Production deployment successful

---

## Support

If you encounter issues not covered here:

1. Check database logs in Supabase Dashboard
2. Review Next.js build output
3. Check browser console for errors
4. Test API endpoints with curl/Postman
5. Contact NeX Consulting Ltd support

---

**Migration completed on:** __________________

**Migrated by:** __________________

**Production URL:** __________________

**Test field link:** __________________
