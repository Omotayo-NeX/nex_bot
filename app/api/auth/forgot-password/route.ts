import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { prisma } from '@/lib/prisma';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Create a specific rate limiter for forgot password requests (5 per hour per IP)
const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

const forgotPasswordLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, '1 h'), // 5 requests per hour
      analytics: true,
      prefix: 'forgot_password',
    })
  : {
      limit: async () => ({ success: true, limit: 5, remaining: 4, reset: new Date() }),
    };

function getClientIP(request: Request): string {
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

export async function POST(req: NextRequest) {
  try {
    // Rate limiting for forgot password requests
    const clientIP = getClientIP(req);
    const { success, remaining } = await forgotPasswordLimit.limit(clientIP);
    
    if (!success) {
      console.log(`🚫 Rate limit exceeded for forgot password from IP: ${clientIP}`);
      return NextResponse.json(
        { error: 'Too many password reset attempts. Please wait an hour before trying again.' },
        { status: 429 }
      );
    }

    console.log(`🔒 Rate limit check passed. Remaining attempts: ${remaining}`);

    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    console.log('🔍 Processing forgot password request for:', email);

    // Check if user exists in our database
    const user = await prisma.user.findUnique({
      where: { email: email.trim() },
      select: { email: true, emailVerified: true }
    });

    if (!user) {
      // Don't reveal if user exists or not for security
      console.log('❌ User not found, but sending success response for security');
      return NextResponse.json(
        { message: "If an account with this email exists, a password reset link has been sent." },
        { status: 200 }
      );
    }

    if (!user.emailVerified) {
      console.log('❌ User email not verified');
      return NextResponse.json(
        { error: "Please verify your email address first" },
        { status: 400 }
      );
    }

    console.log('📧 Sending password reset email via Supabase...');
    
    // Send password reset email using Supabase
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/reset-password`,
    });

    if (error) {
      console.error('❌ Supabase password reset error:', error);
      return NextResponse.json(
        { error: error.message || "Failed to send password reset email" },
        { status: 400 }
      );
    }

    console.log('✅ Password reset email sent successfully');

    return NextResponse.json(
      { message: "Password reset link sent to your email" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('💥 Forgot password error:', error);
    
    return NextResponse.json(
      { error: "Failed to process password reset request" },
      { status: 500 }
    );
  }
}