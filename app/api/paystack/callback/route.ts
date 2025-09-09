import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { type PlanType } from '@/lib/plans';
import crypto from 'crypto';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const reference = searchParams.get('reference');

    if (!reference) {
      console.error('No reference provided in callback');
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/pricing?error=invalid_reference`);
    }

    // Verify the transaction with Paystack
    const verifyResponse = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!verifyResponse.ok) {
      console.error('Paystack verification failed');
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/pricing?error=verification_failed`);
    }

    const verifyData = await verifyResponse.json();

    if (!verifyData.status || verifyData.data.status !== 'success') {
      console.error('Transaction not successful:', verifyData);
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/pricing?error=payment_failed`);
    }

    const { metadata, customer } = verifyData.data;
    const userId = metadata.user_id;
    const planType = metadata.plan as PlanType;

    if (!userId || !planType) {
      console.error('Missing metadata in transaction');
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/pricing?error=invalid_metadata`);
    }

    // Calculate plan expiry (30 days from now)
    const planExpiresAt = new Date();
    planExpiresAt.setDate(planExpiresAt.getDate() + 30);

    // Update user's plan in database
    await prisma.user.update({
      where: { id: userId },
      data: {
        plan: planType,
        plan_expires_at: planExpiresAt,
        paystack_customer_id: customer.customer_code || customer.id,
        // Reset usage counters on plan upgrade
        chat_used_today: 0,
        videos_generated_this_week: 0,
        voice_minutes_this_week: 0,
      },
    });

    console.log(`✅ Plan updated successfully: ${userId} -> ${planType}`);

    // Redirect to success page
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/pricing?success=plan_upgraded&plan=${planType.toLowerCase()}`);

  } catch (error) {
    console.error('Callback processing error:', error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/pricing?error=callback_failed`);
  }
}

// Handle webhook for subscription management
export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('x-paystack-signature');

    if (!signature || !process.env.PAYSTACK_SECRET_KEY) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Verify webhook signature
    const hash = crypto
      .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
      .update(body)
      .digest('hex');

    if (hash !== signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const event = JSON.parse(body);

    switch (event.event) {
      case 'charge.success':
        // Handle successful payment
        const { metadata, customer } = event.data;
        if (metadata.user_id && metadata.plan) {
          const planExpiresAt = new Date();
          planExpiresAt.setDate(planExpiresAt.getDate() + 30);

          await prisma.user.update({
            where: { id: metadata.user_id },
            data: {
              plan: metadata.plan,
              plan_expires_at: planExpiresAt,
              paystack_customer_id: customer.customer_code || customer.id,
            },
          });
          
          console.log(`✅ Webhook: Plan activated for user ${metadata.user_id}`);
        }
        break;

      case 'subscription.disable':
        // Handle subscription cancellation
        const customerCode = event.data.customer.customer_code;
        if (customerCode) {
          await prisma.user.updateMany({
            where: { paystack_customer_id: customerCode },
            data: {
              plan: 'Free',
              plan_expires_at: null,
            },
          });
          
          console.log(`✅ Webhook: Subscription disabled for customer ${customerCode}`);
        }
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