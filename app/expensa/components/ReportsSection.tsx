'use client';
import { motion } from 'framer-motion';
import { Download, FileText, Calendar } from 'lucide-react';
import { useState } from 'react';

interface ReportsSectionProps {
  expenses: any[];
}

export default function ReportsSection({ expenses }: ReportsSectionProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportCSV = () => {
    setIsExporting(true);

    try {
      // Create CSV content
      const headers = ['Date', 'Merchant', 'Category', 'Amount', 'Currency', 'Status', 'Description'];
      const rows = expenses.map(exp => [
        new Date(exp.expenseDate).toLocaleDateString(),
        exp.merchantName || 'N/A',
        exp.category,
        exp.amount,
        exp.currency,
        exp.status,
        exp.description || ''
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      // Download file
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `expenses-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export CSV:', error);
    } finally {
      setIsExporting(false);
    }
  };

  // Calculate summary stats
  const totalAmount = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount.toString()), 0);
  const byCategory = expenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + parseFloat(exp.amount.toString());
    return acc;
  }, {} as Record<string, number>);

  const topCategories = Object.entries(byCategory)
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
          <Calendar className="w-6 h-6" />
          <span>Reports & Analytics</span>
        </h2>
        <button
          onClick={handleExportCSV}
          disabled={isExporting || expenses.length === 0}
          className="px-4 py-2 bg-nex-yellow hover:bg-nex-yellow-dark text-nex-navy font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          <Download className="w-4 h-4" />
          <span>{isExporting ? 'Exporting...' : 'Export CSV'}</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
        >
          <h3 className="text-gray-400 text-sm font-medium mb-2">Total Expenses</h3>
          <p className="text-3xl font-bold text-white">
            ₦{totalAmount.toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </p>
          <p className="text-gray-500 text-sm mt-2">{expenses.length} transactions</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
        >
          <h3 className="text-gray-400 text-sm font-medium mb-2">Average Expense</h3>
          <p className="text-3xl font-bold text-white">
            ₦{expenses.length > 0 ? (totalAmount / expenses.length).toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : '0'}
          </p>
          <p className="text-gray-500 text-sm mt-2">Per transaction</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50"
        >
          <h3 className="text-gray-400 text-sm font-medium mb-2">Top Category</h3>
          <p className="text-3xl font-bold text-white">
            {topCategories[0]?.[0] || 'N/A'}
          </p>
          <p className="text-gray-500 text-sm mt-2">
            {topCategories[0] ? `₦${(topCategories[0][1] as number).toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : 'No data'}
          </p>
        </motion.div>
      </div>

      {/* Category Breakdown */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
        <h3 className="text-lg font-semibold text-white mb-4">Spending by Category</h3>
        {topCategories.length > 0 ? (
          <div className="space-y-3">
            {topCategories.map(([category, amount], index) => {
              const percentage = ((amount as number) / totalAmount) * 100;
              return (
                <div key={category}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-300 text-sm font-medium">{category}</span>
                    <span className="text-gray-400 text-sm">
                      ₦{(amount as number).toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ delay: index * 0.1, duration: 0.5 }}
                      className="h-full bg-gradient-to-r from-nex-yellow to-nex-navy-light"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No expense data available</p>
        )}
      </div>
    </div>
  );
}
