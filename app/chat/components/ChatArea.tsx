'use client';
import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import ChatBubble from './ChatBubble';
import ChatInput from './ChatInput';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface ChatAreaProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

export default function ChatArea({ messages, onSendMessage, isLoading }: ChatAreaProps) {
  const { data: session } = useSession();
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
      <div className="flex flex-col h-screen bg-gradient-to-b from-[#0d1117] to-[#1c1f26] relative">
      {/* Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-sm border-b border-gray-700/50 px-6 py-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 relative">
              <Image
                src="/Nex_logomark_white.png"
                alt="NeX AI Logo"
                fill
                className="object-contain"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                NeX AI
              </h1>
              <p className="text-sm text-gray-400">Your AI Marketing Assistant</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Online</span>
          </div>
        </div>
      </motion.div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-6 pb-28">
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
                className="w-20 h-20 relative mb-6 shadow-lg"
              >
                <Image
                  src="/Nex_logomark_white.png"
                  alt="NeX AI Logo"
                  fill
                  className="object-contain"
                />
              </motion.div>
              
              <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Welcome to NeX AI
              </h2>
              <p className="text-gray-400 mb-8 text-lg">
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
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => startSuggestion(suggestion)}
                    className="p-4 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 hover:border-purple-500/50 transition-all text-left group"
                  >
                    <div className="font-medium text-purple-400 mb-1 group-hover:text-purple-300 transition-colors">
                      💡 Quick Start
                    </div>
                    <div className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
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
                  userName={session?.user?.name || undefined}
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
                    <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center">
                      <Loader2 className="w-4 h-4 text-white animate-spin" />
                    </div>
                    <div className="px-6 py-4 rounded-2xl bg-gray-800/80 backdrop-blur-sm border border-gray-700/50">
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <span className="text-gray-400 text-sm">NeX AI is thinking...</span>
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