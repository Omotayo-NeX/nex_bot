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

    // TODO: Email verification can be re-enabled later when billing or premium features are introduced
    // For now, we create users without email verification for immediate access
    console.log('👤 Creating Supabase auth user without email verification...');
    
    // Create user in Supabase Auth without email verification
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
        // Skip email confirmation for immediate account access
        data: {
          email_confirmed: true
        }
      },
    });

    // Handle Supabase auth errors gracefully
    let supabaseUserId = null;

    if (authError) {
      console.error('❌ Supabase auth error:', authError);
      console.log('⚠️ Supabase signup failed, creating user directly in database...');
      
      // Generate a UUID for the user since Supabase failed
      const { randomUUID } = require('crypto');
      supabaseUserId = randomUUID();
    } else if (!authData.user) {
      console.error('❌ No user data returned from Supabase');
      console.log('⚠️ Creating user directly in database...');
      
      const { randomUUID } = require('crypto');
      supabaseUserId = randomUUID();
    } else {
      supabaseUserId = authData.user.id;
      console.log('✅ Supabase user created successfully without email verification');
    }

    console.log('🔒 Hashing password for Prisma...');
    // Hash password for Prisma storage
    const hashedPassword = await bcrypt.hash(password, 12);
    console.log('✅ Password hashed successfully');

    console.log('👤 Creating user in Prisma...');
    // Create user in Prisma with Supabase user ID (or generated UUID if Supabase failed)
    // Email is immediately verified for seamless user experience
    const user = await prisma.user.create({
      data: {
        id: supabaseUserId, // Use Supabase user ID or fallback UUID
        name: name || null,
        email,
        password: hashedPassword,
        emailVerified: new Date(), // Auto-verify all users for immediate access
      },
    });
    console.log('✅ User created successfully:', user.id);

    const responseMessage = "Account created successfully! You can sign in immediately.";

    return NextResponse.json(
      { 
        message: responseMessage,
        userId: user.id,
        emailSent: false // No email verification needed
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('💥 Signup error:', error);
    console.error('📋 Error message:', error.message);
    console.error('🔢 Error code:', error.code);
    console.error('📊 Error meta:', error.meta);
    
    // Determine specific error message based on error type
    let userMessage = "Failed to create account. Please try again.";
    let statusCode = 500;
    
    if (error.code === 'P1001') {
      // Database connection error
      userMessage = "Database connection failed. Please try again later.";
      console.error('🔌 Database connection error - Check DATABASE_URL configuration');
      console.error('🔌 DATABASE_URL host:', process.env.DATABASE_URL?.match(/@([^:]+)/)?.[1] || 'not found');
      console.error('🔌 Full connection error:', error.message);
    } else if (error.code === 'P1003') {
      // Database does not exist error
      userMessage = "Database configuration error. Please contact support.";
      console.error('🗄️ Database does not exist error:', error.message);
    } else if (error.code === 'P1017') {
      // Server has closed the connection
      userMessage = "Database connection lost. Please try again.";
      console.error('📡 Database server closed connection:', error.message);
    } else if (error.code === 'P2002') {
      // Unique constraint violation (user already exists)
      userMessage = "An account with this email already exists. Please try signing in instead.";
      statusCode = 409;
    } else if (error.code === 'P1008') {
      // Operation timeout
      userMessage = "Request timed out. Please try again.";
      statusCode = 408;
    } else if (error.message?.includes('email') && error.message?.includes('unique')) {
      // Email already exists
      userMessage = "An account with this email already exists. Please try signing in instead.";
      statusCode = 409;
    } else if (error.message?.includes('password')) {
      // Password related error
      userMessage = "Invalid password format. Please try a different password.";
      statusCode = 400;
    }
    
    return NextResponse.json(
      { 
        error: userMessage,
        type: error.code || 'unknown_error',
        details: process.env.NODE_ENV === 'development' ? {
          message: error.message,
          code: error.code,
          meta: error.meta,
          stack: error.stack
        } : undefined
      },
      { status: statusCode }
    );
  }
}