import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Helper functions for model information
function getModelDisplayName(modelId: string): string {
  const displayNames: { [key: string]: string } = {
    'gpt-4o-mini': 'GPT-4o Mini',
    'gpt-4o': 'GPT-4o',
    'gpt-4-turbo': 'GPT-4 Turbo',
    'gpt-4': 'GPT-4',
    'gpt-3.5-turbo': 'GPT-3.5 Turbo',
    'gpt-3.5-turbo-16k': 'GPT-3.5 Turbo 16K',
  };
  return displayNames[modelId] || modelId.toUpperCase();
}

function getModelDescription(modelId: string): string {
  const descriptions: { [key: string]: string } = {
    'gpt-4o-mini': 'Most capable and efficient model - recommended',
    'gpt-4o': 'Advanced reasoning and creativity',
    'gpt-4-turbo': 'Fast and capable, optimized for speed',
    'gpt-4': 'High quality reasoning and analysis',
    'gpt-3.5-turbo': 'Quick responses and good performance',
    'gpt-3.5-turbo-16k': 'Extended context window version',
  };
  return descriptions[modelId] || 'OpenAI language model';
}

function getModelContextWindow(modelId: string): string {
  const contextWindows: { [key: string]: string } = {
    'gpt-4o-mini': '128K tokens',
    'gpt-4o': '128K tokens',
    'gpt-4-turbo': '128K tokens',
    'gpt-4': '8K tokens',
    'gpt-3.5-turbo': '16K tokens',
    'gpt-3.5-turbo-16k': '16K tokens',
  };
  return contextWindows[modelId] || 'Standard context';
}

function getFallbackModels() {
  return [
    {
      id: 'gpt-4o-mini',
      name: 'GPT-4o Mini',
      description: 'Most capable and efficient model - recommended',
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
    }
  ];
}

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

    // Fetch available models from OpenAI API
    let availableModels = [];
    
    try {
      const openAIResponse = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      if (openAIResponse.ok) {
        const data = await openAIResponse.json();
        
        // Filter and format models we want to show to users
        const relevantModels = data.data
          .filter((model: any) => 
            model.id.includes('gpt-4') || 
            model.id.includes('gpt-3.5') ||
            model.id === 'gpt-4o-mini' ||
            model.id === 'gpt-4o'
          )
          .sort((a: any, b: any) => {
            // Sort by preference: gpt-4o-mini first, then others
            const order = ['gpt-4o-mini', 'gpt-4o', 'gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo'];
            return order.indexOf(a.id) - order.indexOf(b.id);
          })
          .map((model: any) => ({
            id: model.id,
            name: getModelDisplayName(model.id),
            description: getModelDescription(model.id),
            provider: 'openai',
            contextWindow: getModelContextWindow(model.id),
            recommended: model.id === 'gpt-4o-mini'
          }));

        availableModels = relevantModels.length > 0 ? relevantModels : getFallbackModels();
      } else {
        console.warn('OpenAI models API failed, using fallback models');
        availableModels = getFallbackModels();
      }
    } catch (error) {
      console.warn('Error fetching OpenAI models, using fallback:', error);
      availableModels = getFallbackModels();
    }

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