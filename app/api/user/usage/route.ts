import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getUserUsage } from '@/lib/usage-tracking';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
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
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user usage data
    const usage = await getUserUsage(user.id);

    if (!usage) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get email verification status
    const userRecord = await prisma.user.findUnique({
      where: { id: user.id },
      select: { emailVerified: true }
    });

    return NextResponse.json({
      plan: usage.plan,
      chat_used_today: usage.chat_used_today,
      videos_generated_this_week: usage.videos_generated_this_week,
      voice_minutes_this_week: usage.voice_minutes_this_week,
      plan_expires_at: usage.plan_expires_at,
      emailVerified: userRecord?.emailVerified ? true : false,
    });

  } catch (error) {
    console.error('Usage API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch usage data' },
      { status: 500 }
    );
  }
}