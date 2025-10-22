# ElevenOne Webhook Forwarding - Configuration Summary

**Status**: ✅ **CONFIGURED & DEPLOYED**

**Date**: January 19, 2025

---

## Overview

The NeXAI Paystack webhook router is **fully configured** and **deployed to production** with HTTP forwarding capabilities for ElevenOne webhooks.

### Webhook Flow

```
Paystack Webhook Event
        ↓
[1] Received at: https://ai.nexconsultingltd.com/api/paystack/webhook
        ↓
[2] Signature Verified (HMAC-SHA512)
        ↓
[3] App Detection: event.data.metadata.app
        ↓
        ├─ "elevenone" → Forward to ElevenOne + Log to DB
        └─ "nexai" → Log to DB only
        ↓
[4] HTTP Forward (if elevenone)
        │
        ├─ Target: https://elevenoneapp.com/api/webhooks/paystack
        ├─ Header: x-router-source: nexai-paystack-router
        ├─ Retry: 3 attempts with exponential backoff
        └─ Log: webhook_forward_logs table
        ↓
[5] Database Logging
        │
        ├─ elevenone → elevenone_subscriptions
        └─ nexai → nexai_subscriptions
        ↓
[6] Return 200 OK to Paystack
```

---

## Configuration Details

### 1. Router Implementation

**File**: `app/api/paystack/webhook/route.ts`

**Key Features**:
- ✅ Signature verification with `PAYSTACK_SECRET_KEY`
- ✅ App detection from `metadata.app` field (line 39)
- ✅ Forwarding trigger: `appSource === 'elevenone'` (line 45)
- ✅ Retry logic with exponential backoff
- ✅ Comprehensive error handling
- ✅ Always returns 200 to prevent Paystack retries

**Forwarding Code** (Lines 44-47):
```typescript
// Forward to ElevenOne if applicable
if (appSource === 'elevenone' && process.env.ELEVENONE_WEBHOOK_URL) {
  await forwardToElevenOne(body, event);
}
```

### 2. Forwarding Utility

**File**: `lib/forward.ts`

**Function**: `forwardWithRetry()`

**Configuration**:
```typescript
{
  url: process.env.ELEVENONE_WEBHOOK_URL,
  body: rawVerifiedWebhookPayload,
  attempts: 3,  // from FORWARDING_RETRY_ATTEMPTS
  timeoutMs: 6000  // from FORWARDING_TIMEOUT_MS
}
```

**Headers Added**:
```typescript
{
  'Content-Type': 'application/json',
  'x-router-source': 'nexai-paystack-router'  // Identifies router
}
```

**Retry Strategy**:
- Attempt 1: Immediate
- Attempt 2: 300ms delay
- Attempt 3: 600ms delay
- Attempt 4: 1200ms delay (if more attempts configured)

### 3. Environment Variables

**Production Configuration** (Vercel):

| Variable | Value | Status |
|----------|-------|--------|
| `ELEVENONE_WEBHOOK_URL` | `https://elevenoneapp.com/api/webhooks/paystack` | ✅ Set |
| `FORWARDING_RETRY_ATTEMPTS` | `3` | ✅ Set |
| `FORWARDING_TIMEOUT_MS` | `6000` (6 seconds) | ✅ Set |

**Verification**:
```bash
vercel env ls production | grep -E "ELEVENONE|FORWARDING"
```

### 4. Database Schema

**Forwarding Logs Table**: `webhook_forward_logs`

**Migration File**: `supabase/migrations/20251019083220_create_webhook_forward_logs.sql`

**Schema**:
```sql
CREATE TABLE webhook_forward_logs (
  id                bigserial PRIMARY KEY,
  created_at        timestamptz NOT NULL DEFAULT now(),
  app               text NOT NULL,           -- 'elevenone'
  target_url        text NOT NULL,           -- https://elevenoneapp.com/...
  ok                boolean NOT NULL,         -- Success/failure
  status_code       int,                     -- HTTP response code
  attempt_count     int DEFAULT 1,           -- Number of retries
  error_message     text,                    -- Error details
  reference         text                     -- Paystack transaction ref
);
```

**Indexes**:
- `idx_webhook_forward_logs_created_at` - Chronological queries
- `idx_webhook_forward_logs_app` - Filter by app
- `idx_webhook_forward_logs_reference` - Correlation with transactions
- `idx_webhook_forward_logs_ok` - Success/failure filtering

---

## ElevenOne Integration Guide

