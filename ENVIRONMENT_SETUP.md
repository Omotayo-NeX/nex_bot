# 🔒 Environment Variables Setup Guide

## ⚠️ SECURITY WARNING
**NEVER commit `.env` files to Git!** All sensitive keys must be stored as environment variables.

## 🛡️ Required Environment Variables

### Core Application
```bash
# NextAuth Configuration
NEXTAUTH_SECRET=your_random_32_character_secret
NEXTAUTH_URL=https://yourdomain.com  # or http://localhost:3000 for local dev

# Database
DATABASE_URL="postgresql://user:password@host:port/database"

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OpenAI
OPENAI_API_KEY=sk-your_openai_api_key
NEX_PROMPT_ID=pmpt_your_custom_prompt_id

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### Optional Features
```bash
# ElevenLabs (Voice Generation)
ELEVENLABS_API_KEY=sk_your_elevenlabs_api_key

# Paystack (Nigerian Payments)
PAYSTACK_SECRET_KEY=sk_live_or_test_key
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_or_test_key

# Gemini AI (Alternative Image Generation)
GEMINI_API_KEY=your_gemini_api_key

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

## 🚀 Vercel Deployment Setup

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Select your project → Settings → Environment Variables

2. **Add Required Variables**
   Copy all required variables above into Vercel's environment variables section.

3. **Set for All Environments**
   Make sure to enable variables for:
   - ✅ Production
   - ✅ Preview  
   - ✅ Development

## 🏠 Local Development Setup

1. **Create `.env.local`** (NEVER commit this file!)
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your actual keys
   ```

2. **Verify Environment Variables**
   ```bash
   npm run build  # Will show validation errors if keys are missing
   ```

## 🔍 Environment Validation

The app automatically validates all environment variables at startup:

- ✅ **Required variables**: App fails to start if missing
- ⚠️ **Optional variables**: Shows warnings but continues
- 🔑 **Format validation**: Checks API key formats (sk-, pk-, etc.)

## 🚨 Security Best Practices

### ✅ DO:
- Store all secrets in environment variables
- Use different keys for development/production
- Rotate API keys regularly
- Use `.env.local` for local development
- Add all `.env*` files to `.gitignore`

### ❌ DON'T:
- Commit any `.env` files to Git
- Share API keys in chat/email/docs
- Use production keys in development
- Hardcode secrets in source code
- Store secrets in client-side code

## 🔧 Troubleshooting

### Environment Variable Not Found
```bash
Error: Missing required environment variable: OPENAI_API_KEY
```
**Solution**: Add the missing variable to your environment or `.env.local`

### Invalid API Key Format
```bash
Error: Invalid environment variable: OPENAI_API_KEY (must start with sk-)
```
**Solution**: Check your API key format - OpenAI keys start with `sk-`

### Vercel Deployment Issues
1. Check Vercel Dashboard → Project → Settings → Environment Variables
2. Ensure all required variables are set for Production environment
3. Redeploy the project after adding variables

## 📋 Environment Variables Checklist

### Local Development (.env.local)
- [ ] NEXTAUTH_SECRET
- [ ] NEXTAUTH_URL  
- [ ] DATABASE_URL
- [ ] NEXT_PUBLIC_SUPABASE_URL
- [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY
- [ ] SUPABASE_SERVICE_ROLE_KEY
- [ ] OPENAI_API_KEY
- [ ] NEX_PROMPT_ID
- [ ] GOOGLE_CLIENT_ID
- [ ] GOOGLE_CLIENT_SECRET

### Vercel Production
- [ ] All variables above configured in Vercel Dashboard
- [ ] Variables enabled for Production environment
- [ ] No `.env.vercel` file in repository (security risk!)

### Optional Features
- [ ] ELEVENLABS_API_KEY (for voice generation)
- [ ] PAYSTACK_SECRET_KEY (for payments)
- [ ] NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY
- [ ] GEMINI_API_KEY (for image generation)

## 🆘 Support

If you encounter issues:
1. Check this guide first
2. Verify all environment variables are set
3. Check Vercel deployment logs
4. Test locally with `npm run dev`

---
**Last Updated**: January 2025
**Security Level**: 🔒 HIGH - Follow all guidelines strictly