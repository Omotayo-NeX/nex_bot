import { NextRequest, NextResponse } from 'next/server';
import { resetDailyUsage } from '@/lib/usage-tracking';

export async function GET(req: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('🔄 Starting daily usage reset job...');
    const resetCount = await resetDailyUsage();
    
    console.log(`✅ Daily usage reset completed for ${resetCount} users`);
    
    return NextResponse.json({
      success: true,
      message: `Daily usage reset for ${resetCount} users`,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('❌ Daily reset cron job failed:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// Also support POST for Vercel cron
export const POST = GET;