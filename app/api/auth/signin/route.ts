import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { prisma } from '@/lib/prisma';

// Helper function to ensure user exists in Prisma database
async function ensurePrismaUser(userId: string, email: string, name?: string) {
  try {
    console.log('📝 Checking/creating Prisma user record:', { userId, email });

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (existingUser) {
      console.log('✅ User already exists in Prisma database');
      return existingUser;
    }

    // Create new user record if doesn't exist
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
    console.error('❌ Error ensuring Prisma user:', error);
    // Don't throw - we'll handle this gracefully
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    console.log('= Server-side signin attempt:', { email });

    // Attempt signin using Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    console.log('= Signin response:', { data, error });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    // Ensure user exists in Prisma database (for existing users who signed up before this fix)
    if (data.user) {
      await ensurePrismaUser(
        data.user.id,
        data.user.email || email,
        data.user.user_metadata?.name
      );
    }

    return NextResponse.json({
      success: true,
      user: data.user,
      session: data.session,
      message: 'Sign in successful!'
    });

  } catch (error: any) {
    console.error('L Signin error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}