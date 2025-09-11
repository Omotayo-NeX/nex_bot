import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getClientIP } from '../../../lib/rate-limit';
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

// OpenAI provider selection logic
function getOpenAIProvider(): { provider: string; apiKey: string | null } {
  const openaiKey = process.env.OPENAI_API_KEY;

  if (openaiKey) {
    console.log('🎨 [Image Generation] Using OpenAI DALL-E as image provider');
    return { provider: 'openai', apiKey: openaiKey };
  } else {
    console.warn('⚠️ [Image Generation] No OpenAI API key configured');
    return { provider: 'none', apiKey: null };
  }
}

// OpenAI DALL-E implementation
async function generateWithOpenAI(prompt: string, model: string, apiKey: string): Promise<ImageGenerationResponse | ProviderError> {
  try {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model, // Use the model passed from frontend (dall-e-2 or dall-e-3)
        prompt: prompt,
        n: 1,
        size: '1024x1024',
        quality: model === 'dall-e-3' ? 'standard' : undefined, // Only dall-e-3 supports quality parameter
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


export async function POST(req: NextRequest) {
  try {

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

    const { prompt, model = 'dall-e-3' } = await req.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Prompt is required and must be a string', isError: true },
        { status: 400 }
      );
    }

    console.log('🖼️ [Image Generation Request] Model:', model, 'Prompt:', prompt.substring(0, 100) + (prompt.length > 100 ? '...' : ''));

    // Validate model parameter
    if (!['dall-e-2', 'dall-e-3'].includes(model)) {
      return NextResponse.json(
        { error: 'Invalid model. Only dall-e-2 and dall-e-3 are supported.', isError: true },
        { status: 400 }
      );
    }

    // Get OpenAI API key
    const { provider, apiKey } = getOpenAIProvider();

    if (provider === 'none') {
      return NextResponse.json(
        { 
          error: '⚠️ No OpenAI API key configured. Please set OPENAI_API_KEY in your environment variables.',
          isError: true
        },
        { status: 500 }
      );
    }

    // Generate image using OpenAI DALL-E
    const result = await generateWithOpenAI(prompt, model, apiKey!);

    // Handle errors
    if ('error' in result) {
      console.error(`❌ [OPENAI] Image generation failed:`, result.error);
      return NextResponse.json(
        { error: result.error, provider: result.provider, isError: true },
        { status: 500 }
      );
    }

    // Increment usage counter for successful image generation
    await incrementUsage(token.id as string, 'video', 1);
    console.log(`✅ [Usage] Video usage incremented for user ${token.id}`);

    // Success response
    console.log(`✅ [OPENAI] Image generated successfully with ${model} for prompt: ${prompt.substring(0, 50)}...`);
    return NextResponse.json(result);

  } catch (error) {
    console.error('💥 [Image Generation] Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred during image generation. Please try again.', isError: true },
      { status: 500 }
    );
  }
}