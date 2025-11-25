'use client';
import { motion } from 'framer-motion';
import { DollarSign, Calendar, User, Building2, Hash, Trash2, Edit, CheckCircle, Clock, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';
import DeleteConfirmModal from './DeleteConfirmModal';

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

interface IncomeCardProps {
  income: Income;
  onDelete: (id: string) => void;
  onEdit: (income: Income) => void;
  session: any;
}

export default function IncomeCard({ income, onDelete, onEdit, session }: IncomeCardProps) {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = () => {
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/expensa/income/${income.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${session?.access_token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete income');
      }

      toast.success('Income deleted successfully');
      onDelete(income.id);
      setDeleteModalOpen(false);
    } catch (error: any) {
      console.error('Failed to delete income:', error);
      toast.error('Failed to delete income');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setDeleteModalOpen(false);
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'received':
        return {
          icon: <CheckCircle className="w-4 h-4" />,
          bg: 'bg-green-500/20',
          text: 'text-green-400',
          border: 'border-green-500/50',
          label: 'Received'
        };
      case 'pending':
        return {
          icon: <Clock className="w-4 h-4" />,
          bg: 'bg-yellow-500/20',
          text: 'text-yellow-400',
          border: 'border-yellow-500/50',
          label: 'Pending'
        };
      case 'cancelled':
        return {
          icon: <XCircle className="w-4 h-4" />,
          bg: 'bg-red-500/20',
          text: 'text-red-400',
          border: 'border-red-500/50',
          label: 'Cancelled'
        };
      default:
        return {
          icon: <CheckCircle className="w-4 h-4" />,
          bg: 'bg-gray-500/20',
          text: 'text-gray-400',
          border: 'border-gray-500/50',
          label: status
        };
    }
  };

  const statusConfig = getStatusConfig(income.status);

  const getCurrencySymbol = (currency: string) => {
    switch (currency) {
      case 'NGN': return '₦';
      case 'USD': return '$';
      case 'GBP': return '£';
      case 'EUR': return '€';
      default: return currency;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6 hover:border-green-500/30 transition-all"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-green-500/20 rounded-lg">
            <DollarSign className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">{income.source}</h3>
            <p className="text-sm text-gray-400">{income.category}</p>
          </div>
        </div>
        <div className={`flex items-center space-x-1 px-3 py-1 rounded-full border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}>
          {statusConfig.icon}
          <span className="text-xs font-medium">{statusConfig.label}</span>
        </div>
      </div>

      {/* Amount */}
      <div className="mb-4">
        <p className="text-3xl font-bold text-green-400">
          {getCurrencySymbol(income.currency)}{parseFloat(income.amount.toString()).toLocaleString()}
        </p>
        {income.currency !== 'NGN' && (
          <p className="text-xs text-gray-500 mt-1">{income.currency}</p>
        )}
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="flex items-center space-x-2 text-sm">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span className="text-gray-300">
            {new Date(income.incomeDate).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
          </span>
        </div>

        {income.clientName && (
          <div className="flex items-center space-x-2 text-sm">
            <User className="w-4 h-4 text-gray-400" />
            <span className="text-gray-300 truncate">{income.clientName}</span>
          </div>
        )}

        {income.projectName && (
          <div className="flex items-center space-x-2 text-sm">
            <Building2 className="w-4 h-4 text-gray-400" />
            <span className="text-gray-300 truncate">{income.projectName}</span>
          </div>
        )}

        {income.invoiceNumber && (
          <div className="flex items-center space-x-2 text-sm">
            <Hash className="w-4 h-4 text-gray-400" />
            <span className="text-gray-300 truncate">{income.invoiceNumber}</span>
          </div>
        )}
      </div>

      {/* Description */}
      {income.description && (
        <div className="mb-4">
          <p className="text-sm text-gray-400 line-clamp-2">{income.description}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end space-x-2 pt-4 border-t border-gray-700">
        <button
          onClick={() => onEdit(income)}
          className="p-2 hover:bg-green-500/20 rounded-lg transition-colors text-green-400 hover:text-green-300 group"
          title="Edit income"
        >
          <Edit className="w-4 h-4" />
        </button>
        <button
          onClick={handleDeleteClick}
          className="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-red-400 hover:text-red-300 group"
          title="Delete income"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Delete Income"
        message="Are you sure you want to delete this income record?"
        itemName={`${income.source} - ${income.category}`}
        isDeleting={isDeleting}
      />
    </motion.div>
  );
}
