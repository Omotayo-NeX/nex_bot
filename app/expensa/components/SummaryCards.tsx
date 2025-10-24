'use client';
import { motion } from 'framer-motion';
import { Wallet, Clock, CheckCircle, TrendingUp } from 'lucide-react';

interface SummaryCardsProps {
  totalExpenses: number;
  pendingApproval: number;
  approvedThisMonth: number;
  budgetRemaining: number;
  currency?: string;
  onPendingClick?: () => void;
}

export default function SummaryCards({
  totalExpenses,
  pendingApproval,
  approvedThisMonth,
  budgetRemaining,
  currency = 'NGN',
  onPendingClick
}: SummaryCardsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const cards = [
    {
      title: 'Total Expenses',
      value: formatCurrency(totalExpenses),
      icon: <Wallet className="w-6 h-6" />,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-500/10',
      iconColor: 'text-blue-500',
      clickable: false
    },
    {
      title: 'Pending Approval',
      value: pendingApproval.toString(),
      icon: <Clock className="w-6 h-6" />,
      color: 'from-yellow-500 to-orange-600',
      bgColor: 'bg-yellow-500/10',
      iconColor: 'text-yellow-500',
      clickable: true,
      subtitle: 'Click to review'
    },
    {
      title: 'Approved This Month',
      value: formatCurrency(approvedThisMonth),
      icon: <CheckCircle className="w-6 h-6" />,
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-500/10',
      iconColor: 'text-green-500',
      clickable: false
    },
    {
      title: 'Budget Remaining',
      value: formatCurrency(budgetRemaining),
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'from-purple-500 to-indigo-600',
      bgColor: 'bg-purple-500/10',
      iconColor: 'text-purple-500',
      clickable: false
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
      {cards.map((card, index) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          onClick={card.clickable ? onPendingClick : undefined}
          className={`bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 md:p-6 border border-gray-700/50 transition-all ${
            card.clickable
              ? 'cursor-pointer hover:border-yellow-500/50 hover:bg-gray-800/70'
              : 'hover:border-gray-600/50'
          }`}
        >
          <div className="flex items-start justify-between mb-3 md:mb-4">
            <div className={`${card.bgColor} rounded-lg p-2 md:p-3`}>
              <div className={`${card.iconColor} w-4 h-4 md:w-6 md:h-6`}>
                {card.icon}
              </div>
            </div>
          </div>
          <h3 className="text-gray-400 text-xs md:text-sm font-medium mb-1 md:mb-2">{card.title}</h3>
          <p className="text-white text-lg md:text-2xl font-bold truncate">{card.value}</p>
          {card.subtitle && (
            <p className="text-xs md:text-sm text-gray-500 mt-1">{card.subtitle}</p>
          )}
        </motion.div>
      ))}
    </div>
  );
}
