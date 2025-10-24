import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

interface Expense {
  id: string;
  merchantName: string | null;
  category: string;
  amount: number;
  currency: string;
  description: string | null;
  expenseDate: string;
  status: string;
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

    const { expenses, timeRange } = await req.json();

    if (!expenses || expenses.length === 0) {
      return NextResponse.json({ error: 'No expenses to analyze' }, { status: 400 });
    }

    console.log('🤖 Starting AI analysis for', expenses.length, 'expenses');

    // Prepare expense data summary for AI
    const totalSpent = expenses.reduce((sum: number, exp: Expense) => sum + parseFloat(exp.amount.toString()), 0);
    const averageExpense = totalSpent / expenses.length;

    // Category breakdown
    const categoryBreakdown = expenses.reduce((acc: Record<string, { amount: number; count: number }>, exp: Expense) => {
      const category = exp.category || 'Other';
      if (!acc[category]) {
        acc[category] = { amount: 0, count: 0 };
      }
      acc[category].amount += parseFloat(exp.amount.toString());
      acc[category].count += 1;
      return acc;
    }, {});

    const topCategories = Object.entries(categoryBreakdown)
      .sort(([, a], [, b]) => (b as { amount: number; count: number }).amount - (a as { amount: number; count: number }).amount)
      .slice(0, 5)
      .map(([name, data]) => ({
        name,
        amount: (data as { amount: number; count: number }).amount,
        count: (data as { amount: number; count: number }).count,
        percentage: (((data as { amount: number; count: number }).amount / totalSpent) * 100).toFixed(1)
      }));

    // Monthly trend
    const monthlyData = expenses.reduce((acc: Record<string, number>, exp: Expense) => {
      const month = new Date(exp.expenseDate).toLocaleDateString('en-US', { month: 'short' });
      if (!acc[month]) acc[month] = 0;
      acc[month] += parseFloat(exp.amount.toString());
      return acc;
    }, {});

    // Status breakdown
    const statusBreakdown = expenses.reduce((acc: Record<string, number>, exp: Expense) => {
      acc[exp.status] = (acc[exp.status] || 0) + 1;
      return acc;
    }, {});

    // Create analysis prompt
    const analysisPrompt = `You are a financial advisor analyzing business expense data. Provide insights and recommendations based on the following data:

Time Period: ${timeRange}
Total Expenses: ₦${totalSpent.toLocaleString()}
Number of Transactions: ${expenses.length}
Average Expense: ₦${averageExpense.toLocaleString(undefined, { maximumFractionDigits: 0 })}

Top Spending Categories:
${topCategories.map(cat => `- ${cat.name}: ₦${cat.amount.toLocaleString()} (${cat.percentage}%) - ${cat.count} transactions`).join('\n')}

Monthly Breakdown:
${Object.entries(monthlyData).map(([month, amount]) => `- ${month}: ₦${(amount as number).toLocaleString()}`).join('\n')}

Status Distribution:
${Object.entries(statusBreakdown).map(([status, count]) => `- ${status}: ${count as number} expenses`).join('\n')}

Please provide:
1. A brief summary of spending patterns (2-3 sentences)
2. 3-5 key trends or observations
3. 3-5 actionable recommendations for better expense management
4. Budget health assessment (excellent/good/warning/critical)

Return the response as a valid JSON object with this exact structure:
{
  "summary": "string",
  "budgetHealth": "excellent" | "good" | "warning" | "critical",
  "trends": ["trend1", "trend2", "trend3"],
  "recommendations": ["rec1", "rec2", "rec3"]
}

Important: Return ONLY the JSON object, no markdown formatting or explanations.`;

    // Call OpenAI for analysis
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a professional financial advisor specializing in business expense analysis. Provide clear, actionable insights based on expense data. Always respond with valid JSON only.'
        },
        {
          role: 'user',
          content: analysisPrompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from AI');
    }

    console.log('✅ AI analysis response received');

    // Parse JSON response
    let jsonContent = content.trim();

    // Remove markdown code blocks if present
    if (jsonContent.startsWith('```json')) {
      jsonContent = jsonContent.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
    } else if (jsonContent.startsWith('```')) {
      jsonContent = jsonContent.replace(/```\n?/g, '').replace(/```\n?$/g, '');
    }

    const insights = JSON.parse(jsonContent);

    // Add top spending category
    insights.topSpendingCategory = topCategories[0]?.name || 'N/A';
    insights.averageExpense = averageExpense;

    console.log('📊 AI insights generated:', insights);

    return NextResponse.json({ insights });
  } catch (error: any) {
    console.error('❌ POST /api/expensa/analyze error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze expenses', details: error.message },
      { status: 500 }
    );
  }
}
