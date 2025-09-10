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

    // Handle Supabase auth errors gracefully
    let supabaseUserId = null;
    let emailSentSuccessfully = true;

    if (authError) {
      console.error('❌ Supabase auth error:', authError);
      console.log('⚠️ Supabase signup failed, creating user directly in database...');
      emailSentSuccessfully = false;
      
      // Generate a UUID for the user since Supabase failed
      const { randomUUID } = require('crypto');
      supabaseUserId = randomUUID();
    } else if (!authData.user) {
      console.error('❌ No user data returned from Supabase');
      console.log('⚠️ Creating user directly in database...');
      emailSentSuccessfully = false;
      
      const { randomUUID } = require('crypto');
      supabaseUserId = randomUUID();
    } else {
      supabaseUserId = authData.user.id;
      console.log('✅ Supabase user created successfully');
    }

    console.log('🔒 Hashing password for Prisma...');
    // Hash password for Prisma storage
    const hashedPassword = await bcrypt.hash(password, 12);
    console.log('✅ Password hashed successfully');

    console.log('👤 Creating user in Prisma...');
    // Create user in Prisma with Supabase user ID (or generated UUID if Supabase failed)
    const user = await prisma.user.create({
      data: {
        id: supabaseUserId, // Use Supabase user ID or fallback UUID
        name: name || null,
        email,
        password: hashedPassword,
        emailVerified: emailSentSuccessfully ? null : new Date(), // Auto-verify if email couldn't be sent
      },
    });
    console.log('✅ User created successfully:', user.id);

    const responseMessage = emailSentSuccessfully 
      ? "Account created successfully! Please check your email to verify your account before signing in."
      : "Account created successfully! You can sign in immediately. (Email verification was skipped due to technical issues)";

    return NextResponse.json(
      { 
        message: responseMessage,
        userId: user.id,
        emailSent: emailSentSuccessfully
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