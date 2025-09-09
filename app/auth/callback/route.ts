import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/chat';

  if (code) {
    try {
      // Exchange the code for a session
      const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (error) {
        console.error('Error exchanging code for session:', error);
        return NextResponse.redirect(new URL('/auth/signin?error=verification_failed', request.url));
      }

      if (user && user.email_confirmed_at) {
        console.log('✅ Email verified for user:', user.email);
        
        // Update the user's emailVerified field in Prisma
        try {
          await prisma.user.update({
            where: { id: user.id },
            data: { 
              emailVerified: new Date(user.email_confirmed_at),
            },
          });
          console.log('✅ User email verification updated in Prisma');
        } catch (prismaError) {
          console.error('❌ Failed to update user in Prisma:', prismaError);
          // Don't fail the verification if Prisma update fails
        }
        
        // Redirect to sign in with success message
        return NextResponse.redirect(new URL(`/auth/signin?verified=true`, request.url));
      }
      
      // If email is not confirmed yet
      return NextResponse.redirect(new URL('/verify-email', request.url));
      
    } catch (error) {
      console.error('Error in auth callback:', error);
      return NextResponse.redirect(new URL('/auth/signin?error=verification_failed', request.url));
    }
  }

  // If no code is provided
  return NextResponse.redirect(new URL('/auth/signin?error=no_code', request.url));
}