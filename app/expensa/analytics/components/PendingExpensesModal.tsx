'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, XCircle, Calendar, DollarSign, Tag, FileText, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

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

interface PendingExpensesModalProps {
  isOpen: boolean;
  onClose: () => void;
  expenses: Expense[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  session: any;
}

export default function PendingExpensesModal({
  isOpen,
  onClose,
  expenses,
  onApprove,
  onReject,
  session
}: PendingExpensesModalProps) {
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleApprove = async (id: string) => {
    setProcessingId(id);
    try {
      const response = await fetch(`/api/expensa/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ status: 'approved' })
      });

      if (!response.ok) throw new Error('Failed to approve expense');

      toast.success('Expense approved!');
      onApprove(id);
    } catch (error: any) {
      console.error('Failed to approve expense:', error);
      toast.error('Failed to approve expense');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string) => {
    setProcessingId(id);
    try {
      const response = await fetch(`/api/expensa/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ status: 'rejected' })
      });

      if (!response.ok) throw new Error('Failed to reject expense');

      toast.success('Expense rejected');
      onReject(id);
    } catch (error: any) {
      console.error('Failed to reject expense:', error);
      toast.error('Failed to reject expense');
    } finally {
      setProcessingId(null);
    }
  };

  const pendingExpenses = expenses.filter(exp => exp.status === 'pending');

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-gray-900 rounded-2xl border border-gray-700 shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700/50 bg-gradient-to-r from-yellow-500/10 to-yellow-500/5">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-yellow-500/20 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-yellow-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Pending Expenses</h2>
                  <p className="text-gray-400 text-sm">{pendingExpenses.length} expense(s) awaiting approval</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-300 transition-colors p-2 hover:bg-gray-800 rounded-lg"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {pendingExpenses.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-green-400" />
                  </div>
                  <p className="text-gray-400 text-lg">No pending expenses!</p>
                  <p className="text-gray-500 text-sm mt-2">All expenses have been reviewed</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingExpenses.map((expense) => (
                    <motion.div
                      key={expense.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-4 hover:border-gray-600/50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          {/* Merchant and Date */}
                          <div className="flex items-center space-x-3 mb-3">
                            <h3 className="text-lg font-semibold text-white">
                              {expense.merchantName || 'Unknown Merchant'}
                            </h3>
                            <div className="flex items-center space-x-1 text-gray-400 text-sm">
                              <Calendar className="w-4 h-4" />
                              <span>{new Date(expense.expenseDate).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}</span>
                            </div>
                          </div>

                          {/* Details Grid */}
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            {/* Amount */}
                            <div className="flex items-center space-x-2">
                              <DollarSign className="w-4 h-4 text-green-400" />
                              <span className="text-white font-semibold">
                                {expense.currency} {expense.amount.toLocaleString()}
                              </span>
                            </div>

                            {/* Category */}
                            <div className="flex items-center space-x-2">
                              <Tag className="w-4 h-4 text-blue-400" />
                              <span className="text-gray-300">{expense.category}</span>
                            </div>

                            {/* Project */}
                            {expense.projectName && (
                              <div className="flex items-center space-x-2 col-span-2">
                                <FileText className="w-4 h-4 text-purple-400" />
                                <span className="text-gray-300">{expense.projectName}</span>
                              </div>
                            )}
                          </div>

                          {/* Description */}
                          {expense.description && (
                            <p className="text-gray-400 text-sm mb-4 p-3 bg-gray-900/50 rounded-lg">
                              {expense.description}
                            </p>
                          )}

                          {/* Receipt Link */}
                          {expense.receiptUrl && (
                            <a
                              href={expense.receiptUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-nex-yellow hover:text-nex-yellow-dark text-sm inline-flex items-center space-x-1 mb-4"
                            >
                              <FileText className="w-4 h-4" />
                              <span>View Receipt</span>
                            </a>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center space-x-2 ml-4">
                          <button
                            onClick={() => handleApprove(expense.id)}
                            disabled={processingId === expense.id}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                          >
                            {processingId === expense.id ? (
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <Check className="w-4 h-4" />
                            )}
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => handleReject(expense.id)}
                            disabled={processingId === expense.id}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                          >
                            {processingId === expense.id ? (
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <XCircle className="w-4 h-4" />
                            )}
                            <span>Reject</span>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
