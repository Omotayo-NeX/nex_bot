# 💰 Expensa Integration - Testing Guide

## ✅ Implementation Complete!

Expensa has been successfully integrated into the NeX AI platform as a fourth core module for smart expense tracking.

---

## 🗂️ What Was Built

### 1. **Database Schema** (Prisma)
- ✅ `Expense` model - stores all expense records
- ✅ `Reimbursement` model - tracks payment status
- ✅ `Budget` model - for budget tracking (future use)
- ✅ Added relation to User model

### 2. **Frontend Components**
- ✅ `/app/expensa/page.tsx` - Main expense dashboard
- ✅ `SummaryCards.tsx` - KPI cards (Total, Pending, Approved, Budget)
- ✅ `ExpenseTable.tsx` - Sortable expense table with actions
- ✅ `AddExpenseModal.tsx` - Manual expense entry form
- ✅ `UploadReceiptModal.tsx` - Receipt upload with drag-and-drop
- ✅ `ReportsSection.tsx` - Analytics and CSV export

### 3. **API Routes**
- ✅ `GET /api/expensa` - List expenses with filters
- ✅ `POST /api/expensa` - Create new expense
- ✅ `PUT /api/expensa/[id]` - Update expense
- ✅ `DELETE /api/expensa/[id]` - Delete expense
- ✅ `POST /api/expensa/upload` - Upload receipt + AI extraction

### 4. **AI Integration**
- ✅ `/lib/expensa/ai-extraction.ts` - OpenAI GPT-4o Vision for receipt OCR
- ✅ Extracts: Merchant name, amount, date, category, description

### 5. **Navigation**
- ✅ Added "Expensa" button to LeftSidebar in chat
- ✅ Prominent "New" badge for visibility

---

## 🧪 Testing Instructions

### **Step 1: Database Migration**

**Important:** Before testing, you need to push the schema to your database.

Run this command in your terminal:

```bash
npx prisma db push
```

If that fails due to connection pooling issues, you can alternatively run:

```bash
npx prisma migrate dev --name add_expensa_tables
```

Then restart your database connection or wait a few minutes and try again.

---

### **Step 2: Start the Development Server**

The server is already running at:
- **Local**: http://localhost:3000
- **Network**: http://192.168.234.236:3000

---

### **Step 3: Test Navigation**

1. Open http://localhost:3000
2. Sign in to your account
3. Navigate to `/chat`
4. Look for **"Expensa"** in the left sidebar under "AI Tools"
5. Click on it - you should be redirected to `/expensa`

---

### **Step 4: Test Manual Expense Entry**

1. On the Expensa dashboard, click **"Add Expense"** button
2. Fill in the form:
   - **Merchant**: "Total Filling Station"
   - **Date**: Today's date
   - **Amount**: 5000
   - **Currency**: NGN
   - **Category**: Transport
   - **Project**: "Marketing Campaign Q4" (optional)
   - **Description**: "Fuel for client visit" (optional)
3. Click **"Add Expense"**
4. Verify the expense appears in the table below

---

### **Step 5: Test Receipt Upload (AI Extraction)**

**Requirements:**
- You need a valid `OPENAI_API_KEY` in your `.env` file
- The key must have access to GPT-4o (vision model)

**Steps:**
1. Click **"Upload Receipt"** button
2. Drag and drop a receipt image (JPG/PNG) OR click to browse
3. Click **"Extract Data"** button
4. Wait for AI to process (5-10 seconds)
5. Verify that the "Add Expense" modal opens with pre-filled data
6. Adjust any fields if needed
7. Click **"Add Expense"**

**Test Images:**
- Try with a restaurant receipt
- Try with a gas station receipt
- Try with an equipment purchase receipt

---

### **Step 6: Test Expense Table Features**

**Sorting:**
- Click on "Date" header to sort by date
- Click on "Amount" header to sort by amount
- Click on "Category" header to sort alphabetically

**Actions:**
- Click **Eye icon** to view receipt (if uploaded)
- Click **Edit icon** to modify a pending expense
- Click **Trash icon** to delete a pending expense

