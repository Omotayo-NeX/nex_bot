'use client';
import { useChat } from 'ai/react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import Image from 'next/image';

export default function ChatPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
    keepLastMessageOnError: true,
  });

  useEffect(() => {
    if (status === 'loading') return; // Still loading
    
    if (!session) {
      // Not authenticated, redirect to signin
      router.replace('/auth/signin');
      return;
    }
  }, [session, status, router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null; // Will redirect to signin
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black text-white flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-700/50 bg-gray-800/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 relative">
                <Image 
                  src="/Nex_logomark_white.png" 
                  alt="NeX Logo" 
                  fill
                  className="object-contain"
                />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                NeX AI Chat
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-300">Welcome, {session.user?.name || session.user?.email}</span>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto mb-6 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 relative mx-auto mb-6">
                <Image 
                  src="/Nex_logomark_white.png" 
                  alt="NeX Logo" 
                  fill
                  className="object-contain opacity-50"
                />
              </div>
              <h2 className="text-2xl font-semibold mb-4">Welcome to NeX AI</h2>
              <p className="text-gray-400 mb-6">I'm your AI assistant for digital marketing and automation. How can I help you today?</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                <button
                  onClick={() => handleInputChange({ target: { value: 'Help me create a marketing strategy for my business' } } as any)}
                  className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/50 hover:bg-gray-800/70 transition-all text-left"
                >
                  <div className="font-medium text-blue-400 mb-1">Marketing Strategy</div>
                  <div className="text-sm text-gray-400">Get help with marketing plans</div>
                </button>
                <button
                  onClick={() => handleInputChange({ target: { value: 'Create engaging social media content ideas' } } as any)}
                  className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/50 hover:bg-gray-800/70 transition-all text-left"
                >
                  <div className="font-medium text-purple-400 mb-1">Content Ideas</div>
                  <div className="text-sm text-gray-400">Generate creative content</div>
                </button>
                <button
                  onClick={() => handleInputChange({ target: { value: 'Analyze my website performance and suggest improvements' } } as any)}
                  className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/50 hover:bg-gray-800/70 transition-all text-left"
                >
                  <div className="font-medium text-green-400 mb-1">Website Analysis</div>
                  <div className="text-sm text-gray-400">Improve your website</div>
                </button>
              </div>
            </div>
          ) : (
            messages.map((message, index) => (
              <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-3xl px-4 py-3 rounded-2xl ${
                  message.role === 'user' 
                    ? 'bg-blue-600 text-white ml-8' 
                    : 'bg-gray-800/60 text-gray-100 mr-8 border border-gray-700/50'
                }`}>
                  <div className="whitespace-pre-wrap">{message.content}</div>
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-3xl px-4 py-3 rounded-2xl bg-gray-800/60 text-gray-100 mr-8 border border-gray-700/50">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="border-t border-gray-700/50 pt-4">
          <div className="flex space-x-4">
            <input
              value={input}
              onChange={handleInputChange}
              placeholder="Ask me anything about marketing, automation, or business growth..."
              className="flex-1 px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors flex items-center space-x-2"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
              <span>Send</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
