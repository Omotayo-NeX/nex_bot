# 🚀 Production Setup - ai.nexconsultingltd.com

## ✅ Your Custom Domain

**Website**: `ai.nexconsultingltd.com`

---

## 🔗 Production URLs

### Admin Login Page
```
https://ai.nexconsultingltd.com/admin/login
```

### Subscriptions Dashboard
```
https://ai.nexconsultingltd.com/dashboard/subscriptions
```

### Paystack Webhook Endpoint
```
https://ai.nexconsultingltd.com/api/paystack/webhook
```

---

## 🔐 Quick Login Guide

1. **Visit**: https://ai.nexconsultingltd.com/admin/login
2. **Enter**: `adetolaodunubi@gmail.com`
3. **Check email** for magic link
4. **Click link** → Redirected to dashboard

---

## ⚙️ REQUIRED: Update Configurations

### 1. Supabase Authentication Settings

Go to: https://app.supabase.com → Your Project → Authentication → URL Configuration

**Update Site URL:**
```
https://ai.nexconsultingltd.com
```

**Add Redirect URLs:**
```
https://ai.nexconsultingltd.com/admin/login
https://ai.nexconsultingltd.com/dashboard/subscriptions
https://ai.nexconsultingltd.com/auth/callback
```

**Screenshot guide:**
1. Click **Authentication** in left sidebar
2. Click **URL Configuration**
3. Update **Site URL** field
4. Add each URL to **Redirect URLs** section
5. Click **Save**

---

### 2. Paystack Webhook Configuration

Go to: https://dashboard.paystack.com → Settings → API Keys & Webhooks

**Update Webhook URL:**
```
https://ai.nexconsultingltd.com/api/paystack/webhook
```

**Enable these events:**
- ✅ charge.success
- ✅ subscription.create
- ✅ subscription.disable
- ✅ invoice.create
- ✅ invoice.payment_failed

**Steps:**
1. Go to Settings → **API Keys & Webhooks**
2. Click **Add Webhook**
3. Enter URL: `https://ai.nexconsultingltd.com/api/paystack/webhook`
4. Select the events above
5. Click **Save**

---

### 3. Vercel Domain Configuration (If Not Already Set)

If `ai.nexconsultingltd.com` is not yet pointing to your Vercel project:

**Option A: Via Vercel Dashboard**
1. Go to: https://vercel.com/dashboard
2. Select your `nex_bot` project
3. Go to **Settings** → **Domains**
4. Add domain: `ai.nexconsultingltd.com`
5. Follow DNS configuration instructions

**Option B: Via CLI**
```bash
vercel domains add ai.nexconsultingltd.com
```

---

## 🧪 Test Your Setup

### Step 1: Test Admin Login

```bash
# Open login page
open https://ai.nexconsultingltd.com/admin/login
```

**Expected:**
- Clean login page appears
- Enter `adetolaodunubi@gmail.com`
- Receive magic link email
- Click link → Redirects to dashboard

### Step 2: Test Dashboard Access

After login, verify:
- ✅ Dashboard loads at: `https://ai.nexconsultingltd.com/dashboard/subscriptions`
- ✅ Shows "Logged in as: adetolaodunubi@gmail.com"
- ✅ Logout button visible (top-right)
- ✅ Stats cards display (may show 0 if no transactions yet)
- ✅ Filter buttons work (All Apps / NeX AI / ElevenOne)

### Step 3: Test Unauthorized Access

```bash
# Try accessing dashboard without login (in incognito/private mode)
open https://ai.nexconsultingltd.com/dashboard/subscriptions
```

**Expected:**
- Auto-redirects to `/admin/login`

### Step 4: Test Webhook (Optional)

Make a test payment from NeX AI or ElevenOne with metadata:
```json
{
  "app": "nexai",
  "user_email": "test@example.com",
  "plan": "pro"
}
```

**Expected:**
- Transaction appears in dashboard
- Check webhook logs in Paystack dashboard

---

## 📊 Dashboard Features Overview

### What You'll See:

**Stats Cards:**
- Total Transactions: Count across both apps
- Successful Payments: Completed transactions
- Total Revenue: Sum in Naira (₦)

**Filters:**
- App Source: All / NeX AI / ElevenOne
- Payment Status: All / Success / Pending / Failed
- Search: By email, reference, or plan

**Data Table:**
- App badge (color-coded)
- User email
- Plan name
- Amount (₦)
- Status badge (color-coded)
- Reference number
- Transaction date/time

**Top Bar:**
- Logged in user email
- Logout button

---

## 🔒 Security Summary

**Access Control:**
- ✅ Only `adetolaodunubi@gmail.com` can log in
- ✅ Wrong emails are rejected at login
- ✅ Unauthenticated users redirected to login
- ✅ Row Level Security on database
- ✅ Service role for webhook writes only

