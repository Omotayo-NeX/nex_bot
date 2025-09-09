import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { checkRateLimit, getClientIP } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  try {
    // Rate limiting for email resends
    const clientIP = getClientIP(req);
    const rateLimit = await checkRateLimit(`resend_verification_${clientIP}`);
    
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: rateLimit.error },
        { status: 429 }
      );
    }

    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    console.log('📧 Resending verification email for:', email);
    
    // Resend verification email using Supabase
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
      },
    });

    if (error) {
      console.error('❌ Supabase resend error:', error);
      return NextResponse.json(
        { error: error.message || "Failed to resend verification email" },
        { status: 400 }
      );
    }

    console.log('✅ Verification email resent successfully');

    return NextResponse.json(
      { message: "Verification email sent successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('💥 Resend verification error:', error);
    
    return NextResponse.json(
      { error: "Failed to resend verification email" },
      { status: 500 }
    );
  }
}