import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    // Authenticate with Supabase
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: { Authorization: `Bearer ${token}` }
        }
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      // Get organization profile
      const profile = await prisma.organizationProfile.findUnique({
        where: { userId: user.id }
      });

      if (!profile) {
        return NextResponse.json({ profile: null, needsOnboarding: true });
      }

      return NextResponse.json({ profile, needsOnboarding: false });
    } catch (dbError: any) {
      // Handle case where table doesn't exist yet
      console.warn('Database error (table might not exist):', dbError.message);
      return NextResponse.json({ profile: null, needsOnboarding: true });
    }
  } catch (error: any) {
    console.error('GET /api/expensa/profile error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // Try to get auth from header first, then from cookies
    const authHeader = req.headers.get('authorization');
    let user;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          global: {
            headers: { Authorization: `Bearer ${token}` }
          }
        }
      );

      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      if (authError || !authUser) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      user = authUser;
    } else {
      // Try to get user from cookies (for client-side requests without explicit auth header)
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { data: { user: cookieUser }, error: cookieError } = await supabase.auth.getUser();
      if (cookieError || !cookieUser) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      user = cookieUser;
    }

    // Parse request body
    const body = await req.json();
    const {
      organizationName,
      website,
      phoneNumber,
      address,
      representativeName,
      businessEmail,
      monthlyBudget,
      currency
    } = body;

    // Validation
    if (!organizationName || !phoneNumber || !address || !representativeName || !businessEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (monthlyBudget && monthlyBudget < 0) {
      return NextResponse.json(
        { error: 'Budget must be a positive number' },
        { status: 400 }
      );
    }

    try {
      // Check if profile already exists
      const existingProfile = await prisma.organizationProfile.findUnique({
        where: { userId: user.id }
      });

      let profile;
      if (existingProfile) {
        // Update existing profile
        profile = await prisma.organizationProfile.update({
          where: { userId: user.id },
          data: {
            organizationName,
            website: website || null,
            phoneNumber,
            address,
            representativeName,
            businessEmail,
            monthlyBudget: monthlyBudget || 100000,
            currency: currency || 'NGN',
            onboardingCompleted: true
          }
        });
      } else {
        // Create new profile
        profile = await prisma.organizationProfile.create({
          data: {
            userId: user.id,
            organizationName,
            website: website || null,
            phoneNumber,
            address,
            representativeName,
            businessEmail,
            monthlyBudget: monthlyBudget || 100000,
            currency: currency || 'NGN',
            onboardingCompleted: true
          }
        });
      }

      return NextResponse.json(profile, { status: existingProfile ? 200 : 201 });
    } catch (dbError: any) {
      console.error('Database error in POST:', dbError);
      return NextResponse.json(
        {
          error: 'Database table not ready. Please run the migration first.',
          details: dbError.message
        },
        { status: 503 }
      );
    }
  } catch (error: any) {
    console.error('POST /api/expensa/profile error:', error);
    return NextResponse.json(
      { error: 'Failed to save profile', details: error.message },
      { status: 500 }
    );
  }
}
