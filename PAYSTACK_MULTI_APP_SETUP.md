# Paystack Multi-App Integration Setup

This document describes the shared Paystack webhook integration that handles payments from multiple NeX Consulting applications.

## Overview

The NeX AI application now serves as a central webhook endpoint for all NeX Consulting app payments, including:
- **NeX AI**: AI chatbot with subscription plans
- **ElevenOne (11:1)**: Scripture and Bible app powered by AI

All payment transactions are logged in separate Supabase tables for easy tracking and reporting.

## Database Schema

### Tables Created

Two Supabase tables have been created to store subscription data:

1. **nexai_subscriptions** - Stores NeX AI payment transactions
2. **elevenone_subscriptions** - Stores ElevenOne payment transactions

Both tables have the same structure:

```sql
- id (uuid, primary key)
- user_email (text)
- user_id (text)
- plan (text)
- amount (numeric)
- status (text)
- reference (text, unique)
- transaction_id (text)
- paystack_customer_code (text)
- metadata (jsonb)
- created_at (timestamp)
- updated_at (timestamp)
```

### Running the Migration

To create these tables in your Supabase database:

1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Run the migration file: `supabase/migrations/create_subscription_tables.sql`

Or use the Supabase CLI:

```bash
supabase db push
```

## Environment Variables

Ensure these environment variables are set in your `.env` or `.env.local`:

```bash
# Supabase Configuration (Already set in .env)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Paystack Configuration (Already set in .env)
PAYSTACK_SECRET_KEY=sk_live_your_paystack_secret_key
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_your_paystack_public_key

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Webhook Configuration

### Setting Up the Webhook in Paystack Dashboard

1. Log in to your [Paystack Dashboard](https://dashboard.paystack.com)
2. Go to **Settings → API Keys & Webhooks**
3. Add the webhook URL:

   **Production:**
   ```
   https://ai.nexconsultingltd.com/api/paystack/webhook
   ```

   **Development:**
   ```
   http://localhost:3000/api/paystack/webhook
   ```

4. Select the following webhook events:
   - ✅ `charge.success`
   - ✅ `subscription.create`
   - ✅ `subscription.disable`
   - ✅ `invoice.create`
   - ✅ `invoice.payment_failed`

### How It Works

When a payment is made from any NeX Consulting app:

1. The app includes metadata in the Paystack payment initialization:
   ```javascript
   {
     metadata: {
       app: "elevenone",  // or "nexai"
       user_email: "user@example.com",
       user_id: "user-uuid",
       plan: "premium"
     }
   }
   ```

2. Paystack sends a webhook to the shared endpoint: `/api/paystack/webhook`

3. The webhook handler:
   - Verifies the Paystack signature for security
   - Extracts the `app` field from metadata
   - Routes the transaction to the correct Supabase table:
     - `"elevenone"` → `elevenone_subscriptions`
     - `"nexai"` → `nexai_subscriptions` (default)
   - Updates the user's subscription in the Prisma database (for NeX AI users)

## Implementation for Other Apps (ElevenOne)

To integrate ElevenOne or other apps with this shared webhook:

### Frontend Payment Initialization

```typescript
// In your ElevenOne app
const response = await fetch('/api/payments/initialize', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: user.email,
    amount: planPrice * 100, // Convert to kobo
    metadata: {
      app: "elevenone",  // IMPORTANT: Identifies the app
      user_email: user.email,
      user_id: user.id,
      plan: "premium"
    }
  })
});

// Redirect to Paystack checkout
const { authorization_url } = await response.json();
window.location.href = authorization_url;
```

### Backend Paystack Initialization

```typescript
// In your ElevenOne backend API
const paystack = require('paystack')(process.env.PAYSTACK_SECRET_KEY);

