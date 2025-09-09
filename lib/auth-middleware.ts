import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/prisma';

export async function requireEmailVerification(request: NextRequest) {
  try {
    const token = await getToken({ req: request });
    
    if (!token || !token.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user's email is verified
    const user = await prisma.user.findUnique({
      where: { id: token.id as string },
      select: { emailVerified: true, email: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (!user.emailVerified) {
      return NextResponse.json(
        { 
          error: 'Email verification required',
          message: 'Please verify your email address to access this feature',
          requiresVerification: true
        },
        { status: 403 }
      );
    }

    // User is authenticated and verified
    return null;
  } catch (error) {
    console.error('Auth middleware error:', error);
    return NextResponse.json(
      { error: 'Authentication error' },
      { status: 500 }
    );
  }
}

// Utility to check authentication without verification requirement
export async function requireAuth(request: NextRequest) {
  try {
    const token = await getToken({ req: request });
    
    if (!token || !token.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Just check if user exists
    const user = await prisma.user.findUnique({
      where: { id: token.id as string },
      select: { id: true, email: true, emailVerified: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return null;
  } catch (error) {
    console.error('Auth middleware error:', error);
    return NextResponse.json(
      { error: 'Authentication error' },
      { status: 500 }
    );
  }
}