'use client';
import React, { useState } from 'react';
import { Send, Sparkles, Plus, Download, MessageCircle, Settings, User } from 'lucide-react';

export default function TestLayoutPreview() {
  const [input, setInput] = useState('');

  // Generate fake chat messages for testing
  const fakeMessages = [
    { id: 1, role: 'assistant', content: 'Hello! I\'m NeX AI, developed by Nex Consulting Limited in Abuja. How can I help you today?' },
    { id: 2, role: 'user', content: 'Can you help me create a marketing strategy for my e-commerce business?' },
    { id: 3, role: 'assistant', content: 'Absolutely! I\'d be happy to help you create a comprehensive marketing strategy for your e-commerce business. Let me break this down into key areas that will help you drive sales and grow your customer base.' },
    { id: 4, role: 'user', content: 'That sounds great! What should I focus on first?' },
    { id: 5, role: 'assistant', content: 'Great question! I recommend starting with these three foundational elements:\n\n1. **Customer Research & Personas** - Understanding who your ideal customers are, their pain points, and shopping behaviors.\n\n2. **Brand Positioning** - Clearly defining what makes your e-commerce store unique and why customers should choose you over competitors.\n\n3. **Content Strategy** - Creating valuable content that attracts, engages, and converts your target audience.\n\nWould you like me to dive deeper into any of these areas first?' },
    { id: 6, role: 'user', content: 'Let\'s focus on customer research first' },
    { id: 7, role: 'assistant', content: 'Perfect choice! Customer research is the foundation of any successful marketing strategy. Here\'s a systematic approach to understanding your customers better:\n\n**Data Collection Methods:**\n- Survey your existing customers about their preferences and shopping habits\n- Analyze your website and social media analytics\n- Conduct competitor analysis to see who they\'re targeting\n- Use tools like Google Analytics, Facebook Insights, and customer feedback forms\n\n**Key Questions to Answer:**\n- What age group and demographics buy from you most?\n- What problems does your product solve for them?\n- Where do they spend time online?\n- What influences their purchasing decisions?\n\nThis research will help you create detailed customer personas that guide all your marketing efforts.' },
    { id: 8, role: 'user', content: 'This is very helpful! What tools do you recommend for analytics?' },
    { id: 9, role: 'assistant', content: 'Excellent question! Here are the essential analytics tools I recommend for e-commerce businesses:\n\n**Free Tools:**\n- Google Analytics 4 - Track website traffic, user behavior, and conversion paths\n- Google Search Console - Monitor search performance and keywords\n- Facebook/Meta Business Suite - Social media analytics and audience insights\n- Google Trends - Understand search trends and seasonal patterns\n\n**Paid Tools (Worth the Investment):**\n- Hotjar or Crazy Egg - Heatmaps and user session recordings\n- SEMrush or Ahrefs - Competitor analysis and keyword research\n- Klaviyo or Mailchimp - Email marketing analytics\n- Shopify Analytics (if using Shopify) - Detailed e-commerce metrics\n\nStart with the free tools first, then invest in paid options as your business grows. The key is to focus on metrics that directly impact your revenue!' },
    { id: 10, role: 'user', content: 'Can you create a content calendar for my business?' },
  ];

  return (
    <div className="flex h-screen bg-gray-950 text-white">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 bg-[#0a0a0f] border-r border-gray-700 flex-col z-20">
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <Sparkles className="h-6 w-6 text-blue-400" />
            NeX AI - Test Layout
          </div>
        </div>
        
        <div className="flex-1 p-4">
          <button className="w-full flex items-center gap-2 px-3 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors text-sm mb-4">
            <Plus className="h-4 w-4" />
            New Chat
          </button>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-800 rounded-lg text-sm">
              <MessageCircle className="h-4 w-4" />
              Marketing Strategy
            </div>
            <div className="flex items-center gap-2 px-3 py-2 hover:bg-gray-800 rounded-lg text-sm cursor-pointer">
              <MessageCircle className="h-4 w-4" />
              Content Calendar
            </div>
            <div className="flex items-center gap-2 px-3 py-2 hover:bg-gray-800 rounded-lg text-sm cursor-pointer">
              <MessageCircle className="h-4 w-4" />
              Automation Tools
            </div>
          </div>
        </div>
        
        <div className="p-4 border-t border-gray-700">
          <button className="w-full flex items-center gap-2 px-3 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors text-sm">
            <Download className="h-4 w-4" />
            Download Chat
          </button>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex flex-col flex-1 relative">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 border-b border-gray-800 bg-gray-900">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <Sparkles className="h-6 w-6 text-blue-400" />
            NeX AI Test
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-3 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors text-sm">
              <Download className="h-4 w-4" />
            </button>
            <button className="flex items-center gap-2 px-3 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors text-sm">
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-950" style={{ paddingBottom: '100px' }}>
          {fakeMessages.map((message) => (
            <div
              key={message.id}
              className={`flex w-full ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-4xl px-6 py-4 rounded-xl ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-100'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-4 w-4 text-blue-400" />
                    <span className="text-sm font-medium text-blue-300">NeX AI</span>
                  </div>
                )}
                <div className="leading-relaxed whitespace-pre-line">{message.content}</div>
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          <div className="flex justify-start">
            <div className="bg-gray-800 px-6 py-4 rounded-xl">
              <div className="flex items-center space-x-1">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-blue-400" />
                  <span className="text-sm text-gray-300">NeX AI is thinking</span>
                </div>
                <div className="flex space-x-1 ml-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Input Bar */}
        <div className="fixed bottom-0 left-0 right-0 md:left-64 p-4 bg-[#0d0d14] border-t border-gray-700 z-30">
          <div className="flex gap-3 w-full max-w-4xl mx-auto">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-4 py-3 bg-[#1a1a25] border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-white placeholder-gray-400"
            />
            <button
              disabled={!input.trim()}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors font-medium"
            >
              <Send className="h-4 w-4" />
              Send
            </button>
          </div>
        </div>
      </main>

      {/* Optional Settings Panel (for future use) */}
      {/* You can uncomment this to test with a settings panel */}
      {/* 
      <aside className="hidden lg:flex w-80 bg-[#0a0a0f] border-l border-gray-700 flex-col z-20">
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <Settings className="h-5 w-5 text-gray-400" />
            Settings
          </div>
        </div>
        <div className="flex-1 p-4">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-300">Model</label>
              <select className="w-full mt-1 p-2 bg-[#1a1a25] border border-gray-600 rounded-lg text-white">
                <option>GPT-4</option>
                <option>GPT-3.5</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-300">Temperature</label>
              <input type="range" min="0" max="1" step="0.1" className="w-full mt-1" />
            </div>
          </div>
        </div>
      </aside>
      */}
    </div>
  );
}