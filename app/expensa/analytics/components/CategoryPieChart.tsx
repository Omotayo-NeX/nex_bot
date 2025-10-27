'use client';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface CategoryData {
  name: string;
  amount: number;
  count: number;
  percentage: number;
}

interface CategoryPieChartProps {
  data: CategoryData[];
}

// Professional color palette
const COLORS = [
  '#FFD700', // Gold (nex-yellow)
  '#4A9EFF', // Blue
  '#10B981', // Green
  '#F59E0B', // Orange
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#14B8A6', // Teal
];

// Custom tooltip
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl">
        <p className="text-white font-semibold mb-1">{data.name}</p>
        <p className="text-nex-yellow text-sm">₦{data.amount.toLocaleString()}</p>
        <p className="text-gray-400 text-xs mt-1">{data.count} transactions</p>
        <p className="text-gray-400 text-xs">{data.percentage}% of total</p>
      </div>
    );
  }
  return null;
};

// Custom label for the pie slices
const renderCustomLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}: any) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  // Only show label if percentage is above 5%
  if (percent < 0.05) return null;

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      className="text-xs font-semibold"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

// Custom legend
const renderLegend = (props: any) => {
  const { payload } = props;

  return (
    <div className="grid grid-cols-2 gap-2 mt-4">
      {payload.map((entry: any, index: number) => (
        <div key={`legend-${index}`} className="flex items-center space-x-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-sm text-gray-300 truncate">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

export default function CategoryPieChart({ data }: CategoryPieChartProps) {
  // Transform data for recharts
  const chartData = data.map((item) => ({
    name: item.name,
    value: item.amount,
    amount: item.amount,
    count: item.count,
    percentage: item.percentage,
  }));

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[400px] text-gray-400">
        <p>No data available</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomLabel}
            outerRadius={120}
            innerRadius={60}
            fill="#8884d8"
            dataKey="value"
            animationBegin={0}
            animationDuration={800}
            animationEasing="ease-out"
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
                className="hover:opacity-80 transition-opacity cursor-pointer"
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend content={renderLegend} />
        </PieChart>
      </ResponsiveContainer>

      {/* Stats Summary below chart */}
      <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-700">
        <div className="text-center">
          <p className="text-gray-400 text-xs mb-1">Total Categories</p>
          <p className="text-white text-lg font-semibold">{data.length}</p>
        </div>
        <div className="text-center">
          <p className="text-gray-400 text-xs mb-1">Total Transactions</p>
          <p className="text-white text-lg font-semibold">
            {data.reduce((sum, item) => sum + item.count, 0)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-gray-400 text-xs mb-1">Top Category</p>
          <p className="text-white text-lg font-semibold truncate">
            {data[0]?.name || 'N/A'}
          </p>
        </div>
      </div>
    </div>
  );
}
