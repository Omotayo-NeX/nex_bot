'use client';
import { MessageSquare, Image, Mic, Wallet, TrendingUp, Sparkles } from 'lucide-react';
import DashboardWelcome from './DashboardWelcome';
import QuickStartCard from './QuickStartCard';

interface DashboardViewProps {
  onStartChat: () => void;
  onOpenPictureGenerator: () => void;
  onOpenVoiceGenerator: () => void;
  onNavigateToExpensa: () => void;
}

export default function DashboardView({
  onStartChat,
  onOpenPictureGenerator,
  onOpenVoiceGenerator,
  onNavigateToExpensa,
}: DashboardViewProps) {
  console.log('🟢 DashboardView rendered, onStartChat:', typeof onStartChat);

  const quickStartItems = [
    {
      title: 'Start a New Chat',
      description: 'Begin a conversation with NeX AI assistant for any task or question',
      icon: MessageSquare,
      onClick: () => {
        console.log('🟡 Start Chat clicked from quickStartItems');
        onStartChat();
      },
      gradient: 'from-nex-violet-start to-nex-violet-end',
      isPrimary: true,
    },
    {
      title: 'Generate Images',
      description: 'Create stunning AI-generated images for your projects and content',
      icon: Image,
      onClick: onOpenPictureGenerator,
      gradient: 'from-pink-500 via-nex-purple to-nex-gradient-end',
    },
    {
      title: 'Create Voice-over',
      description: 'Transform text into natural-sounding speech with AI voice synthesis',
      icon: Mic,
      onClick: onOpenVoiceGenerator,
      gradient: 'from-cyan-500 via-blue-600 to-nex-purple',
    },
    {
      title: 'Track Expenses',
      description: 'Manage your finances with intelligent expense tracking and analytics',
      icon: Wallet,
      onClick: onNavigateToExpensa,
      gradient: 'from-emerald-500 via-green-600 to-teal-600',
    },
    {
      title: 'View Analytics',
      description: 'Monitor your usage statistics and insights across all NeX AI tools',
      icon: TrendingUp,
      onClick: () => window.location.href = '/analytics',
      gradient: 'from-orange-500 via-amber-500 to-nex-gradient-start',
    },
    {
      title: 'Explore Templates',
      description: 'Browse pre-built prompts and workflows to boost your productivity',
      icon: Sparkles,
      onClick: onStartChat,
      gradient: 'from-nex-gradient-start via-nex-purple to-nex-gradient-end',
    },
  ];

  return (
    <div className="h-full w-full overflow-y-auto flex items-center justify-center bg-nex-bg">
      <div className="w-full max-w-5xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <DashboardWelcome />

        {/* Quick Start Section */}
        <div className="w-full">
          {/* Quick Start Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {quickStartItems.map((item) => (
              <QuickStartCard
                key={item.title}
                title={item.title}
                description={item.description}
                icon={item.icon}
                onClick={item.onClick}
                gradient={item.gradient}
                isPrimary={item.isPrimary}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
