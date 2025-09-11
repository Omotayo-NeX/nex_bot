import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const token = await getToken({ req });
    if (!token || !token.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const userId = token.id as string;

    // Get user settings
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        preferred_model: true,
        preferred_temperature: true,
        plan: true,
        subscriptionStatus: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      preferredModel: user.preferred_model,
      preferredTemperature: user.preferred_temperature,
      plan: user.plan,
      subscriptionStatus: user.subscriptionStatus
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
    const token = await getToken({ req });
    if (!token || !token.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const userId = token.id as string;
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