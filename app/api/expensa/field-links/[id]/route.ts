import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { prisma } from '@/lib/prisma';
import {
  generateFieldLinkToken,
  calculateExpiryDate,
  formatFieldLinkForSharing
} from '@/lib/expensa/field-link-utils';

/**
 * GET /api/expensa/field-links/[id]
 * Get a specific field link with details
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const fieldLink = await prisma.fieldLink.findFirst({
      where: {
        id: id,
        businessId: user.id
      },
      include: {
        expenses: {
          orderBy: { createdAt: 'desc' },
          include: {
            aiLogs: true
          }
        }
      }
    });

    if (!fieldLink) {
      return NextResponse.json({ error: 'Field link not found' }, { status: 404 });
    }

    return NextResponse.json({ fieldLink });
  } catch (error: any) {
    console.error('GET /api/expensa/field-links/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch field link', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/expensa/field-links/[id]
 * Update a field link (toggle active, extend expiry, etc.)
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    // Check ownership
    const existingLink = await prisma.fieldLink.findFirst({
      where: {
        id: id,
        businessId: user.id
      }
    });

    if (!existingLink) {
      return NextResponse.json({ error: 'Field link not found' }, { status: 404 });
    }

    const body = await req.json();
    const { isActive, expiryDays } = body;

    const updateData: any = {};

    if (typeof isActive === 'boolean') {
      updateData.isActive = isActive;
    }

    if (expiryDays) {
      const newExpiry = calculateExpiryDate(expiryDays);
      updateData.expiresAt = newExpiry;
    }

    const updatedLink = await prisma.fieldLink.update({
      where: { id: id },
      data: updateData
    });

    return NextResponse.json({ fieldLink: updatedLink });
  } catch (error: any) {
    console.error('PATCH /api/expensa/field-links/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to update field link', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/expensa/field-links/[id]
 * Delete (revoke) a field link
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    // Check ownership
    const existingLink = await prisma.fieldLink.findFirst({
      where: {
        id: id,
        businessId: user.id
      }
    });

    if (!existingLink) {
      return NextResponse.json({ error: 'Field link not found' }, { status: 404 });
    }

    // Soft delete by marking as inactive
    await prisma.fieldLink.update({
      where: { id: id },
      data: { isActive: false }
    });

    return NextResponse.json({ message: 'Field link revoked successfully' });
  } catch (error: any) {
    console.error('DELETE /api/expensa/field-links/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to delete field link', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/expensa/field-links/[id]/regenerate
 * Regenerate a field link with a new token
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');

    if (action !== 'regenerate') {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

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

    // Check ownership
    const existingLink = await prisma.fieldLink.findFirst({
      where: {
        id: id,
        businessId: user.id
      }
    });

    if (!existingLink) {
      return NextResponse.json({ error: 'Field link not found' }, { status: 404 });
    }

    const body = await req.json();
    const { expiryDays = 30 } = body;

    // Calculate new expiry
    const expiresAt = calculateExpiryDate(expiryDays);

    // Generate new token
    const newToken = await generateFieldLinkToken({
      businessId: user.id,
      workerName: existingLink.workerName,
      projectName: existingLink.projectName || undefined,
      expiresAt: expiresAt.getTime(),
      allowedActions: existingLink.allowedActions
    });

    // Update the field link
    const updatedLink = await prisma.fieldLink.update({
      where: { id: id },
      data: {
        inviteToken: newToken,
        expiresAt,
        isActive: true,
        currentUses: 0 // Reset usage count
      }
    });

    const shareableLink = formatFieldLinkForSharing(
      newToken,
      updatedLink.workerName,
      expiresAt,
      updatedLink.projectName || undefined
    );

    return NextResponse.json({
      fieldLink: updatedLink,
      shareableLink
    });
  } catch (error: any) {
    console.error('POST /api/expensa/field-links/[id]/regenerate error:', error);
    return NextResponse.json(
      { error: 'Failed to regenerate field link', details: error.message },
      { status: 500 }
    );
  }
}
