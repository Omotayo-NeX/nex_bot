import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getClientIP } from '../../../lib/rate-limit';
import { requireEmailVerification } from '../../../lib/auth-middleware';
import { checkFeatureAccess, incrementUsage } from '../../../lib/usage-tracking';
import { getToken } from 'next-auth/jwt';

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
    // Check authentication and email verification
    const authError = await requireEmailVerification(req);
    if (authError) {
      return authError;
    }

    // Get user token for usage tracking
    const token = await getToken({ req });
    if (!token || !token.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check feature access and usage limits
    const accessCheck = await checkFeatureAccess(token.id as string, 'video');
    if (!accessCheck.allowed) {
      console.log(`🚫 [Image API] Feature access denied for user ${token.id}: ${accessCheck.message}`);
      return NextResponse.json({ 
        error: accessCheck.message,
        isLimitReached: true,
        currentUsage: accessCheck.usage,
        upgradeRequired: true
      }, { status: 403 });
    }

    // Get client IP for rate limiting
    const clientIP = getClientIP(req);
    
    // Check rate limits
    const rateLimit = await checkRateLimit(clientIP);
    if (!rateLimit.success) {
      console.log(`🚫 [Image API] Rate limit exceeded for ${clientIP}: ${rateLimit.error}`);
      return NextResponse.json({
        error: rateLimit.error,
        isRateLimit: true,
        type: rateLimit.type,
        reset: rateLimit.reset instanceof Date ? rateLimit.reset.toISOString() : rateLimit.reset,
      }, { status: 429 });
    }

    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Prompt is required and must be a string', isError: true },
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
          availableProviders: ['gemini', 'openai', 'stability'],
          isError: true
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
        { error: result.error, provider: result.provider, isError: true },
        { status: 500 }
      );
    }

    // Increment usage counter for successful image generation
    await incrementUsage(token.id as string, 'video', 1);
    console.log(`✅ [Usage] Video usage incremented for user ${token.id}`);

    // Success response
    console.log(`✅ [${provider.toUpperCase()}] Image generated successfully for prompt: ${prompt.substring(0, 50)}...`);
    return NextResponse.json(result);

  } catch (error) {
    console.error('💥 [Image Generation] Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred during image generation. Please try again.', isError: true },
      { status: 500 }
    );
  }
}