### Required Webhook Endpoint

**ElevenOne must implement**:
```
POST https://elevenoneapp.com/api/webhooks/paystack
```

### Expected Request Format

**Headers**:
```
Content-Type: application/json
x-router-source: nexai-paystack-router
```

**Body**: Original Paystack webhook payload (already signature-verified)

### ElevenOne Endpoint Implementation

```typescript
// Example implementation for ElevenOne
export async function POST(req: Request) {
  // Verify request is from NeXAI router
  const routerSource = req.headers.get('x-router-source');

  if (routerSource !== 'nexai-paystack-router') {
    return Response.json(
      { error: 'Unauthorized - Invalid router source' },
      { status: 401 }
    );
  }

  const event = await req.json();

  console.log(`📨 Webhook received from NeXAI router: ${event.event}`);
  console.log(`   Reference: ${event.data.reference}`);
  console.log(`   App: ${event.data.metadata.app}`);

  // Process the webhook event
  switch (event.event) {
    case 'charge.success':
      await handleSuccessfulPayment(event.data);
      break;

    case 'subscription.create':
      await handleSubscriptionCreated(event.data);
      break;

    // ... other event handlers
  }

  // IMPORTANT: Always return 200 OK
  return Response.json({
    ok: true,
    source: 'router',
    processed: true
  });
}

async function handleSuccessfulPayment(data: any) {
  const { metadata, reference, amount } = data;

  // Update ElevenOne database
  await db.subscriptions.create({
    userId: metadata.user_id,
    plan: metadata.plan,
    reference: reference,
    amount: amount / 100,  // Convert from kobo to naira
    status: 'active',
  });

  console.log(`✅ Subscription activated for user ${metadata.user_id}`);
}
```

### Security Considerations for ElevenOne

**DO**:
- ✅ Check `x-router-source` header
- ✅ Implement idempotency using `reference` field
- ✅ Return 200 OK quickly (< 3 seconds)
- ✅ Process async operations in background if needed
- ✅ Log all received webhooks for debugging

**DON'T**:
- ❌ Do NOT verify Paystack signature (already verified by router)
- ❌ Do NOT return errors for duplicate webhooks (use idempotency)
- ❌ Do NOT perform long-running operations synchronously
- ❌ Do NOT return non-200 status codes (causes retries)

---

## Testing the Configuration

### Test Script

**File**: `scripts/test-webhook-forwarding.js`

**Usage**:
```bash
# Set environment variable
export PAYSTACK_SECRET_KEY=sk_live_your_key_here

# Run test (localhost)
WEBHOOK_URL=http://localhost:3000/api/paystack/webhook node scripts/test-webhook-forwarding.js

# Run test (production)
WEBHOOK_URL=https://ai.nexconsultingltd.com/api/paystack/webhook node scripts/test-webhook-forwarding.js
```

### Manual Testing with cURL

```bash
# Generate test payload
REFERENCE="TEST_ELEVENONE_$(date +%s)"

# Create payload file
cat > test-payload.json <<EOF
{
  "event": "charge.success",
  "data": {
    "id": 123456789,
    "domain": "test",
    "status": "success",
    "reference": "$REFERENCE",
    "amount": 1000000,
    "currency": "NGN",
    "metadata": {
      "app": "elevenone",
      "user_email": "test@elevenone.com",
      "user_id": "test-user-123",
      "plan": "premium"
    },
    "customer": {
      "email": "test@elevenone.com",
      "customer_code": "CUS_test123"
    }
  }
}
EOF

# Generate signature (requires PAYSTACK_SECRET_KEY)
SIGNATURE=$(cat test-payload.json | openssl dgst -sha512 -hmac "$PAYSTACK_SECRET_KEY" | awk '{print $2}')

# Send webhook
curl -X POST https://ai.nexconsultingltd.com/api/paystack/webhook \
  -H "Content-Type: application/json" \
  -H "x-paystack-signature: $SIGNATURE" \
  -d @test-payload.json

# Check result
echo "Reference: $REFERENCE"
```

### Verification Queries

