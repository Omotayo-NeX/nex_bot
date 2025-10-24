# 💼 Expensa Real-Time Field Expense System

## 🎯 Quick Overview

Transform Expensa from a static receipt storage feature into a **Real-Time Expense Reporting and Approval System** that supports secure field expense submission by workers, instant notifications to business admins, AI-powered receipt scanning, and a complete approval workflow.

---

## ✨ Key Features

### 🔗 Secure Field Links
- Generate time-limited, JWT-secured links for field workers
- No login required - workers submit expenses via unique URL
- Configurable expiry (1-365 days)
- Optional usage limits (max submissions per link)
- Revocable links (deactivate anytime)
- Share via WhatsApp, email, or SMS

### 📱 Mobile-First Submission Form
- Optimized for mobile devices
- Camera integration for receipt photos
- GPS location capture
- Visual category selection
- Real-time link validation
- Clear success/error states

### 🤖 AI Receipt Scanning
- GPT-4o Vision for OCR
- Auto-extracts: merchant, amount, date, currency, category
- Confidence scoring
- Cost tracking per scan
- Logged in database for audit

### 🔔 Real-Time Notifications
- Instant alerts on new submissions
- Unread count tracking
- Mark as read functionality
- Optional email/webhook integration

### 👨‍💼 Admin Dashboard
- Manage all field links
- View usage statistics
- Approve/reject expenses
- Scan receipts with AI
- Track worker submissions

---

## 📁 Project Structure

```
nex_bot/
├── prisma/
│   ├── schema.prisma                              # ✅ Updated with new models
│   └── migrations/
│       └── add_field_links_system.sql             # ✅ Complete SQL migration
│
├── lib/
│   └── expensa/
│       ├── ai-extraction.ts                       # Existing AI extraction
│       └── field-link-utils.ts                    # ✅ JWT utils & link formatting
│
├── app/
│   ├── api/
│   │   └── expensa/
│   │       ├── route.ts                           # Existing expense CRUD
│   │       ├── upload/route.ts                    # ✅ Updated for public uploads
│   │       ├── scan/route.ts                      # ✅ NEW: AI scanning endpoint
│   │       ├── submit/route.ts                    # ✅ NEW: Public submission endpoint
│   │       ├── notifications/route.ts             # ✅ NEW: Notifications API
│   │       └── field-links/
│   │           ├── route.ts                       # ✅ NEW: Field links CRUD
│   │           └── [id]/route.ts                  # ✅ NEW: Individual link management
│   │
│   └── expensa/
│       ├── page.tsx                               # Existing dashboard
│       ├── field-links/
│       │   └── page.tsx                           # ✅ NEW: Field links admin UI
│       └── submit/
│           └── [token]/page.tsx                   # ✅ NEW: Worker submission form
│
└── Documentation/
    ├── EXPENSA_FIELD_SYSTEM_SETUP.md              # ✅ Complete setup guide
    ├── EXPENSA_IMPLEMENTATION_SUMMARY.md          # ✅ Implementation details
    ├── EXPENSA_MIGRATION_CHECKLIST.md             # ✅ Step-by-step migration
    └── EXPENSA_SYSTEM_README.md                   # ✅ This file
```

---

## 🚀 Quick Start (3 Steps)

### 1. Database Setup
```sql
-- Execute via Supabase Dashboard → SQL Editor
-- Copy/paste: prisma/migrations/add_field_links_system.sql
```

### 2. Storage Setup
```bash
# In Supabase Dashboard → Storage
# Create bucket: "receipts" (public or RLS-protected)
```

### 3. Install & Run
```bash
pnpm add jose                    # JWT library
npx prisma generate              # Update Prisma client
pnpm run dev                     # Start dev server
```

---

## 📋 Complete Documentation

| Document | Purpose | Start Here If... |
|----------|---------|------------------|
| **[EXPENSA_MIGRATION_CHECKLIST.md](./EXPENSA_MIGRATION_CHECKLIST.md)** | Step-by-step migration guide | You're setting up for the first time |
| **[EXPENSA_FIELD_SYSTEM_SETUP.md](./EXPENSA_FIELD_SYSTEM_SETUP.md)** | Complete setup & configuration | You need detailed setup instructions |
| **[EXPENSA_IMPLEMENTATION_SUMMARY.md](./EXPENSA_IMPLEMENTATION_SUMMARY.md)** | Technical implementation details | You want to understand the architecture |
| **[EXPENSA_SYSTEM_README.md](./EXPENSA_SYSTEM_README.md)** | Overview & quick reference | You're reading this now! |

---

