import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { prisma } from '@/lib/prisma';
import { extractReceiptData } from '@/lib/expensa/ai-extraction';

/**
 * POST /api/expensa/scan
 * Scan an existing expense receipt with AI and update the expense
 */
export async function POST(req: NextRequest) {
  try {
    // Authenticate with Supabase
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { expenseId } = body;

    if (!expenseId) {
      return NextResponse.json(
        { error: 'Expense ID is required' },
        { status: 400 }
      );
    }

    // Fetch the expense
    const expense = await prisma.expense.findFirst({
      where: {
        id: expenseId,
        userId: user.id
      }
    });

    if (!expense) {
      return NextResponse.json(
        { error: 'Expense not found' },
        { status: 404 }
      );
    }

    if (!expense.receiptUrl) {
      return NextResponse.json(
        { error: 'No receipt image found for this expense' },
        { status: 400 }
      );
    }

    // Fetch the receipt image
    let imageBase64 = expense.receiptUrl;

    // If it's a Supabase URL, fetch it
    if (imageBase64.startsWith('http')) {
      const imageResponse = await fetch(imageBase64);
      const imageBuffer = await imageResponse.arrayBuffer();
      const buffer = Buffer.from(imageBuffer);
      const base64 = buffer.toString('base64');

      // Determine MIME type from URL or default to jpeg
      const mimeType = imageBase64.includes('.png') ? 'image/png' :
                       imageBase64.includes('.jpg') || imageBase64.includes('.jpeg') ? 'image/jpeg' :
                       'image/jpeg';
      imageBase64 = `data:${mimeType};base64,${base64}`;
    }

    console.log('🤖 Starting AI scan for expense:', expenseId);

    // Track start time for performance
    const startTime = Date.now();

    // Extract data using AI
    const extractedData = await extractReceiptData(imageBase64);

    const processingTime = Date.now() - startTime;

    console.log('✅ AI scan completed in', processingTime, 'ms');

    // Calculate confidence score (simple heuristic based on completeness)
    let confidence = 0;
    if (extractedData.merchantName && extractedData.merchantName !== 'Unknown Merchant') confidence += 25;
    if (extractedData.amount > 0) confidence += 25;
    if (extractedData.currency) confidence += 15;
    if (extractedData.expenseDate) confidence += 15;
    if (extractedData.category && extractedData.category !== 'Other') confidence += 20;

    // Update the expense with AI-extracted data
    const updatedExpense = await prisma.expense.update({
      where: { id: expenseId },
      data: {
        merchantName: extractedData.merchantName,
        amount: extractedData.amount,
        detectedCurrency: extractedData.currency,
        receiptDate: new Date(extractedData.expenseDate),
        category: extractedData.category,
        description: extractedData.description || expense.description,
        aiScanned: true,
        aiConfidence: confidence
      }
    });

    // Log the AI scan
    await prisma.aiReceiptLog.create({
      data: {
        expenseId,
        modelUsed: 'gpt-4o',
        promptTokens: 0, // Will be calculated if using token tracking
        completionTokens: 0,
        totalTokens: 0,
        costUsd: 0.001, // Approximate cost per scan
        rawResponse: extractedData as any,
        confidenceScore: confidence,
        extractionStatus: 'success'
      }
    });

    return NextResponse.json({
      success: true,
      expense: updatedExpense,
      extractedData,
      confidence,
      processingTime
    });
  } catch (error: any) {
    console.error('POST /api/expensa/scan error:', error);

    // Log the failed scan
    try {
      const body = await req.json();
      if (body.expenseId) {
        await prisma.aiReceiptLog.create({
          data: {
            expenseId: body.expenseId,
            modelUsed: 'gpt-4o',
            extractionStatus: 'failed',
            errorMessage: error.message
          }
        });
      }
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }

    return NextResponse.json(
      { error: 'Failed to scan receipt', details: error.message },
      { status: 500 }
    );
  }
}
