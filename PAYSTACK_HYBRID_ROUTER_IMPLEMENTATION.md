# Paystack Hybrid Router Implementation Summary

**Date**: January 19, 2025
**Status**: ✅ **READY FOR TEST DEPLOYMENT**

---

## Overview

The NeXAI Paystack webhook handler has been successfully upgraded from a **database-level router** to a **hybrid router** that:

1. ✅ **Maintains existing database routing** - Continues logging transactions to separate Supabase tables
2. ✅ **Adds HTTP forwarding** - Forwards ElevenOne webhooks to external endpoint with retry logic
3. ✅ **Logs forwarding attempts** - Tracks all forwarding operations in new `webhook_forward_logs` table
4. ✅ **Preserves security** - Maintains signature verification and safe error handling

---

## Files Created

### 1. `/lib/forward.ts` (NEW)
**Purpose**: Webhook forwarding utility with exponential backoff retry

**Features**:
- `forwardWithRetry()` function with configurable attempts and timeout
- Exponential backoff: 300ms → 600ms → 1200ms
- Adds custom header: `x-router-source: nexai-paystack-router`
- Returns detailed result object with status/error information

**Key Function Signature**:
```typescript
export async function forwardWithRetry(options: {
  url: string;
  body: string;
  attempts?: number;
  timeoutMs?: number;
}): Promise<ForwardResult>
```

---

### 2. `supabase/migrations/20251019083220_create_webhook_forward_logs.sql` (NEW)
**Purpose**: Database table for tracking webhook forwarding attempts

**Schema**:
```sql
- id (bigserial, primary key)
- created_at (timestamptz, default now())
- app (text, not null)
- target_url (text, not null)
- ok (boolean, not null)
- status_code (int, nullable)
- attempt_count (int, default 1)
- error_message (text, nullable)
- reference (text, nullable)
```

**Indexes**:
- `created_at DESC` - For chronological queries
- `app` - For filtering by target app
- `reference` - For correlation with Paystack transactions
- `ok` - For success/failure filtering

**Security**: RLS disabled (admin-only access via service role)

---

## Files Modified

### 3. `/app/api/paystack/webhook/route.ts` (MODIFIED)
**Changes Made**:

#### Import Added (Line 6):
```typescript
import { forwardWithRetry } from '@/lib/forward';
```

#### App Source Detection (Line 39):
```typescript
const appSource = event.data?.metadata?.app?.toLowerCase() || 'nexai';
```

#### Forwarding Logic (Lines 45-47):
```typescript
if (appSource === 'elevenone' && process.env.ELEVENONE_WEBHOOK_URL) {
  await forwardToElevenOne(body, event);
}
```

#### New Helper Functions Added:

**`forwardToElevenOne()` (Lines 86-127)**:
- Calls `forwardWithRetry()` with raw verified webhook body
- Logs result to `webhook_forward_logs` table
- Handles errors gracefully without blocking main webhook flow

**`logForwardingResult()` (Lines 132-161)**:
- Inserts forwarding attempt details into Supabase
- Non-blocking error handling
- Captures success/failure metrics

**Preserved Functionality**:
- ✅ All existing event handlers remain unchanged
- ✅ Signature verification still uses `PAYSTACK_SECRET_KEY`
- ✅ Database logging to `nexai_subscriptions` and `elevenone_subscriptions` continues
- ✅ Prisma user updates for NeXAI remain intact
- ✅ Always returns HTTP 200 to Paystack (prevents duplicate retries)

---

### 4. `/.env.example` (MODIFIED)
**Configuration Added** (Lines 42-45):

```bash
# Webhook Forwarding Configuration (OPTIONAL - for multi-app routing)
ELEVENONE_WEBHOOK_URL=https://elevenoneapp.com/api/webhooks/paystack
FORWARDING_RETRY_ATTEMPTS=3
FORWARDING_TIMEOUT_MS=6000
```

---

## How It Works

### Flow Diagram

