'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Check, Star } from 'lucide-react';
import { PLANS, type PlanType } from '@/lib/plans';
import { toast } from 'sonner';

export default function PricingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState<PlanType | null>(null);

  const handlePlanSelect = async (planId: PlanType) => {
    if (!session) {
      toast.error('Please sign in to upgrade your plan');
      router.push('/auth/signin');
      return;
    }

    if (planId === 'Free') {
      toast.info('You are already on the Free plan');
      return;
    }

    setLoading(planId);
    
    try {
      // Redirect to Paystack checkout
      const response = await fetch(`/api/paystack/checkout?plan=${planId.toLowerCase()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: session.user.email,
          plan: planId
        }),
      });

      const data = await response.json();
      
      if (data.authorization_url) {
        // Redirect to Paystack payment page
        window.location.href = data.authorization_url;
      } else {
        toast.error('Failed to initiate payment. Please try again.');
      }
    } catch (error) {
      console.error('Payment initiation error:', error);
      toast.error('Payment system error. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black text-white">
      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-12">
          <Link href="/chat" className="flex items-center space-x-3">
            <div className="relative w-10 h-10">
              <Image 
                src="/Nex_logomark_white.png" 
                alt="NeX Logo" 
                fill
                className="object-contain"
              />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              NeX AI
            </span>
          </Link>
          
          {session ? (
            <Link 
              href="/chat"
              className="bg-gray-700/50 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Back to Dashboard
            </Link>
          ) : (
            <Link 
              href="/auth/signin"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Sign In
            </Link>
          )}
        </div>

        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Choose Your{' '}
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Perfect Plan
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Unlock the full potential of NeX AI with our flexible pricing plans. 
            From free exploration to enterprise solutions.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {Object.values(PLANS).map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-gray-800/50 backdrop-blur-sm rounded-2xl border p-8 transition-all duration-300 hover:scale-105 ${
                plan.popular
                  ? 'border-purple-500/50 ring-2 ring-purple-500/20'
                  : 'border-gray-700/50 hover:border-gray-600/50'
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                    <Star className="w-4 h-4" />
                    Most Popular
                  </div>
                </div>
              )}

              {/* Plan Header */}
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold">
                    ₦{plan.price.naira.toLocaleString()}
                  </span>
                  {plan.price.naira > 0 && (
                    <>
                      <span className="text-gray-400 ml-2">/ ${plan.price.usd}</span>
                      <div className="text-gray-400 text-sm">{plan.billing}</div>
                    </>
                  )}
                </div>
                
                {/* CTA Button */}
                <button
                  onClick={() => handlePlanSelect(plan.id)}
                  disabled={loading === plan.id}
                  className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${
                    plan.popular
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-purple-500/25'
                      : plan.id === 'Free'
                      ? 'bg-gray-700/50 hover:bg-gray-700 text-white'
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-blue-500/25'
                  }`}
                >
                  {loading === plan.id ? 'Processing...' : 
                   plan.id === 'Free' ? 'Current Plan' : 'Upgrade Now'}
                </button>
              </div>

              {/* Features List */}
              <div className="space-y-4">
                {plan.limits.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-5 h-5 bg-green-500/20 rounded-full flex items-center justify-center mt-0.5">
                      <Check className="w-3 h-3 text-green-400" />
                    </div>
                    <span className="text-gray-300 text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Usage Limits */}
              <div className="mt-8 pt-6 border-t border-gray-700/50">
                <h4 className="font-semibold mb-3 text-gray-200">Usage Limits:</h4>
                <div className="space-y-2 text-sm text-gray-400">
                  <div>
                    Chat: {plan.limits.chatPerDay === -1 ? 'Unlimited' : `${plan.limits.chatPerDay} per day`}
                  </div>
                  <div>
                    Videos: {plan.limits.videosPerWeek === -1 ? 'Unlimited' : `${plan.limits.videosPerWeek} per week`}
                  </div>
                  <div>
                    Voice: {plan.limits.voiceMinutesPerWeek === -1 ? 'Unlimited' : `${plan.limits.voiceMinutesPerWeek} min/week`}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-20 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gray-800/30 rounded-xl p-6">
              <h3 className="font-semibold mb-3">Can I change my plan anytime?</h3>
              <p className="text-gray-400 text-sm">
                Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately for upgrades.
              </p>
            </div>
            <div className="bg-gray-800/30 rounded-xl p-6">
              <h3 className="font-semibold mb-3">What payment methods do you accept?</h3>
              <p className="text-gray-400 text-sm">
                We accept all major payment methods through Paystack, including cards, bank transfers, and mobile money.
              </p>
            </div>
            <div className="bg-gray-800/30 rounded-xl p-6">
              <h3 className="font-semibold mb-3">Is there a free trial for Pro plans?</h3>
              <p className="text-gray-400 text-sm">
                Start with our Free plan to explore NeX AI. Upgrade when you're ready for more features and higher limits.
              </p>
            </div>
            <div className="bg-gray-800/30 rounded-xl p-6">
              <h3 className="font-semibold mb-3">What happens if I exceed my limits?</h3>
              <p className="text-gray-400 text-sm">
                You'll be prompted to upgrade your plan. Your account won't be suspended, but premium features will be limited.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}