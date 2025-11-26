'use client';
import { useState, useEffect, useRef } from 'react';
import { Plus, Pin, Clock, User, Settings, Mail, CheckCircle, AlertCircle, Crown, LogOut, Palette, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/contexts/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { hapticFeedback } from '@/lib/utils/haptics';

interface LeftSidebarProps {
  onNewChat: () => void;
  onCloseSidebar?: () => void;
  onLoadConversation?: (id: string) => void;
}

interface UserData {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  plan: string;
}

interface ConversationData {
  id: string;
  title: string;
  isPinned: boolean;
  timestamp: string;
  preview: string;
}

export default function LeftSidebar({ onNewChat, onCloseSidebar, onLoadConversation }: LeftSidebarProps) {
  const { user, session, signOut, loading } = useAuth();
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  // const [sendingVerification, setSendingVerification] = useState(false); // TODO: Re-enable when email verification is needed
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const [conversations, setConversations] = useState<ConversationData[]>([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredConversations, setFilteredConversations] = useState<ConversationData[]>([]);

  // Pull-to-refresh state
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [startY, setStartY] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Fetch user data and conversations
  useEffect(() => {
    if (loading) {
      // Still loading, don't do anything yet
      return;
    }

    if (user?.id) {
      fetchUserData();
      fetchConversations();
    } else {
      // User is null and not loading, set fallback data
      setUserData({
        id: '',
        name: 'Guest User',
        email: 'guest@example.com',
        emailVerified: false,
        plan: 'free'
      });
    }
  }, [user, loading]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchConversations = async () => {
    if (!user?.id || !session?.access_token) return;

    setIsLoadingConversations(true);
    try {
      const response = await fetch('/api/conversations', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        const formattedConversations = data.map((conv: any) => ({
          id: conv.id,
          title: conv.title,
          isPinned: conv.isPinned,
          timestamp: formatTimestamp(conv.timestamp),
          preview: conv.preview
        }));
        setConversations(formattedConversations);
      }
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    } finally {
      setIsLoadingConversations(false);
    }
  };

  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;

    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) return `${diffInWeeks} week${diffInWeeks > 1 ? 's' : ''} ago`;

    return date.toLocaleDateString();
  };

  const handleConversationClick = (conversationId: string) => {
    hapticFeedback.light(); // Haptic feedback on conversation selection
    if (onLoadConversation) {
      onLoadConversation(conversationId);
      if (onCloseSidebar) {
        onCloseSidebar();
      }
    }
  };

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/usage', {
        headers: {
          ...(session?.access_token && { 'Authorization': `Bearer ${session.access_token}` })
        }
      });
      if (response.ok) {
        const data = await response.json();
        setUserData({
          id: user?.id || '',
          name: user?.user_metadata?.name || user?.email?.split('@')[0] || 'User',
          email: user?.email || '',
          emailVerified: data.emailVerified || false,
          plan: data.plan || 'free'
        });
      } else {
        // Fallback to basic user data if API fails
        setUserData({
          id: user?.id || '',
          name: user?.user_metadata?.name || user?.email?.split('@')[0] || 'User',
          email: user?.email || '',
          emailVerified: false,
          plan: 'free'
        });
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      // Fallback to user data
      setUserData({
        id: user?.id || '',
        name: user?.user_metadata?.name || user?.email?.split('@')[0] || 'User',
        email: user?.email || '',
        emailVerified: false,
        plan: 'free'
      });
    }
  };

  // Filter conversations based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredConversations(conversations);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = conversations.filter(conv =>
        conv.title.toLowerCase().includes(query) ||
        conv.preview.toLowerCase().includes(query)
      );
      setFilteredConversations(filtered);
    }
  }, [searchQuery, conversations]);

  // Pull-to-refresh handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer && scrollContainer.scrollTop === 0) {
      setStartY(e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer || scrollContainer.scrollTop > 0) return;

    const currentY = e.touches[0].clientY;
    const distance = currentY - startY;

    if (distance > 0 && distance < 100) {
      setPullDistance(distance);
      setIsPulling(distance > 60);
    }
  };

  const handleTouchEnd = async () => {
    if (isPulling && pullDistance > 60) {
      hapticFeedback.medium();
      await fetchConversations();
    }
    setIsPulling(false);
    setPullDistance(0);
    setStartY(0);
  };

  // TODO: Email verification function can be re-enabled later when billing or premium features are introduced

  const getPlanDisplayName = (plan: string) => {
    switch (plan) {
      case 'pro': return 'Pro Plan';
      case 'enterprise': return 'Enterprise';
      default: return 'Free Plan';
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'pro': return 'text-blue-400';
      case 'enterprise': return 'text-purple-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <motion.div
      initial={{ x: -260, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="w-[85vw] sm:w-[320px] md:w-[280px] bg-nex-surface border-r border-nex-border flex flex-col h-full"
    >
      {/* NeX AI Title */}
      <div className="px-4 sm:px-6 py-4 border-b border-nex-border">
        <h2 className="text-lg font-semibold bg-gradient-to-r from-nex-gradient-start to-nex-gradient-end bg-clip-text text-transparent">
          NeX AI
        </h2>
      </div>
      {/* New Chat Button */}
      <div className="p-3 sm:p-4 space-y-3">
        <button
          onClick={() => {
            hapticFeedback.light(); // Haptic feedback on new chat
            onNewChat();
            onCloseSidebar?.();
          }}
          className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-nex-gradient-start to-nex-gradient-end hover:shadow-[0_0_20px_rgba(163,65,255,0.3)] text-white rounded-xl font-medium transition-all duration-200 hover:scale-105 transform"
        >
          <Plus className="w-4 h-4" />
          <span>New Chat</span>
        </button>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-nex-bg text-white placeholder-gray-400 rounded-lg border border-nex-border focus:border-nex-gradient-end focus:outline-none focus:ring-2 focus:ring-nex-gradient-end/20 transition-all"
          />
        </div>
      </div>

      {/* Pinned Chats */}
      {filteredConversations.filter(conv => conv.isPinned).length > 0 && (
        <div className="px-3 sm:px-4 pb-4">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3 flex items-center">
            <Pin className="w-3 h-3 mr-1" />
            Pinned Chats
          </h3>
          <div className="space-y-1">
            {filteredConversations.filter(conv => conv.isPinned).map((chat) => (
              <button
                key={chat.id}
                onClick={() => handleConversationClick(chat.id)}
                className="w-full flex flex-col items-start px-3 py-3 min-h-[44px] text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors group"
              >
                <span className="text-sm font-medium truncate w-full text-left max-w-[200px] sm:max-w-none">{chat.title}</span>
                <span className="text-xs text-gray-500 group-hover:text-gray-400">{chat.timestamp}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Recent Chats */}
      <div
        ref={scrollContainerRef}
        className="flex-1 px-3 sm:px-4 pb-4 overflow-y-auto relative"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Pull-to-refresh indicator */}
        {pullDistance > 0 && (
          <div
            className="absolute top-0 left-0 right-0 flex items-center justify-center transition-all duration-200"
            style={{
              transform: `translateY(${Math.min(pullDistance - 60, 0)}px)`,
              opacity: pullDistance / 60
            }}
          >
            <motion.div
              animate={{ rotate: isPulling ? 180 : 0 }}
              className="text-purple-400"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </motion.div>
          </div>
        )}

        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3 flex items-center">
          <Clock className="w-3 h-3 mr-1" />
          Recent Chats
        </h3>
        <div className="space-y-1">
          {isLoadingConversations ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-400"></div>
            </div>
          ) : filteredConversations.filter(conv => !conv.isPinned).length > 0 ? (
            filteredConversations.filter(conv => !conv.isPinned).map((chat) => (
              <button
                key={chat.id}
                onClick={() => handleConversationClick(chat.id)}
                className="w-full flex flex-col items-start px-3 py-3 min-h-[44px] text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors group"
              >
                <span className="text-sm font-medium truncate w-full text-left max-w-[200px] sm:max-w-none">{chat.title}</span>
                <div className="flex justify-between items-center w-full">
                  <span className="text-xs text-gray-500 group-hover:text-gray-400">{chat.timestamp}</span>
                  {chat.preview && (
                    <span className="text-xs text-gray-600 truncate ml-2 max-w-20">
                      {chat.preview.substring(0, 20)}...
                    </span>
                  )}
                </div>
              </button>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm">{searchQuery ? 'No conversations found' : 'No conversations yet'}</p>
              <p className="text-xs mt-1">{searchQuery ? 'Try a different search term' : 'Start a new chat to see your history here'}</p>
            </div>
          )}
        </div>
      </div>

      {/* User Info Footer */}
      <div className="p-3 sm:p-4 border-t border-gray-700/50 relative" ref={dropdownRef}>
        {userData ? (
          <>
            <div
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-full flex items-center space-x-3 px-3 py-3 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-all duration-200 group cursor-pointer"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 text-left overflow-hidden">
                <div className="font-medium text-sm truncate group-hover:text-white">
                  {userData.name}
                </div>
                <div className={`text-xs ${getPlanColor(userData.plan)} truncate`}>
                  {getPlanDisplayName(userData.plan)}
                </div>
              </div>
              <Settings className="w-4 h-4 text-gray-500 group-hover:text-gray-300 flex-shrink-0" />
            </div>


            {/* Dropdown Menu */}
            <AnimatePresence>
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute bottom-full left-4 right-4 mb-2 bg-gray-800/95 backdrop-blur-sm border border-gray-700/50 rounded-xl shadow-2xl z-50"
                >
                  <div className="p-4">
                    {/* Account Info */}
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-white mb-3 flex items-center">
                        <User className="w-4 h-4 mr-2" />
                        Account Info
                      </h4>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Name:</span>
                          <span className="text-white">{userData.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Email:</span>
                          <span className="text-white truncate ml-2">{userData.email}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Plan:</span>
                          <span className={getPlanColor(userData.plan)}>{getPlanDisplayName(userData.plan)}</span>
                        </div>
                      </div>
                    </div>

                    {/* TODO: Email verification UI can be re-enabled later when billing or premium features are introduced */}

                    {/* Quick Actions */}
                    <div className="space-y-1">
                      <Link 
                        href="/settings"
                        className="w-full flex items-center space-x-3 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors text-sm"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Settings className="w-4 h-4" />
                        <span>Settings</span>
                      </Link>
                      
                      <Link 
                        href="/pricing"
                        className="w-full flex items-center space-x-3 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors text-sm"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Crown className="w-4 h-4" />
                        <span>{userData.plan === 'free' ? 'Upgrade Plan' : 'Manage Subscription'}</span>
                      </Link>
                      
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          signOut();
                        }}
                        className="w-full flex items-center space-x-3 px-3 py-2 text-gray-300 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors text-sm"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        ) : (
          <div className="flex items-center justify-center space-x-2 text-gray-500">
            <User className="w-4 h-4 animate-pulse" />
            <span className="text-sm">Loading...</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}