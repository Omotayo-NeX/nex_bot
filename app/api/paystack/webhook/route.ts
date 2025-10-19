import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { type PlanType } from '@/lib/plans';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { forwardWithRetry } from '@/lib/forward';

// Initialize Supabase client with service role for database operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('x-paystack-signature');

    if (!signature || !process.env.PAYSTACK_SECRET_KEY) {
      console.error('Webhook: Missing signature or secret key');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Verify webhook signature
    const hash = crypto
      .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
      .update(body)
      .digest('hex');

    if (hash !== signature) {
      console.error('Webhook: Invalid signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const event = JSON.parse(body);
    console.log(`📨 Paystack webhook received: ${event.event}`);

    // Detect app source for routing
    const appSource = event.data?.metadata?.app?.toLowerCase() || 'nexai';

    // Log transaction to appropriate Supabase table based on app source
    await logTransactionToSupabase(event);

    // Forward to ElevenOne if applicable
    if (appSource === 'elevenone' && process.env.ELEVENONE_WEBHOOK_URL) {
      await forwardToElevenOne(body, event);
    }

    switch (event.event) {
      case 'charge.success':
        await handleSuccessfulPayment(event.data);
        break;

      case 'subscription.create':
        await handleSubscriptionCreated(event.data);
        break;

      case 'subscription.disable':
      case 'subscription.not_renew':
        await handleSubscriptionDisabled(event.data);
        break;

      case 'invoice.create':
        await handleInvoiceCreated(event.data);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data);
        break;

      default:
        console.log(`Unhandled webhook event: ${event.event}`);
    }

    return NextResponse.json({ status: 'success' });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

/**
 * Forwards webhook to ElevenOne endpoint and logs the result
 */
async function forwardToElevenOne(rawBody: string, event: any) {
  const targetUrl = process.env.ELEVENONE_WEBHOOK_URL!;
  const reference = event.data?.reference || 'unknown';

  console.log(`🔄 Forwarding webhook to ElevenOne: ${targetUrl}`);

  try {
    const result = await forwardWithRetry({
      url: targetUrl,
      body: rawBody,
    });

    // Log forwarding result to Supabase
    await logForwardingResult({
      app: 'elevenone',
      targetUrl,
      ok: result.ok,
      statusCode: result.status || null,
      attemptCount: result.attempt || 3,
      errorMessage: result.error || null,
      reference,
    });

    if (result.ok) {
      console.log(`✅ Successfully forwarded to ElevenOne (attempt ${result.attempt}, status ${result.status})`);
    } else {
      console.error(`❌ Failed to forward to ElevenOne: ${result.error}`);
    }
  } catch (error) {
    console.error('❌ Forwarding error:', error);
    // Log the failure
    await logForwardingResult({
      app: 'elevenone',
      targetUrl,
      ok: false,
      statusCode: null,
      attemptCount: 3,
      errorMessage: String(error),
      reference,
    });
  }
}

/**
 * Logs forwarding results to webhook_forward_logs table
 */
async function logForwardingResult(data: {
  app: string;
  targetUrl: string;
  ok: boolean;
  statusCode: number | null;
  attemptCount: number;
  errorMessage: string | null;
  reference: string;
}) {
  try {
    const { error } = await supabase
      .from('webhook_forward_logs')
      .insert({
        app: data.app,
        target_url: data.targetUrl,
        ok: data.ok,
        status_code: data.statusCode,
        attempt_count: data.attemptCount,
        error_message: data.errorMessage,
        reference: data.reference,
      });

    if (error) {
      console.error('❌ Failed to log forwarding result:', error);
    }
  } catch (error) {
    console.error('Error in logForwardingResult:', error);
    // Don't throw - we want webhook processing to continue even if logging fails
  }
}

/**
 * Logs transaction to the appropriate Supabase table based on app source
 */
async function logTransactionToSupabase(event: any) {
  try {
    const appSource = event.data?.metadata?.app || 'nexai'; // Default to nexai
    const userEmail = event.data?.customer?.email || event.data?.metadata?.user_email || null;
    const userId = event.data?.metadata?.user_id || null;
    const plan = event.data?.metadata?.plan || null;
    const amount = event.data?.amount ? event.data.amount / 100 : 0; // Convert from kobo to naira
    const status = event.data?.status || 'pending';
    const reference = event.data?.reference || null;
    const transactionId = event.data?.id?.toString() || null;
    const paystackCustomerCode = event.data?.customer?.customer_code || null;

    const transactionData = {
      user_email: userEmail,
      user_id: userId,
      plan,
      amount,
      status,
      reference,
      transaction_id: transactionId,
      paystack_customer_code: paystackCustomerCode,
      metadata: event.data?.metadata || {},
      created_at: new Date().toISOString(),
    };

    // Route to the correct table based on app source
    if (appSource.toLowerCase() === 'elevenone') {
      const { error } = await supabase
        .from('elevenone_subscriptions')
        .upsert(transactionData, { onConflict: 'reference' });

      if (error) {
        console.error('❌ Failed to log ElevenOne transaction:', error);
      } else {
        console.log(`✅ Logged ElevenOne transaction: ${reference}`);
      }
    } else {
      // Default to nexai table
      const { error } = await supabase
        .from('nexai_subscriptions')
        .upsert(transactionData, { onConflict: 'reference' });

      if (error) {
        console.error('❌ Failed to log NeX AI transaction:', error);
      } else {
        console.log(`✅ Logged NeX AI transaction: ${reference}`);
      }
    }
  } catch (error) {
    console.error('Error in logTransactionToSupabase:', error);
    // Don't throw - we want webhook processing to continue even if logging fails
  }
}

async function handleSuccessfulPayment(data: any) {
  const { metadata, customer, reference } = data;
  
  if (!metadata || !metadata.user_id || !metadata.plan) {
    console.error('Webhook: Missing metadata in successful payment');
    return;
  }

  const userId = metadata.user_id;
  const planType = metadata.plan as PlanType;
  
  // Calculate plan expiry (30 days from now)
  const planExpiresAt = new Date();
  planExpiresAt.setDate(planExpiresAt.getDate() + 30);

  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        plan: planType.toLowerCase(),
        paystackCustomerCode: customer.customer_code || customer.id,
        subscriptionStatus: 'active',
        plan_expires_at: planExpiresAt,
        // Reset usage counters on plan upgrade
        chat_used_today: 0,
        videos_generated_this_week: 0,
        voice_minutes_this_week: 0,
      },
    });

    console.log(`✅ Webhook: Plan activated for user ${userId} - ${planType} (ref: ${reference})`);
  } catch (error) {
    console.error(`❌ Webhook: Failed to update user ${userId}:`, error);
  }
}