**Status Badges:**
- Verify color coding: Pending (yellow), Approved (green), Rejected (red)

---

### **Step 7: Test Reports Section**

1. Click **"Show Reports"** button at the top
2. Verify summary cards display correct totals
3. Check the "Spending by Category" chart
4. Click **"Export CSV"** to download expense data
5. Open the CSV file and verify all expense data is present

---

### **Step 8: Test Filtering (Future Enhancement)**

Currently, the UI doesn't have filter dropdowns, but the API supports it:

```bash
# Test via curl or Postman:
GET /api/expensa?status=pending&category=Transport
```

---

## 🚨 Known Limitations & Future Enhancements

### **Current Limitations:**
1. **Supabase Storage** - Receipt uploads require Supabase storage bucket named `receipts` to be created
2. **Admin Approval** - No admin UI yet for approving expenses (status is set to "pending")
3. **Paystack Reimbursements** - Transfer API not yet implemented
4. **Multi-currency** - Currency conversion not implemented
5. **Team/Project** - No team management UI yet

### **Future Enhancements:**
- [ ] Add filter dropdowns for category, status, date range
- [ ] Implement admin approval workflow
- [ ] Add Paystack reimbursement integration
- [ ] Create budget management UI
- [ ] Add expense categories customization
- [ ] Implement recurring expenses
- [ ] Add mobile-responsive enhancements
- [ ] Implement role-based access control (RBAC)

---

## 🐛 Troubleshooting

### **Issue: "Unauthorized" error**
**Solution:** Make sure you're signed in and have a valid session token.

### **Issue: Receipt upload fails**
**Solution:**
1. Check that `OPENAI_API_KEY` is set in `.env`
2. Verify the API key has GPT-4o access
3. Check file size (must be < 5MB)
4. Ensure file is an image (JPG, PNG)

### **Issue: Database errors**
**Solution:**
1. Run `npx prisma db push` to sync schema
2. Check that `DATABASE_URL` is correct in `.env`
3. Verify Supabase database is accessible

### **Issue: Expenses don't appear**
**Solution:**
1. Check browser console for errors
2. Verify API route is returning data: `curl http://localhost:3000/api/expensa`
3. Check that user is authenticated

### **Issue: Supabase Storage upload fails**
**Solution:**
1. Create a `receipts` bucket in Supabase Storage
2. Make it **public** for viewing receipts
3. Update RLS policies if needed

---

## 📊 Database Migration Status

**Status:** ⚠️ Pending

**Required Actions:**
1. Run: `npx prisma db push` or `npx prisma migrate dev --name add_expensa_tables`
2. Verify tables are created: `Expense`, `Reimbursement`, `Budget`
3. Check Prisma Studio: `npx prisma studio`

**Note:** The migration may fail if there are active database connections. Close all Prisma connections and try again, or wait a few minutes for pooled connections to close.

---

## 🎉 Success Criteria

✅ Navigation works from Chat → Expensa
✅ Can add expense manually
✅ Can upload receipt and extract data
✅ Expenses appear in table
✅ Can edit/delete pending expenses
✅ Reports section displays charts
✅ CSV export works

---

## 📝 Next Steps After Testing

Once testing is complete and you're satisfied:

1. **Commit changes:**
   ```bash
   git add .
   git commit -m "feat: add Expensa expense tracking module"
   git push
   ```

2. **Deploy to production** (Vercel):
   - Push to main branch
   - Vercel will auto-deploy
   - Run migration on production database

3. **Create Supabase Storage bucket:**
   - Log in to Supabase dashboard
   - Create `receipts` bucket
   - Make it public

4. **Update documentation:**
   - Add Expensa to README
   - Document API endpoints
   - Create user guide

---

## 🔗 Quick Links

- **Local Dev**: http://localhost:3000/expensa
- **Expensa Dashboard**: `/expensa`
- **API Docs**: See code comments in `/app/api/expensa/`
- **Prisma Studio**: Run `npx prisma studio`

---

**Built with ❤️ by Claude Code for NeX AI Platform**
