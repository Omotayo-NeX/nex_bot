import { NextRequest, NextResponse } from 'next/server';

// Type definitions for provider responses
interface ImageGenerationResponse {
  success: boolean;
  imageUrl?: string;
  prompt: string;
  revised_prompt?: string;
  provider?: string;
}

interface ProviderError {
  error: string;
  provider: string;
}

// Provider selection logic
function selectImageProvider(): { provider: string; apiKey: string | null } {
  const geminiKey = process.env.GEMINI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;
  const stabilityKey = process.env.STABILITY_API_KEY;

  if (geminiKey) {
    console.log('🎨 [Image Generation] Using Gemini (Google) as image provider');
    return { provider: 'gemini', apiKey: geminiKey };
  } else if (openaiKey) {
    console.log('🎨 [Image Generation] Using OpenAI DALL-E as image provider');
    return { provider: 'openai', apiKey: openaiKey };
  } else if (stabilityKey) {
    console.log('🎨 [Image Generation] Using Stability.ai as image provider');
    return { provider: 'stability', apiKey: stabilityKey };
  } else {
    console.warn('⚠️ [Image Generation] No image generation provider configured');
    return { provider: 'none', apiKey: null };
  }
}

// OpenAI DALL-E implementation
async function generateWithOpenAI(prompt: string, apiKey: string): Promise<ImageGenerationResponse | ProviderError> {
  try {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: prompt,
        n: 1,
        size: '1024x1024',
        quality: 'standard',
        response_format: 'url'
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI DALL-E API error:', errorData);
      return { error: 'Failed to generate image with OpenAI DALL-E. Please try again with a different prompt.', provider: 'openai' };
    }

    const data = await response.json();
    
    if (data.data && data.data[0] && data.data[0].url) {
      return {
        success: true,
        imageUrl: data.data[0].url,
        prompt: prompt,
        revised_prompt: data.data[0].revised_prompt || prompt,
        provider: 'openai'
      };
    } else {
      console.error('Unexpected OpenAI response format:', data);
      return { error: 'OpenAI image generation failed. Please try again.', provider: 'openai' };
    }
  } catch (error) {
    console.error('OpenAI image generation error:', error);
    return { error: 'OpenAI image generation encountered an error.', provider: 'openai' };
  }
}

// Gemini implementation (placeholder - would need actual Gemini API integration)
async function generateWithGemini(prompt: string, apiKey: string): Promise<ImageGenerationResponse | ProviderError> {
  // Note: This is a placeholder. Gemini's image generation API would need to be implemented
  // based on their actual API documentation when available
  console.log('Gemini image generation called with prompt:', prompt);
  return { 
    error: 'Gemini image generation is not yet implemented. Please use OpenAI or Stability.ai instead.', 
    provider: 'gemini' 
  };
}

// Stability.ai implementation
async function generateWithStability(prompt: string, apiKey: string): Promise<ImageGenerationResponse | ProviderError> {
  try {
    const response = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-v1-6/text-to-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        text_prompts: [
          {
            text: prompt,
            weight: 1
          }
        ],
        cfg_scale: 7,
        height: 1024,
        width: 1024,
        samples: 1,
        steps: 30,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Stability.ai API error:', errorData);
      return { error: 'Failed to generate image with Stability.ai. Please try again with a different prompt.', provider: 'stability' };
    }

    const data = await response.json();
    
    if (data.artifacts && data.artifacts[0] && data.artifacts[0].base64) {
      // Convert base64 to data URL
      const imageUrl = `data:image/png;base64,${data.artifacts[0].base64}`;
      return {
        success: true,
        imageUrl: imageUrl,
        prompt: prompt,
        provider: 'stability'
      };
    } else {
      console.error('Unexpected Stability.ai response format:', data);
      return { error: 'Stability.ai image generation failed. Please try again.', provider: 'stability' };
    }
  } catch (error) {
    console.error('Stability.ai image generation error:', error);
    return { error: 'Stability.ai image generation encountered an error.', provider: 'stability' };
  }
}

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Prompt is required and must be a string' },
        { status: 400 }
      );
    }

    console.log('🖼️ [Image Generation Request] Prompt:', prompt.substring(0, 100) + (prompt.length > 100 ? '...' : ''));

    // Select provider based on available environment variables
    const { provider, apiKey } = selectImageProvider();

    if (provider === 'none') {
      return NextResponse.json(
        { 
          error: '⚠️ No image generation provider configured. Please set GEMINI_API_KEY, OPENAI_API_KEY, or STABILITY_API_KEY in your environment variables.',
          availableProviders: ['gemini', 'openai', 'stability']
        },
        { status: 500 }
      );
    }

    let result: ImageGenerationResponse | ProviderError;

    // Generate image using the selected provider
    switch (provider) {
      case 'gemini':
        result = await generateWithGemini(prompt, apiKey!);
        break;
      case 'openai':
        result = await generateWithOpenAI(prompt, apiKey!);
        break;
      case 'stability':
        result = await generateWithStability(prompt, apiKey!);
        break;
      default:
        return NextResponse.json(
          { error: 'Unknown provider selected.', provider },
          { status: 500 }
        );
    }

    // Handle provider-specific errors
    if ('error' in result) {
      console.error(`❌ [${result.provider.toUpperCase()}] Image generation failed:`, result.error);
      return NextResponse.json(
        { error: result.error, provider: result.provider },
        { status: 500 }
      );
    }

    // Success response
    console.log(`✅ [${provider.toUpperCase()}] Image generated successfully for prompt: ${prompt.substring(0, 50)}...`);
    return NextResponse.json(result);

  } catch (error) {
    console.error('💥 [Image Generation] Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred during image generation. Please try again.' },
      { status: 500 }
    );
  }
}