import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

// Rolling 24-hour rate limiting (10 requests per user per 24-hour window)
let requestLog: Record<string, number[]> = {};

function getClientIP(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  const realIP = req.headers.get('x-real-ip');
  const remoteAddress = forwarded?.split(',')[0].trim() || realIP || 'unknown';
  return remoteAddress;
}

function checkRateLimit(clientIP: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const twentyFourHours = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  const maxRequests = 10;

  // Initialize user's request log if it doesn't exist
  if (!requestLog[clientIP]) {
    requestLog[clientIP] = [];
  }

  // Filter out requests older than 24 hours (rolling window)
  requestLog[clientIP] = requestLog[clientIP].filter(timestamp => {
    return now - timestamp < twentyFourHours;
  });

  const currentRequests = requestLog[clientIP].length;
  const remaining = Math.max(0, maxRequests - currentRequests);

  // Check if user has exceeded the limit
  if (currentRequests >= maxRequests) {
    return { allowed: false, remaining: 0 };
  }

  // Log this request
  requestLog[clientIP].push(now);
  
  return { allowed: true, remaining: remaining - 1 };
}

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
    // Check rate limit first
    const clientIP = getClientIP(req);
    const rateLimit = checkRateLimit(clientIP);
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Daily limit of 10 voice generations reached (24h rolling window)' },
        { status: 429 }
      );
    }

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

    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'ElevenLabs API key not configured' },
        { status: 500 }
      );
    }

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
        errorMessage = 'Invalid ElevenLabs API key. Please check your configuration.';
      } else if (response.status === 422) {
        errorMessage = errorMessage.includes('detail') ? errorMessage : 'Invalid voice parameters or text content.';
      } else if (response.status === 429) {
        errorMessage = 'Rate limit exceeded. Please try again later.';
      }

      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      );
    }

    // Get the audio stream
    const audioBuffer = await response.arrayBuffer();

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