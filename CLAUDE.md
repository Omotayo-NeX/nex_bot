# NeX AI Chatbot - Claude Code Documentation

## Paystack Integration Setup

This document provides setup instructions for the Paystack payment integration in the NeX AI chatbot application.

### Environment Variables

The following environment variables need to be configured for Paystack integration:

```bash
# Paystack Configuration
PAYSTACK_SECRET_KEY=sk_test_xxxxxxxxxxxxxx  # Your Paystack secret key (use sk_live_ for production)
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_xxxxxxxxxxxxxx  # Your Paystack public key (use pk_live_ for production)
NEXT_PUBLIC_SITE_URL=http://localhost:3000  # Your site URL for payment redirects (update for production)

# Database Configuration (already configured)
DATABASE_URL="postgresql://postgres.xxx:password@aws-0-region.pooler.supabase.com:5432/postgres"

# NextAuth Configuration (already configured)
AUTH_SECRET=your_auth_secret_here
```

### Getting Paystack API Keys

1. **Create a Paystack Account**:
   - Visit [Paystack](https://paystack.com) and sign up
   - Complete account verification

2. **Get API Keys**:
   - Login to your Paystack dashboard
   - Go to Settings → API Keys & Webhooks
   - Copy your Test/Live public and secret keys

3. **Set up Webhook**:
   - In Paystack dashboard, go to Settings → API Keys & Webhooks
   - Add webhook URL: `https://yourdomain.com/api/paystack/webhook`
   - Select events: `charge.success`, `subscription.create`, `subscription.disable`, `invoice.create`, `invoice.payment_failed`

### Subscription Plans Configuration

The application supports three subscription tiers:

- **Free Plan**: ₦0/month
  - 20 chat messages per day
  - 3 videos per week (watermarked)
  - 5 voice minutes per week

- **Pro Plan**: ₦10,000/month ($10 USD)
  - Unlimited chat messages
  - 50 HD videos per month (no watermark)
  - 300 voice minutes per month

- **Enterprise Plan**: ₦40,000/month ($40 USD)
  - Everything in Pro
  - Unlimited videos and voice
  - Team collaboration features

### Payment Flow

1. User selects a plan on `/pricing` page
2. System calls `/api/paystack/checkout` to initialize payment
3. User is redirected to Paystack payment page
4. After payment, user is redirected back via `/api/paystack/callback`
5. Webhooks handle subscription updates via `/api/paystack/webhook`

### Database Schema Changes

The User model includes subscription fields:

```prisma
model User {
  id                        String         @id @default(uuid()) @db.Uuid
  name                      String?
  email                     String?        @unique
  password                  String?
  plan                      String         @default("free") // free, pro, enterprise
  paystackCustomerCode      String?        // from Paystack API
  subscriptionStatus        String?        // trialing, active, canceled
  chat_used_today           Int            @default(0)
  videos_generated_this_week Int           @default(0)
  voice_minutes_this_week   Int            @default(0)
  plan_expires_at           DateTime?
  paystack_customer_id      String?
  updatedAt                 DateTime       @updatedAt
  // ... other fields
}
```

### API Endpoints

- `POST /api/paystack/checkout` - Initialize payment
- `GET /api/paystack/callback` - Handle payment return
- `POST /api/paystack/webhook` - Handle webhook events
- `GET /api/user/usage` - Get user usage and plan info

### Usage Limits and Middleware

The `lib/subscription.ts` file provides helper functions:

- `getUserSubscription(userId)` - Get user's current subscription
- `checkFeatureAccess(feature, userId)` - Check if user can access a feature
- `checkUsageLimits(userId, feature)` - Check usage limits
- `incrementUsage(userId, feature)` - Increment usage counters

### Frontend Components

- **Pricing Page** (`/pricing`): Displays plans and handles subscription
- **Usage Dashboard**: Shows current usage and plan info
- **Chat Settings**: Includes subscription management in right sidebar

### Testing Paystack Integration

1. Use test API keys (sk_test_xxx, pk_test_xxx)
2. Use test card numbers:
   - **Success**: 4084084084084081
   - **Insufficient Funds**: 4084084084084081 (amount > 300,000)
   - **Invalid CVV**: Use any invalid CVV

### Production Deployment

1. Update environment variables with live Paystack keys
2. Set correct `NEXT_PUBLIC_SITE_URL` for production domain
3. Update webhook URL in Paystack dashboard
4. Test with small amounts before going live

### Security Considerations

- Never expose secret keys in client-side code
- Verify webhook signatures to prevent fraud
- Use HTTPS in production
- Validate all payment data server-side
- Store sensitive data securely

### Support and Troubleshooting

- Check Paystack dashboard for transaction logs
- Monitor webhook delivery in Paystack dashboard
- Use server logs to debug payment issues
- Test payments in development mode first

For technical support, contact NeX Consulting Ltd or check Paystack documentation.