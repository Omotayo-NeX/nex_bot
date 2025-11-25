import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const redirect = searchParams.get('redirect') ?? searchParams.get('next') ?? '/chat';

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

        // Create or update user in Prisma database
        try {
          await prisma.user.upsert({
            where: { id: user.id },
            update: {
              emailVerified: new Date(), // Auto-verify all users
              updatedAt: new Date(),
            },
            create: {
              id: user.id,
              email: user.email || '',
              name: user.user_metadata?.name || user.email?.split('@')[0] || '',
              plan: 'free',
              subscriptionStatus: 'inactive',
              emailVerified: new Date(),
              createdAt: new Date(),
              updatedAt: new Date(),
              last_reset_date: new Date(),
              preferred_model: 'gpt-4o-mini',
              preferred_temperature: 0.7,
              chat_used_today: 0,
              videos_generated_this_week: 0,
              voice_minutes_this_week: 0,
              images_generated_this_week: 0,
            }
          });
          console.log('✅ User record ensured in Prisma database');
        } catch (prismaError) {
          console.error('❌ Failed to create/update user in Prisma:', prismaError);
          // Don't fail the authentication if Prisma update fails
        }

        // Redirect to intended destination (no verification needed)
        return NextResponse.redirect(new URL(redirect, request.url));
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