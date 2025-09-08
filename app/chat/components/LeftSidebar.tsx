'use client';
import { useState } from 'react';
import { Plus, MessageSquare, Image, Mic, Pin, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

interface LeftSidebarProps {
  onNewChat: () => void;
  onOpenPictureGenerator: () => void;
  onOpenVoiceGenerator: () => void;
}

export default function LeftSidebar({ onNewChat, onOpenPictureGenerator, onOpenVoiceGenerator }: LeftSidebarProps) {
  const [pinnedChats] = useState([
    { id: '1', title: 'Marketing Strategy Planning', timestamp: '2 hours ago' },
    { id: '2', title: 'Content Calendar Ideas', timestamp: '1 day ago' },
  ]);

  const [recentChats] = useState([
    { id: '3', title: 'Social Media Automation', timestamp: '3 days ago' },
    { id: '4', title: 'Email Campaign Setup', timestamp: '1 week ago' },
    { id: '5', title: 'Website Analytics Review', timestamp: '1 week ago' },
    { id: '6', title: 'SEO Optimization Tips', timestamp: '2 weeks ago' },
  ]);

  return (
    <motion.div 
      initial={{ x: -260, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="w-64 bg-[#111827] border-r border-gray-700/50 flex flex-col h-full"
    >
      {/* New Chat Button */}
      <div className="p-4">
        <button
          onClick={onNewChat}
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
          {/* AI Voice Chat - Disabled */}
          <div className="relative">
            <button
              disabled
              className="w-full flex items-center space-x-3 px-3 py-2 text-gray-500 rounded-lg cursor-not-allowed relative"
            >
              <MessageSquare className="w-4 h-4" />
              <span className="text-sm">AI Voice Chat</span>
              <span className="ml-auto bg-gray-600 text-xs px-2 py-1 rounded text-gray-300">Soon</span>
            </button>
          </div>

          {/* Picture Generator - Active */}
          <button
            onClick={onOpenPictureGenerator}
            className="w-full flex items-center space-x-3 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors relative"
          >
            <Image className="w-4 h-4" />
            <span className="text-sm">Picture Generator</span>
            <span className="ml-auto bg-green-600 text-xs px-2 py-1 rounded text-white">New</span>
          </button>

          {/* Voice Generator */}
          <button
            onClick={onOpenVoiceGenerator}
            className="w-full flex items-center space-x-3 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors"
          >
            <Mic className="w-4 h-4" />
            <span className="text-sm">Voice Generator</span>
          </button>
        </div>
      </div>

      {/* Pinned Chats */}
      {pinnedChats.length > 0 && (
        <div className="px-4 pb-4">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3 flex items-center">
            <Pin className="w-3 h-3 mr-1" />
            Pinned Chats
          </h3>
          <div className="space-y-1">
            {pinnedChats.map((chat) => (
              <button
                key={chat.id}
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
          {recentChats.map((chat) => (
            <button
              key={chat.id}
              className="w-full flex flex-col items-start px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors group"
            >
              <span className="text-sm font-medium truncate w-full text-left">{chat.title}</span>
              <span className="text-xs text-gray-500 group-hover:text-gray-400">{chat.timestamp}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700/50">
        <p className="text-xs text-gray-500 text-center">
          Powered by NeX AI Technology
        </p>
      </div>
    </motion.div>
  );
}