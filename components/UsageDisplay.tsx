'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { 
  MessageSquare, 
  Image, 
  Video, 
  Mic, 
  Crown, 
  AlertCircle, 
  TrendingUp,
  Calendar,
  Clock
} from 'lucide-react';

interface UsageData {
  messages_used_today: number;
  daily_limit: number;
  images_generated_this_week: number;
  images_weekly_limit: number;
  videos_generated_this_week: number;
  videos_weekly_limit: number;
  voice_minutes_used_this_week: number;
  voice_weekly_limit: number;
  plan: string;
  plan_key: string;
  subscription_status: string;
  plan_expires_at: string | null;
  chat_usage_percentage: number;
  images_usage_percentage: number;
  videos_usage_percentage: number;
  voice_usage_percentage: number;
  is_chat_limit_reached: boolean;
  is_images_limit_reached: boolean;
  is_videos_limit_reached: boolean;
  is_voice_limit_reached: boolean;
}

interface ProgressBarProps {
  current: number;
  limit: number;
  percentage: number;
  isLimitReached: boolean;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  unit?: string;
  period: string;
}

function ProgressBar({ 
  current, 
  limit, 
  percentage, 
  isLimitReached, 
  icon: Icon, 
  label, 
  unit = '',
  period 
}: ProgressBarProps) {
  const getBarColor = () => {
    if (isLimitReached) return 'bg-red-500';
    if (percentage >= 80) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getBarBgColor = () => {
    if (isLimitReached) return 'bg-red-100';
    if (percentage >= 80) return 'bg-yellow-100';
    return 'bg-green-100';
  };

  const displayLimit = limit === -1 ? '∞' : limit;
  const displayPercentage = limit === -1 ? 0 : Math.min(percentage, 100);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">{label}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-sm text-gray-600">
            {current}{unit} / {displayLimit}{unit}
          </span>
          <span className="text-xs text-gray-400">({period})</span>
        </div>
      </div>
      
      <div className="space-y-1">
        <div className={`h-2 rounded-full ${getBarBgColor()}`}>
          <motion.div
            className={`h-2 rounded-full ${getBarColor()}`}
            initial={{ width: 0 }}
            animate={{ width: `${displayPercentage}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
        
        {isLimitReached && (
          <div className="flex items-center gap-1 text-xs text-red-600">
            <AlertCircle className="h-3 w-3" />
            <span>Limit reached - Upgrade plan to continue</span>
          </div>
        )}
        
        {!isLimitReached && percentage >= 80 && (
          <div className="flex items-center gap-1 text-xs text-yellow-600">
            <AlertCircle className="h-3 w-3" />
            <span>Approaching limit ({displayPercentage}%)</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function UsageDisplay() {
  const { data: session } = useSession();
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user?.id) {
      fetchUsage();
    }
  }, [session]);

  const fetchUsage = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/usage');
      
      if (!response.ok) {
        throw new Error('Failed to fetch usage data');
      }
      
      const data = await response.json();
      setUsage(data);
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch usage:', err);
      setError(err.message || 'Failed to load usage data');
    } finally {
      setLoading(false);
    }
  };

  const getPlanBadgeColor = (planKey: string) => {
    switch (planKey) {
      case 'enterprise':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'pro':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'free':
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-2 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
        <p className="text-red-600 text-sm">{error}</p>
        <button
          onClick={fetchUsage}
          className="mt-2 px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!usage) {
    return (
      <div className="p-6 text-center text-gray-500">
        <p>No usage data available</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header with Plan Info */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Usage Overview
          </h3>
          <button
            onClick={fetchUsage}
            className="p-1 text-gray-400 hover:text-gray-600 rounded"
            title="Refresh usage data"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crown className="h-4 w-4 text-yellow-500" />
            <span 
              className={`px-2 py-1 text-xs font-medium border rounded-full ${getPlanBadgeColor(usage.plan_key)}`}
            >
              {usage.plan}
            </span>
          </div>
          <div className="text-xs text-gray-500 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {usage.subscription_status === 'active' ? 'Active' : 'Inactive'}
          </div>
        </div>
      </div>

      {/* Usage Progress Bars */}
      <div className="space-y-4">
        <ProgressBar
          current={usage.messages_used_today}
          limit={usage.daily_limit}
          percentage={usage.chat_usage_percentage}
          isLimitReached={usage.is_chat_limit_reached}
          icon={MessageSquare}
          label="Messages"
          period="today"
        />

        <ProgressBar
          current={usage.images_generated_this_week}
          limit={usage.images_weekly_limit}
          percentage={usage.images_usage_percentage}
          isLimitReached={usage.is_images_limit_reached}
          icon={Image}
          label="Images"
          period="this week"
        />

        <ProgressBar
          current={usage.videos_generated_this_week}
          limit={usage.videos_weekly_limit}
          percentage={usage.videos_usage_percentage}
          isLimitReached={usage.is_videos_limit_reached}
          icon={Video}
          label="Videos"
          period="this week"
        />

        <ProgressBar
          current={usage.voice_minutes_used_this_week}
          limit={usage.voice_weekly_limit}
          percentage={usage.voice_usage_percentage}
          isLimitReached={usage.is_voice_limit_reached}
          icon={Mic}
          label="Voice"
          unit=" min"
          period="this week"
        />
      </div>

      {/* Plan Expiry Info */}
      {usage.plan_key !== 'free' && usage.plan_expires_at && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-blue-700">
            <Calendar className="h-4 w-4" />
            <span>Plan expires: {new Date(usage.plan_expires_at).toLocaleDateString()}</span>
          </div>
        </div>
      )}

      {/* Upgrade CTA */}
      {(usage.is_chat_limit_reached || usage.is_images_limit_reached || 
        usage.is_videos_limit_reached || usage.is_voice_limit_reached) && 
        usage.plan_key === 'free' && (
        <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Crown className="h-5 w-5 text-yellow-500" />
            <span className="font-medium text-gray-900">Upgrade to Pro</span>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Get unlimited chat, 50 videos/month, and 300 voice minutes.
          </p>
          <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            Upgrade Now
          </button>
        </div>
      )}
    </div>
  );
}