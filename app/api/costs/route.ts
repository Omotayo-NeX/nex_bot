import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getUserCosts, getAllUsersCosts } from '@/lib/openai-cost-tracker';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  try {
    // Get auth token from header
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);

    // Verify token with Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30'; // days
    const isAdmin = searchParams.get('admin') === 'true';

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Check if user is admin (you may want to add admin check logic here)
    if (isAdmin) {
      // For now, only allow if explicitly checking for admin
      // TODO: Add proper admin role check
      const costs = await getAllUsersCosts(startDate, endDate);
      return NextResponse.json({
        success: true,
        period: `${period} days`,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        ...costs,
      });
    }

    // Get costs for the authenticated user
    const costs = await getUserCosts(user.id, startDate, endDate);

    return NextResponse.json({
      success: true,
      userId: user.id,
      period: `${period} days`,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      ...costs,
    });

  } catch (error: any) {
    console.error('Error fetching costs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch costs', details: error.message },
      { status: 500 }
    );
  }
}
