import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const { status } = await req.json();

    // Validate status
    const validStatuses = ['pending', 'approved', 'rejected', 'reimbursed'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be one of: pending, approved, rejected, reimbursed' },
        { status: 400 }
      );
    }

    // Check if expense exists and belongs to user
    const expense = await prisma.expense.findUnique({
      where: { id }
    });

    if (!expense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
    }

    if (expense.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized to modify this expense' }, { status: 403 });
    }

    // Update expense status
    const updatedExpense = await prisma.expense.update({
      where: { id },
      data: { status }
    });

    console.log(`✅ Expense ${id} status updated to: ${status}`);

    return NextResponse.json(updatedExpense);
  } catch (error: any) {
    console.error('PATCH /api/expensa/[id]/status error:', error);
    return NextResponse.json(
      { error: 'Failed to update expense status', details: error.message },
      { status: 500 }
    );
  }
}
