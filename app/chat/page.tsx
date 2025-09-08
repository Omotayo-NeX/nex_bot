'use client';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Download, X, Image as ImageIcon, Mic } from 'lucide-react';
import PictureGeneratorModal from './components/PictureGeneratorModal';
import VoiceoverGeneratorModal from './components/VoiceoverGeneratorModal';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

type ModalType = 'picture' | 'voiceover' | null;

export default function ChatPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { 
      role: 'user', 
      content: input,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });

      if (!response.ok) throw new Error('Failed to get response');
      
      const data = await response.json();
      const assistantMessage: Message = { 
        role: 'assistant', 
        content: data.response || 'Sorry, I could not process your request.',
        timestamp: Date.now()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = { 
        role: 'assistant', 
        content: 'Sorry, there was an error processing your request.',
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const downloadChatTranscript = () => {
    const transcript = messages.map(msg => ({
      role: msg.role,
      content: msg.content,
      timestamp: new Date(msg.timestamp).toISOString()
    }));
    
    const blob = new Blob([JSON.stringify(transcript, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nex-chat-transcript-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

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
      <div className="h-screen bg-gradient-to-b from-[#0d1117] to-[#1c1f26] flex items-center justify-center">
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
    <div className="flex h-screen overflow-hidden">
      {/* Main Chat Section */}
      <main className="flex-1 flex flex-col bg-gradient-to-b from-[#0d1117] to-[#1c1f26]">
        {/* Header */}
        <div className="border-b border-gray-700/50 bg-gray-800/50 backdrop-blur-sm">
          <div className="flex justify-between items-center py-4 px-6">
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
              {messages.length > 0 && (
                <button
                  onClick={downloadChatTranscript}
                  className="flex items-center space-x-2 px-3 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors text-sm"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Chat</span>
                </button>
              )}
              <span className="text-gray-300 text-sm hidden md:block">
                {session.user?.name || session.user?.email}
              </span>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="px-3 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors text-sm"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
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
              <h2 className="text-2xl font-semibold mb-4 text-white">Welcome to NeX AI</h2>
              <p className="text-gray-400 mb-6">I'm your AI assistant for digital marketing and automation. How can I help you today?</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                <button
                  onClick={() => setInput('Help me create a marketing strategy for my business')}
                  className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/50 hover:bg-gray-800/70 transition-all text-left"
                >
                  <div className="font-medium text-blue-400 mb-1">Marketing Strategy</div>
                  <div className="text-sm text-gray-400">Get help with marketing plans</div>
                </button>
                <button
                  onClick={() => setInput('Create engaging social media content ideas')}
                  className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/50 hover:bg-gray-800/70 transition-all text-left"
                >
                  <div className="font-medium text-purple-400 mb-1">Content Ideas</div>
                  <div className="text-sm text-gray-400">Generate creative content</div>
                </button>
                <button
                  onClick={() => setInput('Analyze my website performance and suggest improvements')}
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
        <div className="border-t border-gray-700/50 p-4">
          <form onSubmit={handleSubmit} className="flex space-x-4">
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
          </form>
        </div>
      </main>

      {/* Right Sidebar */}
      <aside className="w-72 bg-[#111827] border-l border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-lg font-bold text-white">AI Tools</h2>
        </div>
        
        <div className="flex-1 p-4 space-y-4">
          <button
            onClick={() => setActiveModal('picture')}
            className="w-full p-4 rounded-lg bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:from-pink-600 hover:to-purple-600 transition-all transform hover:scale-105 flex items-center justify-center space-x-3"
          >
            <ImageIcon className="w-5 h-5" />
            <span className="font-semibold">Picture Generator</span>
          </button>
          
          <button
            onClick={() => setActiveModal('voiceover')}
            className="w-full p-4 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600 transition-all transform hover:scale-105 flex items-center justify-center space-x-3"
          >
            <Mic className="w-5 h-5" />
            <span className="font-semibold">Voiceover Generator</span>
          </button>
          
          <div className="pt-4 border-t border-gray-700">
            <div className="text-gray-400 text-sm mb-3">Quick Actions</div>
            <div className="space-y-2">
              <button
                onClick={() => setInput('Generate a content calendar for my social media')}
                className="w-full p-2 text-left text-gray-300 hover:text-white hover:bg-gray-800 rounded text-sm transition-colors"
              >
                📅 Content Calendar
              </button>
              <button
                onClick={() => setInput('Create a marketing strategy for my startup')}
                className="w-full p-2 text-left text-gray-300 hover:text-white hover:bg-gray-800 rounded text-sm transition-colors"
              >
                🎯 Marketing Strategy
              </button>
              <button
                onClick={() => setInput('Suggest automation tools for my business')}
                className="w-full p-2 text-left text-gray-300 hover:text-white hover:bg-gray-800 rounded text-sm transition-colors"
              >
                ⚙️ Automation Tools
              </button>
            </div>
          </div>
        </div>
        
        <div className="p-4 border-t border-gray-700 text-center">
          <div className="text-gray-500 text-xs">
            NeX AI by Nex Consulting Ltd
          </div>
        </div>
      </aside>

      {/* Modal Components */}
      {activeModal === 'picture' && (
        <PictureGeneratorModal onClose={() => setActiveModal(null)} />
      )}
      
      {activeModal === 'voiceover' && (
        <VoiceoverGeneratorModal onClose={() => setActiveModal(null)} />
      )}
    </div>
  );
}