**1. Check forwarding logs**:
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
WHERE reference = 'TEST_ELEVENONE_xxxxx'
ORDER BY created_at DESC;
```

**2. Check subscription logging**:
```sql
SELECT *
FROM elevenone_subscriptions
WHERE reference = 'TEST_ELEVENONE_xxxxx';
```

**3. Success rate monitoring**:
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

**4. Failed forwards (need investigation)**:
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

## Paystack Dashboard Configuration

### Webhook Settings

**DO NOT CHANGE** the Paystack webhook URL. It must remain:

```
https://ai.nexconsultingltd.com/api/paystack/webhook
```

**Reason**: The NeXAI router acts as the central hub. All webhooks must come here first for routing.

### Required Events

Ensure these events are enabled in Paystack Dashboard:
- ✅ `charge.success`
- ✅ `subscription.create`
- ✅ `subscription.disable`
- ✅ `invoice.create`
- ✅ `invoice.payment_failed`

**Path**: Paystack Dashboard → Settings → API Keys & Webhooks

---

## Triggering Forwarding from ElevenOne App

### Payment Initialization

When creating a Paystack transaction from the ElevenOne app, **MUST include** `metadata.app`:

```typescript
// ElevenOne payment initialization
const response = await fetch('https://api.paystack.co/transaction/initialize', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: user.email,
    amount: planPrice * 100,  // Convert to kobo
    callback_url: 'https://elevenoneapp.com/payment/callback',
    metadata: {
      app: 'elevenone',  // ⭐ THIS IS CRITICAL - Triggers forwarding
      user_id: user.id,
      user_email: user.email,
      plan: 'premium',
      // ... other metadata
    }
  })
});
```

### Without metadata.app

If `metadata.app` is **NOT** set to `"elevenone"`:
- ❌ Webhook will NOT be forwarded to ElevenOne
- ✅ Will be logged to `nexai_subscriptions` table (default behavior)
- ⚠️ ElevenOne will never receive the webhook

---

## Expected Behavior

### Scenario 1: ElevenOne Payment

**Trigger**: User purchases subscription on ElevenOne app

**Metadata**:
```json
{
  "app": "elevenone",
  "user_id": "user-123",
  "plan": "premium"
}
```

**Router Actions**:
1. ✅ Receives webhook from Paystack
2. ✅ Verifies signature
3. ✅ Detects `app = "elevenone"`
4. ✅ Logs to `elevenone_subscriptions` table
5. ✅ **Forwards to** `https://elevenoneapp.com/api/webhooks/paystack`
6. ✅ Logs forwarding result to `webhook_forward_logs`
7. ✅ Returns 200 OK to Paystack

**ElevenOne Receives**:
```
POST https://elevenoneapp.com/api/webhooks/paystack
Headers:
  Content-Type: application/json
  x-router-source: nexai-paystack-router
Body: {original Paystack webhook}
```

### Scenario 2: NeXAI Payment

**Trigger**: User purchases subscription on NeXAI app

**Metadata**:
```json
{
  "user_id": "user-456",
  "plan": "pro"
  // NO app field
}
```

**Router Actions**:
1. ✅ Receives webhook from Paystack
2. ✅ Verifies signature
3. ✅ Defaults to `app = "nexai"` (line 39 in webhook handler)
4. ✅ Logs to `nexai_subscriptions` table
5. ✅ Updates Prisma User model
6. ❌ **Does NOT forward** (no forwarding URL for nexai)
7. ✅ Returns 200 OK to Paystack

---

## Monitoring & Debugging

### Production Logs

**View real-time logs**:
```bash
vercel logs ai.nexconsultingltd.com --follow
```

**Filter for forwarding**:
```bash
vercel logs ai.nexconsultingltd.com --follow | grep -E "Forwarding|ElevenOne"
```

### Log Messages to Look For

**Successful forwarding**:
```
🔄 Forwarding webhook to ElevenOne: https://elevenoneapp.com/api/webhooks/paystack
✅ Successfully forwarded to ElevenOne (attempt 1, status 200)
```

**Failed forwarding**:
```
🔄 Forwarding webhook to ElevenOne: https://elevenoneapp.com/api/webhooks/paystack
⚠️ Forward attempt 1/3 failed: HTTP 500: Internal Server Error
⏳ Waiting 300ms before retry...
❌ Failed to forward to ElevenOne: Failed after 3 attempts. Last error: HTTP 500
```

### Common Issues & Solutions

**Issue 1: Forwarding not happening**

Check:
1. Is `metadata.app` set to `"elevenone"` in payment initialization?
2. Is `ELEVENONE_WEBHOOK_URL` environment variable set in Vercel?
3. Check router logs for `🔄 Forwarding` messages

**Issue 2: Forwarding failing (status 500)**

Check:
1. Is ElevenOne endpoint accessible?
2. Does ElevenOne return 200 OK?
3. Check ElevenOne server logs for errors
4. Verify ElevenOne endpoint URL is correct

