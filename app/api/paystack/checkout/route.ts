import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/prisma';
import { PLANS, type PlanType } from '@/lib/plans';

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const token = await getToken({ req });
    if (!token || !token.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { plan } = await req.json();
    const planType = plan as PlanType;

    if (!planType || !PLANS[planType]) {
      return NextResponse.json(
        { error: 'Invalid plan selected' },
        { status: 400 }
      );
    }

    if (planType === 'Free') {
      return NextResponse.json(
        { error: 'Cannot checkout for free plan' },
        { status: 400 }
      );
    }

    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: token.id as string },
      select: { id: true, email: true, name: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const selectedPlan = PLANS[planType];

    // Initialize Paystack transaction
    const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: user.email,
        amount: selectedPlan.paystack_amount, // Amount in kobo
        currency: 'NGN',
        callback_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/paystack/callback`,
        metadata: {
          user_id: user.id,
          plan: planType,
          user_email: user.email,
          user_name: user.name || 'NeX AI User'
        },
        channels: ['card', 'bank', 'ussd', 'qr', 'mobile_money', 'bank_transfer'],
      }),
    });

    if (!paystackResponse.ok) {
      const errorData = await paystackResponse.json();
      console.error('Paystack initialization failed:', errorData);
      return NextResponse.json(
        { error: 'Payment initialization failed' },
        { status: 500 }
      );
    }

    const paystackData = await paystackResponse.json();

    if (!paystackData.status || !paystackData.data.authorization_url) {
      return NextResponse.json(
        { error: 'Invalid payment initialization response' },
        { status: 500 }
      );
    }

    console.log(`✅ Payment initialized for user ${user.email} - Plan: ${planType}`);

    return NextResponse.json({
      authorization_url: paystackData.data.authorization_url,
      access_code: paystackData.data.access_code,
      reference: paystackData.data.reference,
    });

  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}