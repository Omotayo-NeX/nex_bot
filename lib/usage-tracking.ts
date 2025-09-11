import { prisma } from './prisma';
import { type PlanType, isFeatureAvailable } from './plans';

export interface UserUsage {
  id: string;
  plan: PlanType;
  chat_used_today: number;
  videos_generated_this_week: number;
  voice_minutes_this_week: number;
  plan_expires_at: Date | null;
}

export async function getUserUsage(userId: string): Promise<UserUsage | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        plan: true,
        chat_used_today: true,
        videos_generated_this_week: true,
        voice_minutes_this_week: true,
        plan_expires_at: true,
      },
    });

    if (!user) return null;

    return {
      id: user.id,
      plan: (user.plan as PlanType) || 'free',
      chat_used_today: user.chat_used_today || 0,
      videos_generated_this_week: user.videos_generated_this_week || 0,
      voice_minutes_this_week: user.voice_minutes_this_week || 0,
      plan_expires_at: user.plan_expires_at,
    };
  } catch (error) {
    console.error('Error fetching user usage:', error);
    return null;
  }
}

export async function checkFeatureAccess(
  userId: string,
  feature: 'chat' | 'video' | 'voice'
): Promise<{ allowed: boolean; usage: UserUsage | null; message?: string }> {
  const usage = await getUserUsage(userId);
  
  if (!usage) {
    return { allowed: false, usage: null, message: 'User not found' };
  }

  // Check if plan has expired (except for free plan)
  if (usage.plan !== 'free' && usage.plan_expires_at && new Date() > usage.plan_expires_at) {
    // Downgrade expired users to free plan
    await prisma.user.update({
      where: { id: userId },
      data: { plan: 'free', plan_expires_at: null }
    });
    usage.plan = 'free';
  }

  let currentUsage: number;
  let limitMessage: string;

  switch (feature) {
    case 'chat':
      currentUsage = usage.chat_used_today;
      limitMessage = usage.plan === 'free' ? 
        'Daily chat limit reached (20/day). Upgrade to Pro for unlimited chat.' :
        'Chat feature temporarily unavailable.';
      break;
    case 'video':
      currentUsage = usage.videos_generated_this_week;
      limitMessage = usage.plan === 'free' ? 
        'Weekly video limit reached (3/week). Upgrade to Pro for 50 videos/month.' :
        usage.plan === 'pro' ?
        'Monthly video limit reached (50/month). Upgrade to Enterprise for unlimited videos.' :
        'Video feature temporarily unavailable.';
      break;
    case 'voice':
      currentUsage = usage.voice_minutes_this_week;
      limitMessage = usage.plan === 'free' ? 
        'Weekly voice limit reached (5 min/week). Upgrade to Pro for 300 minutes/month.' :
        usage.plan === 'pro' ?
        'Monthly voice limit reached (300 min/month). Upgrade to Enterprise for unlimited voice.' :
        'Voice feature temporarily unavailable.';
      break;
    default:
      return { allowed: false, usage, message: 'Invalid feature' };
  }

  const allowed = isFeatureAvailable(usage.plan, feature, currentUsage);
  
  return {
    allowed,
    usage,
    message: allowed ? undefined : limitMessage
  };
}

export async function incrementUsage(
  userId: string,
  feature: 'chat' | 'video' | 'voice',
  amount: number = 1
): Promise<boolean> {
  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    
    // Update both the old User table (for backwards compatibility) and new UsageStats table
    const updateData: any = {};
    let usageStatsField: string;

    switch (feature) {
      case 'chat':
        updateData.chat_used_today = { increment: amount };
        usageStatsField = 'messagesUsed';
        break;
      case 'video':
        updateData.videos_generated_this_week = { increment: amount };
        usageStatsField = 'videosGenerated';
        break;
      case 'voice':
        updateData.voice_minutes_this_week = { increment: amount };
        usageStatsField = 'voiceMinutes';
        break;
      default:
        return false;
    }

    // Update old User table for backwards compatibility
    await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    // Update or create new UsageStats record for today
    await prisma.usageStats.upsert({
      where: {
        userId_date: {
          userId: userId,
          date: today
        }
      },
      update: {
        [usageStatsField]: { increment: amount }
      },
      create: {
        userId: userId,
        date: today,
        [usageStatsField]: amount
      }
    });

    return true;
  } catch (error) {
    console.error('Error incrementing usage:', error);
    return false;
  }
}

export async function resetDailyUsage(): Promise<number> {
  try {
    const result = await prisma.user.updateMany({
      data: {
        chat_used_today: 0,
        last_reset_date: new Date(),
      },
    });

    console.log(`✅ Reset daily usage for ${result.count} users`);
    return result.count;
  } catch (error) {
    console.error('Error resetting daily usage:', error);
    return 0;
  }
}

export async function resetWeeklyUsage(): Promise<number> {
  try {
    const result = await prisma.user.updateMany({
      data: {
        videos_generated_this_week: 0,
        voice_minutes_this_week: 0,
        last_reset_date: new Date(),
      },
    });

    console.log(`✅ Reset weekly usage for ${result.count} users`);
    return result.count;
  } catch (error) {
    console.error('Error resetting weekly usage:', error);
    return 0;
  }
}