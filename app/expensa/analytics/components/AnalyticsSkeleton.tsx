import { motion } from 'framer-motion';

export default function AnalyticsSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0d1117] to-[#1c1f26]">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-gray-700/50 rounded-lg animate-pulse" />
            <div className="space-y-2">
              <div className="h-8 w-48 bg-gray-700/50 rounded animate-pulse" />
              <div className="h-4 w-64 bg-gray-700/50 rounded animate-pulse hidden sm:block" />
            </div>
          </div>
          <div className="w-10 h-10 bg-gray-700/50 rounded-lg animate-pulse" />
        </div>

        {/* Time Range Skeleton */}
        <div className="bg-gray-800/30 rounded-xl p-4 mb-8">
          <div className="flex items-center space-x-3">
            <div className="h-4 w-24 bg-gray-700/50 rounded animate-pulse" />
            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-10 w-20 bg-gray-700/50 rounded-lg animate-pulse" />
              ))}
            </div>
          </div>
        </div>

        {/* Summary Cards Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="h-4 w-20 bg-gray-700/50 rounded animate-pulse" />
                <div className="w-5 h-5 bg-gray-700/50 rounded animate-pulse" />
              </div>
              <div className="h-10 w-32 bg-gray-700/50 rounded animate-pulse mb-2" />
              <div className="h-3 w-24 bg-gray-700/50 rounded animate-pulse" />
            </motion.div>
          ))}
        </div>

        {/* AI Insights Skeleton */}
        <div className="bg-gradient-to-r from-nex-yellow/10 to-nex-yellow/5 border border-nex-yellow/30 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-gray-700/50 rounded animate-pulse" />
              <div className="h-6 w-48 bg-gray-700/50 rounded animate-pulse" />
            </div>
            <div className="h-12 w-48 bg-gray-700/50 rounded-lg animate-pulse" />
          </div>
          <div className="space-y-3">
            <div className="h-4 w-full bg-gray-700/50 rounded animate-pulse" />
            <div className="h-4 w-5/6 bg-gray-700/50 rounded animate-pulse" />
            <div className="h-4 w-4/6 bg-gray-700/50 rounded animate-pulse" />
          </div>
        </div>

        {/* Category Breakdown Skeleton */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
          <div className="h-6 w-48 bg-gray-700/50 rounded animate-pulse mb-6" />
          <div className="space-y-4">
            {[
              { id: 1, width: 85 },
              { id: 2, width: 65 },
              { id: 3, width: 92 },
              { id: 4, width: 58 },
              { id: 5, width: 75 }
            ].map(({ id, width }) => (
              <div key={id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="h-4 w-32 bg-gray-700/50 rounded animate-pulse" />
                  <div className="h-4 w-24 bg-gray-700/50 rounded animate-pulse" />
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full bg-gray-600/50 rounded-full animate-pulse"
                    style={{ width: `${width}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
