'use client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface MonthlyTrend {
  month: string;
  amount: number;
}

interface MonthlyTrendChartProps {
  data: MonthlyTrend[];
}

// Custom tooltip
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl">
        <p className="text-gray-400 text-xs mb-1">{data.payload.month}</p>
        <p className="text-nex-yellow text-lg font-bold">₦{data.value.toLocaleString()}</p>
      </div>
    );
  }
  return null;
};

// Custom dot for data points
const CustomDot = (props: any) => {
  const { cx, cy, payload } = props;

  return (
    <circle
      cx={cx}
      cy={cy}
      r={6}
      fill="#FFD700"
      stroke="#1f2937"
      strokeWidth={2}
      className="cursor-pointer hover:r-8 transition-all"
    />
  );
};

export default function MonthlyTrendChart({ data }: MonthlyTrendChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-gray-400">
        <p>No trend data available</p>
      </div>
    );
  }

  // Calculate trend direction
  const firstAmount = data[0]?.amount || 0;
  const lastAmount = data[data.length - 1]?.amount || 0;
  const trend = lastAmount > firstAmount ? 'up' : 'down';
  const trendPercent = firstAmount > 0
    ? (((lastAmount - firstAmount) / firstAmount) * 100).toFixed(1)
    : 0;

  // Calculate average
  const average = data.reduce((sum, item) => sum + item.amount, 0) / data.length;

  return (
    <div className="w-full">
      {/* Trend Summary */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-gray-400 text-sm mb-1">Spending Trend</p>
          <div className="flex items-center space-x-2">
            {trend === 'up' ? (
              <div className="flex items-center space-x-1 text-red-400">
                <TrendingUp className="w-5 h-5" />
                <span className="text-lg font-bold">+{trendPercent}%</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1 text-green-400">
                <TrendingDown className="w-5 h-5" />
                <span className="text-lg font-bold">{trendPercent}%</span>
              </div>
            )}
            <span className="text-gray-400 text-sm">vs first month</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-gray-400 text-sm mb-1">Average</p>
          <p className="text-white text-lg font-bold">₦{average.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#FFD700" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#FFD700" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
          <XAxis
            dataKey="month"
            stroke="#9CA3AF"
            style={{ fontSize: '12px' }}
            tick={{ fill: '#9CA3AF' }}
          />
          <YAxis
            stroke="#9CA3AF"
            style={{ fontSize: '12px' }}
            tick={{ fill: '#9CA3AF' }}
            tickFormatter={(value) => `₦${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#FFD700', strokeWidth: 1 }} />
          <Area
            type="monotone"
            dataKey="amount"
            stroke="#FFD700"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorAmount)"
            animationDuration={1000}
            animationEasing="ease-in-out"
          />
          <Line
            type="monotone"
            dataKey="amount"
            stroke="#FFD700"
            strokeWidth={3}
            dot={<CustomDot />}
            activeDot={{ r: 8 }}
            animationDuration={1000}
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-700">
        <div className="text-center">
          <p className="text-gray-400 text-xs mb-1">Highest</p>
          <p className="text-white text-sm font-semibold">
            ₦{Math.max(...data.map(d => d.amount)).toLocaleString()}
          </p>
        </div>
        <div className="text-center">
          <p className="text-gray-400 text-xs mb-1">Lowest</p>
          <p className="text-white text-sm font-semibold">
            ₦{Math.min(...data.map(d => d.amount)).toLocaleString()}
          </p>
        </div>
        <div className="text-center">
          <p className="text-gray-400 text-xs mb-1">Total Months</p>
          <p className="text-white text-sm font-semibold">{data.length}</p>
        </div>
      </div>
    </div>
  );
}
