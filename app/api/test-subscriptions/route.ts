import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    // Test fetching from both tables
    const [nexaiRes, elevenRes] = await Promise.all([
      supabase.from('nexai_subscriptions').select('*').limit(5),
      supabase.from('elevenone_subscriptions').select('*').limit(5),
    ]);

    return NextResponse.json({
      success: true,
      nexai: {
        count: nexaiRes.data?.length || 0,
        data: nexaiRes.data || [],
        error: nexaiRes.error,
      },
      elevenone: {
        count: elevenRes.data?.length || 0,
        data: elevenRes.data || [],
        error: elevenRes.error,
      },
    });
  } catch (error) {
    console.error('Test subscriptions error:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
