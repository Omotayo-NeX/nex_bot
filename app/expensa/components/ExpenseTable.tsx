'use client';
import { motion } from 'framer-motion';
import { Edit, Trash2, Eye, Calendar, Tag, User } from 'lucide-react';
import { useState } from 'react';
import DeleteConfirmModal from './DeleteConfirmModal';
import { hapticFeedback } from '@/lib/utils/haptics';

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

interface ExpenseTableProps {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
  onViewReceipt: (receiptUrl: string) => void;
}

export default function ExpenseTable({
  expenses,
  onEdit,
  onDelete,
  onViewReceipt
}: ExpenseTableProps) {
  const [sortField, setSortField] = useState<keyof Expense>('expenseDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<{ id: string; name: string } | null>(null);

  const handleSort = (field: keyof Expense) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedExpenses = [...expenses].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];

    if (sortField === 'expenseDate') {
      aVal = new Date(aVal as string).getTime();
      bVal = new Date(bVal as string).getTime();
    }

    if (aVal === null || aVal === undefined) return 1;
    if (bVal === null || bVal === undefined) return -1;

    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50',
      approved: 'bg-green-500/20 text-green-300 border-green-500/50',
      rejected: 'bg-red-500/20 text-red-300 border-red-500/50',
      reimbursed: 'bg-blue-500/20 text-blue-300 border-blue-500/50'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${styles[status as keyof typeof styles]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Transport': 'bg-blue-500/10 text-blue-400',
      'Food': 'bg-green-500/10 text-green-400',
      'Equipment': 'bg-purple-500/10 text-purple-400',
      'Software': 'bg-indigo-500/10 text-indigo-400',
      'Marketing': 'bg-pink-500/10 text-pink-400',
      'Travel': 'bg-orange-500/10 text-orange-400',
      'Office': 'bg-gray-500/10 text-gray-400',
      'Other': 'bg-gray-500/10 text-gray-400'
    };
    return colors[category] || colors['Other'];
  };

  const handleDeleteClick = (expense: Expense) => {
    hapticFeedback.medium(); // Haptic feedback on delete attempt
    setExpenseToDelete({
      id: expense.id,
      name: expense.merchantName || 'Unknown Merchant'
    });
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    hapticFeedback.strong(); // Strong haptic on confirm delete
    if (expenseToDelete) {
      onDelete(expenseToDelete.id);
      setDeleteModalOpen(false);
      setExpenseToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteModalOpen(false);
    setExpenseToDelete(null);
  };

  if (expenses.length === 0) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-12 text-center">
        <Wallet className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-300 mb-2">No expenses yet</h3>
        <p className="text-gray-500">Add your first expense to get started</p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop Table View - Hidden on mobile */}
      <div className="hidden md:block bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-900/50 border-b border-gray-700/50">
              <tr>
                <th
                  className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-300"
                  onClick={() => handleSort('expenseDate')}
                >
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>Date</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Merchant
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-300"
                  onClick={() => handleSort('category')}
                >
                  <div className="flex items-center space-x-2">
                    <Tag className="w-4 h-4" />
                    <span>Category</span>
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-300"
                  onClick={() => handleSort('amount')}
                >
                  Amount
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {sortedExpenses.map((expense, index) => (
                <motion.tr
                  key={expense.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-700/30 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {formatDate(expense.expenseDate)}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="text-gray-200 font-medium">
                      {expense.merchantName || 'N/A'}
                    </div>
                    {expense.description && (
                      <div className="text-gray-500 text-xs mt-1 max-w-xs truncate">
                        {expense.description}
                      </div>
                    )}
                    {expense.projectName && (
                      <div className="flex items-center mt-1 text-xs text-gray-400">
                        <User className="w-3 h-3 mr-1" />
                        {expense.projectName}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 rounded-md text-xs font-medium ${getCategoryColor(expense.category)}`}>
                      {expense.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-200">
                    {formatCurrency(expense.amount, expense.currency)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {getStatusBadge(expense.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      {expense.receiptUrl && (
                        <button
                          onClick={() => onViewReceipt(expense.receiptUrl!)}
                          className="text-blue-400 hover:text-blue-300 transition-colors p-2 hover:bg-blue-500/10 rounded-lg"
                          title="View Receipt"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => onEdit(expense)}
                        className="text-gray-400 hover:text-gray-300 transition-colors p-2 hover:bg-gray-700/50 rounded-lg"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(expense)}
                        className="text-red-400 hover:text-red-300 transition-colors p-2 hover:bg-red-500/10 rounded-lg"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View - Visible only on mobile */}
      <div className="md:hidden space-y-3">
        {sortedExpenses.map((expense, index) => (
          <motion.div
            key={expense.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-4"
          >
            {/* Header: Merchant and Amount */}
            <div className="flex items-start justify-between mb-3 gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-semibold text-sm sm:text-base truncate">
                  {expense.merchantName || 'N/A'}
                </h3>
                <div className="flex items-center space-x-1 text-gray-400 text-xs mt-1">
                  <Calendar className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{formatDate(expense.expenseDate)}</span>
                </div>
              </div>
              <div className="text-right ml-2 flex-shrink-0">
                <div className="text-white font-bold text-base sm:text-lg whitespace-nowrap">
                  {formatCurrency(expense.amount, expense.currency)}
                </div>
              </div>
            </div>

            {/* Category and Status */}
            <div className="flex items-center space-x-2 mb-3">
              <span className={`px-2 py-1 rounded-md text-xs font-medium ${getCategoryColor(expense.category)}`}>
                {expense.category}
              </span>
              {getStatusBadge(expense.status)}
            </div>

            {/* Description */}
            {expense.description && (
              <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                {expense.description}
              </p>
            )}

            {/* Project Name */}
            {expense.projectName && (
              <div className="flex items-center text-xs text-gray-400 mb-3">
                <User className="w-3 h-3 mr-1" />
                <span>{expense.projectName}</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 sm:gap-3 pt-3 border-t border-gray-700/50 flex-wrap">
              {expense.receiptUrl && (
                <button
                  onClick={() => onViewReceipt(expense.receiptUrl!)}
                  className="flex items-center space-x-1 text-blue-400 hover:text-blue-300 transition-colors px-4 py-2.5 min-h-[44px] hover:bg-blue-500/10 rounded-lg text-sm"
                >
                  <Eye className="w-4 h-4" />
                  <span>Receipt</span>
                </button>
              )}
              {expense.status === 'pending' && (
                <>
                  <button
                    onClick={() => onEdit(expense)}
                    className="flex items-center space-x-1 text-gray-400 hover:text-gray-300 transition-colors px-4 py-2.5 min-h-[44px] hover:bg-gray-700/50 rounded-lg text-sm"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDeleteClick(expense)}
                    className="flex items-center space-x-1 text-red-400 hover:text-red-300 transition-colors px-4 py-2.5 min-h-[44px] hover:bg-red-500/10 rounded-lg text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Delete Expense"
        message="Are you sure you want to delete this expense?"
        itemName={expenseToDelete?.name}
      />
    </>
  );
}

function Wallet({ className }: { className: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  );
}
