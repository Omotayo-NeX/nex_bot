'use client';
import { useState, useEffect, useRef } from 'react';
import { Plus, Image, Mic, Pin, Clock, User, Settings, Mail, CheckCircle, AlertCircle, Crown, LogOut, Palette } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/contexts/AuthContext';
import Link from 'next/link';

interface LeftSidebarProps {
  onNewChat: () => void;
  onOpenPictureGenerator: () => void;
  onOpenVoiceGenerator: () => void;
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

export default function LeftSidebar({ onNewChat, onOpenPictureGenerator, onOpenVoiceGenerator, onCloseSidebar, onLoadConversation }: LeftSidebarProps) {
  const { user, session, signOut, loading } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  // const [sendingVerification, setSendingVerification] = useState(false); // TODO: Re-enable when email verification is needed
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const [conversations, setConversations] = useState<ConversationData[]>([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);

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
      className="w-[280px] bg-[#111827] border-r border-gray-700/50 flex flex-col h-full"
    >
      {/* New Chat Button */}
      <div className="p-4">
        <button
          onClick={() => {
            onNewChat();
            onCloseSidebar?.();
          }}
          className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl font-medium transition-all hover:scale-105 transform"
        >
          <Plus className="w-4 h-4" />
          <span>New Chat</span>
        </button>
      </div>

      {/* AI Tools Section */}
      <div className="px-4 pb-4">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">AI Tools</h3>
        <div className="space-y-2">
          {/* Picture Generator */}
          <button
            onClick={() => {
              onOpenPictureGenerator();
              onCloseSidebar?.();
            }}
            className="w-full flex items-center space-x-3 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors relative"
          >
            <Image className="w-4 h-4" />
            <span className="text-sm">Picture Generator</span>
            <span className="ml-auto bg-green-600 text-xs px-2 py-1 rounded text-white">New</span>
          </button>

          {/* Voice Generator */}
          <button
            onClick={() => {
              onOpenVoiceGenerator();
              onCloseSidebar?.();
            }}
            className="w-full flex items-center space-x-3 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors"
          >
            <Mic className="w-4 h-4" />
            <span className="text-sm">Voice Generator</span>
          </button>
        </div>
      </div>

      {/* Pinned Chats */}
      {conversations.filter(conv => conv.isPinned).length > 0 && (
        <div className="px-4 pb-4">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3 flex items-center">
            <Pin className="w-3 h-3 mr-1" />
            Pinned Chats
          </h3>
          <div className="space-y-1">
            {conversations.filter(conv => conv.isPinned).map((chat) => (
              <button
                key={chat.id}
                onClick={() => handleConversationClick(chat.id)}
                className="w-full flex flex-col items-start px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors group"
              >
                <span className="text-sm font-medium truncate w-full text-left">{chat.title}</span>
                <span className="text-xs text-gray-500 group-hover:text-gray-400">{chat.timestamp}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Recent Chats */}
      <div className="flex-1 px-4 pb-4 overflow-y-auto">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3 flex items-center">
          <Clock className="w-3 h-3 mr-1" />
          Recent Chats
        </h3>
        <div className="space-y-1">
          {isLoadingConversations ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-400"></div>
            </div>
          ) : conversations.filter(conv => !conv.isPinned).length > 0 ? (
            conversations.filter(conv => !conv.isPinned).map((chat) => (
              <button
                key={chat.id}
                onClick={() => handleConversationClick(chat.id)}
                className="w-full flex flex-col items-start px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors group"
              >
                <span className="text-sm font-medium truncate w-full text-left">{chat.title}</span>
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
              <p className="text-sm">No conversations yet</p>
              <p className="text-xs mt-1">Start a new chat to see your history here</p>
            </div>
          )}
        </div>
      </div>

      {/* User Info Footer */}
      <div className="p-4 border-t border-gray-700/50 relative" ref={dropdownRef}>
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