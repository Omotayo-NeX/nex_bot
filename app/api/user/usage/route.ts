import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { getUserUsage } from '@/lib/usage-tracking';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const token = await getToken({ req });
    if (!token || !token.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user usage data
    const usage = await getUserUsage(token.id as string);
    
    if (!usage) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get email verification status
    const user = await prisma.user.findUnique({
      where: { id: token.id as string },
      select: { emailVerified: true }
    });

    return NextResponse.json({
      plan: usage.plan,
      chat_used_today: usage.chat_used_today,
      videos_generated_this_week: usage.videos_generated_this_week,
      voice_minutes_this_week: usage.voice_minutes_this_week,
      plan_expires_at: usage.plan_expires_at,
      emailVerified: user?.emailVerified ? true : false,
    });

  } catch (error) {
    console.error('Usage API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch usage data' },
      { status: 500 }
    );
  }
}