import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { prisma } from '@/lib/prisma';
import { PLANS, type PlanType } from '@/lib/plans';

export async function POST(req: NextRequest) {
  try {
    // Validate environment variables
    if (!process.env.PAYSTACK_SECRET_KEY) {
      console.error('❌ PAYSTACK_SECRET_KEY is not configured');
      return NextResponse.json(
        { error: 'Payment service not configured - missing secret key' },
        { status: 500 }
      );
    }

    if (!process.env.NEXT_PUBLIC_SITE_URL) {
      console.error('❌ NEXT_PUBLIC_SITE_URL is not configured');
      return NextResponse.json(
        { error: 'Site URL not configured' },
        { status: 500 }
      );
    }

    // Log key format for debugging (first/last chars only)
    const keyPrefix = process.env.PAYSTACK_SECRET_KEY.substring(0, 8);
    const keyLength = process.env.PAYSTACK_SECRET_KEY.length;
    console.log('🔑 Paystack key check:', { keyPrefix, keyLength });

    // Authenticate with Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const accessToken = authHeader.substring(7);
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(accessToken);

    if (authError || !authUser) {
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

    if (planType === 'free') {
      return NextResponse.json(
        { error: 'Cannot checkout for free plan' },
        { status: 400 }
      );
    }

    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
      select: { id: true, email: true, name: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const selectedPlan = PLANS[planType];

    console.log(`💳 Initializing Paystack payment:`, {
      email: user.email,
      plan: planType,
      amount: selectedPlan.paystack_amount,
      amountInNaira: selectedPlan.paystack_amount / 100
    });

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
      console.error('❌ Paystack initialization failed:', {
        status: paystackResponse.status,
        statusText: paystackResponse.statusText,
        error: errorData
      });

      // Provide more specific error messages
      if (errorData.message?.includes('Invalid key')) {
        return NextResponse.json(
          {
            error: 'Payment configuration error',
            details: 'Invalid Paystack API key. Please verify your Paystack credentials in the environment variables.'
          },
          { status: 500 }
        );
      }

      return NextResponse.json(
        {
          error: 'Payment initialization failed',
          details: errorData.message || 'Unknown error from payment provider'
        },
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