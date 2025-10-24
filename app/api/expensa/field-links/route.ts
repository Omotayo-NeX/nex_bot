import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { prisma } from '@/lib/prisma';
import {
  generateFieldLinkToken,
  calculateExpiryDate,
  formatFieldLinkForSharing,
  generateWhatsAppMessage,
  generateEmailHTML
} from '@/lib/expensa/field-link-utils';

/**
 * GET /api/expensa/field-links
 * Fetch all field links for the authenticated business owner
 */
export async function GET(req: NextRequest) {
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

    // Get query parameters
    const { searchParams } = new URL(req.url);
    const includeExpired = searchParams.get('includeExpired') === 'true';

    // Build where clause
    const where: any = { businessId: user.id };

    if (!includeExpired) {
      where.OR = [
        { expiresAt: { gte: new Date() } },
        { isActive: true }
      ];
    }

    // Fetch field links - optimize by not loading all expenses upfront
    const fieldLinks = await prisma.fieldLink.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { expenses: true }
        }
      }
    });

    return NextResponse.json({ fieldLinks });
  } catch (error: any) {
    console.error('GET /api/expensa/field-links error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch field links', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/expensa/field-links
 * Create a new field link for a worker
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

    // Parse request body
    const body = await req.json();
    const {
      workerName,
      workerEmail,
      workerPhone,
      projectName,
      expiryDays = 30, // Default to 30 days
      maxUses,
      allowedActions = ['submit_expense']
    } = body;

    // Validation
    if (!workerName || workerName.trim().length === 0) {
      return NextResponse.json(
        { error: 'Worker name is required' },
        { status: 400 }
      );
    }

    if (expiryDays < 1 || expiryDays > 365) {
      return NextResponse.json(
        { error: 'Expiry days must be between 1 and 365' },
        { status: 400 }
      );
    }

    // Calculate expiry date
    const expiresAt = calculateExpiryDate(expiryDays);

    // Generate JWT token
    const inviteToken = await generateFieldLinkToken({
      businessId: user.id,
      workerName: workerName.trim(),
      projectName: projectName?.trim(),
      expiresAt: expiresAt.getTime(),
      allowedActions
    });

    // Create field link in database
    const fieldLink = await prisma.fieldLink.create({
      data: {
        businessId: user.id,
        workerName: workerName.trim(),
        workerEmail: workerEmail?.trim() || null,
        workerPhone: workerPhone?.trim() || null,
        projectName: projectName?.trim() || null,
        inviteToken,
        expiresAt,
        allowedActions,
        maxUses: maxUses || null,
        isActive: true
      }
    });

    // Format for sharing
    const shareableLink = formatFieldLinkForSharing(
      inviteToken,
      workerName.trim(),
      expiresAt,
      projectName?.trim()
    );

    // Generate sharing formats
    const whatsappMessage = generateWhatsAppMessage(shareableLink);
    const emailHtml = generateEmailHTML(shareableLink);

    return NextResponse.json({
      fieldLink,
      shareableLink,
      sharing: {
        whatsappUrl: `https://wa.me/?text=${whatsappMessage}`,
        emailHtml,
        smsText: `Hi ${workerName}, submit expenses here: ${shareableLink.url} (expires ${new Date(expiresAt).toLocaleDateString()})`
      }
    }, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/expensa/field-links error:', error);
    return NextResponse.json(
      { error: 'Failed to create field link', details: error.message },
      { status: 500 }
    );
  }
}
