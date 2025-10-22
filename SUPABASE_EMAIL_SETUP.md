# 🚀 Quick Setup: Supabase Email Configuration

## 🎯 Goal
Fix confirmation emails for https://ai.nexconsultingltd.com

---

## ⚡ Quick Fix (15 Minutes)

### Step 1: Configure SMTP in Supabase (5 minutes)

1. **Go to Supabase Dashboard**:
   - https://app.supabase.com
   - Select your NeX AI project

2. **Navigate to SMTP Settings**:
   - Click **Authentication** (left sidebar)
   - Click **Settings** tab
   - Scroll to **SMTP Settings**

3. **Enter SMTP Configuration**:
   ```
   Enable Custom SMTP: ✅ ON

   SMTP Host: smtp.hostinger.com
   SMTP Port: 587
   SMTP Admin Email: nex@nexconsultingltd.com
   SMTP Password: [your email password]

   Sender Email: nex@nexconsultingltd.com
   Sender Name: NeX AI
   ```

4. **Click Save**

---

### Step 2: Update Email Templates (5 minutes)

1. **Go to Email Templates**:
   - Still in Authentication section
   - Click **Email Templates** tab

2. **Update Confirmation Email**:
   - Template: **Confirm signup**
   - Subject: `Confirm your email for NeX AI`
   - Add this header (in template):
     ```
     Reply-To: support@nexconsultingltd.com
     ```

3. **Update Magic Link Email**:
   - Template: **Magic Link**
   - Subject: `Your magic link for NeX AI`
   - Add same Reply-To header

4. **Click Save All**

---

### Step 3: Test Email Delivery (5 minutes)

1. **Test Signup**:
   - Go to: https://ai.nexconsultingltd.com/auth/signup
   - Create test account
   - Check email (including spam folder)

2. **OR Test in Supabase**:
   - Go to **Authentication → Users**
   - Click **Invite User**
   - Enter your email
   - Check inbox

3. **Verify**:
   - ✅ Email received
   - ✅ Not in spam
   - ✅ Confirmation link works

---

## 🔧 If Email Still Not Working

### Check SMTP Password

Make sure you're using the **email account password**, not your Hostinger panel password.

**To get/reset email password**:
1. Login to Hostinger: https://hpanel.hostinger.com
2. Go to **Emails → Email Accounts**
3. Find `nex@nexconsultingltd.com`
4. Click **Manage** → **Change Password**
5. Set new password
6. Update in Supabase SMTP settings

---

### Alternative: Use SendGrid (Recommended)

**Why SendGrid?**
- ✅ Better deliverability (99%+)
- ✅ Free tier: 100 emails/day
- ✅ Automatic DKIM setup
- ✅ Email analytics

**Setup** (10 minutes):

1. **Sign up for SendGrid**:
   - Go to: https://signup.sendgrid.com
   - Create free account

2. **Verify Sender**:
   - Settings → Sender Authentication
   - Single Sender Verification
   - Add: `nex@nexconsultingltd.com`
   - Verify via email

3. **Create API Key**:
   - Settings → API Keys
   - Create API Key
   - Copy the key (starts with `SG.`)

4. **Configure in Supabase**:
   ```
   SMTP Host: smtp.sendgrid.net
   SMTP Port: 587
   SMTP Admin Email: apikey
   SMTP Password: [paste your SendGrid API key]

   Sender Email: nex@nexconsultingltd.com
   Sender Name: NeX AI
   ```

5. **Test Again**

---

## 🎯 Critical: Add DKIM Record

**Why**: Without DKIM, emails go to spam.

**How to Fix**:

### Option 1: Via Hostinger

1. **Login to Hostinger**:
   - https://hpanel.hostinger.com

2. **Go to Email Settings**:
   - Dashboard → Emails
   - Click **Email Settings**
   - Look for **DKIM** section

3. **Enable DKIM**:
   - Toggle DKIM **ON**
   - Copy the DKIM record shown

4. **Add to DNS** (if not automatic):
   - Go to: Domains → nexconsultingltd.com → DNS Records
   - Add TXT record:
     ```
     Name: default._domainkey
     Value: [paste DKIM value from email settings]
     ```

5. **Wait 10 minutes** for DNS propagation

6. **Verify**:
   ```bash
   dig +short txt default._domainkey.nexconsultingltd.com
   ```
   Should return the DKIM record.

---

### Option 2: Via SendGrid (Automatic)

If using SendGrid:
1. **Authenticate Domain**:
   - Settings → Sender Authentication
   - Authenticate Your Domain
   - Enter: `nexconsultingltd.com`

2. **Add DNS Records**:
   - SendGrid will show 3 DNS records
   - Copy each record
   - Add to Hostinger DNS

3. **Verify**:
   - Click "Verify" in SendGrid
   - Should show all green checkmarks

**SendGrid automatically configures**:
- ✅ DKIM
- ✅ SPF
- ✅ Return-Path

---

## 📊 Verification Checklist

After setup, verify these:

- [ ] **SMTP Connected**: Test email in Supabase works
- [ ] **Email Received**: Check inbox (not spam)
- [ ] **Links Work**: Confirmation link redirects correctly
- [ ] **DKIM Added**: `dig +short txt default._domainkey.nexconsultingltd.com` returns record
- [ ] **Not Spam**: Email arrives in inbox, not spam folder

---

## 🐛 Troubleshooting

### "SMTP Connection Failed"
- ❌ Wrong password → Reset email password in Hostinger
- ❌ Wrong host → Use `smtp.hostinger.com`
- ❌ Wrong port → Use `587` (not 465)

### "Email Not Received"
- ❌ Check spam folder
- ❌ Wait 2-3 minutes (delay)
- ❌ Check Supabase logs: Authentication → Logs → Filter by "email"

### "Email in Spam"
- ❌ Add DKIM record (see above)
- ❌ Add Reply-To header: `support@nexconsultingltd.com`
- ❌ Consider switching to SendGrid

---

## 📞 Quick Links

**Supabase Dashboard**: https://app.supabase.com
**Hostinger Panel**: https://hpanel.hostinger.com
**SendGrid Signup**: https://signup.sendgrid.com
**Email Tester**: https://www.mail-tester.com

**Test SMTP Script**:
```bash
node scripts/test-smtp-config.js
```

---

**Status**: ⚠️ Action Required
**Priority**: High
**Estimated Time**: 15 minutes

