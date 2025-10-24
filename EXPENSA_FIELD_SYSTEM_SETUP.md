# 🚀 Expensa Real-Time Field Expense System - Setup Guide

## 📋 Overview

The Expensa Field System enables businesses to:
- ✅ Create secure, time-limited links for field workers
- ✅ Accept expense submissions without requiring worker login
- ✅ Scan receipts with AI (GPT-4o Vision)
- ✅ Get real-time notifications for new submissions
- ✅ Approve/reject expenses from admin dashboard
- ✅ Track usage and analytics

---

## 🗄️ Database Setup

### Step 1: Run the SQL Migration

Execute the SQL migration file on your Supabase database:

```bash
# Option 1: Via Supabase Dashboard
1. Go to your Supabase project
2. Navigate to SQL Editor
3. Copy contents of prisma/migrations/add_field_links_system.sql
4. Execute the script

# Option 2: Via Prisma (if using Prisma migrations)
npx prisma db push
```

### Step 2: Create Supabase Storage Bucket

1. Go to **Supabase Dashboard** → **Storage**
2. Create a new bucket named **`receipts`**
3. Set to **Public** (for easier access) or **Private** (more secure)
4. Configure RLS policies:

```sql
-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload receipts"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'receipts');

-- Allow public read for field submissions
CREATE POLICY "Public can upload field receipts"
ON storage.objects FOR INSERT
TO public
WITH CHECK (
  bucket_id = 'receipts' AND
  (storage.foldername(name))[1] = 'field-submissions'
);

-- Users can view their own receipts
CREATE POLICY "Users can view own receipts"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'receipts' AND
  (auth.uid()::text = (storage.foldername(name))[1] OR
   (storage.foldername(name))[1] = 'field-submissions')
);
```

---

## ⚙️ Environment Variables

Add these to your `.env.local` file:

```bash
# Existing variables (keep these)
DATABASE_URL="your_postgres_url"
NEXT_PUBLIC_SUPABASE_URL="your_supabase_url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your_supabase_anon_key"
OPENAI_API_KEY="your_openai_api_key"
AUTH_SECRET="your_auth_secret"

# New: Field Link Security (uses AUTH_SECRET if not set)
FIELD_LINK_SECRET="your_field_link_jwt_secret"  # Optional, defaults to AUTH_SECRET

# Site URL for generating links
NEXT_PUBLIC_SITE_URL="http://localhost:3000"  # Change in production
```

---

## 📦 Install Dependencies

```bash
# Jose for JWT handling (already added)
pnpm add jose

# Generate Prisma client with new models
npx prisma generate
```

---

## 🧪 Testing the System

### 1. Create a Field Link

```bash
# Login as business owner
# Navigate to: /expensa/field-links
# Click "Create Field Link"
# Fill in:
#   - Worker Name: "John Doe"
#   - Project: "Project Alpha" (optional)
#   - Expiry: 30 days
#   - Max Uses: 10 (optional)
```

### 2. Share the Link

After creating, you'll get a shareable URL like:
```
https://yourdomain.com/expensa/submit/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Share via:
- **WhatsApp** (button provided)
- **Copy Link** (for email/SMS)

### 3. Field Worker Submits Expense

1. Worker opens the link on mobile/desktop
2. Uploads receipt photo
3. Enters amount, category, description
4. (Optional) Captures GPS location
5. Submits → Instant notification to admin

### 4. Admin Reviews

Navigate to `/expensa` dashboard:
- See new expense in "Pending Approval" section
- Click "Scan with AI" to extract receipt data
- Review extracted info
- Approve or Reject

---

## 🔐 Security Features

### Field Links
- ✅ **JWT-based tokens** with expiry
- ✅ **Time-limited access** (configurable days)
- ✅ **Usage limits** (max submissions per link)
- ✅ **Revocable** (deactivate anytime)
- ✅ **No authentication required** (worker-friendly)

### Row-Level Security
- ✅ Business owners can only see their own data
- ✅ Field workers can only insert via valid token
- ✅ No cross-business data leaks

---

## 📱 Mobile Optimization

The field worker submission UI (`/expensa/submit/[token]`) is fully mobile-responsive:
- ✅ Touch-optimized buttons
- ✅ Camera integration (`capture="environment"`)
- ✅ GPS location capture
- ✅ Large tap targets
- ✅ Minimal text input required

---

## 🤖 AI Receipt Scanning

### How It Works

1. **Admin uploads receipt** (via Upload Receipt button)
   → Immediately scanned with GPT-4o Vision
   → Extracted fields auto-populate expense form

2. **Field worker submits** (optional AI scan)
   → Receipt stored
   → Admin can scan later via "Scan with AI" button

### Extracted Fields
- Merchant Name
- Amount
- Currency
- Receipt Date
- Category
- Description

### Cost Tracking
All AI scans are logged in `AiReceiptLog` table with:
- Model used
- Tokens consumed
- Cost estimate
- Confidence score
- Raw JSON response

View AI costs via:
```sql
SELECT
  COUNT(*) as total_scans,
  SUM(cost_usd) as total_cost,
  AVG(confidence_score) as avg_confidence
