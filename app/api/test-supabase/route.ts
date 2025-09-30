import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    console.log('Testing Supabase connection from API route...');

    // Test the connection by getting session (should return null for new users)
    const { data, error } = await supabase.auth.getSession();

    console.log('Supabase test result:', { data, error });

    if (error) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          details: 'Failed to connect to Supabase'
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Supabase connection successful',
      hasSession: !!data.session
    });

  } catch (error: any) {
    console.error('Supabase test error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        details: 'Exception during Supabase test'
      },
      { status: 500 }
    );
  }
}