## 🔧 Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Database:** PostgreSQL (Supabase)
- **ORM:** Prisma
- **Auth:** Supabase Auth
- **Storage:** Supabase Storage
- **AI:** OpenAI GPT-4o Vision
- **JWT:** Jose
- **Styling:** TailwindCSS
- **Animations:** Framer Motion

---

## 📊 Database Models

### New Models

#### FieldLink
Secure links for field worker access
```typescript
{
  id: string;
  businessId: string;
  workerName: string;
  workerEmail?: string;
  projectName?: string;
  inviteToken: string;      // JWT token
  expiresAt: Date;
  isActive: boolean;
  maxUses?: number;
  currentUses: number;
  allowedActions: string[];
}
```

#### AiReceiptLog
AI scan tracking and cost logging
```typescript
{
  id: string;
  expenseId: string;
  modelUsed: string;        // 'gpt-4o', 'gpt-4o-mini'
  promptTokens: number;
  completionTokens: number;
  costUsd: number;
  confidenceScore?: number;
  rawResponse: object;
  extractionStatus: string; // 'success', 'failed'
  errorMessage?: string;
}
```

#### ExpenseNotification
Real-time notification system
```typescript
{
  id: string;
  businessId: string;
  expenseId: string;
  notificationType: string; // 'new_submission', 'status_change'
  title: string;
  message: string;
  isRead: boolean;
  sentViaEmail: boolean;
  metadata: object;
}
```

### Updated: Expense
Extended with field worker fields
```typescript
{
  // ... existing fields
  fieldLinkId?: string;
  workerName?: string;
  location?: string;
  aiScanned: boolean;
  aiConfidence?: number;
  detectedCurrency?: string;
  receiptDate?: Date;
  rejectionReason?: string;
  reviewedBy?: string;
  reviewedAt?: Date;
  submissionMethod: string; // 'admin_entry', 'field_worker', 'api'
}
```

---

## 🔐 Security Features

### JWT Authentication
- **Algorithm:** HS256
- **Library:** jose (Edge-compatible)
- **Secret:** `FIELD_LINK_SECRET` or `AUTH_SECRET`
- **Expiry:** Configurable per link
- **Validation:** Server-side on every submission

### Row-Level Security (RLS)
- Business owners can only access their own data
- Field workers (anonymous) can only INSERT via valid token
- No cross-business data access
- Enforced at database level

### Storage Security
- Bucket-level access control
- Optional RLS on storage objects
- File type validation
- Size limits enforced

---

## 🎯 User Flows

### Admin Flow: Create & Share Link
1. Login → Navigate to `/expensa/field-links`
2. Click "Create Field Link"
3. Enter worker details (name, project, expiry)
4. System generates secure JWT token
5. Share via WhatsApp/email/copy URL

### Field Worker Flow: Submit Expense
1. Open shared link (no login required)
2. System validates token (expiry, usage limits)
3. Upload receipt photo
4. Fill in amount, category, description
5. Submit → Instant notification to admin

### Admin Flow: Review & Approve
1. Receive notification of new submission
2. Navigate to `/expensa` dashboard
3. View pending expenses
4. (Optional) Scan receipt with AI
5. Approve or reject with reason

---

## 📈 Analytics & Reporting

### Built-in Metrics
- Total field links created
- Active vs expired vs maxed-out
- Submissions per link/worker/project
- AI scan success rate & costs
- Approval/rejection rates

### Example Queries

**Top Field Workers:**
```sql
SELECT
  worker_name,
  COUNT(*) as submissions,
  SUM(amount) as total_amount
FROM "Expense"
WHERE submission_method = 'field_worker'
GROUP BY worker_name
ORDER BY submissions DESC;
```

**AI Scan Performance:**
```sql
SELECT
  AVG(confidence_score) as avg_confidence,
  COUNT(*) as total_scans,
  SUM(cost_usd) as total_cost
FROM "AiReceiptLog"
WHERE extraction_status = 'success';
```

**Field Link Utilization:**
```sql
SELECT
  fl.worker_name,
  fl.project_name,
  fl.current_uses,
  fl.max_uses,
  CASE
    WHEN fl.max_uses IS NULL THEN 'Unlimited'
    ELSE ROUND((fl.current_uses::decimal / fl.max_uses) * 100, 2)::text || '%'
  END as utilization
FROM "FieldLink" fl
WHERE fl.is_active = true;
```

---

## 🔌 API Endpoints

### Admin Endpoints (Authenticated)

#### Field Links
```http
GET    /api/expensa/field-links          # List all field links
POST   /api/expensa/field-links          # Create new field link
GET    /api/expensa/field-links/[id]     # Get specific link
PATCH  /api/expensa/field-links/[id]     # Update link (toggle active, extend expiry)
DELETE /api/expensa/field-links/[id]     # Delete/revoke link
```

