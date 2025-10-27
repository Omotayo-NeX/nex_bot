import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { prisma } from '@/lib/prisma';

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

    // Get query parameters for filtering
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build where clause
    const where: any = { userId: user.id };

    if (status) where.status = status;
    if (category) where.category = category;
    if (startDate || endDate) {
      where.incomeDate = {};
      if (startDate) where.incomeDate.gte = new Date(startDate);
      if (endDate) where.incomeDate.lte = new Date(endDate);
    }

    // Fetch income records
    const incomes = await prisma.income.findMany({
      where,
      orderBy: { incomeDate: 'desc' }
    });

    return NextResponse.json({ incomes });
  } catch (error: any) {
    console.error('GET /api/expensa/income error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch income records', details: error.message },
      { status: 500 }
    );
  }
}

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
      source,
      category,
      amount,
      currency,
      description,
      incomeDate,
      projectName,
      clientName,
      invoiceNumber,
      receiptUrl,
      status
    } = body;

    // Validation
    if (!source || !category || !amount || !incomeDate) {
      return NextResponse.json(
        { error: 'Missing required fields: source, category, amount, incomeDate' },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than 0' },
        { status: 400 }
      );
    }

    // Create income record
    const income = await prisma.income.create({
      data: {
        userId: user.id,
        source,
        category,
        amount,
        currency: currency || 'NGN',
        description,
        incomeDate: new Date(incomeDate),
        projectName,
        clientName,
        invoiceNumber,
        receiptUrl,
        status: status || 'received'
      }
    });

    return NextResponse.json(income, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/expensa/income error:', error);
    return NextResponse.json(
      { error: 'Failed to create income record', details: error.message },
      { status: 500 }
    );
  }
}
