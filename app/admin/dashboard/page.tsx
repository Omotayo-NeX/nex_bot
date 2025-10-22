'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SkeletonDashboard } from '@/components/ui/Skeleton';
import {
  Users,
  DollarSign,
  Activity,
  TrendingUp,
  MessageSquare,
  Image as ImageIcon,
  Mic,
  Shield,
  RefreshCw,
} from 'lucide-react';
import { toast } from '@/lib/hooks/useToast';

interface AdminStats {
  totalUsers: number;
  totalCost: number;
  totalTokens: number;
  totalRequests: number;
  activeUsers: number;
  freeUsers: number;
  proUsers: number;
  enterpriseUsers: number;
}

interface UserCostData {
  userId: string;
  email?: string;
  plan?: string;
  totalCost: number;
  totalTokens: number;
  requestCount: number;
}

export default function AdminDashboard() {
  const { user, session, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [userCosts, setUserCosts] = useState<UserCostData[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [period, setPeriod] = useState<'7' | '30' | '90'>('30');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/admin/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && session) {
      fetchAdminData();
    }
  }, [user, session, period]);

  const fetchAdminData = async () => {
    setLoadingData(true);
    try {
      // Fetch cost data for all users
      const costsRes = await fetch(`/api/costs?period=${period}&admin=true`, {
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      if (!costsRes.ok) {
        throw new Error('Failed to fetch admin data');
      }

      const costsData = await costsRes.json();

      // Fetch all users
      const usersRes = await fetch('/api/admin/users', {
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      let allUsers: any[] = [];
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        allUsers = usersData.users || [];
      }

      // Calculate stats
      const freeCount = allUsers.filter((u) => u.plan === 'free').length;
      const proCount = allUsers.filter((u) => u.plan === 'pro').length;
      const enterpriseCount = allUsers.filter((u) => u.plan === 'enterprise').length;

      setStats({
        totalUsers: allUsers.length,
        totalCost: costsData.totalCost || 0,
        totalTokens: costsData.totalTokens || 0,
        totalRequests: costsData.users?.reduce((sum: number, u: any) => sum + u.requestCount, 0) || 0,
        activeUsers: costsData.userCount || 0,
        freeUsers: freeCount,
        proUsers: proCount,
        enterpriseUsers: enterpriseCount,
      });

      // Merge cost data with user data
      const enrichedCosts = (costsData.users || []).map((costUser: any) => {
        const userInfo = allUsers.find((u) => u.id === costUser.userId);
        return {
          ...costUser,
          email: userInfo?.email,
          plan: userInfo?.plan,
        };
      });

      setUserCosts(enrichedCosts);
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
      toast.error('Failed to load admin data');
    } finally {
      setLoadingData(false);
    }
  };

  if (loading || loadingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-nex-navy via-nex-navy-light to-nex-navy p-8">
        <div className="container mx-auto">
          <SkeletonDashboard />
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-nex-navy via-nex-navy-light to-nex-navy flex items-center justify-center">
        <div className="text-white text-center">
          <Shield className="w-16 h-16 mx-auto mb-4 text-nex-yellow" />
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-gray-300">You don't have permission to access this page</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-nex-navy via-nex-navy-light to-nex-navy">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-heading font-bold text-white mb-2 flex items-center gap-3">
              <Shield className="w-10 h-10 text-nex-yellow" />
              Admin Dashboard
            </h1>
            <p className="text-gray-300">Monitor users, costs, and system performance</p>
          </div>
          <Button variant="secondary" size="sm" onClick={fetchAdminData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Period Selector */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={period === '7' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setPeriod('7')}
          >
            Last 7 Days
          </Button>
          <Button
            variant={period === '30' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setPeriod('30')}
          >
            Last 30 Days
          </Button>
          <Button
            variant={period === '90' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setPeriod('90')}
          >
            Last 90 Days
          </Button>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Users className="w-5 h-5 mr-2 text-blue-500" />
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-nex-navy">{stats.totalUsers}</div>
              <p className="text-sm text-gray-600 mt-1">{stats.activeUsers} active in period</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <DollarSign className="w-5 h-5 mr-2 text-green-500" />
                Total Cost
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-nex-navy">
                ${stats.totalCost.toFixed(2)}
              </div>
              <p className="text-sm text-gray-600 mt-1">Last {period} days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Activity className="w-5 h-5 mr-2 text-purple-500" />
                Total Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-nex-navy">
                {stats.totalRequests.toLocaleString()}
              </div>
              <p className="text-sm text-gray-600 mt-1">API calls</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <TrendingUp className="w-5 h-5 mr-2 text-orange-500" />
                Total Tokens
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-nex-navy">
                {stats.totalTokens.toLocaleString()}
              </div>
              <p className="text-sm text-gray-600 mt-1">Across all models</p>
            </CardContent>
          </Card>
        </div>

        {/* User Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Free Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-600">{stats.freeUsers}</div>
              <div className="text-sm text-gray-500 mt-1">
                {((stats.freeUsers / stats.totalUsers) * 100).toFixed(1)}% of total
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pro Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{stats.proUsers}</div>
              <div className="text-sm text-gray-500 mt-1">
                {((stats.proUsers / stats.totalUsers) * 100).toFixed(1)}% of total
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Enterprise Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">{stats.enterpriseUsers}</div>
              <div className="text-sm text-gray-500 mt-1">
                {((stats.enterpriseUsers / stats.totalUsers) * 100).toFixed(1)}% of total
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Users by Cost */}
        <Card>
          <CardHeader>
            <CardTitle>Top Users by Cost</CardTitle>
            <CardDescription>Users with highest API usage in the selected period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">
                      Email
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">
                      Plan
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-sm text-gray-700">
                      Cost
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-sm text-gray-700">
                      Tokens
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-sm text-gray-700">
                      Requests
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {userCosts
                    .sort((a, b) => b.totalCost - a.totalCost)
                    .slice(0, 10)
                    .map((user) => (
                      <tr key={user.userId} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm">
                          {user.email || user.userId.substring(0, 8) + '...'}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-block px-2 py-1 text-xs font-medium rounded capitalize ${
                              user.plan === 'enterprise'
                                ? 'bg-purple-100 text-purple-700'
                                : user.plan === 'pro'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {user.plan || 'free'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right text-sm font-medium">
                          ${user.totalCost.toFixed(4)}
                        </td>
                        <td className="py-3 px-4 text-right text-sm text-gray-600">
                          {user.totalTokens.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right text-sm text-gray-600">
                          {user.requestCount}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
              {userCosts.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>No user data available for the selected period</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
