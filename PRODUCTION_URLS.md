# 🚀 Production URLs - NeX AI Admin Dashboard

## ✅ Deployment Complete

Your admin authentication and subscription dashboard have been successfully deployed to Vercel!

---

## 🔗 Production URLs

### Admin Login Page
```
https://nex-nxqvmu9iq-omotayo-odunubis-projects.vercel.app/admin/login
```

### Subscriptions Dashboard
```
https://nex-nxqvmu9iq-omotayo-odunubis-projects.vercel.app/dashboard/subscriptions
```

### Main Application
```
https://nex-nxqvmu9iq-omotayo-odunubis-projects.vercel.app
```

---

## 🔐 Login Instructions

1. **Visit the admin login page**:
   ```
   https://nex-nxqvmu9iq-omotayo-odunubis-projects.vercel.app/admin/login
   ```

2. **Enter your admin email**:
   ```
   adetolaodunubi@gmail.com
   ```

3. **Check your email** for the magic link from Supabase

4. **Click the magic link** - you'll be redirected to the dashboard

5. **Access the dashboard**:
   ```
   https://nex-nxqvmu9iq-omotayo-odunubis-projects.vercel.app/dashboard/subscriptions
   ```

---

## ⚙️ Required: Update Supabase Settings

### Important: Update Redirect URLs

Go to your Supabase Dashboard and update these settings:

1. **Navigate to**: Authentication → URL Configuration

2. **Site URL**: Update to production URL
   ```
   https://nex-nxqvmu9iq-omotayo-odunubis-projects.vercel.app
   ```

3. **Redirect URLs**: Add these URLs
   ```
   https://nex-nxqvmu9iq-omotayo-odunubis-projects.vercel.app/admin/login
   https://nex-nxqvmu9iq-omotayo-odunubis-projects.vercel.app/dashboard/subscriptions
   https://nex-nxqvmu9iq-omotayo-odunubis-projects.vercel.app/auth/callback
   ```

4. **Save changes**

---

## 🔔 Update Paystack Webhook URL

Update your Paystack webhook URL to the production endpoint:

1. Go to [Paystack Dashboard](https://dashboard.paystack.com)
2. Navigate to **Settings → Webhooks**
3. Update webhook URL to:
   ```
   https://nex-nxqvmu9iq-omotayo-odunubis-projects.vercel.app/api/paystack/webhook
   ```
4. Save changes

---

## ✅ What's Live Now

- ✅ Admin login with magic link authentication
- ✅ Protected subscriptions dashboard
- ✅ Multi-app transaction tracking (NeX AI + ElevenOne)
- ✅ Filtering by app, status, and search
- ✅ Real-time stats and revenue tracking
- ✅ Logout functionality
- ✅ Responsive design

---

## 🧪 Test the Deployment

### Step 1: Test Login
```bash
# Open login page
open https://nex-nxqvmu9iq-omotayo-odunubis-projects.vercel.app/admin/login

# Enter: adetolaodunubi@gmail.com
# Check email for magic link
```

### Step 2: Verify Dashboard Access
After logging in, you should see:
- Total transactions count
- Successful payments count
- Total revenue
- Filter buttons (All Apps / NeX AI / ElevenOne)
- Logout button (top-right)

### Step 3: Test Webhook (Optional)
Make a test payment through either NeX AI or ElevenOne to verify webhook logging.

---

## 📊 Dashboard Features

### Stats Cards
- **Total Transactions**: All payments across both apps
- **Successful Payments**: Count of successful transactions
- **Total Revenue**: Sum in Naira (₦)

### Filters
- **App Source**: All / NeX AI / ElevenOne
- **Payment Status**: All / Success / Pending / Failed
- **Search**: By email, reference, or plan name

### Table Columns
- App (color-coded badge)
- User Email
- Plan
- Amount (₦)
- Status (color-coded)
- Reference
- Date

---

## 🔒 Security Notes

### What's Protected:
- ✅ Login requires admin email only
- ✅ Dashboard redirects unauthorized users
- ✅ Row Level Security on database
- ✅ Service role for webhook writes
- ✅ Session-based authentication

### Admin Email:
```
adetolaodunubi@gmail.com
```

Only this email can access the dashboard.

---

## 🐛 Troubleshooting

### Can't log in?
1. Verify email is exactly: `adetolaodunubi@gmail.com`
2. Check spam folder for magic link
3. Ensure Supabase redirect URLs are updated
4. Check Supabase auth logs

### Dashboard not loading?
1. Clear browser cache/cookies
2. Try incognito mode
3. Check browser console for errors
4. Verify you're logged in

### No transactions showing?
1. Check RLS policies are applied
2. Verify webhook is receiving events
3. Check Supabase table has data
4. Look for errors in Vercel logs

---

## 📝 Next Steps

1. ✅ **Update Supabase redirect URLs** (IMPORTANT)
2. ✅ **Update Paystack webhook URL** (IMPORTANT)
3. ✅ **Test login flow** with production URL
4. ✅ **Verify dashboard access** works correctly
5. ✅ **Test a payment** to verify webhook logging
6. ✅ **(Optional) Add custom domain** in Vercel

---

## 📞 Support

If you encounter any issues:

1. Check Vercel deployment logs:
   ```bash
   vercel logs https://nex-nxqvmu9iq-omotayo-odunubis-projects.vercel.app
   ```

2. Check Supabase logs:
   - Authentication logs
   - Database logs

3. Review documentation:
   - `ADMIN_SETUP_INSTRUCTIONS.md`
   - `PAYSTACK_MULTI_APP_SETUP.md`

---

## 🎉 You're All Set!

**Admin Login**: https://nex-nxqvmu9iq-omotayo-odunubis-projects.vercel.app/admin/login

**Email**: adetolaodunubi@gmail.com

**Remember to**:
1. Update Supabase redirect URLs
2. Update Paystack webhook URL
3. Test the login flow

Happy monitoring! 🚀

---

**Deployment Date**: January 2025
**Status**: ✅ Live in Production
**Latest Commit**: 1981c1e
