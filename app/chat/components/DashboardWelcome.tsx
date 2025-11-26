'use client';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { Sparkles, TrendingUp } from 'lucide-react';

export default function DashboardWelcome() {
  const { user } = useAuth();
  const [greeting, setGreeting] = useState('Good day');
  const [userName, setUserName] = useState('there');

  useEffect(() => {
    // Set greeting based on time of day
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting('Good morning');
    } else if (hour < 18) {
      setGreeting('Good afternoon');
    } else {
      setGreeting('Good evening');
    }

    // Get user name
    if (user?.email) {
      // Extract first name from email or use full name
      const emailName = user.email.split('@')[0];
      const displayName = user.user_metadata?.name || user.user_metadata?.full_name || emailName;
      setUserName(displayName.split(' ')[0] || displayName);
    }
  }, [user]);

  return (
    <div className="text-center pb-8">
      {/* Main Greeting with Gradient Text */}
      <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
        <span className="text-white">
          {greeting},{' '}
        </span>
        <span className="bg-gradient-to-r from-nex-violet-start via-nex-purple to-nex-violet-end bg-clip-text text-transparent">
          {userName}
        </span>
      </h1>

      {/* Subheading */}
      <p className="text-base sm:text-lg text-nex-text-muted mb-4">
        What would you like to create today?
      </p>

      {/* Usage Insight */}
      <div className="flex items-center justify-center gap-2 mb-4">
        <TrendingUp className="w-4 h-4 text-nex-violet-start" />
        <p className="text-sm text-nex-text-muted">
          You have created <span className="text-white font-semibold">14 chats</span> and{' '}
          <span className="text-white font-semibold">6 images</span> this week.
        </p>
      </div>

      {/* Top Tag - Floating pill */}
      <div className="inline-block">
        <div className="px-4 py-2 bg-white/[0.04] backdrop-blur-md border border-white/10 rounded-full relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-nex-violet-start/10 to-nex-violet-end/10" />
          <span className="relative text-xs font-semibold text-white flex items-center gap-2">
            <Sparkles className="w-3 h-3" />
            Powered by NeX AI Core — GPT-5 + ElevenLabs Integration
          </span>
        </div>
      </div>
    </div>
  );
}
