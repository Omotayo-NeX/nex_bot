import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { prisma } from '@/lib/prisma';

// Helper function to authenticate user with Supabase
async function authenticateUser(req: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );

  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return { user: null, error: 'No authorization header' };
  }

  const accessToken = authHeader.substring(7);
  const { data: { user }, error } = await supabase.auth.getUser(accessToken);

  if (error || !user) {
    return { user: null, error: 'Invalid token' };
  }

  return { user, error: null };
}

export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const { user, error } = await authenticateUser(req);
    if (error || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const userId = user.id;

    // Get user settings
    const userSettings = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        preferred_model: true,
        preferred_temperature: true,
        plan: true,
        subscriptionStatus: true
      }
    });

    if (!userSettings) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      preferredModel: userSettings.preferred_model,
      preferredTemperature: userSettings.preferred_temperature,
      plan: userSettings.plan,
      subscriptionStatus: userSettings.subscriptionStatus
    });

  } catch (error: any) {
    console.error('Settings GET API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    // Check authentication
    const { user, error } = await authenticateUser(req);
    if (error || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const userId = user.id;
    const body = await req.json();

    // Validate input
    const updates: any = {};

    if (body.preferredModel && typeof body.preferredModel === 'string') {
      updates.preferred_model = body.preferredModel;
    }

    if (body.preferredTemperature !== undefined && typeof body.preferredTemperature === 'number') {
      // Clamp temperature between 0 and 1
      updates.preferred_temperature = Math.max(0, Math.min(1, body.preferredTemperature));
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid settings provided' },
        { status: 400 }
      );
    }

    // Update user settings
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updates,
      select: {
        preferred_model: true,
        preferred_temperature: true,
        plan: true,
        subscriptionStatus: true
      }
    });

    return NextResponse.json({
      preferredModel: updatedUser.preferred_model,
      preferredTemperature: updatedUser.preferred_temperature,
      plan: updatedUser.plan,
      subscriptionStatus: updatedUser.subscriptionStatus,
      message: 'Settings updated successfully'
    });

  } catch (error: any) {
    console.error('Settings PUT API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}