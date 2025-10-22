# NeX AI - Production Deployment Guide

## Table of Contents
1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Environment Variables](#environment-variables)
3. [Database Setup](#database-setup)
4. [Vercel Deployment](#vercel-deployment)
5. [Post-Deployment](#post-deployment)
6. [Monitoring & Maintenance](#monitoring--maintenance)
7. [Troubleshooting](#troubleshooting)

---

## Pre-Deployment Checklist

Before deploying to production, ensure you have:

- [ ] Valid Supabase project (unpaused, production-ready)
- [ ] OpenAI API key with billing enabled
- [ ] Paystack account with live API keys
- [ ] Custom domain configured (optional but recommended)
- [ ] All environment variables prepared
- [ ] Database migrations run successfully
- [ ] Test all critical flows (auth, chat, payments)

---

## Environment Variables

### Required Variables

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Database (use pooler for production)
DATABASE_URL=postgresql://postgres:password@aws-x-region.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1

# OpenAI
OPENAI_API_KEY=sk-...
NEX_PROMPT_ID=your-prompt-id

# Paystack (Production Keys - use sk_live_ and pk_live_)
PAYSTACK_SECRET_KEY=sk_live_...
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_...

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://ai.nexconsultingltd.com
NODE_ENV=production
```

---

## Database Setup

### 1. Run Required Scripts

```bash
# Generate Prisma client
npx prisma generate

# Create OpenAI cost tracking table
node scripts/create-openai-cost-table.js

# Verify setup
node scripts/verify-cost-tracking.js
```

---

## Vercel Deployment

### 1. Quick Deploy

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

### 2. Set Environment Variables

In Vercel Dashboard → Project Settings → Environment Variables, add all variables from above.

### 3. Configure Domain

```bash
# Add custom domain
vercel domains add ai.nexconsultingltd.com
```

---

## Post-Deployment

### 1. Configure Paystack Webhooks

**Webhook URL:** `https://ai.nexconsultingltd.com/api/paystack/webhook`

**Events to subscribe:**
- charge.success
- subscription.create
- subscription.disable
- invoice.create
- invoice.payment_failed

### 2. Test Critical Flows

- [ ] Homepage loads
- [ ] User signup/signin
- [ ] Chat works
- [ ] Image generation
- [ ] Payment processing
- [ ] Admin dashboard

---

## Monitoring

**View Logs:**
```bash
vercel logs --follow
```

**Check Analytics:**
- Vercel Analytics Dashboard
- /analytics page
- /admin/dashboard page

---

## Troubleshooting

**Common Issues:**

1. **"fetch failed" errors** - Supabase paused → Unpause in dashboard
2. **Database errors** - Check connection pooler settings
3. **Payment failures** - Verify webhook URL and Paystack keys
4. **Build failures** - Check `vercel logs`

---

## Emergency Rollback

```bash
# List deployments
vercel ls

# Rollback
vercel rollback [deployment-url]
```

---

## Support

- Email: nexconsultingltd@gmail.com
- GitHub: Create an issue

---

Last Updated: 2025-10-18
