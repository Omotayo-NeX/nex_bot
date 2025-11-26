'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Tag, DollarSign, FileText, Briefcase } from 'lucide-react';
import { useState, useEffect } from 'react';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (expense: ExpenseFormData) => Promise<void>;
  initialData?: ExpenseFormData | null;
}

export interface ExpenseFormData {
  merchantName: string;
  category: string;
  amount: string;
  currency: string;
  description: string;
  expenseDate: string;
  projectName?: string;
}

const CATEGORIES = [
  'Transport',
  'Food',
  'Equipment',
  'Software',
  'Marketing',
  'Travel',
  'Office',
  'Other'
];

export default function AddExpenseModal({
  isOpen,
  onClose,
  onSubmit,
  initialData
}: AddExpenseModalProps) {
  const [formData, setFormData] = useState<ExpenseFormData>(
    initialData || {
      merchantName: '',
      category: 'Transport',
      amount: '',
      currency: 'NGN',
      description: '',
      expenseDate: new Date().toISOString().split('T')[0],
      projectName: ''
    }
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update form data when initialData changes (e.g., from receipt extraction)
  useEffect(() => {
    if (initialData) {
      console.log('📝 Populating form with extracted data:', initialData);
      setFormData(initialData);
    } else if (!isOpen) {
      // Reset form when modal closes without initialData
      setFormData({
        merchantName: '',
        category: 'Transport',
        amount: '',
        currency: 'NGN',
        description: '',
        expenseDate: new Date().toISOString().split('T')[0],
        projectName: ''
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // Validation
      if (!formData.merchantName.trim()) {
        throw new Error('Merchant name is required');
      }
      if (!formData.amount || parseFloat(formData.amount) <= 0) {
        throw new Error('Please enter a valid amount');
      }
      if (!formData.expenseDate) {
        throw new Error('Expense date is required');
      }

      await onSubmit(formData);
      onClose();

      // Reset form
      setFormData({
        merchantName: '',
        category: 'Transport',
        amount: '',
        currency: 'NGN',
        description: '',
        expenseDate: new Date().toISOString().split('T')[0],
        projectName: ''
      });
    } catch (err: any) {
      setError(err.message || 'Failed to save expense');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4">
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
            className="relative bg-gray-900 rounded-none sm:rounded-2xl border-0 sm:border border-gray-700 shadow-2xl max-w-2xl w-full h-full sm:h-auto sm:max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-700/50 sticky top-0 bg-gray-900 z-10">
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                {initialData ? 'Edit Expense' : 'Add New Expense'}
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-300 transition-colors p-3 sm:p-2 min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-gray-800 rounded-lg flex-shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto max-h-[calc(95vh-160px)] sm:max-h-[calc(90vh-140px)]">
              {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-3 sm:space-y-4">
                {/* Merchant Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <div className="flex items-center space-x-2">
                      <Briefcase className="w-4 h-4" />
                      <span className="text-sm">Merchant / Vendor Name *</span>
                    </div>
                  </label>
                  <input
                    type="text"
                    name="merchantName"
                    value={formData.merchantName}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm sm:text-base placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-nex-yellow focus:border-transparent"
                    placeholder="e.g., Total Filling Station"
                  />
                </div>

                {/* Date and Amount Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">Expense Date *</span>
                      </div>
                    </label>
                    <input
                      type="date"
                      name="expenseDate"
                      value={formData.expenseDate}
                      onChange={handleChange}
                      required
                      max={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-nex-yellow focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="w-4 h-4" />
                        <span className="text-sm">Amount *</span>
                      </div>
                    </label>
                    <div className="flex space-x-2">
                      <select
                        name="currency"
                        value={formData.currency}
                        onChange={handleChange}
                        className="px-2 py-2 sm:px-3 sm:py-3 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-nex-yellow focus:border-transparent"
                      >
                        <option value="NGN">NGN</option>
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                      </select>
                      <input
                        type="number"
                        name="amount"
                        value={formData.amount}
                        onChange={handleChange}
                        required
                        min="0"
                        step="0.01"
                        className="flex-1 px-3 py-2 sm:px-4 sm:py-3 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm sm:text-base placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-nex-yellow focus:border-transparent"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <div className="flex items-center space-x-2">
                      <Tag className="w-4 h-4" />
                      <span className="text-sm">Category *</span>
                    </div>
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-nex-yellow focus:border-transparent"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Project Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <span className="text-sm">Project / Department (Optional)</span>
                  </label>
                  <input
                    type="text"
                    name="projectName"
                    value={formData.projectName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm sm:text-base placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-nex-yellow focus:border-transparent"
                    placeholder="e.g., Marketing Campaign Q4"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4" />
                      <span className="text-sm">Description (Optional)</span>
                    </div>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm sm:text-base placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-nex-yellow focus:border-transparent resize-none"
                    placeholder="Additional details about this expense..."
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end space-x-2 sm:space-x-3 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-700/50">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 sm:px-6 sm:py-2.5 bg-gray-800 hover:bg-gray-700 text-white text-sm sm:text-base rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 sm:px-6 sm:py-2.5 bg-nex-yellow hover:bg-nex-yellow-dark text-nex-navy text-sm sm:text-base font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Saving...' : initialData ? 'Update' : 'Add Expense'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
