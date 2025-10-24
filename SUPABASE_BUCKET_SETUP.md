# 📸 Supabase Storage Bucket Setup Guide

## Creating the "receipts" Bucket

Follow these steps to create the storage bucket for receipt uploads:

### **Step 1: Access Supabase Dashboard**

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Sign in with your account
3. Select your project (the one connected to your NeX AI app)

---

### **Step 2: Navigate to Storage**

1. In the left sidebar, click **"Storage"**
2. You'll see the Storage interface with a list of buckets

---

### **Step 3: Create New Bucket**

1. Click the **"New bucket"** button (usually in the top right)
2. Fill in the bucket details:
   - **Name:** `receipts` (must be exactly this name)
   - **Public bucket:** Toggle **ON** ✅
     - This allows users to view their uploaded receipts via public URLs
   - **File size limit:** 5 MB (recommended)
   - **Allowed MIME types:** Leave as default or specify:
     - `image/jpeg`
     - `image/jpg`
     - `image/png`
     - `image/webp`

3. Click **"Create bucket"**

---

### **Step 4: Configure Bucket Policies (Optional but Recommended)**

For better security, set up Row Level Security (RLS) policies:

1. Click on the **"receipts"** bucket
2. Go to **"Policies"** tab
3. Click **"New Policy"**

**Policy 1: Allow Authenticated Users to Upload**
```sql
-- Policy Name: Allow authenticated uploads
-- Operation: INSERT
-- Target Roles: authenticated

CREATE POLICY "Allow authenticated users to upload receipts"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'receipts'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

**Policy 2: Allow Users to Read Their Own Files**
```sql
-- Policy Name: Allow users to read own receipts
-- Operation: SELECT
-- Target Roles: authenticated, anon (for public viewing)

CREATE POLICY "Allow users to read own receipts"
ON storage.objects FOR SELECT
TO authenticated, anon
USING (
  bucket_id = 'receipts'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

**Policy 3: Allow Users to Delete Their Own Files**
```sql
-- Policy Name: Allow users to delete own receipts
-- Operation: DELETE
-- Target Roles: authenticated

CREATE POLICY "Allow users to delete own receipts"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'receipts'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

---

### **Step 5: Verify Bucket Creation**

1. Go back to **Storage** main page
2. You should see the **"receipts"** bucket listed
3. The **Public** indicator should show **"Public"** ✅

---

### **Step 6: Test Upload (Optional)**

You can test the bucket by manually uploading a test image:

1. Click on the **"receipts"** bucket
2. Click **"Upload file"**
3. Select any test image
4. Once uploaded, click on the file
5. Copy the **Public URL**
6. Paste the URL in a browser - the image should display

---

## 🔐 **Security Notes**

### **Why Make It Public?**

Making the bucket public allows users to view their receipt images via direct URLs without authentication. The folder structure (`userId/filename.jpg`) ensures users can only access receipts in their own folders.

### **Alternative: Private Bucket with Signed URLs**

If you prefer a private bucket:

1. Create bucket as **Private** (toggle OFF)
2. Update the upload API to generate signed URLs:

```typescript
// In /app/api/expensa/upload/route.ts
const { data: signedUrlData } = await supabase.storage
  .from('receipts')
  .createSignedUrl(fileName, 3600); // 1 hour expiry

receiptUrl = signedUrlData.signedUrl;
```

---

## 🚨 **Troubleshooting**

### **Issue: "Bucket not found" error**
**Solution:** Ensure the bucket name is exactly `receipts` (lowercase, no spaces)

### **Issue: Upload fails with "Permission denied"**
**Solution:**
- Verify bucket is set to **Public**
- Check RLS policies are correctly configured
- Ensure user is authenticated

### **Issue: Can't view uploaded image**
**Solution:**
- Verify bucket is **Public**
- Check the URL format: `https://[project-ref].supabase.co/storage/v1/object/public/receipts/[userId]/[filename]`

---

## ✅ **Success Checklist**

- [ ] Created "receipts" bucket in Supabase
- [ ] Set bucket to Public
- [ ] Configured file size limit (5 MB recommended)
- [ ] (Optional) Set up RLS policies
- [ ] Tested manual upload
- [ ] Verified public URL works

---

## 🎯 **Next Steps**

Once the bucket is created, the Expensa upload functionality will work automatically. No code changes needed!

---

*Last Updated: 2025-10-22*
