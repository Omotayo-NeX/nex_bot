'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { Home, MessageSquare, Wallet, Mic, Settings, Menu, X } from 'lucide-react';
import { useState } from 'react';

interface NavbarProps {
  onToggleSidebar?: () => void;
  sidebarOpen?: boolean;
}

const navItems = [
  { name: 'Home', icon: Home, href: '/', tooltip: 'Go to homepage' },
  { name: 'Chat', icon: MessageSquare, href: '/chat', tooltip: 'AI Chat Assistant' },
  { name: 'Expensa', icon: Wallet, href: '/expensa', tooltip: 'Expense Tracker' },
  { name: 'Voice', icon: Mic, href: '/voiceover', tooltip: 'Voice Generator' },
  { name: 'Settings', icon: Settings, href: '/settings', tooltip: 'Account Settings' },
];

export default function Navbar({ onToggleSidebar, sidebarOpen }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="flex-shrink-0 bg-nex-bg border-b border-nex-border"
      style={{ height: '60px' }}
    >
      <div className="h-full flex items-center justify-between px-6">
        {/* Left Section: Official NeX Consulting Logo */}
        <div className="flex items-center gap-4">
          {/* Mobile Hamburger */}
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-3 sm:p-2 min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-white/5 rounded-lg transition-all duration-200"
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? (
                <X className="w-5 h-5 text-gray-300" />
              ) : (
                <Menu className="w-5 h-5 text-gray-300" />
              )}
            </button>
          )}

          {/* Official NeX Consulting Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="relative w-10 h-10 transition-transform duration-200 group-hover:scale-105"
            >
              <Image
                src="/Nex_logomark_white.png"
                alt="NeX AI"
                fill
                sizes="40px"
                className="object-contain"
                priority
              />
            </motion.div>
            <span className="hidden sm:block font-semibold text-base sm:text-lg tracking-tight">
              <span className="text-white">NeX </span>
              <span className="bg-gradient-to-r from-nex-gradient-start to-nex-gradient-end bg-clip-text text-transparent">
                AI
              </span>
            </span>
          </Link>
        </div>

        {/* Center Section: Navigation Icons */}
        <div className="flex items-center gap-3 sm:gap-4 md:gap-5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <div
                key={item.name}
                className="relative"
                onMouseEnter={() => setHoveredItem(item.name)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push(item.href)}
                  className={`p-3 sm:p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-nex-gradient-start/20 to-nex-gradient-end/20 text-nex-gradient-end'
                      : 'hover:bg-white/5 text-gray-300 hover:text-nex-gradient-end'
                  }`}
                  aria-label={item.tooltip}
                >
                  <Icon className="w-5 h-5" />

                  {/* Active Indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute -bottom-[1px] left-0 right-0 h-0.5 bg-gradient-to-r from-nex-gradient-start to-nex-gradient-end rounded-full"
                      initial={false}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}

                  {/* Glow Effect on Hover */}
                  {hoveredItem === item.name && !isActive && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-gradient-to-r from-nex-gradient-start/10 to-nex-gradient-end/10 rounded-lg blur-sm -z-10"
                    />
                  )}
                </motion.button>

                {/* Tooltip */}
                {hoveredItem === item.name && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-nex-surface text-nex-text text-xs font-medium rounded-lg whitespace-nowrap z-50 pointer-events-none border border-nex-border"
                    style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.4)' }}
                  >
                    {item.tooltip}
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-nex-surface border-l border-t border-nex-border rotate-45" />
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>

        {/* Right Section: Online Status Indicator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 rounded-full border border-green-500/20">
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [1, 0.7, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="w-2 h-2 bg-green-500 rounded-full animate-pulse"
            />
            <span className="text-xs font-medium text-green-400">Online</span>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