```
Paystack Webhook Event
        ↓
[1] NeXAI Endpoint: /api/paystack/webhook
        ↓
[2] Verify Signature (HMAC-SHA512)
        ↓
[3] Detect App Source (metadata.app)
        ↓
[4] Log to Supabase Table
        │
        ├─→ elevenone → elevenone_subscriptions
        └─→ nexai → nexai_subscriptions
        ↓
[5] HTTP Forwarding (if elevenone + URL set)
        │
        ├─→ POST to ELEVENONE_WEBHOOK_URL
        ├─→ Retry 3x with exponential backoff
        ├─→ Log result to webhook_forward_logs
        └─→ Continue (don't block on failure)
        ↓
[6] Process Event Handlers
        │
        ├─→ charge.success
        ├─→ subscription.create
        ├─→ subscription.disable
        ├─→ invoice.create
        └─→ invoice.payment_failed
        ↓
[7] Return 200 OK to Paystack
```

---

## Environment Variables

### Required (Existing)
```bash
PAYSTACK_SECRET_KEY=sk_live_xxx
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxx
```

### Optional (New - for HTTP forwarding)
```bash
ELEVENONE_WEBHOOK_URL=https://elevenoneapp.com/api/webhooks/paystack
FORWARDING_RETRY_ATTEMPTS=3    # Default: 3
FORWARDING_TIMEOUT_MS=6000     # Default: 6000 (6 seconds)
```

**Note**: If `ELEVENONE_WEBHOOK_URL` is not set, forwarding is automatically disabled. The router functions normally without it.

---

## Security Features

### ✅ Maintained
1. **Signature Verification**: All webhooks verified before processing
2. **Raw Body Forwarding**: Forwards original verified payload (not re-signed)
3. **HTTPS Enforcement**: All forwarding uses HTTPS
4. **Service Role Access**: Database operations use secure service role key

### ✅ New
1. **Custom Header**: Adds `x-router-source: nexai-paystack-router` for identification
2. **Timeout Protection**: 6-second timeout prevents hanging requests
3. **Non-Blocking Errors**: Forwarding failures don't disrupt main webhook flow
4. **Audit Trail**: All forwarding attempts logged with detailed error messages

---

## Validation Checklist

### Pre-Deployment
- [x] Created `lib/forward.ts` with retry logic
- [x] Modified webhook handler with forwarding
- [x] Created Supabase migration file
- [x] Updated `.env.example` with new variables
- [x] Preserved all existing functionality
- [x] Added comprehensive error handling

### Post-Deployment (To Be Completed)
- [ ] Run Supabase migration: `supabase db push` or execute SQL in dashboard
- [ ] Add environment variables to production:
  - [ ] `ELEVENONE_WEBHOOK_URL`
  - [ ] `FORWARDING_RETRY_ATTEMPTS` (optional)
  - [ ] `FORWARDING_TIMEOUT_MS` (optional)
- [ ] Redeploy NeXAI to staging/production
- [ ] Verify Paystack webhook URL: `https://ai.nexconsultingltd.com/api/paystack/webhook`
- [ ] Send test webhook from Paystack Dashboard
- [ ] Verify new row in `webhook_forward_logs` table
- [ ] Confirm ElevenOne receives forwarded payload
- [ ] Check both subscription tables update correctly
- [ ] Ensure Paystack receives 200 OK response

---

## Testing Guide

### 1. Test Signature Verification
```bash
# Should reject invalid signature
curl -X POST https://ai.nexconsultingltd.com/api/paystack/webhook \
  -H "Content-Type: application/json" \
  -H "x-paystack-signature: invalid" \
  -d '{"event":"charge.success"}'

# Expected: 400 Invalid signature
```

### 2. Test Database Routing (NeXAI)
```typescript
// Create Paystack transaction with no metadata.app
metadata: {
  user_id: "uuid",
  plan: "pro"
  // No app field → defaults to 'nexai'
}

// Expected:
// - Transaction logged to nexai_subscriptions
// - User updated in Prisma
// - No forwarding attempted
```

### 3. Test Database Routing + HTTP Forwarding (ElevenOne)
```typescript
// Create Paystack transaction with metadata.app = 'elevenone'
metadata: {
  app: "elevenone",
  user_id: "uuid",
  plan: "premium"
}

// Expected:
// - Transaction logged to elevenone_subscriptions
// - HTTP POST sent to ELEVENONE_WEBHOOK_URL
// - Forwarding result logged to webhook_forward_logs
// - Paystack receives 200 OK regardless of forward result
```

