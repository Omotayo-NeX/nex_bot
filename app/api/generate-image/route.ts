import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Prompt is required and must be a string' },
        { status: 400 }
      );
    }

    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      console.error('OPENAI_API_KEY is not set in environment variables');
      return NextResponse.json(
        { error: 'API configuration error' },
        { status: 500 }
      );
    }

    // Use OpenAI's DALL-E for actual image generation
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`,
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
      return NextResponse.json(
        { error: 'Failed to generate image. Please try again with a different prompt.' },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Extract the image URL from the response
    if (data.data && data.data[0] && data.data[0].url) {
      return NextResponse.json({ 
        success: true, 
        imageUrl: data.data[0].url,
        prompt: prompt,
        revised_prompt: data.data[0].revised_prompt || prompt
      });
    } else {
      console.error('Unexpected response format:', data);
      return NextResponse.json(
        { error: 'Image generation failed. Please try again.' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error generating image:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}