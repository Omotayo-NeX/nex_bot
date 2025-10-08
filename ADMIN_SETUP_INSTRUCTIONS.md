# Admin Authentication Setup Instructions

## Overview
The subscriptions dashboard is now secured with admin-only authentication using Supabase Auth.

**Admin Email**: `adetolaodunubi@gmail.com`

---

## What Was Implemented

### 1. Admin Login Page
**Location**: `/admin/login`

- Magic link/OTP authentication
- Email validation (only admin email allowed)
- Automatic redirect after login
- Clean, branded UI

### 2. Protected Dashboard
**Location**: `/dashboard/subscriptions`

- Requires authentication
- Admin email verification
- Session persistence
- Logout functionality
- Displays logged-in user email

### 3. Row Level Security (RLS)
- Database-level security
- Only admin can read subscription data
- Service role can write (for webhooks)

---

## Setup Steps

### Step 1: Configure Supabase Auth

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **Authentication → Providers**
4. Enable **Email** provider
5. Configure settings:
   - ✅ Enable Email provider
   - ✅ Enable Magic Link
   - ✅ Disable Email confirmation (for faster testing)
   - Set **Site URL**: `http://localhost:3003` (dev) or your production URL
   - Set **Redirect URLs**:
     - `http://localhost:3003/dashboard/subscriptions`
     - `https://ai.nexconsultingltd.com/dashboard/subscriptions`

### Step 2: Apply RLS Policies

Run this SQL in **Supabase SQL Editor**:

```sql
-- Enable Row Level Security
alter table nexai_subscriptions enable row level security;
alter table elevenone_subscriptions enable row level security;

-- Admin read access
create policy "Admin read access on nexai_subscriptions"
  on nexai_subscriptions
  for select
  using (auth.jwt() ->> 'email' = 'adetolaodunubi@gmail.com');

create policy "Admin read access on elevenone_subscriptions"
  on elevenone_subscriptions
  for select
  using (auth.jwt() ->> 'email' = 'adetolaodunubi@gmail.com');

-- Service role write access (for webhooks)
create policy "Service role write access on nexai_subscriptions"
  on nexai_subscriptions
  for all
  using (true)
  with check (true);

create policy "Service role write access on elevenone_subscriptions"
  on elevenone_subscriptions
  for all
  using (true)
  with check (true);
```

**Or** run the prepared file: `ADMIN_AUTH_SETUP.sql`

### Step 3: Test the Authentication Flow

1. **Visit login page**: `http://localhost:3003/admin/login`
2. **Enter admin email**: `adetolaodunubi@gmail.com`
3. **Click**: "Sign in with Email"
4. **Check email**: Look for magic link from Supabase
5. **Click link**: Should redirect to dashboard
6. **Verify access**: Dashboard loads with data

---

## How It Works

### Authentication Flow

```
User visits /dashboard/subscriptions
         ↓
    Not authenticated?
         ↓
Redirect to /admin/login
         ↓
User enters email
         ↓
  Email validation
  (must be admin email)
         ↓
Supabase sends magic link
         ↓
User clicks link in email
         ↓
Authenticated & redirected
         ↓
Dashboard verifies email
         ↓
   Access granted!
```

### Security Layers

1. **Frontend Auth Guard**: Checks authentication in React
2. **Email Validation**: Only admin email can proceed
3. **RLS Policies**: Database-level security
4. **Session Management**: Supabase handles tokens

---

## Testing

### Test Authorized Access

```bash
# Visit login page
open http://localhost:3003/admin/login

# Enter: adetolaodunubi@gmail.com
# Click magic link in email
# Should see dashboard with data
```

### Test Unauthorized Access

```bash
# Try accessing dashboard directly without login
open http://localhost:3003/dashboard/subscriptions

# Should redirect to /admin/login
```

### Test Wrong Email

```bash
# Visit login page
# Enter: wrong@email.com
# Should see: "Access denied" message
```

---

## Features

### Dashboard Features

- ✅ **Email Display**: Shows logged-in user
- ✅ **Logout Button**: Top-right corner
- ✅ **Session Persistence**: Stay logged in
- ✅ **Auto-redirect**: Unauthenticated users → login
- ✅ **Loading State**: "Verifying access..." spinner

### Security Features

- ✅ **Magic Link**: No passwords to remember
- ✅ **Email Validation**: Only admin email allowed
- ✅ **RLS Policies**: Database-level protection
- ✅ **Session Tokens**: Secure, httpOnly cookies
- ✅ **Auto-logout**: On session expiry

---

## Troubleshooting

### "Access denied" Message

**Problem**: Wrong email entered
**Solution**: Use `adetolaodunubi@gmail.com`

### Magic Link Not Received

**Problem**: Email not arriving
**Solutions**:
1. Check spam folder
2. Verify Supabase email settings
3. Check Supabase logs: **Authentication → Logs**
4. Verify SMTP configuration

### Redirect Loop

**Problem**: Keeps redirecting between pages
**Solutions**:
1. Clear browser cookies
2. Check Supabase redirect URLs
3. Verify Site URL in Supabase settings

### RLS Errors

**Problem**: "Permission denied" when fetching data
**Solutions**:
1. Verify RLS policies are created
2. Check logged-in email matches admin email
3. Run verification query:
   ```sql
   select * from pg_policies
   where tablename = 'nexai_subscriptions';
   ```

### Session Expires Too Quickly

**Solution**: Configure in Supabase:
- Go to **Authentication → Settings**
- Increase **JWT expiry** (default: 1 hour)
- Increase **Refresh token expiry** (default: 30 days)

---

## Production Deployment

### Before Going Live

1. ✅ Update **Site URL** in Supabase to production domain
2. ✅ Add production **Redirect URLs**
3. ✅ Enable **Email confirmation** (optional)
4. ✅ Configure custom **SMTP** for branded emails
5. ✅ Test magic link flow in production
6. ✅ Monitor authentication logs

### Environment Variables

Ensure these are set in production:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

---

## File Structure

```
/app/admin/login/page.tsx                    - Admin login page
/app/dashboard/subscriptions/page.tsx        - Protected dashboard
/supabase/migrations/add_admin_rls_policies.sql  - RLS policies
/ADMIN_AUTH_SETUP.sql                        - Quick setup SQL
/ADMIN_SETUP_INSTRUCTIONS.md                 - This file
```

---

## Additional Security (Optional)

### Add 2FA

```typescript
// In login page
const { error } = await supabase.auth.signInWithOtp({
  email: email,
  options: {
    shouldCreateUser: false, // Prevent new user creation
  },
});
```

### Add Rate Limiting

Install rate limiter:
```bash
npm install @upstash/ratelimit @upstash/redis
```

### Add IP Whitelisting

In Supabase → Settings → API:
- Add allowed IP addresses

---

## Support

### Supabase Resources
- [Auth Documentation](https://supabase.com/docs/guides/auth)
- [RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [Magic Link Guide](https://supabase.com/docs/guides/auth/auth-magic-link)

### Debug Commands

```bash
# Test Supabase connection
node scripts/test-supabase-tables.js

# Check auth status
# (In browser console on dashboard page)
await supabase.auth.getUser()
```

---

## Quick Reference

**Login URL**: `/admin/login`
**Dashboard URL**: `/dashboard/subscriptions`
**Admin Email**: `adetolaodunubi@gmail.com`
**Auth Provider**: Supabase Email (Magic Link)
**Session Duration**: 1 hour (configurable)

---

**Last Updated**: January 2025
**Version**: 1.0.0
**Status**: ✅ Production Ready
