'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Activity, DollarSign, MessageSquare, Image as ImageIcon, Mic, Video, TrendingUp, Calendar } from 'lucide-react';

interface UsageData {
  chat_used_today: number;
  images_generated_this_week: number;
  voice_minutes_this_week: number;
  videos_generated_this_week: number;
  plan: string;
  plan_expires_at: string | null;
}

interface CostData {
  totalCost: number;
  totalTokens: number;
  recordCount: number;
  byFeature: Record<string, { cost: number; count: number }>;
  byModel: Record<string, { cost: number; tokens: number; count: number }>;
}

export default function AnalyticsPage() {
  const { user, session, loading } = useAuth();
  const router = useRouter();
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [costs, setCosts] = useState<CostData | null>(null);
  const [period, setPeriod] = useState<'7' | '30' | '90'>('30');
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/signin');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && session) {
      fetchAnalytics();
    }
  }, [user, session, period]);

  const fetchAnalytics = async () => {
    setLoadingData(true);
    try {
      // Fetch usage data
      const usageRes = await fetch('/api/usage', {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      });
      if (usageRes.ok) {
        const usageData = await usageRes.json();
        setUsage(usageData);
      }

      // Fetch cost data
      const costsRes = await fetch(`/api/costs?period=${period}`, {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      });
      if (costsRes.ok) {
        const costsData = await costsRes.json();
        setCosts(costsData);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const getPlanLimits = (plan: string) => {
    switch (plan) {
      case 'pro':
        return { chat: Infinity, images: 50, voice: 300, videos: 50 };
      case 'enterprise':
        return { chat: Infinity, images: Infinity, voice: Infinity, videos: Infinity };
      default:
        return { chat: 20, images: 3, voice: 5, videos: 3 };
    }
  };

  const calculatePercentage = (used: number, limit: number) => {
    if (limit === Infinity) return 0;
    return Math.min((used / limit) * 100, 100);
  };

  if (loading || loadingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-nex-navy via-nex-navy-light to-nex-navy flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nex-yellow"></div>
      </div>
    );
  }

  if (!usage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-nex-navy via-nex-navy-light to-nex-navy flex items-center justify-center">
        <div className="text-white">Failed to load analytics data</div>
      </div>
    );
  }

  const limits = getPlanLimits(usage.plan);

  return (
    <div className="min-h-screen bg-gradient-to-br from-nex-navy via-nex-navy-light to-nex-navy">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-heading font-bold text-white mb-2">Usage Analytics</h1>
          <p className="text-gray-300">Track your AI usage, costs, and performance metrics</p>
        </div>

        {/* Period Selector */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={period === '7' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setPeriod('7')}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Last 7 Days
          </Button>
          <Button
            variant={period === '30' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setPeriod('30')}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Last 30 Days
          </Button>
          <Button
            variant={period === '90' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setPeriod('90')}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Last 90 Days
          </Button>
        </div>

        {/* Cost Overview */}
        {costs && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="w-5 h-5 mr-2 text-green-500" />
                  Total Cost
                </CardTitle>
                <CardDescription>Last {period} days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-nex-navy">
                  ${costs.totalCost.toFixed(4)}
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {costs.recordCount} API calls
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-blue-500" />
                  Total Tokens
                </CardTitle>
                <CardDescription>Across all models</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-nex-navy">
                  {costs.totalTokens.toLocaleString()}
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Prompt + completion
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-purple-500" />
                  Current Plan
                </CardTitle>
                <CardDescription>Subscription tier</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-nex-navy capitalize">
                  {usage.plan}
                </div>
                {usage.plan_expires_at && (
                  <p className="text-sm text-gray-600 mt-2">
                    Renews {new Date(usage.plan_expires_at).toLocaleDateString()}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Usage Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {/* Chat Usage */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <MessageSquare className="w-5 h-5 mr-2 text-blue-500" />
                Chat Messages
              </CardTitle>
              <CardDescription>Today</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-baseline">
                  <span className="text-3xl font-bold text-nex-navy">{usage.chat_used_today}</span>
                  <span className="text-sm text-gray-600">/ {limits.chat === Infinity ? '∞' : limits.chat}</span>
                </div>
                {limits.chat !== Infinity && (
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{ width: `${calculatePercentage(usage.chat_used_today, limits.chat)}%` }}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Images Usage */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <ImageIcon className="w-5 h-5 mr-2 text-purple-500" />
                Images Generated
              </CardTitle>
              <CardDescription>This week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-baseline">
                  <span className="text-3xl font-bold text-nex-navy">{usage.images_generated_this_week}</span>
                  <span className="text-sm text-gray-600">/ {limits.images === Infinity ? '∞' : limits.images}</span>
                </div>
                {limits.images !== Infinity && (
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-500 h-2 rounded-full transition-all"
                      style={{ width: `${calculatePercentage(usage.images_generated_this_week, limits.images)}%` }}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Voice Usage */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Mic className="w-5 h-5 mr-2 text-green-500" />
                Voice Minutes
              </CardTitle>
              <CardDescription>This week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-baseline">
                  <span className="text-3xl font-bold text-nex-navy">{usage.voice_minutes_this_week}</span>
                  <span className="text-sm text-gray-600">/ {limits.voice === Infinity ? '∞' : limits.voice}</span>
                </div>
                {limits.voice !== Infinity && (
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all"
                      style={{ width: `${calculatePercentage(usage.voice_minutes_this_week, limits.voice)}%` }}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Videos Usage */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Video className="w-5 h-5 mr-2 text-red-500" />
                Videos Generated
              </CardTitle>
              <CardDescription>This week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-baseline">
                  <span className="text-3xl font-bold text-nex-navy">{usage.videos_generated_this_week}</span>
                  <span className="text-sm text-gray-600">/ {limits.videos === Infinity ? '∞' : limits.videos}</span>
                </div>
                {limits.videos !== Infinity && (
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-red-500 h-2 rounded-full transition-all"
                      style={{ width: `${calculatePercentage(usage.videos_generated_this_week, limits.videos)}%` }}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cost Breakdown */}
        {costs && costs.byFeature && Object.keys(costs.byFeature).length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Cost by Feature</CardTitle>
                <CardDescription>Breakdown of spending across features</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(costs.byFeature).map(([feature, data]) => (
                    <div key={feature} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium capitalize">{feature}</span>
                        <span className="text-sm font-bold">${data.cost.toFixed(4)}</span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>{data.count} requests</span>
                        <span>{((data.cost / costs.totalCost) * 100).toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-nex-yellow h-2 rounded-full transition-all"
                          style={{ width: `${(data.cost / costs.totalCost) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cost by Model</CardTitle>
                <CardDescription>Spending per AI model</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(costs.byModel).map(([model, data]) => (
                    <div key={model} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{model}</span>
                        <span className="text-sm font-bold">${data.cost.toFixed(4)}</span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>{data.count} requests</span>
                        <span>{data.tokens.toLocaleString()} tokens</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-nex-navy h-2 rounded-full transition-all"
                          style={{ width: `${(data.cost / costs.totalCost) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Upgrade CTA */}
        {usage.plan === 'free' && (
          <Card className="mt-6 bg-gradient-to-r from-nex-yellow to-nex-yellow-dark">
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-nex-navy mb-2">Upgrade to Pro</h3>
                  <p className="text-nex-navy-dark">Get unlimited chat, more images, and priority support</p>
                </div>
                <Button variant="secondary" size="lg" onClick={() => router.push('/pricing')}>
                  View Plans
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
