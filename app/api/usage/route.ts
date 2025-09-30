import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { prisma } from '@/lib/prisma';
import { PLANS } from '@/lib/plans';

export async function GET(req: NextRequest) {
  try {
    // Create Supabase client for authentication
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

    // Get the authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    // Verify the JWT token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      );
    }

    const userId = user.id;

    // Get user info for plan details, create if doesn't exist
    let userRecord = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        plan: true,
        subscriptionStatus: true,
        plan_expires_at: true
      }
    });

    if (!userRecord) {
      // Create user record in Prisma if it doesn't exist
      console.log('Creating new user record in Prisma for:', userId);
      try {
        userRecord = await prisma.user.create({
          data: {
            id: userId,
            email: user.email || '',
            name: user.user_metadata?.name || user.email?.split('@')[0] || '',
            plan: 'free',
            subscriptionStatus: 'inactive',
            emailVerified: new Date(),
          },
          select: {
            plan: true,
            subscriptionStatus: true,
            plan_expires_at: true
          }
        });
      } catch (createError: any) {
        console.error('Failed to create user record:', createError);
        // Return default free plan data if user creation fails
        userRecord = {
          plan: 'free',
          subscriptionStatus: 'inactive',
          plan_expires_at: null
        };
      }
    }

    // Get user usage data directly from User table (simpler approach)
    const userUsage = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        chat_used_today: true,
        videos_generated_this_week: true,
        voice_minutes_this_week: true
      }
    });

    // For now, we'll use the User table data since it's working
    // Future enhancement: migrate to UsageStats table for detailed tracking
    const todayUsage = {
      messagesUsed: userUsage?.chat_used_today || 0
    };

    const weeklyUsage = {
      _sum: {
        imagesGenerated: 0, // Not tracked yet
        videosGenerated: userUsage?.videos_generated_this_week || 0,
        voiceMinutes: userUsage?.voice_minutes_this_week || 0
      }
    };

    // Get plan limits
    const planKey = userRecord.plan as keyof typeof PLANS;
    const planInfo = PLANS[planKey] || PLANS.free;

    // Prepare response data
    const responseData = {
      // Daily limits
      messages_used_today: todayUsage?.messagesUsed || 0,
      daily_limit: planInfo.limits.chatPerDay,
      
      // Weekly limits
      images_generated_this_week: weeklyUsage._sum.imagesGenerated || 0,
      images_weekly_limit: planInfo.limits.imagesPerWeek,
      
      videos_generated_this_week: weeklyUsage._sum.videosGenerated || 0,
      videos_weekly_limit: planInfo.limits.videosPerWeek,
      
      voice_minutes_used_this_week: weeklyUsage._sum.voiceMinutes || 0,
      voice_weekly_limit: planInfo.limits.voiceMinutesPerWeek,
      
      // Plan info
      plan: planInfo.name,
      plan_key: userRecord.plan,
      subscription_status: userRecord.subscriptionStatus || 'inactive',
      plan_expires_at: userRecord.plan_expires_at?.toISOString() || null,
      
      // Usage percentages for UI
      chat_usage_percentage: planInfo.limits.chatPerDay === -1 ? 0 : Math.round(((todayUsage?.messagesUsed || 0) / planInfo.limits.chatPerDay) * 100),
      images_usage_percentage: planInfo.limits.imagesPerWeek === -1 ? 0 : Math.round(((weeklyUsage._sum.imagesGenerated || 0) / planInfo.limits.imagesPerWeek) * 100),
      videos_usage_percentage: planInfo.limits.videosPerWeek === -1 ? 0 : Math.round(((weeklyUsage._sum.videosGenerated || 0) / planInfo.limits.videosPerWeek) * 100),
      voice_usage_percentage: planInfo.limits.voiceMinutesPerWeek === -1 ? 0 : Math.round(((weeklyUsage._sum.voiceMinutes || 0) / planInfo.limits.voiceMinutesPerWeek) * 100),
      
      // Limit status for UI
      is_chat_limit_reached: planInfo.limits.chatPerDay !== -1 && (todayUsage?.messagesUsed || 0) >= planInfo.limits.chatPerDay,
      is_images_limit_reached: planInfo.limits.imagesPerWeek !== -1 && (weeklyUsage._sum.imagesGenerated || 0) >= planInfo.limits.imagesPerWeek,
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