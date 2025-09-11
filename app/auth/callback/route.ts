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

      // TODO: Email verification can be re-enabled later when billing or premium features are introduced
      // For now, all users are treated as verified immediately
      if (user) {
        console.log('✅ User authenticated:', user.email);
        
        // Update the user's emailVerified field in Prisma (all users are auto-verified)
        try {
          await prisma.user.update({
            where: { id: user.id },
            data: { 
              emailVerified: new Date(), // Auto-verify all users
            },
          });
          console.log('✅ User auto-verified in Prisma');
        } catch (prismaError) {
          console.error('❌ Failed to update user in Prisma:', prismaError);
          // Don't fail the authentication if Prisma update fails
        }
        
        // Redirect to chat page directly (no verification needed)
        return NextResponse.redirect(new URL('/chat', request.url));
      }
      
      // If no user data
      return NextResponse.redirect(new URL('/auth/signin?error=no_user', request.url));
      
    } catch (error) {
      console.error('Error in auth callback:', error);
      return NextResponse.redirect(new URL('/auth/signin?error=verification_failed', request.url));
    }
  }

  // If no code is provided
  return NextResponse.redirect(new URL('/auth/signin?error=no_code', request.url));
}