**Authentication:**
- Magic link (passwordless)
- Session-based with Supabase
- Auto-expiry after inactivity
- Secure httpOnly cookies

---

## 🐛 Troubleshooting

### Magic Link Not Received

**Problem:** Email not arriving

**Solutions:**
1. Check spam/junk folder
2. Verify email is exactly: `adetolaodunubi@gmail.com`
3. Check Supabase email settings: Authentication → Email Templates
4. Verify SMTP configuration in Supabase
5. Check Supabase logs: Authentication → Logs

### Redirect Loop

**Problem:** Keeps redirecting between pages

**Solutions:**
1. Verify Supabase redirect URLs include:
   - `https://ai.nexconsultingltd.com/admin/login`
   - `https://ai.nexconsultingltd.com/dashboard/subscriptions`
2. Clear browser cookies and cache
3. Try incognito/private mode
4. Check Site URL is set correctly

### "Permission Denied" in Dashboard

**Problem:** Data not loading

**Solutions:**
1. Verify RLS policies are applied (run `ADMIN_AUTH_SETUP.sql`)
2. Confirm you're logged in with admin email
3. Check browser console for errors
4. Verify Supabase service role key in Vercel env vars

### Webhook Not Logging Transactions

**Problem:** Payments not appearing in dashboard

**Solutions:**
1. Verify webhook URL in Paystack: `https://ai.nexconsultingltd.com/api/paystack/webhook`
2. Check Paystack webhook logs for delivery status
3. Verify Supabase tables exist (run migration SQL)
4. Check Vercel function logs for errors
5. Ensure `metadata.app` is set in payment initialization

---

## 📝 Checklist - Required Configuration

Before using in production, complete these tasks:

### Supabase Configuration
- [ ] Update Site URL to `https://ai.nexconsultingltd.com`
- [ ] Add redirect URLs for /admin/login and /dashboard/subscriptions
- [ ] Verify Email provider is enabled
- [ ] Test magic link email delivery
- [ ] Run RLS policies SQL (`ADMIN_AUTH_SETUP.sql`)
- [ ] Verify tables exist (run migration if needed)

### Paystack Configuration
- [ ] Update webhook URL to `https://ai.nexconsultingltd.com/api/paystack/webhook`
- [ ] Enable required events (charge.success, etc.)
- [ ] Test webhook delivery
- [ ] Verify live API keys are set in Vercel environment variables

### Vercel Configuration
- [ ] Ensure `ai.nexconsultingltd.com` points to project
- [ ] Verify environment variables are set:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `PAYSTACK_SECRET_KEY`
  - `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`
- [ ] Confirm deployment is successful
- [ ] Test production URLs

### Testing
- [ ] Test admin login flow
- [ ] Verify dashboard loads after login
- [ ] Test logout functionality
- [ ] Verify unauthorized access is blocked
- [ ] Test webhook with sample payment
- [ ] Verify transaction appears in dashboard

---

## 🌐 Integration with ElevenOne App

When integrating your ElevenOne (scripture & Bible app) with this shared webhook:

**In your ElevenOne payment initialization:**
```javascript
const response = await fetch('https://api.paystack.co/transaction/initialize', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: userEmail,
    amount: planPrice * 100, // in kobo
    metadata: {
      app: 'elevenone',  // ← IMPORTANT: Identifies source app
      user_email: userEmail,
      user_id: userId,
      plan: planName
    },
    callback_url: 'https://your-elevenone-app.com/payment/callback'
  })
});
```

**The webhook will:**
1. Receive payment notification
2. See `metadata.app = "elevenone"`
3. Log transaction to `elevenone_subscriptions` table
4. Transaction appears in admin dashboard with "ElevenOne" badge

---

## 📞 Support & Resources

**Documentation Files:**
- `PRODUCTION_SETUP.md` - This file
- `ADMIN_SETUP_INSTRUCTIONS.md` - Detailed setup guide
- `PAYSTACK_MULTI_APP_SETUP.md` - Webhook integration details
- `ADMIN_AUTH_SUMMARY.md` - Quick reference

**External Resources:**
- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Paystack Webhooks](https://paystack.com/docs/payments/webhooks)
- [Vercel Domains](https://vercel.com/docs/concepts/projects/domains)

**Check Logs:**
```bash
# Vercel deployment logs
vercel logs https://ai.nexconsultingltd.com

# Check specific deployment
vercel logs nex-nxqvmu9iq-omotayo-odunubis-projects.vercel.app
```

---

## 🎉 You're Ready!

**Admin Login URL:**
```
https://ai.nexconsultingltd.com/admin/login
```

**Admin Email:**
```
adetolaodunubi@gmail.com
```

**Webhook URL (for Paystack):**
```
https://ai.nexconsultingltd.com/api/paystack/webhook
```

---

**Remember to complete the required configuration checklist above!**

**Status**: ✅ Deployed and Ready
**Domain**: ai.nexconsultingltd.com
**Last Updated**: January 2025
