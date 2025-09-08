import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    console.log('Testing database connection...');
    
    // Test 1: Basic connection
    await prisma.$connect();
    console.log('✅ Prisma connection successful');
    
    // Test 2: Raw query to check if User table exists
    const tableCheck = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'User' 
      ORDER BY ordinal_position;
    `;
    console.log('✅ User table structure:', tableCheck);
    
    // Test 3: Try to count existing users
    const userCount = await prisma.user.count();
    console.log('✅ User count:', userCount);
    
    // Test 4: Try a simple findMany to see what happens
    const users = await prisma.user.findMany({
      take: 1,
      select: { id: true, email: true, name: true }
    });
    console.log('✅ Sample users:', users);
    
    await prisma.$disconnect();
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      tableStructure: tableCheck,
      userCount,
      sampleUsers: users
    });
    
  } catch (error: any) {
    console.error('❌ Database test failed:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    console.error('Full error:', JSON.stringify(error, null, 2));
    
    return NextResponse.json({
      success: false,
      error: error.message,
      code: error.code,
      details: error
    }, { status: 500 });
  }
}