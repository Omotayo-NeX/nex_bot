'use client';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { User, Bot, Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface ChatBubbleProps {
  message: {
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
  };
  index: number;
}

export default function ChatBubble({ message, index }: ChatBubbleProps) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.3, 
        delay: index * 0.05,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-6`}
    >
      <div className={`flex ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start space-x-3 max-w-4xl group`}>
        {/* Avatar */}
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: index * 0.05 + 0.2, type: "spring", stiffness: 500 }}
          className={`flex-shrink-0 ${isUser ? 'ml-3' : 'mr-3'}`}
        >
          {isUser ? (
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
          ) : (
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
          )}
        </motion.div>

        {/* Message Bubble */}
        <div className={`relative flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
          {/* Timestamp */}
          <div className={`text-xs text-gray-500 mb-1 px-1 ${isUser ? 'text-right' : 'text-left'}`}>
            {isUser ? 'You' : 'NeX AI'} • {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>

          {/* Message Content */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
            className={`relative px-6 py-4 rounded-2xl max-w-2xl shadow-lg ${
              isUser
                ? 'bg-gradient-to-br from-purple-600 to-blue-600 text-white'
                : 'bg-gray-800/80 backdrop-blur-sm border border-gray-700/50 text-gray-100'
            }`}
          >
            {/* Message Text */}
            <div className={`prose ${isUser ? 'prose-invert' : ''} max-w-none`}>
              <p className="whitespace-pre-wrap leading-relaxed text-sm md:text-base">
                {message.content}
              </p>
            </div>

            {/* Copy Button */}
            {!isUser && (
              <button
                onClick={copyToClipboard}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg bg-gray-700/50 hover:bg-gray-600/50 text-gray-400 hover:text-white"
                title="Copy message"
              >
                {copied ? (
                  <Check className="w-3 h-3" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </button>
            )}

            {/* Message Tail */}
            <div 
              className={`absolute top-3 w-3 h-3 transform rotate-45 ${
                isUser 
                  ? 'right-0 translate-x-1/2 bg-gradient-to-br from-purple-600 to-blue-600' 
                  : 'left-0 -translate-x-1/2 bg-gray-800/80 border-l border-t border-gray-700/50'
              }`}
            />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}