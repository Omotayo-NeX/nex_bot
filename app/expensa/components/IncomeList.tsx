'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DollarSign, TrendingUp, Filter, Search, Calendar } from 'lucide-react';
import IncomeCard from './IncomeCard';
import { toast } from 'sonner';

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
  invoiceNumber: string | null;
}

interface IncomeListProps {
  session: any;
  refreshTrigger: number;
  onEdit: (income: Income) => void;
}

export default function IncomeList({ session, refreshTrigger, onEdit }: IncomeListProps) {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [filteredIncomes, setFilteredIncomes] = useState<Income[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const hasFetchedRef = useRef(false);

  const fetchIncomes = async (retryCount = 0) => {
    if (!session) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/expensa/income', {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch income records');
      }

      const data = await response.json();
      setIncomes(data.incomes || []);
      setFilteredIncomes(data.incomes || []);
    } catch (error: any) {
      console.error('Failed to fetch income records:', error);

      // Retry once if it's a timeout or connection error
      if (retryCount === 0 && (error.message?.includes('timeout') || error.message?.includes('reach database') || error.message?.includes('500'))) {
        console.log('Retrying income fetch...');
        setTimeout(() => fetchIncomes(1), 1000);
        return;
      }

      // Only show error toast if it's not a missing table error
      if (!error.message?.includes('relation') && !error.message?.includes('does not exist')) {
        toast.error('Unable to load income records');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (session && !hasFetchedRef.current) {
      fetchIncomes();
      hasFetchedRef.current = true;
    }
  }, [session]);

  useEffect(() => {
    if (refreshTrigger > 0) {
      fetchIncomes();
    }
  }, [refreshTrigger]);

  // Filter logic
  useEffect(() => {
    let filtered = [...incomes];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(income =>
        income.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
        income.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        income.clientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        income.projectName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        income.invoiceNumber?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(income => income.status === statusFilter);
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      let startDate = new Date();

      switch (dateFilter) {
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

      filtered = filtered.filter(income => new Date(income.incomeDate) >= startDate);
    }

    setFilteredIncomes(filtered);
  }, [incomes, searchQuery, statusFilter, dateFilter]);

  const handleDelete = (id: string) => {
    setIncomes(prev => prev.filter(inc => inc.id !== id));
  };

  // Calculate totals
  const totalIncome = filteredIncomes.reduce((sum, inc) => sum + parseFloat(inc.amount.toString()), 0);
  const receivedIncome = filteredIncomes.filter(inc => inc.status === 'received').reduce((sum, inc) => sum + parseFloat(inc.amount.toString()), 0);
  const pendingIncome = filteredIncomes.filter(inc => inc.status === 'pending').reduce((sum, inc) => sum + parseFloat(inc.amount.toString()), 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-400">Loading income records...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/30 rounded-xl p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Total Income</span>
            <DollarSign className="w-5 h-5 text-green-400" />
          </div>
          <p className="text-2xl font-bold text-white">₦{totalIncome.toLocaleString()}</p>
          <p className="text-xs text-gray-400 mt-1">{filteredIncomes.length} transactions</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Received</span>
            <TrendingUp className="w-5 h-5 text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-white">₦{receivedIncome.toLocaleString()}</p>
          <p className="text-xs text-gray-400 mt-1">
            {filteredIncomes.filter(inc => inc.status === 'received').length} received
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Pending</span>
            <Calendar className="w-5 h-5 text-yellow-400" />
          </div>
          <p className="text-2xl font-bold text-white">₦{pendingIncome.toLocaleString()}</p>
          <p className="text-xs text-gray-400 mt-1">
            {filteredIncomes.filter(inc => inc.status === 'pending').length} pending
          </p>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="bg-gray-800/30 rounded-xl p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search income..."
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Status</option>
              <option value="received">Received</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Date Filter */}
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Time</option>
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="quarter">Last Quarter</option>
              <option value="year">Last Year</option>
            </select>
          </div>
        </div>
      </div>

      {/* Income Grid */}
      {filteredIncomes.length === 0 ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-800 rounded-full mb-4">
            <DollarSign className="w-8 h-8 text-gray-600" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">No income records found</h3>
          <p className="text-gray-400 text-sm">
            {searchQuery || statusFilter !== 'all' || dateFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'Add your first income record to get started'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filteredIncomes.map((income) => (
              <IncomeCard
                key={income.id}
                income={income}
                onDelete={handleDelete}
                onEdit={onEdit}
                session={session}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
