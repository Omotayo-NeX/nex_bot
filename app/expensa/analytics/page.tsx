'use client';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  PieChart,
  BarChart3,
  Sparkles,
  Download,
  RefreshCw,
  CalendarRange
} from 'lucide-react';
import { toast } from 'sonner';
import PendingExpensesModal from './components/PendingExpensesModal';
import AnalyticsSkeleton from './components/AnalyticsSkeleton';
import CategoryPieChart from './components/CategoryPieChart';
import MonthlyTrendChart from './components/MonthlyTrendChart';
import BudgetProgressIndicator from './components/BudgetProgressIndicator';

interface Expense {
  id: string;
  merchantName: string | null;
  category: string;
  amount: number;
  currency: string;
  description: string | null;
  expenseDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'reimbursed';
  receiptUrl: string | null;
  projectName: string | null;
}

interface Income {
  id: string;
  source: string;
  category: string;
  amount: number;
  currency: string;
  description: string | null;
  incomeDate: string;
  status: string;
  projectName: string | null;
  clientName: string | null;
}

interface CategoryData {
  name: string;
  amount: number;
  count: number;
  percentage: number;
}

interface MonthlyTrend {
  month: string;
  amount: number;
}

interface AIInsight {
  summary: string;
  topSpendingCategory: string;
  averageExpense: number;
  trends: string[];
  recommendations: string[];
  budgetHealth: 'excellent' | 'good' | 'warning' | 'critical';
}

