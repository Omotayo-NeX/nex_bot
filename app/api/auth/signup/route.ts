import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';
import { prisma } from '@/lib/prisma';

// Helper function to create user in Prisma database
async function createPrismaUser(userId: string, email: string, name?: string) {
  try {
    console.log('📝 Creating Prisma user record:', { userId, email, name });

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (existingUser) {
      console.log('✅ User already exists in Prisma database');
      return existingUser;
    }

    // Create new user record
    const user = await prisma.user.create({
      data: {
        id: userId,
        email: email,
        name: name || email.split('@')[0],
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

    console.log('✅ Prisma user record created successfully');
    return user;
  } catch (error: any) {
    console.error('❌ Error creating Prisma user:', error);
    // Don't throw - we'll handle this gracefully
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    console.log('🔐 Server-side signup attempt:', { email, name });

    // First, try standard signup with email verification
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name || '',
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      },
    });

    console.log('📝 Signup response:', { data, error });

    // If email sending fails, fall back to admin creation (development mode)
    if (error && (error.message.includes('Error sending confirmation email') || error.message.includes('email rate limit exceeded'))) {
      console.log('⚠️ Email sending failed, falling back to admin creation...');

      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        }
      );

      // Create user with admin client as fallback
      const { data: adminData, error: adminError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        user_metadata: {
          name: name || '',
        },
        email_confirm: true, // Force confirm email
      });

      if (adminError) {
        return NextResponse.json(
          { error: adminError.message },
          { status: 400 }
        );
      }

      if (adminData.user) {
        console.log('✅ User created with admin client, now signing in...');

        // Create corresponding Prisma user record
        await createPrismaUser(adminData.user.id, email, name);

        // Sign in the user to get session
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          console.error('❌ Sign in error after user creation:', signInError);
          return NextResponse.json(
            { error: 'User created but sign in failed. Please try signing in manually.' },
            { status: 400 }
          );
        }

        return NextResponse.json({
          success: true,
          user: signInData.user,
          session: signInData.session,
          requiresEmailVerification: false,
          message: 'Account created successfully! (Email service unavailable, but account is verified)'
        });
      }
    }

    // Handle other errors
    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    // Normal success case - email verification should work
    const requiresConfirmation = !data.user?.email_confirmed_at && !data.session;

    // Create corresponding Prisma user record if user was created
    if (data.user) {
      await createPrismaUser(data.user.id, email, name);
    }

    return NextResponse.json({
      success: true,
      user: data.user,
      session: data.session,
      requiresEmailVerification: requiresConfirmation,
      message: requiresConfirmation
        ? 'Account created! Please check your email and click the verification link to complete your registration.'
        : 'Account created successfully!'
    });

  } catch (error: any) {
    console.error('❌ Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}