const response = await paystack.transaction.initialize({
  email: userEmail,
  amount: amount * 100,
  callback_url: 'https://your-app.com/payment/callback',
  metadata: {
    app: 'elevenone',  // IMPORTANT
    user_email: userEmail,
    user_id: userId,
    plan: planName
  }
});
```

## Admin Dashboard

Access the unified subscriptions dashboard at:

```
/dashboard/subscriptions
```

### Features:

- **View all transactions** from both NeX AI and ElevenOne
- **Filter by app source** (All, NeX AI, ElevenOne)
- **Filter by payment status** (Success, Pending, Failed)
- **Search** by email, reference, or plan name
- **Real-time stats**: Total transactions, successful payments, total revenue
- **Responsive design** following NeX AI's brand guidelines

### Access Control

Currently, the dashboard is accessible to all authenticated users. You may want to add admin-only access:

```typescript
// Add to page.tsx
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function SubscriptionsDashboard() {
  const session = await getServerSession();

  // Add admin check
  if (!session || session.user.role !== 'admin') {
    redirect('/');
  }

  // ... rest of component
}
```

## Testing

### Test with Paystack Test Keys

1. Switch to test API keys:
   ```bash
   PAYSTACK_SECRET_KEY=sk_test_your_test_key
   NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_your_test_key
   ```

2. Use Paystack test cards:
   - **Success**: `4084084084084081`
   - **CVV**: Any 3 digits
   - **Expiry**: Any future date
   - **PIN**: `0000`
   - **OTP**: `123456`

3. Test the webhook locally using ngrok:
   ```bash
   ngrok http 3000
   # Use the ngrok URL in Paystack dashboard
   # Example: https://abc123.ngrok.io/api/paystack/webhook
   ```

### Verify Transaction Logging

After making a test payment:

1. Check your Supabase table:
   ```sql
   SELECT * FROM nexai_subscriptions ORDER BY created_at DESC LIMIT 10;
   ```

2. Visit the dashboard: `/dashboard/subscriptions`

3. Check server logs for confirmation messages:
   ```
   ✅ Logged NeX AI transaction: ref_abc123
   ```

## Security Considerations

1. **Signature Verification**: All webhooks verify Paystack's signature to prevent fraud
2. **Environment Variables**: Never expose secret keys in client-side code
3. **HTTPS Required**: Always use HTTPS in production
4. **Service Role Key**: Only use on the server side, never expose to client
5. **Idempotency**: Uses `reference` as unique key to prevent duplicate entries

## Troubleshooting

### Webhook Not Receiving Events

1. Check Paystack dashboard → Webhooks → View Logs
2. Verify webhook URL is correct and accessible
3. Check server logs for errors
4. Ensure HTTPS is enabled (Paystack requires HTTPS in production)

### Transactions Not Appearing in Dashboard

1. Check Supabase table directly using SQL Editor
2. Verify environment variables are correct
3. Check server console for error messages
4. Ensure `metadata.app` is set correctly in payment initialization

### Database Permission Errors

1. Verify Row Level Security (RLS) policies allow service role access
2. Check that `SUPABASE_SERVICE_ROLE_KEY` is set correctly
3. Review Supabase logs for detailed error messages

## Production Deployment

Before going live:

1. ✅ Update to live Paystack keys (`sk_live_*`, `pk_live_*`)
2. ✅ Set correct `NEXT_PUBLIC_SITE_URL` for production domain
3. ✅ Update webhook URL in Paystack dashboard to production URL
4. ✅ Enable HTTPS on your domain
5. ✅ Test with small amounts first
6. ✅ Set up monitoring for webhook failures
7. ✅ Add admin authentication to dashboard
8. ✅ Review and test all payment flows

## Support

For technical issues:
- **NeX AI Team**: Contact development team
- **Paystack Support**: https://support.paystack.com
- **Supabase Support**: https://supabase.com/support

## File Structure

```
/app/api/paystack/webhook/route.ts  - Shared webhook handler
/app/dashboard/subscriptions/page.tsx  - Admin dashboard
/supabase/migrations/create_subscription_tables.sql  - Database schema
/PAYSTACK_MULTI_APP_SETUP.md  - This file
```

## Next Steps

1. Run the Supabase migration to create tables
2. Test webhook locally with ngrok
3. Deploy to production
4. Configure ElevenOne app to use the shared webhook
5. Monitor transactions in the dashboard

---

**Last Updated**: January 2025
**Version**: 1.0.0
**Maintained by**: NeX Consulting Ltd Development Team
