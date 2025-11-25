'use client';
import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '@/lib/contexts/AuthContext';
import ChatBubble from './ChatBubble';
import ChatInput from './ChatInput';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  images?: string[];
}

interface ChatAreaProps {
  messages: Message[];
  onSendMessage: (message: string, images?: string[]) => void;
  isLoading: boolean;
}

export default function ChatArea({ messages, onSendMessage, isLoading }: ChatAreaProps) {
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const startSuggestion = (text: string) => {
    onSendMessage(text);
  };

  const suggestions = [
    'Help me create a marketing strategy for my business',
    'Generate engaging social media content ideas',
    'Analyze my website performance and suggest improvements',
    'Create a content calendar for my brand',
    'Develop email marketing campaigns',
    'Optimize my SEO strategy'
  ];

  return (
    <>
      {/* Chat Messages Area */}
      <div className="flex flex-col h-screen bg-nex-bg relative">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-gradient-to-r from-nex-gradient-start/10 to-nex-gradient-end/10 backdrop-blur-sm border-b border-nex-border/50 px-6 py-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 relative">
              <Image
                src="/Nex_logomark_white.png"
                alt="NeX AI Logo"
                fill
                sizes="40px"
                className="object-contain"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-nex-gradient-start to-nex-gradient-end bg-clip-text text-transparent">
                NeX AI
              </h1>
              <p className="text-sm text-nex-text-muted">Your AI Marketing Assistant</p>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-sm text-nex-text-muted">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Online</span>
          </div>
        </div>
      </motion.div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-6 pb-28 bg-nex-bg">
        <AnimatePresence>
          {messages.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-center h-full text-center max-w-2xl mx-auto"
            >
              <motion.div
                animate={{
                  rotate: [0, 5, -5, 0],
                  scale: [1, 1.05, 1]
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="w-20 h-20 relative mb-6"
              >
                <Image
                  src="/Nex_logomark_white.png"
                  alt="NeX AI Logo"
                  fill
                  sizes="80px"
                  className="object-contain drop-shadow-[0_0_15px_rgba(163,65,255,0.4)]"
                />
              </motion.div>

              <h2 className="text-3xl font-bold tracking-tight mb-4 bg-gradient-to-r from-nex-gradient-start to-nex-gradient-end bg-clip-text text-transparent">
                Welcome to NeX AI
              </h2>
              <p className="text-nex-text-muted mb-8 text-lg leading-relaxed">
                I'm your AI assistant for digital marketing and automation. How can I help you today?
              </p>

              {/* Quick Start Suggestions */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-4xl">
                {suggestions.map((suggestion, index) => (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + 0.1 * index, duration: 0.3 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => startSuggestion(suggestion)}
                    className="p-4 bg-nex-surface/50 backdrop-blur-sm rounded-xl border border-nex-border hover:border-nex-gradient-end/50 transition-all duration-200 text-left group hover:shadow-[0_0_15px_rgba(163,65,255,0.4)]"
                  >
                    <div className="font-semibold text-sm bg-gradient-to-r from-nex-gradient-start to-nex-gradient-end bg-clip-text text-transparent mb-2 group-hover:opacity-100 transition-opacity">
                      💡 Quick Start
                    </div>
                    <div className="text-sm text-nex-text-muted group-hover:text-nex-text transition-colors leading-relaxed">
                      {suggestion}
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ) : (
            <div className="space-y-1">
              {messages.map((message, index) => (
                <ChatBubble
                  key={index}
                  message={message}
                  index={index}
                  userName={user?.user_metadata?.name || user?.email || undefined}
                />
              ))}
              
              {/* Loading Indicator */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start mb-6"
                >
                  <div className="flex items-start space-x-3 max-w-4xl">
                    <div className="w-8 h-8 bg-gradient-to-br from-nex-gradient-start to-nex-gradient-end rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(163,65,255,0.5)]">
                      <Loader2 className="w-4 h-4 text-white animate-spin" />
                    </div>
                    <div className="px-6 py-4 rounded-2xl bg-nex-surface/80 backdrop-blur-sm border border-nex-border/50">
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-nex-gradient-start rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-nex-gradient-end rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-nex-gradient-start rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <span className="text-nex-text-muted text-sm">NeX AI is thinking...</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </AnimatePresence>
      </div>

      </div>

      {/* Chat Input Component */}
      <ChatInput onSendMessage={onSendMessage} isLoading={isLoading} />
    </>
  );
}