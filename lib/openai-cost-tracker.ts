import { prisma } from './prisma';

/**
 * OpenAI pricing as of January 2025 (in USD per 1M tokens)
 * Source: https://openai.com/api/pricing/
 */
const PRICING = {
  // Chat models
  'gpt-4o': {
    input: 2.50,
    output: 10.00,
  },
  'gpt-4o-mini': {
    input: 0.150,
    output: 0.600,
  },
  'gpt-4-turbo': {
    input: 10.00,
    output: 30.00,
  },
  'gpt-4': {
    input: 30.00,
    output: 60.00,
  },
  'gpt-3.5-turbo': {
    input: 0.50,
    output: 1.50,
  },
  // Image models (per image)
  'dall-e-3': {
    'standard-1024x1024': 0.040,
    'standard-1024x1792': 0.080,
    'standard-1792x1024': 0.080,
    'hd-1024x1024': 0.080,
    'hd-1024x1792': 0.120,
    'hd-1792x1024': 0.120,
  },
  'dall-e-2': {
    '1024x1024': 0.020,
    '512x512': 0.018,
    '256x256': 0.016,
  },
  // TTS models (per 1M characters)
  'tts-1': 15.00,
  'tts-1-hd': 30.00,
} as const;

interface ChatCostParams {
  userId: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
}

interface ImageCostParams {
  userId: string;
  model: string;
  size: string;
  quality?: string;
}

interface VoiceCostParams {
  userId: string;
  model: string;
  characters: number;
}

/**
 * Calculate and track cost for chat completion
 */
export async function trackChatCost({
  userId,
  model,
  promptTokens,
  completionTokens,
}: ChatCostParams) {
  try {
    const pricing = PRICING[model as keyof typeof PRICING];

    if (!pricing || typeof pricing !== 'object' || !('input' in pricing)) {
      console.warn(`Unknown pricing for model: ${model}`);
      return null;
    }

    const totalTokens = promptTokens + completionTokens;

    // Calculate cost in USD (pricing is per 1M tokens)
    const inputCost = (promptTokens / 1_000_000) * pricing.input;
    const outputCost = (completionTokens / 1_000_000) * pricing.output;
    const estimatedCost = inputCost + outputCost;

    // Store in database
    const costRecord = await prisma.openAICost.create({
      data: {
        userId,
        model,
        promptTokens,
        completionTokens,
        totalTokens,
        estimatedCost,
        feature: 'chat',
      },
    });

    return costRecord;
  } catch (error) {
    console.error('Failed to track chat cost:', error);
    return null;
  }
}

/**
 * Calculate and track cost for image generation
 */
export async function trackImageCost({
  userId,
  model,
  size,
  quality = 'standard',
}: ImageCostParams) {
  try {
    const pricing = PRICING[model as keyof typeof PRICING];

    if (!pricing || typeof pricing !== 'object') {
      console.warn(`Unknown pricing for model: ${model}`);
      return null;
    }

    const priceKey = quality === 'hd' ? `hd-${size}` : `standard-${size}`;
    const estimatedCost = pricing[priceKey as keyof typeof pricing] as number || 0;

    // Store in database (images don't have tokens)
    const costRecord = await prisma.openAICost.create({
      data: {
        userId,
        model,
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
        estimatedCost,
        feature: 'image',
      },
    });

    return costRecord;
  } catch (error) {
    console.error('Failed to track image cost:', error);
    return null;
  }
}

/**
 * Calculate and track cost for voice generation (TTS)
 */
export async function trackVoiceCost({
  userId,
  model,
  characters,
}: VoiceCostParams) {
  try {
    const pricing = PRICING[model as keyof typeof PRICING];

    if (typeof pricing !== 'number') {
      console.warn(`Unknown pricing for model: ${model}`);
      return null;
    }

    // Calculate cost in USD (pricing is per 1M characters)
    const estimatedCost = (characters / 1_000_000) * pricing;

    // Store in database (voice doesn't have tokens)
    const costRecord = await prisma.openAICost.create({
      data: {
        userId,
        model,
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
        estimatedCost,
        feature: 'voice',
      },
    });

    return costRecord;
  } catch (error) {
    console.error('Failed to track voice cost:', error);
    return null;
  }
}

/**
 * Get total costs for a user within a date range
 */
export async function getUserCosts(
  userId: string,
  startDate?: Date,
  endDate?: Date
) {
  try {
    const where: any = { userId };

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const costs = await prisma.openAICost.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    const totalCost = costs.reduce((sum, record) => sum + record.estimatedCost, 0);
    const totalTokens = costs.reduce((sum, record) => sum + record.totalTokens, 0);

    const byFeature = costs.reduce((acc, record) => {
      if (!acc[record.feature]) {
        acc[record.feature] = { cost: 0, count: 0 };
      }
      acc[record.feature].cost += record.estimatedCost;
      acc[record.feature].count += 1;
      return acc;
    }, {} as Record<string, { cost: number; count: number }>);

    const byModel = costs.reduce((acc, record) => {
      if (!acc[record.model]) {
        acc[record.model] = { cost: 0, tokens: 0, count: 0 };
      }
      acc[record.model].cost += record.estimatedCost;
      acc[record.model].tokens += record.totalTokens;
      acc[record.model].count += 1;
      return acc;
    }, {} as Record<string, { cost: number; tokens: number; count: number }>);

    return {
      totalCost,
      totalTokens,
      recordCount: costs.length,
      byFeature,
      byModel,
      records: costs,
    };
  } catch (error) {
    console.error('Failed to get user costs:', error);
    throw error;
  }
}

/**
 * Get costs for all users (admin only)
 */
export async function getAllUsersCosts(startDate?: Date, endDate?: Date) {
  try {
    const where: any = {};

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const costs = await prisma.openAICost.groupBy({
      by: ['userId'],
      _sum: {
        estimatedCost: true,
        totalTokens: true,
      },
      _count: {
        id: true,
      },
      where,
    });

    const totalCost = costs.reduce((sum, record) => sum + (record._sum.estimatedCost || 0), 0);
    const totalTokens = costs.reduce((sum, record) => sum + (record._sum.totalTokens || 0), 0);

    return {
      totalCost,
      totalTokens,
      userCount: costs.length,
      users: costs.map(record => ({
        userId: record.userId,
        totalCost: record._sum.estimatedCost || 0,
        totalTokens: record._sum.totalTokens || 0,
        requestCount: record._count.id,
      })),
    };
  } catch (error) {
    console.error('Failed to get all users costs:', error);
    throw error;
  }
}
