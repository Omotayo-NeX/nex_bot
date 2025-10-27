'use client';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';

interface BudgetProgressIndicatorProps {
  spent: number;
  budget: number;
  currency?: string;
}

export default function BudgetProgressIndicator({ spent, budget, currency = '₦' }: BudgetProgressIndicatorProps) {
  const percentage = budget > 0 ? (spent / budget) * 100 : 0;
  const remaining = budget - spent;
  const isOverBudget = spent > budget;

  // Determine status and color
  let status: 'excellent' | 'good' | 'warning' | 'critical';
  let statusColor: string;
  let statusIcon: React.ReactNode;
  let statusText: string;

  if (percentage <= 50) {
    status = 'excellent';
    statusColor = '#10B981'; // Green
    statusIcon = <CheckCircle className="w-5 h-5" />;
    statusText = 'On Track';
  } else if (percentage <= 75) {
    status = 'good';
    statusColor = '#3B82F6'; // Blue
    statusIcon = <TrendingUp className="w-5 h-5" />;
    statusText = 'Good Pace';
  } else if (percentage <= 90) {
    status = 'warning';
    statusColor = '#F59E0B'; // Orange
    statusIcon = <AlertCircle className="w-5 h-5" />;
    statusText = 'Watch Out';
  } else {
    status = 'critical';
    statusColor = '#EF4444'; // Red
    statusIcon = <AlertTriangle className="w-5 h-5" />;
    statusText = isOverBudget ? 'Over Budget!' : 'Near Limit';
  }

  // SVG circle calculations
  const size = 200;
  const strokeWidth = 16;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (Math.min(percentage, 100) / 100) * circumference;

  return (
    <div className="w-full">
      {/* Circular Progress */}
      <div className="flex items-center justify-center mb-6">
        <div className="relative" style={{ width: size, height: size }}>
          {/* Background circle */}
          <svg
            width={size}
            height={size}
            className="transform -rotate-90"
          >
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="#374151"
              strokeWidth={strokeWidth}
              fill="none"
            />
            {/* Progress circle */}
            <motion.circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={statusColor}
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={circumference}
              strokeLinecap="round"
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
            />
          </svg>

          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
              className="text-center"
            >
              <p className="text-4xl font-bold text-white mb-1">
                {Math.min(percentage, 999).toFixed(0)}%
              </p>
              <p className="text-xs text-gray-400">of budget</p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Status Badge */}
      <div
        className="flex items-center justify-center space-x-2 mb-6 px-4 py-2 rounded-full mx-auto w-fit"
        style={{ backgroundColor: `${statusColor}20`, color: statusColor }}
      >
        {statusIcon}
        <span className="font-semibold text-sm">{statusText}</span>
      </div>

      {/* Budget Details */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-gray-400 text-sm">Total Budget</span>
          <span className="text-white font-semibold">{currency}{budget.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-400 text-sm">Spent</span>
          <span className="text-white font-semibold">{currency}{spent.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-gray-700">
          <span className="text-gray-400 text-sm font-medium">
            {isOverBudget ? 'Over Budget' : 'Remaining'}
          </span>
          <span
            className="font-bold text-lg"
            style={{ color: isOverBudget ? '#EF4444' : '#10B981' }}
          >
            {isOverBudget ? '-' : ''}{currency}{Math.abs(remaining).toLocaleString()}
          </span>
        </div>
      </div>

      {/* Warning Message */}
      {percentage >= 90 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mt-4 p-3 rounded-lg border ${
            isOverBudget
              ? 'bg-red-500/10 border-red-500/50 text-red-400'
              : 'bg-yellow-500/10 border-yellow-500/50 text-yellow-400'
          }`}
        >
          <p className="text-sm flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>
              {isOverBudget
                ? 'You have exceeded your budget. Consider reviewing your expenses.'
                : 'You are approaching your budget limit. Monitor spending carefully.'}
            </span>
          </p>
        </motion.div>
      )}

      {/* Daily Average */}
      <div className="mt-6 p-4 bg-gray-800/50 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-xs mb-1">Daily Average</p>
            <p className="text-white font-semibold">
              {currency}{(spent / 30).toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>
          </div>
          <div className="text-right">
            <p className="text-gray-400 text-xs mb-1">Projected Month End</p>
            <p className="text-white font-semibold">
              {currency}{(spent / new Date().getDate() * 30).toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
