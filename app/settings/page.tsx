'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Bot, 
  Settings as SettingsIcon, 
  Crown, 
  BarChart3,
  Thermometer,
  ChevronDown,
  Check,
  CreditCard,
  Calendar
} from 'lucide-react';
import Link from 'next/link';
import { useSettings } from '@/lib/contexts/SettingsContext';
import UsageDisplay from '@/components/UsageDisplay';
import { PLANS, type PlanType } from '@/lib/plans';

interface ModelOption {
  id: string;
  name: string;
  description: string;
  provider: string;
  contextWindow: string;
  recommended: boolean;
}

interface ModelsResponse {
  models: ModelOption[];
  default: string;
}

export default function SettingsPage() {
  const { user, session, loading: authLoading } = useAuth();
  const router = useRouter();
  const { selectedModel, setSelectedModel, temperature, setTemperature } = useSettings();

  const [availableModels, setAvailableModels] = useState<ModelOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);
  const [userPlan, setUserPlan] = useState<PlanType>('free');

  useEffect(() => {
    if (authLoading) return;

    if (!user || !session) {
      router.replace('/');
      return;
    }

    fetchModels();
    fetchUserPlan();
  }, [user, session, authLoading, router]);

  const fetchModels = async () => {
    try {
      const response = await fetch('/api/models');
      if (response.ok) {
        const data: ModelsResponse = await response.json();
        setAvailableModels(data.models);
      }
    } catch (error) {
      console.error('Failed to fetch models:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPlan = async () => {
    try {
      const response = await fetch('/api/user/usage', {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setUserPlan(data.plan || 'free');
      }
    } catch (error) {
      console.error('Failed to fetch user plan:', error);
    }
  };

  const handleModelChange = async (modelId: string) => {
    setSelectedModel(modelId);
    setModelDropdownOpen(false);

    // Save to backend
    try {
      await fetch('/api/user/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          preferredModel: modelId,
        }),
      });
    } catch (error) {
      console.error('Failed to save model preference:', error);
    }
  };

  const handleTemperatureChange = async (newTemp: number) => {
    setTemperature(newTemp);

    // Debounce the API call to avoid too many requests
    clearTimeout((window as any).tempTimer);
    (window as any).tempTimer = setTimeout(async () => {
      try {
        await fetch('/api/user/settings', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`
          },
          body: JSON.stringify({
            preferredTemperature: newTemp,
          }),
        });
      } catch (error) {
        console.error('Failed to save temperature preference:', error);
      }
    }, 500);
  };

  const selectedModelInfo = availableModels.find(model => model.id === selectedModel);

  if (authLoading || loading) {
    return (
      <div className="h-screen bg-gradient-to-b from-[#0d1117] to-[#1c1f26] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"
          />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-white text-lg font-medium"
          >
            Loading Settings...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  if (!user || !session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0d1117] to-[#1c1f26]">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link 
            href="/chat"
            className="p-2 bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700/50 text-gray-400 hover:text-white hover:bg-gray-700/50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <SettingsIcon className="w-8 h-8 text-purple-400" />
              Settings
            </h1>
            <p className="text-gray-400 mt-1">Customize your NeX AI experience</p>
          </div>
        </div>

        <div className="space-y-8">
          {/* AI Model Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <Bot className="w-6 h-6 text-blue-400" />
              <h2 className="text-xl font-semibold text-white">AI Model</h2>
            </div>

            <div className="space-y-6">
              {/* Model Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Selected Model
                </label>
                <div className="relative">
                  <button
                    onClick={() => setModelDropdownOpen(!modelDropdownOpen)}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white text-left flex items-center justify-between hover:bg-gray-700/70 transition-colors"
                  >
                    <div>
                      <div className="font-medium">{selectedModelInfo?.name || selectedModel}</div>
                      <div className="text-sm text-gray-400">{selectedModelInfo?.description}</div>
                    </div>
                    <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${modelDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {modelDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute z-10 w-full mt-2 bg-gray-800 border border-gray-600 rounded-lg shadow-2xl max-h-64 overflow-y-auto"
                    >
                      {availableModels.map((model) => (
                        <button
                          key={model.id}
                          onClick={() => handleModelChange(model.id)}
                          className="w-full px-4 py-3 text-left hover:bg-gray-700/50 transition-colors border-b border-gray-700/50 last:border-b-0 flex items-center justify-between"
                        >
                          <div>
                            <div className="font-medium text-white flex items-center gap-2">
                              {model.name}
                              {model.recommended && (
                                <span className="px-2 py-0.5 bg-blue-600/20 text-blue-400 text-xs rounded-full">
                                  Recommended
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-400">{model.description}</div>
                            <div className="text-xs text-gray-500">{model.contextWindow}</div>
                          </div>
                          {selectedModel === model.id && (
                            <Check className="w-5 h-5 text-green-400" />
                          )}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Temperature Slider */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-300">
                    Creativity (Temperature)
                  </label>
                  <span className="text-sm text-gray-400">{temperature.toFixed(1)}</span>
                </div>
                <div className="relative">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={temperature}
                    onChange={(e) => handleTemperatureChange(parseFloat(e.target.value))}
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
                <p className="text-xs text-gray-500 mt-2">
                  Lower values make responses more focused and deterministic. Higher values increase creativity and randomness.
                </p>
              </div>
            </div>
          </motion.section>

          {/* Subscription Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <Crown className="w-6 h-6 text-yellow-400" />
              <h2 className="text-xl font-semibold text-white">Subscription</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">{PLANS[userPlan]?.name || 'Free Plan'}</p>
                  <p className="text-gray-400 text-sm">
                    {userPlan === 'free' ? 'Current Plan' : 'Active Subscription'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-white font-bold">
                    ₦{PLANS[userPlan]?.price.naira.toLocaleString() || '0'}
                  </p>
                  <p className="text-gray-400 text-xs">
                    {userPlan === 'free' ? 'Forever' : 'Monthly'}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                {userPlan === 'free' ? (
                  <Link 
                    href="/pricing"
                    className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-sm font-medium py-3 px-4 rounded-lg transition-all duration-200"
                  >
                    <Crown className="w-4 h-4" />
                    Upgrade Plan
                  </Link>
                ) : (
                  <>
                    <Link 
                      href="/pricing"
                      className="flex-1 inline-flex items-center justify-center gap-2 bg-gray-700/50 hover:bg-gray-700 text-white text-sm font-medium py-3 px-4 rounded-lg transition-colors"
                    >
                      <CreditCard className="w-4 h-4" />
                      Manage Billing
                    </Link>
                    <Link 
                      href="/pricing"
                      className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-sm font-medium py-3 px-4 rounded-lg transition-all duration-200"
                    >
                      <Crown className="w-4 h-4" />
                      Upgrade
                    </Link>
                  </>
                )}
              </div>

              {/* Plan Features */}
              <div className="mt-4 p-4 bg-gray-700/30 rounded-lg">
                <h3 className="text-sm font-medium text-gray-300 mb-2">Current Plan Features:</h3>
                <ul className="text-sm text-gray-400 space-y-1">
                  {PLANS[userPlan]?.limits.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.section>

          {/* Usage Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50"
          >
            <div className="flex items-center gap-3 p-6 pb-0">
              <BarChart3 className="w-6 h-6 text-green-400" />
              <h2 className="text-xl font-semibold text-white">Usage Statistics</h2>
            </div>
            
            <UsageDisplay />
          </motion.section>
        </div>
      </div>
    </div>
  );
}