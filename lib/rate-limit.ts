import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Initialize Redis client for Vercel/Upstash
const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

// Fallback in-memory rate limiter for development
const memoryStore = new Map();

// Per-minute rate limit (20 requests per minute)
export const perMinuteLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(20, '1 m'),
      analytics: true,
      prefix: 'nex_bot_minute',
    })
  : {
      limit: async (identifier: string) => {
        const key = `minute_${identifier}`;
        const now = Date.now();
        const windowStart = now - 60 * 1000; // 1 minute window
        
        let requests = memoryStore.get(key) || [];
        requests = requests.filter((timestamp: number) => timestamp > windowStart);
        
        if (requests.length >= 20) {
          return {
            success: false,
            limit: 20,
            remaining: 0,
            reset: new Date(Math.min(...requests) + 60 * 1000),
          };
        }
        
        requests.push(now);
        memoryStore.set(key, requests);
        
        return {
          success: true,
          limit: 20,
          remaining: 20 - requests.length,
          reset: new Date(now + 60 * 1000),
        };
      },
    };

// Per-day rate limit (50 requests per day)
export const perDayLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(50, '1 d'),
      analytics: true,
      prefix: 'nex_bot_daily',
    })
  : {
      limit: async (identifier: string) => {
        const key = `day_${identifier}`;
        const now = Date.now();
        const windowStart = now - 24 * 60 * 60 * 1000; // 24 hours window
        
        let requests = memoryStore.get(key) || [];
        requests = requests.filter((timestamp: number) => timestamp > windowStart);
        
        if (requests.length >= 50) {
          return {
            success: false,
            limit: 50,
            remaining: 0,
            reset: new Date(Math.min(...requests) + 24 * 60 * 60 * 1000),
          };
        }
        
        requests.push(now);
        memoryStore.set(key, requests);
        
        return {
          success: true,
          limit: 50,
          remaining: 50 - requests.length,
          reset: new Date(now + 24 * 60 * 60 * 1000),
        };
      },
    };

// Rate limit check function
export async function checkRateLimit(identifier: string) {
  console.log(`🔒 [Rate Limit] Checking limits for IP: ${identifier}`);
  
  try {
    // Check per-minute limit first
    const minuteResult = await perMinuteLimit.limit(identifier);
    console.log(`⏱️  [Per-Minute] ${minuteResult.remaining}/${minuteResult.limit} remaining`);
    
    if (!minuteResult.success) {
      console.log(`🚫 [Per-Minute] Rate limit exceeded for ${identifier}`);
      return {
        success: false,
        error: '⚠️ Rate limit exceeded. Please wait a minute before trying again.',
        type: 'per_minute',
        reset: minuteResult.reset,
        remaining: minuteResult.remaining,
      };
    }
    
    // Check per-day limit
    const dayResult = await perDayLimit.limit(identifier);
    console.log(`📅 [Per-Day] ${dayResult.remaining}/${dayResult.limit} remaining`);
    
    if (!dayResult.success) {
      console.log(`🚫 [Per-Day] Daily limit exceeded for ${identifier}`);
      return {
        success: false,
        error: '⚠️ Daily limit reached. Please come back tomorrow.',
        type: 'per_day',
        reset: dayResult.reset,
        remaining: dayResult.remaining,
      };
    }
    
    console.log(`✅ [Rate Limit] Passed for ${identifier}`);
    return {
      success: true,
      minuteRemaining: minuteResult.remaining,
      dayRemaining: dayResult.remaining,
    };
  } catch (error) {
    console.error('❌ [Rate Limit] Error checking rate limit:', error);
    // In case of Redis errors, allow the request but log the issue
    return {
      success: true,
      minuteRemaining: 20,
      dayRemaining: 50,
      error: 'Rate limit check failed, allowing request',
    };
  }
}

// Get client IP helper function
export function getClientIP(request: Request): string {
  // Try to get real IP from various headers (for Vercel deployment)
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  if (cfConnectingIP) {
    return cfConnectingIP;
  }
  
  // Fallback for development
  return 'dev-ip-' + Math.random().toString(36).substring(7);
}