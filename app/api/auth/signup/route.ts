import { NextRequest, NextResponse } from 'next/server';
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    console.log('🔍 Starting signup process...');
    
    const { name, email, password } = await req.json();
    console.log('📝 Received data:', { name, email, passwordLength: password?.length });

    if (!email || !password) {
      console.log('❌ Missing email or password');
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    console.log('👤 Checking if user exists...');
    // Check if user already exists in Prisma
    const existingUser = await prisma.user.findUnique({ 
      where: { email } 
    });
    console.log('🔍 Existing user check result:', !!existingUser);
    
    if (existingUser) {
      console.log('⚠️ User already exists');
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    console.log('📧 Creating Supabase auth user with email verification...');
    // Create user in Supabase Auth with email verification
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
      },
    });

    if (authError) {
      console.error('❌ Supabase auth error:', authError);
      return NextResponse.json(
        { error: authError.message || "Failed to create account" },
        { status: 400 }
      );
    }

    if (!authData.user) {
      console.error('❌ No user data returned from Supabase');
      return NextResponse.json(
        { error: "Failed to create account" },
        { status: 500 }
      );
    }

    console.log('🔒 Hashing password for Prisma...');
    // Hash password for Prisma storage
    const hashedPassword = await bcrypt.hash(password, 12);
    console.log('✅ Password hashed successfully');

    console.log('👤 Creating user in Prisma...');
    // Create user in Prisma with Supabase user ID
    const user = await prisma.user.create({
      data: {
        id: authData.user.id, // Use Supabase user ID
        name: name || null,
        email,
        password: hashedPassword,
        emailVerified: null, // Will be updated when email is verified
      },
    });
    console.log('✅ User created successfully:', user.id);

    return NextResponse.json(
      { 
        message: "Account created successfully! Please check your email to verify your account before signing in.",
        userId: user.id,
        emailSent: true
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('💥 Signup error:', error);
    console.error('📋 Error message:', error.message);
    console.error('🔢 Error code:', error.code);
    console.error('📊 Error meta:', error.meta);
    
    return NextResponse.json(
      { 
        error: "Failed to create account. Please try again.",
        details: process.env.NODE_ENV === 'development' ? {
          message: error.message,
          code: error.code,
          meta: error.meta
        } : undefined
      },
      { status: 500 }
    );
  }
}