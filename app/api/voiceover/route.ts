import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { prisma } from "@/lib/prisma";
import { checkFeatureAccess, incrementUsage } from '@/lib/usage-tracking';

// Voice ID mappings for ElevenLabs voices
const VOICE_IDS = {
  'Rachel': '21m00Tcm4TlvDq8ikWAM',
  'Drew': '29vD33N1CtxCmqQRPOHJ', 
  'Clyde': '2EiwWnXFnvU5JabPnv8n',
  'Paul': '5Q0t7uMcjvnagumLfvZi',
  'Domi': 'AZnzlk1XvdvUeBnXmlld',
  'Dave': 'CYw3kZ02Hs0563khs1Fj',
};

export async function POST(req: NextRequest) {
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
        { error: 'Authentication required. Please sign in to use voice generation.' },
        { status: 401 }
      );
    }

    const accessToken = authHeader.substring(7);
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required. Please sign in to use voice generation.' },
        { status: 401 }
      );
    }

    // Check feature access and usage limits
    const accessCheck = await checkFeatureAccess(user.id, 'voice');
    if (!accessCheck.allowed) {
      console.log(`🚫 [Voice API] Feature access denied for user ${user.id}: ${accessCheck.message}`);
      return NextResponse.json({ 
        error: accessCheck.message,
        isLimitReached: true,
        currentUsage: accessCheck.usage,
        upgradeRequired: true
      }, { status: 403 });
    }

    // Get request body
    const { text, voice = 'Rachel' } = await req.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text is required and must be a string' },
        { status: 400 }
      );
    }

    if (text.length > 2500) {
      return NextResponse.json(
        { error: 'Text is too long. Maximum 2500 characters allowed.' },
        { status: 400 }
      );
    }

    // Check ElevenLabs API key
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Voice generation service is temporarily unavailable' },
        { status: 500 }
      );
    }

    // Log the voice request
    await prisma.voiceRequest.create({
      data: { userId: user.id },
    });

    // Generate voice with ElevenLabs
    const voiceId = VOICE_IDS[voice as keyof typeof VOICE_IDS] || VOICE_IDS.Rachel;
    const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.4,
          similarity_boost: 0.8,
          style: 0.0,
          use_speaker_boost: true,
        },
      }),
    });

    if (!response.ok) {
      let errorMessage = 'Failed to generate voice. Please try again.';
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail?.message || errorData.message || errorData.error || errorMessage;
      } catch {
        // If response is not JSON, try to get text
        try {
          const errorText = await response.text();
          errorMessage = errorText || errorMessage;
        } catch {
          // Keep default error message
        }
      }
      
      console.error('ElevenLabs API error:', response.status, errorMessage);
      
      // Provide specific error messages for common status codes
      if (response.status === 401) {
        errorMessage = 'Voice generation service authentication failed.';
      } else if (response.status === 422) {
        errorMessage = errorMessage.includes('detail') ? errorMessage : 'Invalid voice parameters or text content.';
      } else if (response.status === 429) {
        errorMessage = 'Voice generation service rate limit exceeded. Please try again later.';
      }

      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      );
    }

    // Get the audio stream
    const audioBuffer = await response.arrayBuffer();

    // Estimate voice duration in minutes (rough approximation: ~150 words per minute)
    const wordCount = text.split(/\s+/).length;
    const estimatedMinutes = Math.max(1, Math.ceil(wordCount / 150)); // Minimum 1 minute

    // Increment usage counter for successful voice generation
    await incrementUsage(user.id, 'voice', estimatedMinutes);
    console.log(`✅ [Usage] Voice usage incremented by ${estimatedMinutes} minutes for user ${user.id}`);

    // Return the audio file
    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.byteLength.toString(),
        'Cache-Control': 'no-cache',
      },
    });

  } catch (error) {
    console.error('VoiceOver API error:', error);
    return NextResponse.json(
      { error: 'Internal server error. Please try again.' },
      { status: 500 }
    );
  }
}