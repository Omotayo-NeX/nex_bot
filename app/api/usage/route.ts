import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/prisma';
import { PLANS } from '@/lib/plans';

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

    const userId = token.id as string;
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

    // Get user info for plan details
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        plan: true, 
        subscriptionStatus: true,
        planExpiresAt: true 
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get today's usage stats
    const todayUsage = await prisma.usageStats.findUnique({
      where: {
        userId_date: {
          userId: userId,
          date: today
        }
      }
    });

    // Get this week's usage (for images, videos, voice)
    const startOfWeek = getStartOfWeek(new Date()).toISOString().split('T')[0];
    const endOfWeek = getEndOfWeek(new Date()).toISOString().split('T')[0];

    const weeklyUsage = await prisma.usageStats.aggregate({
      where: {
        userId: userId,
        date: {
          gte: startOfWeek,
          lte: endOfWeek
        }
      },
      _sum: {
        imagesGenerated: true,
        videosGenerated: true,
        voiceMinutes: true
      }
    });

    // Get plan limits
    const planKey = user.plan as keyof typeof PLANS;
    const planInfo = PLANS[planKey] || PLANS.free;

    // Prepare response data
    const responseData = {
      // Daily limits
      messages_used_today: todayUsage?.messagesUsed || 0,
      daily_limit: planInfo.limits.chatPerDay,
      
      // Weekly limits
      images_generated_this_week: weeklyUsage._sum.imagesGenerated || 0,
      images_weekly_limit: 10, // Add images to plan config later
      
      videos_generated_this_week: weeklyUsage._sum.videosGenerated || 0,
      videos_weekly_limit: planInfo.limits.videosPerWeek,
      
      voice_minutes_used_this_week: weeklyUsage._sum.voiceMinutes || 0,
      voice_weekly_limit: planInfo.limits.voiceMinutesPerWeek,
      
      // Plan info
      plan: planInfo.name,
      plan_key: user.plan,
      subscription_status: user.subscriptionStatus || 'inactive',
      plan_expires_at: user.planExpiresAt?.toISOString() || null,
      
      // Usage percentages for UI
      chat_usage_percentage: planInfo.limits.chatPerDay === -1 ? 0 : Math.round(((todayUsage?.messagesUsed || 0) / planInfo.limits.chatPerDay) * 100),
      images_usage_percentage: Math.round(((weeklyUsage._sum.imagesGenerated || 0) / 10) * 100), // Temporary limit
      videos_usage_percentage: planInfo.limits.videosPerWeek === -1 ? 0 : Math.round(((weeklyUsage._sum.videosGenerated || 0) / planInfo.limits.videosPerWeek) * 100),
      voice_usage_percentage: planInfo.limits.voiceMinutesPerWeek === -1 ? 0 : Math.round(((weeklyUsage._sum.voiceMinutes || 0) / planInfo.limits.voiceMinutesPerWeek) * 100),
      
      // Limit status for UI
      is_chat_limit_reached: planInfo.limits.chatPerDay !== -1 && (todayUsage?.messagesUsed || 0) >= planInfo.limits.chatPerDay,
      is_images_limit_reached: (weeklyUsage._sum.imagesGenerated || 0) >= 10, // Temporary limit
      is_videos_limit_reached: planInfo.limits.videosPerWeek !== -1 && (weeklyUsage._sum.videosGenerated || 0) >= planInfo.limits.videosPerWeek,
      is_voice_limit_reached: planInfo.limits.voiceMinutesPerWeek !== -1 && (weeklyUsage._sum.voiceMinutes || 0) >= planInfo.limits.voiceMinutesPerWeek,
    };

    return NextResponse.json(responseData);

  } catch (error: any) {
    console.error('Usage API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

// Helper functions to get start and end of week
function getStartOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day; // Adjust to start from Sunday
  return new Date(d.setDate(diff));
}

function getEndOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + 6; // Add 6 days to get Saturday
  return new Date(d.setDate(diff));
}