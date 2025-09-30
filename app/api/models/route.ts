import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Helper functions for model information
function getModelDisplayName(modelId: string): string {
  const displayNames: { [key: string]: string } = {
    'gpt-4.1-mini': 'GPT-4.1 Mini',
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
    'gpt-4.1-mini': 'Latest optimized model - most recommended',
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
    'gpt-4.1-mini': '128K tokens',
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
      id: 'gpt-4.1-mini',
      name: 'GPT-4.1 Mini',
      description: 'Latest optimized model - most recommended',
      provider: 'openai',
      contextWindow: '128K tokens',
      recommended: true
    },
    {
      id: 'gpt-4o-mini',
      name: 'GPT-4o Mini',
      description: 'Most capable and efficient model - recommended',
      provider: 'openai',
      contextWindow: '128K tokens',
      recommended: false
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
    // Authenticate with Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const accessToken = authHeader.substring(7);
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // First try to fetch from published prompts API
    let availableModels = [];
    let defaultModel = 'gpt-4o-mini';
    
    try {
      const promptsResponse = await fetch('https://api.openai.com/v1/prompts', {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      if (promptsResponse.ok) {
        const promptsData = await promptsResponse.json();
        console.log('Published prompts data:', promptsData);
        
        if (promptsData.data && Array.isArray(promptsData.data)) {
          // Parse prompts and extract models
          const promptModels = promptsData.data.map((prompt: any) => ({
            id: prompt.model || 'gpt-4o-mini',
            name: prompt.name || getModelDisplayName(prompt.model || 'gpt-4o-mini'),
            description: prompt.description || getModelDescription(prompt.model || 'gpt-4o-mini'),
            provider: 'openai',
            contextWindow: getModelContextWindow(prompt.model || 'gpt-4o-mini'),
            recommended: prompt.name?.toLowerCase().includes('nex') || false,
            promptId: prompt.id
          }));

          if (promptModels.length > 0) {
            availableModels = promptModels;
            // Set default to NeX AI prompt if available
            const nexPrompt = promptModels.find((model: any) => model.name?.toLowerCase().includes('nex'));
            if (nexPrompt) {
              defaultModel = nexPrompt.id;
            }
          }
        }
      } else {
        console.warn('Published prompts API failed, falling back to standard models');
      }
    } catch (error) {
      console.warn('Error fetching published prompts, falling back to standard models:', error);
    }

    // If no published prompts found, fallback to standard OpenAI models
    if (availableModels.length === 0) {
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
              model.id === 'gpt-4o' ||
              model.id === 'gpt-4.1-mini'  // Add gpt-4.1-mini if available
            )
            .sort((a: any, b: any) => {
              // Sort by preference: gpt-4.1-mini first, then gpt-4o-mini, then others
              const order = ['gpt-4.1-mini', 'gpt-4o-mini', 'gpt-4o', 'gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo'];
              return order.indexOf(a.id) - order.indexOf(b.id);
            })
            .map((model: any) => ({
              id: model.id,
              name: getModelDisplayName(model.id),
              description: getModelDescription(model.id),
              provider: 'openai',
              contextWindow: getModelContextWindow(model.id),
              recommended: model.id === 'gpt-4.1-mini' || model.id === 'gpt-4o-mini'
            }));

          availableModels = relevantModels.length > 0 ? relevantModels : getFallbackModels();
          
          // Update default model if gpt-4.1-mini is available
          const gpt41Mini = relevantModels.find((model: any) => model.id === 'gpt-4.1-mini');
          if (gpt41Mini) {
            defaultModel = 'gpt-4.1-mini';
          }
        } else {
          console.warn('OpenAI models API failed, using fallback models');
          availableModels = getFallbackModels();
        }
      } catch (error) {
        console.warn('Error fetching OpenAI models, using fallback:', error);
        availableModels = getFallbackModels();
      }
    }

    return NextResponse.json({
      models: availableModels,
      default: defaultModel
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