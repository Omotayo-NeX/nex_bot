'use client';
import { LucideIcon } from 'lucide-react';

interface QuickStartCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  onClick: () => void;
  gradient?: string;
  isPrimary?: boolean;
}

export default function QuickStartCard({
  title,
  description,
  icon: Icon,
  onClick,
  gradient = 'from-nex-violet-start to-nex-violet-end',
  isPrimary = false
}: QuickStartCardProps) {
  if (isPrimary) {
    // Primary Action Card - "Start a New Chat"
    return (
      <button
        onClick={() => {
          console.log('🔴 Primary card clicked:', title);
          onClick();
        }}
        className="group relative rounded-xl p-6 transition-all duration-150 cursor-pointer text-left hover:scale-[1.02] active:scale-[0.98]"
        style={{
          background: 'rgba(255, 255, 255, 0.05)',
          border: '2px solid rgba(163, 63, 244, 0.5)'
        }}
      >
        {/* Icon */}
        <div className="mb-4">
          <div
            className="w-12 h-12 rounded-lg flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #A33FF4, #6C3DD9)'
            }}
          >
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-semibold text-white mb-2">
          {title}
        </h3>

        {/* Description */}
        <p className="text-sm text-nex-text-muted leading-relaxed">
          {description}
        </p>
      </button>
    );
  }

  // Regular Cards
  return (
    <button
      onClick={onClick}
      className="group relative rounded-xl p-6 transition-all duration-150 cursor-pointer text-left hover:scale-[1.01] active:scale-[0.99]"
      style={{
        background: 'rgba(255, 255, 255, 0.04)',
        border: '1px solid rgba(255, 255, 255, 0.08)'
      }}
    >
      {/* Icon */}
      <div className="mb-4">
        <div
          className="w-12 h-12 rounded-lg flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, rgba(163, 63, 244, 0.2), rgba(108, 61, 217, 0.1))'
          }}
        >
          <Icon className="w-5 h-5 text-nex-violet-start" />
        </div>
      </div>

      {/* Title */}
      <h3 className="text-base font-medium text-white mb-2">
        {title}
      </h3>

      {/* Description */}
      <p className="text-xs text-gray-400 leading-relaxed">
        {description}
      </p>
    </button>
  );
}