export default function AnalyticsPage() {
  const { user, session, loading } = useAuth();
  const router = useRouter();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [isLoadingExpenses, setIsLoadingExpenses] = useState(true);
  const [isLoadingIncomes, setIsLoadingIncomes] = useState(true);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [aiInsights, setAiInsights] = useState<AIInsight | null>(null);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year' | 'custom'>('month');
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [monthlyBudget, setMonthlyBudget] = useState<number>(0);

  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && session && !hasFetchedRef.current) {
      fetchExpenses();
      fetchIncomes();
      hasFetchedRef.current = true;
    }
  }, [user, session]);

  const fetchExpenses = async () => {
    if (!session) return;

    setIsLoadingExpenses(true);
    try {
      const response = await fetch('/api/expensa', {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch expenses');

      const data = await response.json();
      setExpenses(data.expenses || []);
    } catch (error: any) {
      console.error('Failed to fetch expenses:', error);
      toast.error('Failed to load expenses');
    } finally {
      setIsLoadingExpenses(false);
    }
  };

  const fetchIncomes = async () => {
    if (!session) return;

    setIsLoadingIncomes(true);
    try {
      const response = await fetch('/api/expensa/income', {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch income');

      const data = await response.json();
      setIncomes(data.incomes || []);
    } catch (error: any) {
      console.error('Failed to fetch income:', error);
      // Don't show error toast if income table doesn't exist yet
      if (!error.message?.includes('relation') && !error.message?.includes('does not exist')) {
        toast.error('Failed to load income');
      }
    } finally {
      setIsLoadingIncomes(false);
    }
  };

  const generateAIInsights = async () => {
    if (!session || expenses.length === 0) {
      toast.error('No expense data available for analysis');
      return;
    }

    setIsLoadingAI(true);
    try {
      const response = await fetch('/api/expensa/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ expenses, timeRange })
      });

      if (!response.ok) throw new Error('Failed to generate AI insights');

      const data = await response.json();
      setAiInsights(data.insights);
      toast.success('AI analysis complete!');
    } catch (error: any) {
      console.error('Failed to generate AI insights:', error);
      toast.error('Failed to generate AI insights');
    } finally {
      setIsLoadingAI(false);
    }
  };

  // Filter expenses by time range
  const getFilteredExpenses = () => {
    const now = new Date();
    let startDate = new Date();
    let endDate = now;

    if (timeRange === 'custom') {
      if (!customStartDate || !customEndDate) {
        return expenses;
      }
      startDate = new Date(customStartDate);
      endDate = new Date(customEndDate);
    } else {
      switch (timeRange) {
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'quarter':
          startDate.setMonth(now.getMonth() - 3);
          break;
        case 'year':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }
    }

    return expenses.filter(exp => {
      const expDate = new Date(exp.expenseDate);
      return expDate >= startDate && expDate <= endDate;
    });
  };

  // CSV Export function
  const exportToCSV = () => {
    if (filteredExpenses.length === 0) {
      toast.error('No data to export');
      return;
    }

    // Create CSV header
    const headers = ['Date', 'Merchant', 'Category', 'Amount', 'Currency', 'Status', 'Project', 'Description'];

    // Create CSV rows
    const rows = filteredExpenses.map(exp => [
      new Date(exp.expenseDate).toLocaleDateString('en-US'),
      exp.merchantName || 'N/A',
      exp.category,
      exp.amount.toString(),
      exp.currency,
      exp.status,
      exp.projectName || 'N/A',
      exp.description?.replace(/,/g, ';') || 'N/A' // Replace commas to avoid CSV issues
    ]);

    // Combine header and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    const dateRange = timeRange === 'custom'
      ? `${customStartDate}_to_${customEndDate}`
      : timeRange;

    link.setAttribute('href', url);
    link.setAttribute('download', `expensa_analytics_${dateRange}_${Date.now()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Analytics report exported successfully!');
  };

  // Handle expense approval/rejection
  const handleApprove = async (id: string) => {
    try {
      const response = await fetch(`/api/expensa/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ status: 'approved' })
      });

      if (!response.ok) throw new Error('Failed to approve expense');

      // Update local state
      setExpenses(prev => prev.map(exp =>
        exp.id === id ? { ...exp, status: 'approved' as const } : exp
      ));
      toast.success('Expense approved!');
    } catch (error: any) {
      console.error('Failed to approve expense:', error);
      toast.error('Failed to approve expense');
    }
  };

  const handleReject = async (id: string) => {
    try {
      const response = await fetch(`/api/expensa/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ status: 'rejected' })
      });

      if (!response.ok) throw new Error('Failed to reject expense');

      // Update local state
      setExpenses(prev => prev.map(exp =>
        exp.id === id ? { ...exp, status: 'rejected' as const } : exp
      ));
      toast.success('Expense rejected');
    } catch (error: any) {
      console.error('Failed to reject expense:', error);
      toast.error('Failed to reject expense');
    }
  };

  const filteredExpenses = getFilteredExpenses();

  // Calculate previous period for comparison
  const getPreviousPeriodExpenses = () => {
    const now = new Date();
    let startDate = new Date();
    let endDate = new Date();

    if (timeRange === 'custom') {
      return []; // Skip comparison for custom ranges
    }

    switch (timeRange) {
      case 'week':
        endDate.setDate(now.getDate() - 7);
        startDate.setDate(endDate.getDate() - 7);
        break;
      case 'month':
        endDate.setMonth(now.getMonth() - 1);
        startDate.setMonth(endDate.getMonth() - 1);
        break;
      case 'quarter':
        endDate.setMonth(now.getMonth() - 3);
        startDate.setMonth(endDate.getMonth() - 3);
        break;
      case 'year':
        endDate.setFullYear(now.getFullYear() - 1);
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
    }

    return expenses.filter(exp => {
      const expDate = new Date(exp.expenseDate);
      return expDate >= startDate && expDate <= endDate;
    });
  };

  const previousPeriodExpenses = getPreviousPeriodExpenses();

  // Calculate analytics
  const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount.toString()), 0);
  const averageExpense = filteredExpenses.length > 0 ? totalExpenses / filteredExpenses.length : 0;

  // Previous period totals
  const prevTotalExpenses = previousPeriodExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount.toString()), 0);
  const prevAverageExpense = previousPeriodExpenses.length > 0 ? prevTotalExpenses / previousPeriodExpenses.length : 0;

  // Calculate percentage changes
  const totalChange = prevTotalExpenses > 0 ? ((totalExpenses - prevTotalExpenses) / prevTotalExpenses) * 100 : 0;
  const avgChange = prevAverageExpense > 0 ? ((averageExpense - prevAverageExpense) / prevAverageExpense) * 100 : 0;
  const countChange = previousPeriodExpenses.length > 0 ? ((filteredExpenses.length - previousPeriodExpenses.length) / previousPeriodExpenses.length) * 100 : 0;

  // Category breakdown
  const categoryData: CategoryData[] = Object.entries(
    filteredExpenses.reduce((acc, exp) => {
      const category = exp.category || 'Other';
      if (!acc[category]) {
        acc[category] = { amount: 0, count: 0 };
      }
      acc[category].amount += parseFloat(exp.amount.toString());
      acc[category].count += 1;
      return acc;
    }, {} as Record<string, { amount: number; count: number }>)
  ).map(([name, data]) => ({
    name,
    amount: data.amount,
    count: data.count,
    percentage: (data.amount / totalExpenses) * 100
  })).sort((a, b) => b.amount - a.amount);

  // Monthly trends
  const monthlyTrends: MonthlyTrend[] = Object.entries(
    filteredExpenses.reduce((acc, exp) => {
      const month = new Date(exp.expenseDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      if (!acc[month]) acc[month] = 0;
      acc[month] += parseFloat(exp.amount.toString());
      return acc;
    }, {} as Record<string, number>)
  ).map(([month, amount]) => ({ month, amount }));

  // Status breakdown
  const statusCounts = filteredExpenses.reduce((acc, exp) => {
    acc[exp.status] = (acc[exp.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Filter incomes by time range
  const getFilteredIncomes = () => {
    const now = new Date();
    let startDate = new Date();
    let endDate = now;

    if (timeRange === 'custom') {
      if (!customStartDate || !customEndDate) {
        return incomes;
      }
      startDate = new Date(customStartDate);
      endDate = new Date(customEndDate);
    } else {
      switch (timeRange) {
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'quarter':
          startDate.setMonth(now.getMonth() - 3);
          break;
        case 'year':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }
    }

    return incomes.filter(inc => {
      const incDate = new Date(inc.incomeDate);
      return incDate >= startDate && incDate <= endDate;
    });
  };

  const filteredIncomes = getFilteredIncomes();

  // Calculate income analytics
  const totalIncome = filteredIncomes.reduce((sum, inc) => sum + parseFloat(inc.amount.toString()), 0);
  const netProfit = totalIncome - totalExpenses;

  if (loading || isLoadingExpenses || isLoadingIncomes) {
    return <AnalyticsSkeleton />;
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0d1117] to-[#1c1f26]">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col space-y-4 mb-6 md:mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 md:space-x-4">
              <button
                onClick={() => router.push('/expensa')}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-white flex-shrink-0"
              >
                <ArrowLeft className="w-5 h-5 md:w-6 md:h-6" />
              </button>
              <div>
                <h1 className="text-2xl md:text-4xl font-bold text-white mb-1 md:mb-2 flex items-center space-x-2 md:space-x-3">
                  <BarChart3 className="w-6 h-6 md:w-10 md:h-10 text-nex-yellow" />
                  <span>Analytics</span>
                </h1>
                <p className="text-xs md:text-base text-gray-400 hidden sm:block">Comprehensive spending analysis and AI-powered recommendations</p>
              </div>
            </div>
            <button
              onClick={() => {
                fetchExpenses();
                fetchIncomes();
              }}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-white flex-shrink-0"
              title="Refresh data"
            >
                <RefreshCw className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </div>
        </div>

        {/* Time Range Selector */}
        <div className="bg-gray-800/30 rounded-xl p-3 md:p-4 mb-6 md:mb-8">
          <div className="flex flex-col md:flex-row md:flex-wrap md:items-center gap-2 md:gap-3">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
              <span className="text-sm md:text-base text-gray-400">Time Range:</span>
            </div>
            <div className="grid grid-cols-3 gap-2 md:flex md:flex-wrap md:gap-2">
              {(['week', 'month', 'quarter', 'year'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1.5 md:px-4 md:py-2 rounded-lg transition-colors text-sm md:text-base ${
                    timeRange === range
                      ? 'bg-nex-yellow text-nex-navy font-semibold'
                      : 'bg-gray-800 text-white hover:bg-gray-700'
                  }`}
                >
                  {range.charAt(0).toUpperCase() + range.slice(1)}
                </button>
              ))}
              <button
                onClick={() => setTimeRange('custom')}
                className={`px-3 py-1.5 md:px-4 md:py-2 rounded-lg transition-colors flex items-center justify-center space-x-1 md:space-x-2 text-sm md:text-base ${
                  timeRange === 'custom'
                    ? 'bg-nex-yellow text-nex-navy font-semibold'
                    : 'bg-gray-800 text-white hover:bg-gray-700'
                }`}
              >
                <CalendarRange className="w-3 h-3 md:w-4 md:h-4" />
                <span>Custom</span>
              </button>
            </div>
          </div>

          {/* Custom Date Range Inputs */}
          {timeRange === 'custom' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 mt-4 pt-4 border-t border-gray-700"
            >
              <div className="flex items-center space-x-2">
                <label className="text-gray-400 text-xs md:text-sm w-12">From:</label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="flex-1 px-2 py-1.5 md:px-3 md:py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-nex-yellow"
                />
              </div>
              <div className="flex items-center space-x-2">
                <label className="text-gray-400 text-xs md:text-sm w-12">To:</label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="flex-1 px-2 py-1.5 md:px-3 md:py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-nex-yellow"
                />
              </div>
              {customStartDate && customEndDate && (
                <span className="text-xs md:text-sm text-green-400 text-center sm:text-left">
                  ✓ {filteredExpenses.length} expenses in range
                </span>
              )}
            </motion.div>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4 mb-6 md:mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-4 md:p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-xs md:text-sm">Total Expenses</span>
              <DollarSign className="w-4 h-4 md:w-5 md:h-5 text-nex-yellow" />
            </div>
            <p className="text-xl md:text-3xl font-bold text-white">₦{totalExpenses.toLocaleString()}</p>
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs md:text-sm text-gray-500">{filteredExpenses.length} transactions</p>
              {timeRange !== 'custom' && prevTotalExpenses > 0 && (
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  totalChange > 0 ? 'bg-red-500/20 text-red-400' :
                  totalChange < 0 ? 'bg-green-500/20 text-green-400' :
                  'bg-gray-500/20 text-gray-400'
                }`}>
                  {totalChange > 0 ? '+' : ''}{totalChange.toFixed(1)}%
                </span>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-4 md:p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-xs md:text-sm">Average</span>
              <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-blue-400" />
            </div>
            <p className="text-xl md:text-3xl font-bold text-white">₦{averageExpense.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs md:text-sm text-gray-500">Per transaction</p>
              {timeRange !== 'custom' && prevAverageExpense > 0 && (
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  avgChange > 0 ? 'bg-red-500/20 text-red-400' :
                  avgChange < 0 ? 'bg-green-500/20 text-green-400' :
                  'bg-gray-500/20 text-gray-400'
                }`}>
                  {avgChange > 0 ? '+' : ''}{avgChange.toFixed(1)}%
                </span>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-4 md:p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-xs md:text-sm">Top Category</span>
              <PieChart className="w-4 h-4 md:w-5 md:h-5 text-green-400" />
            </div>
            <p className="text-lg md:text-2xl font-bold text-white truncate">{categoryData[0]?.name || 'N/A'}</p>
            <p className="text-xs md:text-sm text-gray-500 mt-1">
              {categoryData[0] ? `₦${categoryData[0].amount.toLocaleString()}` : 'No data'}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            onClick={() => setShowPendingModal(true)}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-4 md:p-6 cursor-pointer hover:border-yellow-500/50 hover:bg-gray-800/70 transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-xs md:text-sm">Pending</span>
              <TrendingDown className="w-4 h-4 md:w-5 md:h-5 text-yellow-400" />
            </div>
            <p className="text-xl md:text-3xl font-bold text-white">{statusCounts.pending || 0}</p>
            <p className="text-xs md:text-sm text-gray-500 mt-1">Click to review</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/30 rounded-xl p-4 md:p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-xs md:text-sm">Total Income</span>
              <DollarSign className="w-4 h-4 md:w-5 md:h-5 text-green-400" />
            </div>
            <p className="text-xl md:text-3xl font-bold text-white">₦{totalIncome.toLocaleString()}</p>
            <p className="text-xs md:text-sm text-gray-500 mt-1">{filteredIncomes.length} records</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className={`rounded-xl p-4 md:p-6 border ${
              netProfit >= 0
                ? 'bg-gradient-to-br from-blue-500/20 to-blue-600/10 border-blue-500/30'
                : 'bg-gradient-to-br from-red-500/20 to-red-600/10 border-red-500/30'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-xs md:text-sm">Net Profit</span>
              {netProfit >= 0 ? (
                <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-blue-400" />
              ) : (
                <TrendingDown className="w-4 h-4 md:w-5 md:h-5 text-red-400" />
              )}
            </div>
            <p className={`text-xl md:text-3xl font-bold ${
              netProfit >= 0 ? 'text-blue-400' : 'text-red-400'
            }`}>
              ₦{Math.abs(netProfit).toLocaleString()}
            </p>
            <p className="text-xs md:text-sm text-gray-500 mt-1">
              {netProfit >= 0 ? 'Profit' : 'Loss'}
            </p>
          </motion.div>
        </div>

        {/* AI Insights Section */}
        <div className="bg-gradient-to-r from-nex-yellow/10 to-nex-yellow/5 border border-nex-yellow/30 rounded-xl p-4 md:p-6 mb-6 md:mb-8">
          <div className="flex flex-col space-y-3 md:space-y-0 md:flex-row md:items-center md:justify-between mb-4">
            <div className="flex items-center space-x-2 md:space-x-3">
              <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-nex-yellow" />
              <h2 className="text-lg md:text-2xl font-bold text-white">AI-Powered Insights</h2>
            </div>
            <button
              onClick={generateAIInsights}
              disabled={isLoadingAI || filteredExpenses.length === 0}
              className="w-full md:w-auto px-4 py-2 md:px-6 md:py-3 bg-nex-yellow hover:bg-nex-yellow-dark text-nex-navy font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-sm md:text-base"
            >
              {isLoadingAI ? (
                <>
                  <div className="w-4 h-4 md:w-5 md:h-5 border-2 border-nex-navy border-t-transparent rounded-full animate-spin"></div>
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 md:w-5 md:h-5" />
                  <span>Generate AI Report</span>
                </>
              )}
            </button>
          </div>

          {aiInsights && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-4"
            >
              {/* Budget Health */}
              <div className={`p-4 rounded-lg ${
                aiInsights.budgetHealth === 'excellent' ? 'bg-green-500/20 border border-green-500/50' :
                aiInsights.budgetHealth === 'good' ? 'bg-blue-500/20 border border-blue-500/50' :
                aiInsights.budgetHealth === 'warning' ? 'bg-yellow-500/20 border border-yellow-500/50' :
                'bg-red-500/20 border border-red-500/50'
              }`}>
                <h3 className="text-white font-semibold mb-2">Budget Health: {aiInsights.budgetHealth.toUpperCase()}</h3>
                <p className="text-gray-300">{aiInsights.summary}</p>
              </div>

              {/* Trends */}
              {aiInsights.trends.length > 0 && (
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <h3 className="text-white font-semibold mb-2 flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-blue-400" />
                    <span>Spending Trends</span>
                  </h3>
                  <ul className="space-y-2">
                    {aiInsights.trends.map((trend, idx) => (
                      <li key={idx} className="text-gray-300 flex items-start space-x-2">
                        <span className="text-nex-yellow mt-1">•</span>
                        <span>{trend}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommendations */}
              {aiInsights.recommendations.length > 0 && (
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <h3 className="text-white font-semibold mb-2 flex items-center space-x-2">
                    <Sparkles className="w-5 h-5 text-nex-yellow" />
                    <span>Recommendations</span>
                  </h3>
                  <ul className="space-y-2">
                    {aiInsights.recommendations.map((rec, idx) => (
                      <li key={idx} className="text-gray-300 flex items-start space-x-2">
                        <span className="text-green-400 mt-1">✓</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          )}

          {!aiInsights && !isLoadingAI && (
            <p className="text-gray-400 text-center py-4">
              Click "Generate AI Report" to get personalized spending insights and recommendations
            </p>
          )}
        </div>

        {/* Monthly Trends & Budget Progress */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Monthly Trend Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Spending Trends</h2>
            {monthlyTrends.length > 0 ? (
              <MonthlyTrendChart data={monthlyTrends} />
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-400">
                <p>No trend data available</p>
              </div>
            )}
          </motion.div>

          {/* Budget Progress */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">Budget Progress</h2>
              <div className="flex items-center space-x-2">
                <span className="text-gray-400 text-sm">Budget:</span>
                <input
                  type="number"
                  value={monthlyBudget || ''}
                  onChange={(e) => setMonthlyBudget(Number(e.target.value))}
                  placeholder="Set budget"
                  className="w-32 px-3 py-1.5 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-nex-yellow"
                />
              </div>
            </div>
            {monthlyBudget > 0 ? (
              <BudgetProgressIndicator spent={totalExpenses} budget={monthlyBudget} />
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-400">
                <div className="text-center">
                  <p className="mb-2">Set a monthly budget to track progress</p>
                  <p className="text-sm text-gray-500">Enter amount above ↑</p>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Category Breakdown with Pie Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Pie Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Category Distribution</h2>
            {categoryData.length > 0 ? (
              <CategoryPieChart data={categoryData} />
            ) : (
              <div className="flex items-center justify-center h-[400px] text-gray-400">
                <p>No category data available</p>
              </div>
            )}
          </motion.div>

          {/* Category List */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Spending by Category</h2>
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
              {categoryData.map((category, idx) => (
                <motion.div
                  key={category.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium">{category.name}</span>
                    <div className="text-right">
                      <span className="text-white font-semibold">₦{category.amount.toLocaleString()}</span>
                      <span className="text-gray-400 text-sm ml-2">({category.percentage.toFixed(1)}%)</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${category.percentage}%` }}
                      transition={{ delay: idx * 0.1 + 0.2, duration: 0.5 }}
                      className="h-full bg-gradient-to-r from-nex-yellow to-yellow-500 rounded-full"
                    />
                  </div>
                  <p className="text-sm text-gray-500">{category.count} transactions</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Export Options */}
        <div className="flex justify-center px-4">
          <button
            onClick={exportToCSV}
            disabled={filteredExpenses.length === 0}
            className="w-full md:w-auto px-4 py-3 md:px-6 md:py-3 bg-nex-yellow hover:bg-nex-yellow-dark text-nex-navy font-semibold rounded-lg transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
          >
            <Download className="w-4 h-4 md:w-5 md:h-5" />
            <span>Export Analytics (CSV)</span>
          </button>
        </div>

        {/* Pending Expenses Modal */}
        <PendingExpensesModal
          isOpen={showPendingModal}
          onClose={() => setShowPendingModal(false)}
          expenses={filteredExpenses}
          onApprove={handleApprove}
          onReject={handleReject}
          session={session}
        />
      </div>
    </div>
  );
}
