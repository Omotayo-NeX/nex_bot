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
        percentage: parseFloat((((data as { amount: number; count: number }).amount / totalSpent) * 100).toFixed(1))
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

    // Calculate advanced metrics
    const monthlyAmounts = Object.values(monthlyData).map(v => v as number);
    const hasGrowth = monthlyAmounts.length > 1 &&
      monthlyAmounts[monthlyAmounts.length - 1] > monthlyAmounts[0];
    const volatility = monthlyAmounts.length > 1
      ? Math.max(...monthlyAmounts) - Math.min(...monthlyAmounts)
      : 0;

    // Find anomalies
    const avgAmount = totalSpent / expenses.length;
    const anomalies = expenses.filter((exp: typeof expenses[0]) =>
      parseFloat(exp.amount.toString()) > avgAmount * 2
    );

    // Spending patterns
    const weekendSpending = expenses.filter((exp: typeof expenses[0]) => {
      const day = new Date(exp.expenseDate).getDay();
      return day === 0 || day === 6;
    });

    // Category concentration (is spending diverse or concentrated?)
    const topCategoryPercent = topCategories[0]?.percentage || 0;

    // Create enhanced analysis prompt
    const analysisPrompt = `You are an expert financial analyst with deep expertise in business expense optimization, cash flow management, and financial health assessment. Analyze this business expense data with strategic insight:

FINANCIAL OVERVIEW:
Time Period: ${timeRange}
Total Expenses: ₦${totalSpent.toLocaleString()} (${expenses.length} transactions)
Average Transaction: ₦${averageExpense.toLocaleString(undefined, { maximumFractionDigits: 0 })}
Spending Volatility: ₦${volatility.toLocaleString()}

CATEGORY ANALYSIS:
${topCategories.map((cat, idx) => `${idx + 1}. ${cat.name}: ₦${cat.amount.toLocaleString()} (${cat.percentage}%) - ${cat.count} transactions`).join('\n')}
Category Concentration: ${topCategoryPercent > 50 ? 'Highly concentrated' : topCategoryPercent > 30 ? 'Moderately concentrated' : 'Well diversified'}

TEMPORAL PATTERNS:
Monthly Trend: ${hasGrowth ? 'Increasing' : 'Decreasing'}
Monthly Breakdown:
${Object.entries(monthlyData).map(([month, amount]) => `  ${month}: ₦${(amount as number).toLocaleString()}`).join('\n')}

SPENDING BEHAVIOR:
Weekend Transactions: ${weekendSpending.length} (${((weekendSpending.length / expenses.length) * 100).toFixed(1)}%)
Large Transactions (>2x average): ${anomalies.length}
${anomalies.length > 0 ? `Largest: ₦${Math.max(...anomalies.map((e: typeof expenses[0]) => parseFloat(e.amount.toString()))).toLocaleString()}` : ''}

APPROVAL STATUS:
${Object.entries(statusBreakdown).map(([status, count]) => `  ${status}: ${count as number}`).join('\n')}

PROVIDE STRATEGIC ANALYSIS:
1. Summary: Deep insight into overall financial health, spending efficiency, and key patterns (3-4 sentences)
2. Trends: 4-6 specific, data-driven observations with actionable context
3. Recommendations: 4-6 strategic, prioritized recommendations with expected impact
4. Budget Health: Assess as excellent/good/warning/critical based on:
   - Spending concentration
   - Growth trajectory
   - Volatility
   - Efficiency indicators

Focus on:
- Cost optimization opportunities
- Risk identification (concentration, anomalies)
- Strategic spending improvements
- Cash flow optimization
- Comparative benchmarks (if applicable)

Return ONLY valid JSON with this structure:
{
  "summary": "string (comprehensive financial health assessment)",
  "topSpendingCategory": "string (category name)",
  "averageExpense": number,
  "trends": ["detailed trend 1", "detailed trend 2", ...],
  "recommendations": ["strategic recommendation 1", "strategic recommendation 2", ...],
  "budgetHealth": "excellent" | "good" | "warning" | "critical",
  "riskFactors": ["risk 1", "risk 2"] or [],
  "opportunities": ["opportunity 1", "opportunity 2"] or []
}`;

    // Call OpenAI for analysis
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are a senior financial strategist with 20+ years experience in corporate finance, expense optimization, and business intelligence. You specialize in:
- Identifying cost-saving opportunities
- Risk assessment and mitigation
- Cash flow optimization
- Strategic financial planning
- Data-driven decision making

Your analysis should be:
- Strategic and forward-looking
- Data-driven with specific numbers
- Actionable with clear next steps
- Risk-aware and opportunity-focused
- Written for business owners and CFOs

Always respond with valid JSON only, no markdown or explanations.`
        },
        {
          role: 'user',
          content: analysisPrompt
        }
      ],
      temperature: 0.8,
      max_tokens: 1500
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