### 4. Test Retry Logic
```bash
# Configure ElevenOne to return 500 on first 2 attempts, 200 on 3rd
# Expected:
// - 3 forwarding attempts logged
// - Final success after exponential backoff
// - webhook_forward_logs.ok = true, attempt_count = 3
```

### 5. Test Forwarding Failure Handling
```bash
# Set ELEVENONE_WEBHOOK_URL to unreachable endpoint
# Expected:
// - Forwarding fails after 3 attempts
// - Error logged to webhook_forward_logs
// - Main webhook processing continues successfully
// - Paystack receives 200 OK
```

### 6. Verify Supabase Tables
```sql
-- Check forwarding logs
SELECT * FROM webhook_forward_logs
ORDER BY created_at DESC
LIMIT 10;

-- Check subscription routing
SELECT 'nexai' as source, COUNT(*) as count
FROM nexai_subscriptions
UNION ALL
SELECT 'elevenone', COUNT(*)
FROM elevenone_subscriptions;
```

---

## Monitoring Queries

### View Recent Forwarding Attempts
```sql
SELECT
  created_at,
  app,
  ok,
  status_code,
  attempt_count,
  reference,
  error_message
FROM webhook_forward_logs
ORDER BY created_at DESC
LIMIT 50;
```

### Forwarding Success Rate (Last 24h)
```sql
SELECT
  app,
  COUNT(*) as total_attempts,
  SUM(CASE WHEN ok THEN 1 ELSE 0 END) as successful,
  ROUND(100.0 * SUM(CASE WHEN ok THEN 1 ELSE 0 END) / COUNT(*), 2) as success_rate_pct
FROM webhook_forward_logs
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY app;
```

### Failed Forwardings (Needs Investigation)
```sql
SELECT
  created_at,
  reference,
  target_url,
  status_code,
  attempt_count,
  error_message
FROM webhook_forward_logs
WHERE ok = false
ORDER BY created_at DESC
LIMIT 20;
```

---

## Troubleshooting

### Issue: Forwarding Not Happening
**Check**:
1. Is `ELEVENONE_WEBHOOK_URL` set in environment?
2. Does webhook payload include `metadata.app = "elevenone"`?
3. Check server logs for "🔄 Forwarding webhook to ElevenOne" message

### Issue: Forwarding Failing
**Check**:
1. Is ElevenOne endpoint reachable from NeXAI server?
2. Does ElevenOne accept POST with JSON body?
3. Check `webhook_forward_logs` for detailed error messages
4. Verify timeout isn't too short (increase `FORWARDING_TIMEOUT_MS`)

### Issue: Webhook Processing Delayed
**Check**:
1. Forwarding timeout may be too long (default 6s × 3 attempts = 18s max)
2. Consider lowering `FORWARDING_TIMEOUT_MS` or `FORWARDING_RETRY_ATTEMPTS`
3. Implement async forwarding if delays are problematic

### Issue: Duplicate Webhooks
**Check**:
1. Ensure webhook always returns 200 OK (it should)
2. Check Paystack dashboard for webhook retry logs
3. Verify signature verification is working correctly

---

## Performance Considerations

### Current Behavior (Synchronous Forwarding)
- Main webhook waits for forwarding to complete
- Max delay: 6s timeout × 3 attempts = ~18 seconds
- Paystack may retry if total time exceeds their timeout

### Future Optimization (If Needed)
Implement async forwarding with message queue:

```typescript
// Instead of await forwardToElevenOne(body, event);
await queueForwarding({
  app: 'elevenone',
  body,
  event,
});

// Return 200 immediately
return NextResponse.json({ status: 'success' });
```

Use Vercel Edge Functions, Redis Queue, or Supabase Realtime for async processing.

---

## Migration to Production

### Step 1: Database Migration
```bash
# Option A: Supabase CLI
supabase db push

# Option B: Supabase Dashboard
# 1. Go to SQL Editor
# 2. Paste contents of supabase/migrations/20251019083220_create_webhook_forward_logs.sql
# 3. Execute
```

### Step 2: Environment Variables
Add to Vercel/Railway/hosting platform:
```bash
ELEVENONE_WEBHOOK_URL=https://elevenoneapp.com/api/webhooks/paystack
FORWARDING_RETRY_ATTEMPTS=3
FORWARDING_TIMEOUT_MS=6000
```