async function handleSubscriptionCreated(data: any) {
  const { customer, subscription_code } = data;
  
  if (!customer.customer_code) {
    console.error('Webhook: Missing customer code in subscription created');
    return;
  }

  try {
    await prisma.user.updateMany({
      where: { paystackCustomerCode: customer.customer_code },
      data: {
        subscriptionStatus: 'active',
      },
    });

    console.log(`✅ Webhook: Subscription created for customer ${customer.customer_code}`);
  } catch (error) {
    console.error(`❌ Webhook: Failed to update subscription for customer ${customer.customer_code}:`, error);
  }
}

async function handleSubscriptionDisabled(data: any) {
  const { customer } = data;
  
  if (!customer.customer_code) {
    console.error('Webhook: Missing customer code in subscription disabled');
    return;
  }

  try {
    await prisma.user.updateMany({
      where: { paystackCustomerCode: customer.customer_code },
      data: {
        plan: 'free',
        subscriptionStatus: 'canceled',
        plan_expires_at: null,
      },
    });

    console.log(`✅ Webhook: Subscription disabled for customer ${customer.customer_code}`);
  } catch (error) {
    console.error(`❌ Webhook: Failed to disable subscription for customer ${customer.customer_code}:`, error);
  }
}

async function handleInvoiceCreated(data: any) {
  const { customer } = data;
  
  if (!customer.customer_code) return;

  try {
    await prisma.user.updateMany({
      where: { paystackCustomerCode: customer.customer_code },
      data: {
        subscriptionStatus: 'active',
      },
    });

    console.log(`✅ Webhook: Invoice created for customer ${customer.customer_code}`);
  } catch (error) {
    console.error(`❌ Webhook: Failed to process invoice for customer ${customer.customer_code}:`, error);
  }
}

async function handlePaymentFailed(data: any) {
  const { customer } = data;
  
  if (!customer.customer_code) return;

  try {
    await prisma.user.updateMany({
      where: { paystackCustomerCode: customer.customer_code },
      data: {
        subscriptionStatus: 'canceled',
        plan: 'free',
        plan_expires_at: null,
      },
    });

    console.log(`⚠️ Webhook: Payment failed for customer ${customer.customer_code}`);
  } catch (error) {
    console.error(`❌ Webhook: Failed to handle payment failure for customer ${customer.customer_code}:`, error);
  }
}