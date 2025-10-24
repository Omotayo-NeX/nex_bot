import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { extractReceiptData } from '@/lib/expensa/ai-extraction';

// Increase body size limit to 10MB
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export async function POST(req: NextRequest) {
  try {
    // Check for authentication (optional for field worker uploads)
    const authHeader = req.headers.get('authorization');
    let user = null;
    let userId = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          global: {
            headers: { Authorization: `Bearer ${token}` }
          }
        }
      );

      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      if (!authError && authUser) {
        user = authUser;
        userId = authUser.id;
      }
    }

    // Create Supabase client (with or without auth)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Parse form data
    const formData = await req.formData();
    const file = formData.get('receipt') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 });
    }

    // Validate file size (8MB max to account for base64 encoding overhead)
    if (file.size > 8 * 1024 * 1024) {
      return NextResponse.json({
        error: 'File size must be less than 8MB. Please compress your image and try again.'
      }, { status: 413 });
    }

    // Convert file to base64 for OpenAI
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');
    const imageBase64 = `data:${file.type};base64,${base64}`;

    console.log('Starting AI extraction for file:', file.name, 'size:', file.size);

    // Extract data using AI
    const extractedData = await extractReceiptData(imageBase64);

    console.log('AI extraction successful:', extractedData);

    // Upload to Supabase Storage
    // Use "public" folder for anonymous uploads, user ID folder for authenticated
    const folder = userId || 'field-submissions';
    const fileName = `${folder}/${Date.now()}-${file.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('receipts')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      // Continue even if upload fails - we still have extracted data
    }

    // Get public URL
    let receiptUrl = null;
    if (uploadData) {
      const { data: { publicUrl } } = supabase.storage
        .from('receipts')
        .getPublicUrl(uploadData.path);
      receiptUrl = publicUrl;
      console.log('✅ Receipt uploaded to Supabase:', publicUrl);
    } else {
      console.warn('⚠️ Storage upload failed, using base64 fallback');
    }

    // If no URL from storage, try direct data URI (fallback)
    if (!receiptUrl) {
      receiptUrl = imageBase64;
    }

    return NextResponse.json({
      ...extractedData,
      url: receiptUrl,
      receiptUrl // Keep both for compatibility
    });
  } catch (error: any) {
    console.error('POST /api/expensa/upload error:', error);

    // Handle payload too large errors
    if (error.message?.includes('too large') || error.code === 'ERR_HTTP_CONTENT_LENGTH_MISMATCH') {
      return NextResponse.json(
        { error: 'File is too large. Please use an image smaller than 8MB.' },
        { status: 413 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to process receipt', details: error.message },
      { status: 500 }
    );
  }
}
