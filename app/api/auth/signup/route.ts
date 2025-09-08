import { NextRequest, NextResponse } from 'next/server';
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    console.log('🔍 Starting signup process...');
    
    // Log database connection info (partially masked)
    const dbUrl = process.env.DATABASE_URL;
    if (dbUrl) {
      const maskedUrl = dbUrl.replace(/:([^@]+)@/, ':****@');
      console.log('🔗 Database URL:', maskedUrl);
    }
    
    console.log('🔧 Prisma Client initialization...');
    try {
      await prisma.$connect();
      console.log('✅ Prisma Client initialized and connected successfully');
    } catch (initError: any) {
      console.error('❌ Prisma Client initialization failed:', initError.message);
      throw initError;
    }
    
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
    // Check if user already exists
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

    console.log('🔒 Hashing password...');
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    console.log('✅ Password hashed successfully');

    console.log('👤 Creating user...');
    // Create user
    const user = await prisma.user.create({
      data: {
        name: name || null,
        email,
        password: hashedPassword,
      },
    });
    console.log('✅ User created successfully:', user.id);

    await prisma.$disconnect();

    return NextResponse.json(
      { 
        message: "User created successfully", 
        userId: user.id 
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('💥 Signup error:', error);
    console.error('📋 Error message:', error.message);
    console.error('🔢 Error code:', error.code);
    console.error('📊 Error meta:', error.meta);
    console.error('🏗️ Full error object:', JSON.stringify(error, null, 2));
    
    return NextResponse.json(
      { 
        error: "Internal server error",
        message: error.message,
        code: error.code,
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