#### Notifications
```http
GET    /api/expensa/notifications?unreadOnly=true  # Get notifications
PATCH  /api/expensa/notifications                  # Mark as read
```

#### AI Scanning
```http
POST   /api/expensa/scan                 # Scan receipt with AI
# Body: { expenseId: "uuid" }
```

### Public Endpoints (No Auth)

#### Field Submission
```http
GET    /api/expensa/submit?token=xxx     # Validate field link
POST   /api/expensa/submit               # Submit expense
# Body: { token, amount, category, description, receiptUrl, location }

POST   /api/expensa/upload               # Upload receipt image
# Multipart form-data: { receipt: File }
```

---

## 🎨 UI Components

### Field Links Dashboard
Location: `/expensa/field-links`

Features:
- Stats cards (total, active, expired, submissions)
- Sortable table with status badges
- Create modal with form validation
- Share modal (WhatsApp, copy link)
- Quick actions (deactivate, delete, regenerate)

### Field Worker Submission Form
Location: `/expensa/submit/[token]`

Features:
- Link validation with error states
- Mobile-optimized file upload
- Visual category selection (emoji icons)
- GPS location capture
- Real-time validation
- Success/error animations

---

## 🧪 Testing

### Manual Testing Checklist
- [ ] Create field link
- [ ] Share link (copy URL)
- [ ] Open link in incognito/private browser
- [ ] Upload receipt photo
- [ ] Submit expense
- [ ] Verify notification created
- [ ] Approve/reject expense
- [ ] Test expired link
- [ ] Test maxed-out link

### Automated Testing (Recommended)
```typescript
// Example Playwright test
test('field worker can submit expense via valid link', async ({ page }) => {
  // Create field link as admin
  const link = await createFieldLink({ workerName: 'Test Worker' });

  // Open link
  await page.goto(`/expensa/submit/${link.token}`);

  // Fill form
  await page.setInputFiles('input[type="file"]', './test-receipt.jpg');
  await page.fill('input[type="number"]', '5000');
  await page.click('button:has-text("Transport")');

  // Submit
  await page.click('button:has-text("Submit Expense")');

  // Verify success
  await expect(page.locator('text=Success!')).toBeVisible();
});
```

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| "Invalid or expired link" | Check JWT secret, expiry date, and `isActive` status |
| Storage upload fails | Verify bucket exists and RLS policies allow uploads |
| AI scan returns errors | Check `OPENAI_API_KEY` and GPT-4o access |
| Notifications not appearing | Query `ExpenseNotification` table directly to debug |
| Prisma client outdated | Run `npx prisma generate` |
| TypeScript errors | Check imports, run `pnpm run build` |

---

## 📞 Support & Resources

### Documentation
- [Setup Guide](./EXPENSA_FIELD_SYSTEM_SETUP.md)
- [Migration Checklist](./EXPENSA_MIGRATION_CHECKLIST.md)
- [Implementation Summary](./EXPENSA_IMPLEMENTATION_SUMMARY.md)

### External Resources
- [Supabase Docs](https://supabase.com/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [Jose (JWT) Docs](https://github.com/panva/jose)
- [OpenAI Vision API](https://platform.openai.com/docs/guides/vision)

### Getting Help
1. Check documentation above
2. Review error logs (Supabase Dashboard, Vercel Logs)
3. Test API endpoints with Postman/Insomnia
4. Contact NeX Consulting Ltd support

---

## 🎉 Success Criteria

Your system is ready when:

✅ Field links page loads (`/expensa/field-links`)
✅ Can create field link successfully
✅ Link URL generates correctly
✅ Field worker can submit expense (no login)
✅ Notification created in database
✅ Expense appears in admin dashboard
✅ AI scan extracts data correctly
✅ Can approve/reject expenses

---

## 📜 License

Copyright © 2025 NeX Consulting Ltd. All rights reserved.

---

## 🚀 Next Steps

1. **Run the migration:** `prisma/migrations/add_field_links_system.sql`
2. **Create storage bucket:** `receipts` in Supabase
3. **Install dependencies:** `pnpm add jose`
4. **Test the flow:** Create link → Submit expense → Review
5. **Deploy to production:** Update env vars, deploy
6. **Train your team:** Share this documentation

---

**Built with ❤️ for modern businesses**

Need help? Check [EXPENSA_MIGRATION_CHECKLIST.md](./EXPENSA_MIGRATION_CHECKLIST.md) for detailed setup instructions.
