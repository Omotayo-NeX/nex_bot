import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { PLANS, type PlanType } from '@/lib/plans';

export interface UserSubscription {
  plan: PlanType;
  status: string | null;
  expiresAt: Date | null;
  isActive: boolean;
  hasAccess: boolean;
}

export async function getUserSubscription(userId?: string): Promise<UserSubscription | null> {
  try {
    let actualUserId = userId;
    
    if (!actualUserId) {
      const session = await getServerSession(authOptions);
      if (!session?.user?.id) return null;
      actualUserId = session.user.id;
    }

    const user = await prisma.user.findUnique({
      where: { id: actualUserId },
      select: {
        plan: true,
        subscriptionStatus: true,
        plan_expires_at: true,
      },
    });

    if (!user) return null;

    const planType = (user.plan?.charAt(0).toUpperCase() + user.plan?.slice(1) || 'Free') as PlanType;
    const now = new Date();
    const isActive = !user.plan_expires_at || user.plan_expires_at > now;
    const hasAccess = planType === 'Free' || (isActive && user.subscriptionStatus === 'active');

    return {
      plan: planType,
      status: user.subscriptionStatus,
      expiresAt: user.plan_expires_at,
      isActive,
      hasAccess,
    };
  } catch (error) {
    console.error('Error fetching user subscription:', error);
    return null;
  }
}

export async function checkFeatureAccess(
  feature: 'chat' | 'video' | 'voice' | 'advanced_ai',
  userId?: string
): Promise<{ hasAccess: boolean; reason?: string; upgradeRequired?: boolean }> {
  const subscription = await getUserSubscription(userId);
  
  if (!subscription) {
    return { hasAccess: false, reason: 'Authentication required' };
  }

  const { plan, hasAccess: subscriptionActive } = subscription;

  // Check if subscription is active
  if (!subscriptionActive && plan !== 'Free') {
    return { 
      hasAccess: false, 
      reason: 'Subscription expired', 
      upgradeRequired: true 
    };
  }

  // Feature-specific access checks
  switch (feature) {
    case 'advanced_ai':
      if (plan === 'Free') {
        return { 
          hasAccess: false, 
          reason: 'Advanced AI features require Pro or Business plan', 
          upgradeRequired: true 
        };
      }
      break;
    
    case 'video':
      // All plans have some video access, but with different limits
      if (plan === 'Free') {
        // Check daily/weekly limits in your usage checking logic
        return { hasAccess: true };
      }
      break;
      
    case 'voice':
      // All plans have some voice access, but with different limits
      return { hasAccess: true };
      
    case 'chat':
      // All plans have chat access
      return { hasAccess: true };
      
    default:
      return { hasAccess: false, reason: 'Unknown feature' };
  }

  return { hasAccess: true };
}

export async function checkUsageLimits(
  userId: string,
  feature: 'chat' | 'video' | 'voice'
): Promise<{ canUse: boolean; remaining: number; limit: number }> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        plan: true,
        chat_used_today: true,
        videos_generated_this_week: true,
        voice_minutes_this_week: true,
      },
    });

    if (!user) {
      return { canUse: false, remaining: 0, limit: 0 };
    }

    const planType = (user.plan?.charAt(0).toUpperCase() + user.plan?.slice(1) || 'Free') as PlanType;
    const planConfig = PLANS[planType];

    switch (feature) {
      case 'chat': {
        const limit = planConfig.limits.chatPerDay;
        const used = user.chat_used_today;
        const remaining = limit === -1 ? -1 : Math.max(0, limit - used);
        return {
          canUse: limit === -1 || used < limit,
          remaining,
          limit,
        };
      }
      
      case 'video': {
        const limit = planConfig.limits.videosPerWeek;
        const used = user.videos_generated_this_week;
        const remaining = limit === -1 ? -1 : Math.max(0, limit - used);
        return {
          canUse: limit === -1 || used < limit,
          remaining,
          limit,
        };
      }
      
      case 'voice': {
        const limit = planConfig.limits.voiceMinutesPerWeek;
        const used = user.voice_minutes_this_week;
        const remaining = limit === -1 ? -1 : Math.max(0, limit - used);
        return {
          canUse: limit === -1 || used < limit,
          remaining,
          limit,
        };
      }
      
      default:
        return { canUse: false, remaining: 0, limit: 0 };
    }
  } catch (error) {
    console.error('Error checking usage limits:', error);
    return { canUse: false, remaining: 0, limit: 0 };
  }
}

export function requiresPaidPlan(feature: string): boolean {
  const paidFeatures = [
    'advanced_ai',
    'unlimited_chat',
    'hd_video',
    'priority_support',
    'api_access',
  ];
  
  return paidFeatures.includes(feature);
}

export async function incrementUsage(
  userId: string,
  feature: 'chat' | 'video' | 'voice',
  amount: number = 1
): Promise<boolean> {
  try {
    const updateData: any = {};
    
    switch (feature) {
      case 'chat':
        updateData.chat_used_today = { increment: amount };
        break;
      case 'video':
        updateData.videos_generated_this_week = { increment: amount };
        break;
      case 'voice':
        updateData.voice_minutes_this_week = { increment: amount };
        break;
    }

    await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    return true;
  } catch (error) {
    console.error('Error incrementing usage:', error);
    return false;
  }
}