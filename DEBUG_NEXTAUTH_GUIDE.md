# NextAuth + Vercel Debugging Guide

## 🚨 Common Login Crash Issues & Solutions

### Issue 1: "Application error: a client-side exception has occurred"

**Root Causes:**
1. **Environment Variables Missing** - Most common cause
2. **Database Connection Issues** - Prisma/Supabase connection problems
3. **Plan Type Mismatches** - Using 'Free' vs 'free' in different parts of app
4. **NextAuth Configuration Errors** - Provider or callback issues

---

## 🔍 How to Check Vercel Deployment Logs

### Method 1: Vercel CLI (Recommended)
```bash
# Install Vercel CLI if not installed
npm i -g vercel

# Login to Vercel
vercel login

# Check live logs (shows real-time errors)
vercel logs https://your-deployment-url.vercel.app --follow

# Check logs for specific deployment
vercel logs dpl_XXXXXXXXXXXXXXXX
```

### Method 2: Vercel Dashboard
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Click **Functions** tab
4. Click on `/api/auth/[...nextauth]` function
5. View **Invocations** and **Logs** tabs
6. Look for error messages and stack traces

### Method 3: Real-Time Function Logs
```bash
# View function-specific logs
vercel logs --follow --scope=functions

# Filter for auth-related logs
vercel logs --follow | grep -i "auth\\|nextauth\\|login"
```

---

## 🌐 Browser Console Debugging

### Open Browser Developer Tools
1. **Chrome/Edge**: F12 or Ctrl+Shift+I
2. **Firefox**: F12 or Ctrl+Shift+K
3. **Safari**: Cmd+Option+I

### Check for Client-Side Errors
```javascript
// In browser console, check for NextAuth session errors
await fetch('/api/auth/session')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);

// Check for authentication callback errors
window.addEventListener('message', (e) => {
  if (e.data?.type === 'oauth') {
    console.log('OAuth message:', e.data);
  }
});
```

### Network Tab Investigation
1. Go to **Network** tab in DevTools
2. Try to login
3. Look for failed requests to:
   - `/api/auth/callback/credentials`
   - `/api/auth/session`
   - `/api/auth/signin`
4. Check response bodies for error details

---

## ⚙️ Environment Variables Checklist

### Required for NextAuth + Supabase + OpenAI:

```bash
# Authentication (CRITICAL)
NEXTAUTH_SECRET=xxxxx           # 32+ characters
NEXTAUTH_URL=https://your-domain.com

# Database (CRITICAL)
DATABASE_URL=postgresql://xxxxx

# Supabase (CRITICAL)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxx

# OpenAI (CRITICAL)
OPENAI_API_KEY=sk-xxxxx

# Google OAuth (if using Google login)
GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxx
```

### Verify Environment Variables in Vercel:
1. Go to **Project Settings** → **Environment Variables**
2. Ensure all required variables are set for **Production**
3. Check that values don't have extra spaces or quotes
4. Redeploy after changing environment variables

---

## 🔧 Local Testing Commands

### Test Environment Variables
```bash
# Check if environment variables are loaded
node -e "console.log('NEXTAUTH_SECRET:', !!process.env.NEXTAUTH_SECRET)"
node -e "console.log('DATABASE_URL:', !!process.env.DATABASE_URL)"
node -e "console.log('OPENAI_API_KEY:', !!process.env.OPENAI_API_KEY)"
```

### Test Database Connection
```bash
# Test Prisma connection
npx prisma db pull

# Test database query
npx prisma studio
```

### Test NextAuth Locally
```bash
# Start development server with debug mode
NEXTAUTH_DEBUG=1 npm run dev

# Check NextAuth configuration
curl http://localhost:3000/api/auth/providers
```

---

## 🏥 Emergency Fixes

### Fix 1: Reset NextAuth Configuration
```typescript
// Minimal working auth config for testing
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      authorize: async (credentials) => {
        // Minimal test - replace with real auth logic
        if (credentials?.email && credentials?.password) {
          return {
            id: "1",
            email: credentials.email,
            name: "Test User"
          };
        }
        return null;
      }
    })
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  debug: process.env.NODE_ENV === "development"
};
```

### Fix 2: Environment Variables Not Loading
```bash
# Ensure .env.local exists and is properly formatted
cp .env.example .env.local

# Restart development server
npm run dev
```

### Fix 3: Database Schema Issues
```sql
-- Check if User table exists with required columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'User';

-- Add missing plan column if needed
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "plan" TEXT DEFAULT 'free';
```

---

## 📊 Success Indicators

### Successful Login Logs Should Show:
```
✅ All required environment variables are present
✅ Credentials authorization successful for user@example.com
✅ JWT callback successful for user_id_123
✅ Session callback successful for user_id_123
✅ Sign in successful: user@example.com
```

### Successful API Responses:
```bash
# Test session endpoint
curl https://your-domain.com/api/auth/session

# Should return user session data, not an error
```

---

## 🚀 Deployment Checklist

1. **Environment Variables Set in Vercel** ✅
2. **Database Schema Updated** ✅
3. **NextAuth Configuration Valid** ✅
4. **No TypeScript Errors** ✅
5. **Local Testing Passes** ✅

### Deploy Command:
```bash
# Build and test locally first
npm run build

# Deploy to Vercel
vercel --prod

# Check deployment logs immediately
vercel logs --follow
```

---

## 📞 When to Contact Support

If after following this guide you still see:
- "Application error: a client-side exception has occurred"
- Blank pages after login
- Infinite redirect loops
- Session not persisting

**Provide this information:**
1. Full error message from Vercel logs
2. Browser console errors
3. Environment variables list (without values)
4. Steps that trigger the error
5. Whether it works locally vs production

---

## 🔍 Quick Diagnostic Commands

```bash
# Check deployment status
vercel ls

# Check environment variables (without values)
vercel env ls

# Download deployment logs
vercel logs [deployment-url] > debug.log

# Test API endpoints
curl -I https://your-domain.com/api/auth/providers
curl -I https://your-domain.com/api/auth/session
```