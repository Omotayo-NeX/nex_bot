import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { imageUrl, filename } = await req.json();

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Image URL is required' },
        { status: 400 }
      );
    }

    // If it's a data URL, return it as is
    if (imageUrl.startsWith('data:')) {
      return NextResponse.json({
        success: true,
        dataUrl: imageUrl,
        filename: filename || 'image.png'
      });
    }

    console.log('📥 [Download] Fetching image from:', imageUrl.substring(0, 100) + '...');

    // Fetch the image from the external URL
    const response = await fetch(imageUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'NeXBot/1.0',
        'Accept': 'image/*,*/*',
      }
    });

    if (!response.ok) {
      console.error('❌ [Download] Failed to fetch image:', response.status, response.statusText);
      return NextResponse.json(
        { error: `Failed to fetch image: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Get the content type
    const contentType = response.headers.get('content-type') || 'image/png';
    
    console.log('✅ [Download] Image fetched successfully, size:', buffer.length, 'bytes');

    // Convert to base64 data URL for frontend download
    const base64 = buffer.toString('base64');
    const dataUrl = `data:${contentType};base64,${base64}`;

    return NextResponse.json({
      success: true,
      dataUrl: dataUrl,
      filename: filename || 'nex-image.png',
      size: buffer.length,
      contentType: contentType
    });

  } catch (error) {
    console.error('💥 [Download] Error:', error);
    return NextResponse.json(
      { error: 'Failed to process image download' },
      { status: 500 }
    );
  }
}