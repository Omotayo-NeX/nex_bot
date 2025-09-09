import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { prisma } from '@/lib/prisma';
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { password, accessToken, refreshToken } = await req.json();

    if (!password || !accessToken || !refreshToken) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    console.log('🔄 Processing password reset...');

    // Set the session with the tokens from the reset link
    const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    if (sessionError || !sessionData.user) {
      console.error('❌ Invalid or expired reset session:', sessionError);
      return NextResponse.json(
        { error: "Invalid or expired reset link. Please request a new one." },
        { status: 400 }
      );
    }

    console.log('🔒 Updating password in Supabase...');
    
    // Update the password in Supabase
    const { error: updateError } = await supabase.auth.updateUser({
      password: password
    });

    if (updateError) {
      console.error('❌ Supabase password update error:', updateError);
      return NextResponse.json(
        { error: updateError.message || "Failed to update password" },
        { status: 400 }
      );
    }

    console.log('🔒 Updating password in Prisma...');
    
    // Also update the hashed password in Prisma for consistency
    const hashedPassword = await bcrypt.hash(password, 12);
    
    try {
      await prisma.user.update({
        where: { id: sessionData.user.id },
        data: { password: hashedPassword },
      });
      console.log('✅ Password updated in Prisma successfully');
    } catch (prismaError) {
      console.error('❌ Failed to update password in Prisma:', prismaError);
      // Don't fail the entire operation if Prisma update fails
    }

    console.log('✅ Password reset completed successfully');

    return NextResponse.json(
      { message: "Password updated successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('💥 Reset password error:', error);
    
    return NextResponse.json(
      { error: "Failed to reset password" },
      { status: 500 }
    );
  }
}