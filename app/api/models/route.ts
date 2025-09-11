import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const token = await getToken({ req });
    if (!token || !token.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Define available models
    // These could later be fetched from OpenAI API or be configurable based on user plan
    const availableModels = [
      {
        id: 'gpt-4o-mini',
        name: 'GPT-4o Mini',
        description: 'Most capable and efficient model',
        provider: 'openai',
        contextWindow: '128K tokens',
        recommended: true
      },
      {
        id: 'gpt-4o',
        name: 'GPT-4o',
        description: 'Advanced reasoning and creativity',
        provider: 'openai',
        contextWindow: '128K tokens',
        recommended: false
      },
      {
        id: 'gpt-3.5-turbo',
        name: 'GPT-3.5 Turbo',
        description: 'Quick responses and good performance',
        provider: 'openai',
        contextWindow: '16K tokens',
        recommended: false
      },
      {
        id: 'gpt-4',
        name: 'GPT-4',
        description: 'Previous generation, high quality',
        provider: 'openai',
        contextWindow: '8K tokens',
        recommended: false
      }
    ];

    return NextResponse.json({
      models: availableModels,
      default: 'gpt-4o-mini'
    });

  } catch (error: any) {
    console.error('Models API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}