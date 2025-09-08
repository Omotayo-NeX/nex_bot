import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required. Please sign in to use voice generation.' },
        { status: 401 }
      );
    }

    // Get user from database
    const user = await prisma.user.findUnique({ 
      where: { email: session.user.email } 
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found. Please try signing in again.' },
        { status: 401 }
      );
    }

    // Check rate limit (rolling 24-hour window)
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago
    const requestCount = await prisma.voiceRequest.count({
      where: {
        userId: user.id,
        createdAt: { gte: cutoff },
      },
    });

    if (requestCount >= 10) {
      return NextResponse.json(
        { error: 'Daily limit of 10 voice generations reached. Limit resets in 24 hours from your first request today.' },
        { status: 429 }
      );
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