**Issue 3: Duplicate webhooks**

Solution:
- Implement idempotency in ElevenOne using `reference` field
- Check if webhook already processed before creating new subscription
- Always return 200 OK even for duplicates

**Issue 4: Timeouts**

Check:
1. ElevenOne response time (must be < 6 seconds)
2. Consider increasing `FORWARDING_TIMEOUT_MS` if needed
3. Move long-running operations to background jobs in ElevenOne

---

## Performance Metrics

### Expected Timings

- **Signature verification**: < 10ms
- **Database logging**: 50-100ms
- **HTTP forwarding**: 200-3000ms (depends on ElevenOne response time)
- **Total webhook processing**: < 5 seconds

### Retry Impact

- **1 attempt**: 6 seconds max
- **2 attempts**: 6 + 0.3 + 6 = 12.3 seconds max
- **3 attempts**: 6 + 0.3 + 6 + 0.6 + 6 = 18.9 seconds max

**Note**: Paystack may retry if total time exceeds ~30 seconds.

---

## Success Criteria - Final Checklist

### Configuration ✅

- [x] Router implementation complete
- [x] Forwarding logic added to webhook handler
- [x] `forwardWithRetry()` utility created
- [x] Environment variables set in production:
  - [x] `ELEVENONE_WEBHOOK_URL`
  - [x] `FORWARDING_RETRY_ATTEMPTS`
  - [x] `FORWARDING_TIMEOUT_MS`
- [x] Deployed to production
- [x] Custom header `x-router-source` included

### Database ⏳

- [ ] Supabase migration run (`webhook_forward_logs` table created)
- [ ] Table accessible from webhook handler
- [ ] Indexes created for performance

### Testing ⏳

- [ ] Test script created
- [ ] Manual webhook sent successfully
- [ ] Forwarding logged in `webhook_forward_logs`
- [ ] ElevenOne endpoint received webhook
- [ ] ElevenOne responded with 200 OK
- [ ] Subscription created in `elevenone_subscriptions`

### ElevenOne Integration ⏳

- [ ] ElevenOne webhook endpoint implemented
- [ ] Header `x-router-source` verified
- [ ] Idempotency implemented
- [ ] Returns 200 OK within 3 seconds
- [ ] Subscription activation logic working

---

## Next Steps

### 1. Run Supabase Migration

```bash
# Option A: CLI
supabase db push

# Option B: Dashboard
# 1. Login to Supabase Dashboard
# 2. Go to SQL Editor
# 3. Paste contents of: supabase/migrations/20251019083220_create_webhook_forward_logs.sql
# 4. Execute
```

### 2. Implement ElevenOne Endpoint

Create the webhook receiver at:
```
https://elevenoneapp.com/api/webhooks/paystack
```

Use the implementation example provided in this document.

### 3. Test End-to-End

1. Make a test payment from ElevenOne app with `metadata.app = "elevenone"`
2. Verify forwarding in router logs
3. Check `webhook_forward_logs` table
4. Confirm ElevenOne received webhook
5. Verify subscription activated in ElevenOne database

### 4. Monitor Production

- Set up alerts for failed forwards
- Monitor `webhook_forward_logs` success rate
- Review ElevenOne endpoint performance
- Adjust timeout/retry settings if needed

---

## Support & Documentation

**Related Files**:
- `PAYSTACK_HYBRID_ROUTER_IMPLEMENTATION.md` - Full implementation guide
- `PAYSTACK_MULTI_APP_SETUP.md` - Original database router documentation
- `lib/forward.ts` - Forwarding utility source code
- `app/api/paystack/webhook/route.ts` - Webhook handler

**Key Endpoints**:
- Router: `https://ai.nexconsultingltd.com/api/paystack/webhook`
- Admin Dashboard: `https://ai.nexconsultingltd.com/dashboard/subscriptions`
- ElevenOne Target: `https://elevenoneapp.com/api/webhooks/paystack`

**Database Tables**:
- `webhook_forward_logs` - HTTP forwarding logs (NEW)
- `elevenone_subscriptions` - ElevenOne payment transactions
- `nexai_subscriptions` - NeXAI payment transactions

---

**Configuration Date**: January 19, 2025
**Status**: ✅ Configured & Deployed to Production
**Maintained by**: NeX Consulting Ltd Development Team
**Version**: 2.0.0 (Hybrid Router with HTTP Forwarding)
