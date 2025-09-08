'use client';
import { useState } from 'react';
import { Settings, MessageSquare, Image, Code2, Thermometer } from 'lucide-react';
import { motion } from 'framer-motion';

interface RightSidebarProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
  temperature: number;
  onTemperatureChange: (temp: number) => void;
}

export default function RightSidebar({ selectedModel, onModelChange, temperature, onTemperatureChange }: RightSidebarProps) {
  const [activeTab, setActiveTab] = useState<'chat' | 'images' | 'code'>('chat');

  const models = [
    { id: 'nex-gpt-4', name: 'NeX GPT-4', description: 'Most capable model' },
    { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', description: 'Fast and efficient' },
    { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', description: 'Quick responses' },
  ];

  const tabs = [
    { id: 'chat' as const, label: 'Chat', icon: MessageSquare },
    { id: 'images' as const, label: 'Images', icon: Image },
    { id: 'code' as const, label: 'Code', icon: Code2 },
  ];

  return (
    <motion.div 
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeOut", delay: 0.1 }}
      className="w-80 bg-[#0f172a] border-l border-gray-700/50 flex flex-col h-full"
    >
      {/* Tab Switcher */}
      <div className="p-4 border-b border-gray-700/50">
        <div className="flex space-x-1 bg-gray-800/50 p-1 rounded-lg">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                <IconComponent className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 p-4 overflow-y-auto">
        {activeTab === 'chat' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* Chat Settings Card */}
            <div className="bg-gray-800/50 rounded-2xl p-4 border border-gray-700/50">
              <div className="flex items-center space-x-2 mb-4">
                <Settings className="w-5 h-5 text-gray-400" />
                <h3 className="text-lg font-semibold text-white">Chat Settings</h3>
              </div>

              {/* Model Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Model Selection
                </label>
                <select
                  value={selectedModel}
                  onChange={(e) => onModelChange(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {models.map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.name} - {model.description}
                    </option>
                  ))}
                </select>
              </div>

              {/* Temperature Slider */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-300">
                    Temperature
                  </label>
                  <span className="text-sm text-gray-400">{temperature.toFixed(1)}</span>
                </div>
                <div className="relative">
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={temperature}
                    onChange={(e) => onTemperatureChange(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span className="flex items-center">
                      <Thermometer className="w-3 h-3 mr-1" />
                      Focused
                    </span>
                    <span>Creative</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Usage Stats Card */}
            <div className="bg-gray-800/50 rounded-2xl p-4 border border-gray-700/50">
              <h3 className="text-lg font-semibold text-white mb-4">Usage Today</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Messages</span>
                  <span className="text-white font-medium">24/100</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full" style={{ width: '24%' }}></div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'images' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            <div className="bg-gray-800/50 rounded-2xl p-4 border border-gray-700/50">
              <h3 className="text-lg font-semibold text-white mb-4">Image Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Image Size
                  </label>
                  <select className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500">
                    <option>1024x1024 (Square)</option>
                    <option>1024x1792 (Portrait)</option>
                    <option>1792x1024 (Landscape)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Quality
                  </label>
                  <select className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500">
                    <option>Standard</option>
                    <option>HD</option>
                  </select>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'code' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            <div className="bg-gray-800/50 rounded-2xl p-4 border border-gray-700/50">
              <h3 className="text-lg font-semibold text-white mb-4">Code Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Language
                  </label>
                  <select className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500">
                    <option>Auto-detect</option>
                    <option>JavaScript</option>
                    <option>TypeScript</option>
                    <option>Python</option>
                    <option>React</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-300">Code Execution</span>
                  <div className="relative">
                    <input type="checkbox" className="sr-only" />
                    <div className="block bg-gray-600 w-14 h-8 rounded-full"></div>
                    <div className="dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition"></div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: linear-gradient(45deg, #8b5cf6, #3b82f6);
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }

        .slider::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: linear-gradient(45deg, #8b5cf6, #3b82f6);
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
      `}</style>
    </motion.div>
  );
}