import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyFieldLinkToken, isFieldLinkExpired } from '@/lib/expensa/field-link-utils';
import { createClient } from '@supabase/supabase-js';

/**
 * POST /api/expensa/submit
 * Submit an expense via field worker link (NO AUTH REQUIRED)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      token, // Field link token
      amount,
      description,
      category,
      receiptUrl,
      location
    } = body;

    // Validation
    if (!token) {
      return NextResponse.json(
        { error: 'Field link token is required' },
        { status: 400 }
      );
    }

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Valid amount is required' },
        { status: 400 }
      );
    }

    if (!category) {
      return NextResponse.json(
        { error: 'Category is required' },
        { status: 400 }
      );
    }

    if (!receiptUrl) {
      return NextResponse.json(
        { error: 'Receipt photo is required' },
        { status: 400 }
      );
    }

    // Verify the token
    const tokenPayload = await verifyFieldLinkToken(token);
    if (!tokenPayload) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Find the field link in database
    const fieldLink = await prisma.fieldLink.findUnique({
      where: { inviteToken: token }
    });

    if (!fieldLink) {
      return NextResponse.json(
        { error: 'Field link not found' },
        { status: 404 }
      );
    }

    // Check if link is still active
    if (!fieldLink.isActive) {
      return NextResponse.json(
        { error: 'This link has been revoked' },
        { status: 403 }
      );
    }

    // Check expiry
    if (isFieldLinkExpired(fieldLink.expiresAt)) {
      // Auto-deactivate expired link
      await prisma.fieldLink.update({
        where: { id: fieldLink.id },
        data: { isActive: false }
      });

      return NextResponse.json(
        { error: 'This link has expired' },
        { status: 403 }
      );
    }

    // Check max uses
    if (fieldLink.maxUses && fieldLink.currentUses >= fieldLink.maxUses) {
      return NextResponse.json(
        { error: 'This link has reached its maximum usage limit' },
        { status: 403 }
      );
    }

    // Create the expense
    const expense = await prisma.expense.create({
      data: {
        userId: fieldLink.businessId,
        fieldLinkId: fieldLink.id,
        workerName: fieldLink.workerName,
        merchantName: description || 'Field Submission',
        category,
        amount,
        currency: 'NGN', // Default
        description,
        receiptUrl,
        location,
        expenseDate: new Date(),
        status: 'pending',
        submissionMethod: 'field_worker',
        projectName: fieldLink.projectName
      }
    });

    // Increment usage counter
    await prisma.fieldLink.update({
      where: { id: fieldLink.id },
      data: { currentUses: { increment: 1 } }
    });

    // Create notification for business owner
    await prisma.expenseNotification.create({
      data: {
        businessId: fieldLink.businessId,
        expenseId: expense.id,
        notificationType: 'new_submission',
        title: 'New Expense Submitted',
        message: `${fieldLink.workerName} submitted a ₦${amount} ${category} expense${fieldLink.projectName ? ` for ${fieldLink.projectName}` : ''}.`,
        metadata: {
          workerName: fieldLink.workerName,
          amount,
          category,
          projectName: fieldLink.projectName
        }
      }
    });

    // TODO: Send email notification (optional)
    // TODO: Send webhook notification (optional)

    return NextResponse.json({
      success: true,
      message: 'Expense submitted successfully! Your submission will be reviewed shortly.',
      expense: {
        id: expense.id,
        amount: expense.amount,
        category: expense.category,
        status: expense.status,
        createdAt: expense.createdAt
      }
    }, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/expensa/submit error:', error);
    return NextResponse.json(
      { error: 'Failed to submit expense', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/expensa/submit?token=xxx
 * Validate a field link token and return link details
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    // Verify the token
    const tokenPayload = await verifyFieldLinkToken(token);
    if (!tokenPayload) {
      return NextResponse.json(
        { valid: false, error: 'Invalid or expired token' },
        { status: 200 }
      );
    }

    // Find the field link
    const fieldLink = await prisma.fieldLink.findUnique({
      where: { inviteToken: token },
      select: {
        id: true,
        workerName: true,
        projectName: true,
        expiresAt: true,
        isActive: true,
        maxUses: true,
        currentUses: true,
        allowedActions: true
      }
    });

    if (!fieldLink) {
      return NextResponse.json(
        { valid: false, error: 'Link not found' },
        { status: 200 }
      );
    }

    // Check validity
    const isExpired = isFieldLinkExpired(fieldLink.expiresAt);
    const isMaxed = fieldLink.maxUses ? fieldLink.currentUses >= fieldLink.maxUses : false;
    const isValid = fieldLink.isActive && !isExpired && !isMaxed;

    return NextResponse.json({
      valid: isValid,
      fieldLink: {
        workerName: fieldLink.workerName,
        projectName: fieldLink.projectName,
        expiresAt: fieldLink.expiresAt,
        remainingUses: fieldLink.maxUses ? fieldLink.maxUses - fieldLink.currentUses : null
      },
      error: !isValid ? (
        !fieldLink.isActive ? 'Link has been revoked' :
        isExpired ? 'Link has expired' :
        isMaxed ? 'Link has reached maximum uses' :
        'Link is not valid'
      ) : null
    });
  } catch (error: any) {
    console.error('GET /api/expensa/submit error:', error);
    return NextResponse.json(
      { valid: false, error: 'Failed to validate link' },
      { status: 500 }
    );
  }
}