FROM "AiReceiptLog"
WHERE created_at > NOW() - INTERVAL '30 days';
```

---

## 🔔 Real-Time Notifications

### Database Notifications
Every field submission creates a record in `ExpenseNotification`:
```json
{
  "notificationType": "new_submission",
  "title": "New Expense Submitted",
  "message": "John Doe submitted a ₦5,000 Transport expense for Project Alpha.",
  "isRead": false
}
```

### Fetch Notifications
```typescript
// In your component
const response = await fetch('/api/expensa/notifications?unreadOnly=true', {
  headers: { Authorization: `Bearer ${session.access_token}` }
});
const { notifications, unreadCount } = await response.json();
```

### Mark as Read
```typescript
await fetch('/api/expensa/notifications', {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${session.access_token}`
  },
  body: JSON.stringify({
    notificationIds: ['id1', 'id2']
    // OR markAllAsRead: true
  })
});
```

### (Optional) Email Notifications

To add email notifications, integrate SendGrid or similar:

```typescript
// In /api/expensa/submit/route.ts after creating expense
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

const msg = {
  to: businessOwnerEmail,
  from: 'noreply@yourdomain.com',
  subject: 'New Expense Submitted',
  html: `<strong>${workerName}</strong> submitted a ₦${amount} expense.`
};

await sgMail.send(msg);
```

---

## 📊 Analytics & Export

### View Field Link Analytics

Navigate to `/expensa/field-links`:
- Total links created
- Active vs expired
- Total submissions per link
- Usage metrics

### Export Expenses (TODO - Next Steps)

Create `/api/expensa/export` endpoint:

```typescript
export async function GET(req: NextRequest) {
  // ... auth ...

  const expenses = await prisma.expense.findMany({
    where: { userId: user.id }
  });

  // Convert to CSV
  const csv = expensesToCSV(expenses);

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename=expenses.csv'
    }
  });
}
```

---

## 🚀 Deployment

### Production Checklist

1. **Update environment variables**
   ```bash
   NEXT_PUBLIC_SITE_URL="https://yourdomain.com"
   FIELD_LINK_SECRET="<generate-strong-secret>"
   ```

2. **Configure Supabase RLS policies**
   - Test with real users
   - Verify field workers can't access other business data

3. **Set up monitoring**
   - Track AI scan costs
   - Monitor failed submissions
   - Alert on expired links with pending submissions

4. **Enable Supabase Realtime (optional)**
   ```sql
   ALTER PUBLICATION supabase_realtime ADD TABLE "ExpenseNotification";
   ```

5. **Test the complete flow**
   - Create field link → Share → Submit → Review

---

## 🎯 Key Endpoints

### Admin Endpoints (Authenticated)
- `GET /api/expensa/field-links` - List field links
- `POST /api/expensa/field-links` - Create field link
- `PATCH /api/expensa/field-links/[id]` - Update field link
- `DELETE /api/expensa/field-links/[id]` - Delete field link
- `GET /api/expensa/notifications` - Get notifications
- `PATCH /api/expensa/notifications` - Mark as read
- `POST /api/expensa/scan` - Scan receipt with AI

### Public Endpoints (No Auth)
- `GET /api/expensa/submit?token=xxx` - Validate field link
- `POST /api/expensa/submit` - Submit expense via field link
- `POST /api/expensa/upload` - Upload receipt image

### Pages
- `/expensa` - Admin dashboard
- `/expensa/field-links` - Manage field links
- `/expensa/submit/[token]` - Field worker submission form
- `/expensa/analytics` - Analytics dashboard

---

## 🐛 Troubleshooting

### Field link shows "Invalid or expired"
- Check JWT secret matches between creation and validation
- Verify link hasn't expired (check `expiresAt`)
- Ensure link is still active (`isActive = true`)

### Receipt upload fails
- Check Supabase storage bucket exists
- Verify RLS policies allow uploads
- Check file size < 10MB
- Ensure image format is supported

### AI scan returns poor results
- Use clear, well-lit receipt photos
- Ensure text is readable
- Try re-scanning with different image
- Check AI confidence score

### Notifications not appearing
- Verify `ExpenseNotification` table has data
- Check business owner ID matches
- Ensure notifications API is called
- Test with simple SQL query:
  ```sql
  SELECT * FROM "ExpenseNotification"
  WHERE business_id = 'your-user-id'
  ORDER BY created_at DESC;
  ```

---

## 📞 Support

For issues or questions:
1. Check this documentation
2. Review SQL migration logs
3. Check Supabase dashboard for errors
4. Test API endpoints with Postman/Insomnia
5. Contact NeX Consulting Ltd support

---

## ✅ Next Steps

1. **Run the migration** (`add_field_links_system.sql`)
2. **Create storage bucket** (`receipts`)
3. **Install dependencies** (`pnpm add jose`)
4. **Update environment variables**
5. **Test field link creation**
6. **Test expense submission**
7. **Configure notifications** (email/webhook)
8. **Deploy to production**

---

🎉 **Congratulations!** You now have a fully functional real-time expense reporting system for field workers.
