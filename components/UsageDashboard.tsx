'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Crown, MessageCircle, Video, Mic, ArrowUp } from 'lucide-react';
import { PLANS, type PlanType, getRemainingUsage } from '@/lib/plans';

interface UsageData {
  plan: PlanType;
  chat_used_today: number;
  videos_generated_this_week: number;
  voice_minutes_this_week: number;
  plan_expires_at?: string | null;
}

export default function UsageDashboard() {
  const { data: session } = useSession();
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.id) {
      fetchUsage();
    }
  }, [session]);

  const fetchUsage = async () => {
    try {
      const response = await fetch('/api/user/usage');
      if (response.ok) {
        const data = await response.json();
        setUsage(data);
      }
    } catch (error) {
      console.error('Failed to fetch usage data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!session || loading) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-700 rounded w-3/4"></div>
            <div className="h-4 bg-gray-700 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!usage) return null;

  const currentPlan = PLANS[usage.plan];
  const chatRemaining = getRemainingUsage(usage.plan, 'chat', usage.chat_used_today);
  const videoRemaining = getRemainingUsage(usage.plan, 'video', usage.videos_generated_this_week);
  const voiceRemaining = getRemainingUsage(usage.plan, 'voice', usage.voice_minutes_this_week);

  const formatUsage = (used: number, limit: number, type: string) => {
    if (limit === -1) return `${used} ${type} (Unlimited)`;
    return `${used}/${limit} ${type}`;
  };

  const getUsageColor = (used: number, limit: number) => {
    if (limit === -1) return 'text-green-400';
    const percentage = (used / limit) * 100;
    if (percentage >= 90) return 'text-red-400';
    if (percentage >= 70) return 'text-yellow-400';
    return 'text-green-400';
  };

  const getProgressWidth = (used: number, limit: number) => {
    if (limit === -1) return '100%';
    return `${Math.min((used / limit) * 100, 100)}%`;
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 space-y-6">
      {/* Plan Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600/20 rounded-lg">
            <Crown className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white">{currentPlan.name}</h3>
            <p className="text-sm text-gray-400">
              {usage.plan === 'Free' ? 'Current Plan' : 
               usage.plan_expires_at ? `Expires ${new Date(usage.plan_expires_at).toLocaleDateString()}` : 
               'Active'}
            </p>
          </div>
        </div>
        
        {usage.plan === 'Free' && (
          <Link 
            href="/pricing"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-all duration-200 hover:scale-105"
          >
            <ArrowUp className="w-4 h-4" />
            Upgrade
          </Link>
        )}
      </div>

      {/* Usage Stats */}
      <div className="space-y-4">
        {/* Chat Usage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-gray-300">Chat Messages</span>
            </div>
            <span className={`text-sm font-medium ${getUsageColor(usage.chat_used_today, currentPlan.limits.chatPerDay)}`}>
              {formatUsage(usage.chat_used_today, currentPlan.limits.chatPerDay, 'today')}
            </span>
          </div>
          
          {currentPlan.limits.chatPerDay !== -1 && (
            <div className="w-full bg-gray-700/50 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  usage.chat_used_today >= currentPlan.limits.chatPerDay ? 'bg-red-500' : 'bg-blue-500'
                }`}
                style={{ width: getProgressWidth(usage.chat_used_today, currentPlan.limits.chatPerDay) }}
              ></div>
            </div>
          )}
        </div>

        {/* Video Usage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Video className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-gray-300">Videos Generated</span>
            </div>
            <span className={`text-sm font-medium ${getUsageColor(usage.videos_generated_this_week, currentPlan.limits.videosPerWeek)}`}>
              {formatUsage(usage.videos_generated_this_week, currentPlan.limits.videosPerWeek, 'this week')}
            </span>
          </div>
          
          {currentPlan.limits.videosPerWeek !== -1 && (
            <div className="w-full bg-gray-700/50 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  usage.videos_generated_this_week >= currentPlan.limits.videosPerWeek ? 'bg-red-500' : 'bg-purple-500'
                }`}
                style={{ width: getProgressWidth(usage.videos_generated_this_week, currentPlan.limits.videosPerWeek) }}
              ></div>
            </div>
          )}
        </div>

        {/* Voice Usage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mic className="w-4 h-4 text-green-400" />
              <span className="text-sm text-gray-300">Voice Minutes</span>
            </div>
            <span className={`text-sm font-medium ${getUsageColor(usage.voice_minutes_this_week, currentPlan.limits.voiceMinutesPerWeek)}`}>
              {formatUsage(usage.voice_minutes_this_week, currentPlan.limits.voiceMinutesPerWeek, 'this week')}
            </span>
          </div>
          
          {currentPlan.limits.voiceMinutesPerWeek !== -1 && (
            <div className="w-full bg-gray-700/50 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  usage.voice_minutes_this_week >= currentPlan.limits.voiceMinutesPerWeek ? 'bg-red-500' : 'bg-green-500'
                }`}
                style={{ width: getProgressWidth(usage.voice_minutes_this_week, currentPlan.limits.voiceMinutesPerWeek) }}
              ></div>
            </div>
          )}
        </div>
      </div>

      {/* Upgrade Prompt for limits reached */}
      {(
        (currentPlan.limits.chatPerDay !== -1 && usage.chat_used_today >= currentPlan.limits.chatPerDay) ||
        (currentPlan.limits.videosPerWeek !== -1 && usage.videos_generated_this_week >= currentPlan.limits.videosPerWeek) ||
        (currentPlan.limits.voiceMinutesPerWeek !== -1 && usage.voice_minutes_this_week >= currentPlan.limits.voiceMinutesPerWeek)
      ) && usage.plan !== 'Business' && (
        <div className="bg-yellow-900/30 border border-yellow-600/30 rounded-lg p-4">
          <h4 className="font-medium text-yellow-200 mb-2">Limits Reached</h4>
          <p className="text-sm text-yellow-300 mb-3">
            You've reached your {usage.plan.toLowerCase()} plan limits. Upgrade to continue using all features.
          </p>
          <Link 
            href="/pricing"
            className="inline-flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors"
          >
            <Crown className="w-4 h-4" />
            Upgrade Plan
          </Link>
        </div>
      )}
    </div>
  );
}