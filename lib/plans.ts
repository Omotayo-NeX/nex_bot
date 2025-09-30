export type PlanType = 'free' | 'pro' | 'enterprise';
export type PlanDisplay = 'Free' | 'Pro' | 'Enterprise';

export interface PlanLimits {
  chatPerDay: number;
  videosPerWeek: number;
  voiceMinutesPerWeek: number;
  imagesPerWeek: number;
  isUnlimited: boolean;
  features: string[];
}

export interface Plan {
  id: PlanType;
  name: string;
  price: {
    naira: number;
    usd: number;
  };
  billing: string;
  limits: PlanLimits;
  popular?: boolean;
  paystack_amount: number; // Amount in kobo for Paystack
}

export const PLANS: Record<PlanType, Plan> = {
  free: {
    id: 'free',
    name: 'Free Plan',
    price: { naira: 0, usd: 0 },
    billing: 'Forever',
    paystack_amount: 0,
    limits: {
      chatPerDay: 20,
      videosPerWeek: 3,
      voiceMinutesPerWeek: 5,
      imagesPerWeek: 10,
      isUnlimited: false,
      features: [
        '20 chat messages per day',
        '3 videos per week (watermarked)',
        '5 voice minutes per week',
        '10 images per week',
        'Basic AI assistant',
        'Email support'
      ]
    }
  },
  pro: {
    id: 'pro',
    name: 'Pro Plan',
    price: { naira: 10000, usd: 10 },
    billing: 'Monthly',
    paystack_amount: 1000000, // ₦10,000 in kobo
    popular: true,
    limits: {
      chatPerDay: -1, // Unlimited
      videosPerWeek: 50,
      voiceMinutesPerWeek: 300,
      imagesPerWeek: 50,
      isUnlimited: false,
      features: [
        'Unlimited chat messages',
        '50 HD videos per month (no watermark)',
        '300 voice minutes per month',
        '50 images per week',
        'Priority AI processing',
        'Advanced AI models',
        'Priority support'
      ]
    }
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise Plan',
    price: { naira: 40000, usd: 40 },
    billing: 'Monthly',
    paystack_amount: 4000000, // ₦40,000 in kobo
    limits: {
      chatPerDay: -1, // Unlimited
      videosPerWeek: -1, // Unlimited
      voiceMinutesPerWeek: -1, // Unlimited
      imagesPerWeek: -1, // Unlimited
      isUnlimited: true,
      features: [
        'Everything in Pro',
        'Unlimited videos (HD, no watermark)',
        'Unlimited voice generation',
        'Unlimited image generation',
        'Team collaboration (3 seats)',
        'Custom AI training',
        'API access',
        'Dedicated support',
        'Custom integrations'
      ]
    }
  }
};

export function getPlan(planType: PlanType): Plan {
  return PLANS[planType];
}

export function isFeatureAvailable(
  userPlan: PlanType,
  feature: 'chat' | 'video' | 'voice' | 'image',
  currentUsage: number
): boolean {
  const plan = getPlan(userPlan);

  switch (feature) {
    case 'chat':
      return plan.limits.chatPerDay === -1 || currentUsage < plan.limits.chatPerDay;
    case 'video':
      return plan.limits.videosPerWeek === -1 || currentUsage < plan.limits.videosPerWeek;
    case 'voice':
      return plan.limits.voiceMinutesPerWeek === -1 || currentUsage < plan.limits.voiceMinutesPerWeek;
    case 'image':
      return plan.limits.imagesPerWeek === -1 || currentUsage < plan.limits.imagesPerWeek;
    default:
      return false;
  }
}

export function getRemainingUsage(
  userPlan: PlanType,
  feature: 'chat' | 'video' | 'voice' | 'image',
  currentUsage: number
): number {
  const plan = getPlan(userPlan);

  switch (feature) {
    case 'chat':
      return plan.limits.chatPerDay === -1 ? -1 : Math.max(0, plan.limits.chatPerDay - currentUsage);
    case 'video':
      return plan.limits.videosPerWeek === -1 ? -1 : Math.max(0, plan.limits.videosPerWeek - currentUsage);
    case 'voice':
      return plan.limits.voiceMinutesPerWeek === -1 ? -1 : Math.max(0, plan.limits.voiceMinutesPerWeek - currentUsage);
    case 'image':
      return plan.limits.imagesPerWeek === -1 ? -1 : Math.max(0, plan.limits.imagesPerWeek - currentUsage);
    default:
      return 0;
  }
}