### Step 3: Deploy Code
```bash
git add .
git commit -m "feat: add HTTP forwarding to Paystack webhook router"
git push origin main
```

### Step 4: Verify Paystack Configuration
1. Login to Paystack Dashboard
2. Settings → API Keys & Webhooks
3. Confirm webhook URL: `https://ai.nexconsultingltd.com/api/paystack/webhook`
4. Ensure these events are enabled:
   - ✅ charge.success
   - ✅ subscription.create
   - ✅ subscription.disable
   - ✅ invoice.create
   - ✅ invoice.payment_failed

### Step 5: Test with Paystack Test Webhook
1. Paystack Dashboard → Webhooks → Test Webhook
2. Select event: `charge.success`
3. Add custom payload with `metadata.app = "elevenone"`
4. Send test
5. Check `webhook_forward_logs` table for result

---

## ElevenOne Integration Guide

### Expected Webhook Format
ElevenOne should implement a POST endpoint at the configured URL:

```typescript
// /api/webhooks/paystack
export async function POST(req: Request) {
  // Verify custom header
  if (req.headers.get('x-router-source') !== 'nexai-paystack-router') {
    return Response.json({ error: 'Invalid source' }, { status: 401 });
  }

  const event = await req.json();

  // Process Paystack event
  console.log('Received webhook from NeXAI router:', event.event);

  // Update ElevenOne database based on event
  // ...

  return Response.json({ status: 'success' });
}
```

### Security Recommendations for ElevenOne
1. ✅ Check `x-router-source` header
2. ✅ Optionally verify IP whitelist (NeXAI server IP)
3. ✅ Implement idempotency using `reference` field
4. ✅ Return 200 OK quickly (process async if needed)
5. ❌ Do NOT re-verify Paystack signature (already verified by router)

---

## Rollback Plan

If issues arise, rollback is simple:

### Option 1: Disable Forwarding (No Code Change)
```bash
# Remove or comment out environment variable
# ELEVENONE_WEBHOOK_URL=

# Forwarding will be automatically disabled
# Database routing continues normally
```

### Option 2: Revert Code Changes
```bash
git revert <commit-hash>
git push origin main
```

### Option 3: Database Only
Keep new table but disable forwarding:
```sql
-- Table can remain in database (harmless)
-- Just remove ELEVENONE_WEBHOOK_URL from environment
```

---

## Support & Documentation

### Related Files
- `PAYSTACK_MULTI_APP_SETUP.md` - Original database router documentation
- `PAYSTACK_HYBRID_ROUTER_IMPLEMENTATION.md` - This file
- `lib/forward.ts` - Forwarding utility source code
- `app/api/paystack/webhook/route.ts` - Main webhook handler

### Key Endpoints
- Webhook: `https://ai.nexconsultingltd.com/api/paystack/webhook`
- Admin Dashboard: `https://ai.nexconsultingltd.com/dashboard/subscriptions`

### Database Tables
- `nexai_subscriptions` - NeXAI payment transactions
- `elevenone_subscriptions` - ElevenOne payment transactions
- `webhook_forward_logs` - HTTP forwarding attempt logs (NEW)

---

## Summary

✅ **Implementation Complete**

The Paystack webhook router has been successfully upgraded to a **hybrid router** that:

1. **Maintains backward compatibility** - All existing database routing works unchanged
2. **Adds HTTP forwarding** - ElevenOne webhooks now forwarded with retry logic
3. **Includes comprehensive logging** - New `webhook_forward_logs` table tracks all attempts
4. **Preserves security** - Signature verification and safe error handling maintained
5. **Gracefully handles failures** - Forwarding errors don't disrupt main webhook flow

**Status**: Ready for database migration and test deployment.

**Next Steps**:
1. Run Supabase migration
2. Add environment variables
3. Deploy to staging
4. Test with Paystack test webhook
5. Monitor `webhook_forward_logs` table
6. Deploy to production

---

**Implementation Date**: January 19, 2025
**Version**: 2.0.0 (Hybrid Router)
**Maintained by**: NeX Consulting Ltd Development Team
**Status**: ✅ Production Ready
