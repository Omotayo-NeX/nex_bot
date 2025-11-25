import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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

    // Fetch income record
    const income = await prisma.income.findUnique({
      where: { id }
    });

    if (!income) {
      return NextResponse.json({ error: 'Income record not found' }, { status: 404 });
    }

    // Check ownership
    if (income.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(income);
  } catch (error: any) {
    console.error('GET /api/expensa/income/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch income record', details: error.message },
      { status: 500 }
    );
  }
}

async function updateIncomeHandler(
  req: NextRequest,
  params: Promise<{ id: string }>
) {
  try {
    const { id } = await params;

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

    // Check ownership
    const existingIncome = await prisma.income.findUnique({
      where: { id }
    });

    if (!existingIncome) {
      return NextResponse.json({ error: 'Income record not found' }, { status: 404 });
    }

    if (existingIncome.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Parse update data
    const body = await req.json();
    const updateData: any = {};

    // Allow updating specific fields
    if (body.source !== undefined) updateData.source = body.source;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.amount !== undefined) {
      const amount = parseFloat(body.amount);
      if (amount <= 0) {
        return NextResponse.json({ error: 'Amount must be greater than 0' }, { status: 400 });
      }
      updateData.amount = amount;
    }
    if (body.currency !== undefined) updateData.currency = body.currency;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.incomeDate !== undefined) updateData.incomeDate = new Date(body.incomeDate);
    if (body.projectName !== undefined) updateData.projectName = body.projectName;
    if (body.clientName !== undefined) updateData.clientName = body.clientName;
    if (body.invoiceNumber !== undefined) updateData.invoiceNumber = body.invoiceNumber;
    if (body.receiptUrl !== undefined) updateData.receiptUrl = body.receiptUrl;
    if (body.status !== undefined) updateData.status = body.status;

    // Update income record
    const updatedIncome = await prisma.income.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json(updatedIncome);
  } catch (error: any) {
    console.error('UPDATE /api/expensa/income/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to update income record', details: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return updateIncomeHandler(req, params);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return updateIncomeHandler(req, params);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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

    // Check ownership
    const existingIncome = await prisma.income.findUnique({
      where: { id }
    });

    if (!existingIncome) {
      return NextResponse.json({ error: 'Income record not found' }, { status: 404 });
    }

    if (existingIncome.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Delete income record
    await prisma.income.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Income record deleted successfully' });
  } catch (error: any) {
    console.error('DELETE /api/expensa/income/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to delete income record', details: error.message },
      { status: 500 }
    );
  }
}
