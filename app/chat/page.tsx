'use client';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import LeftSidebar from './components/LeftSidebar';
import ChatArea from './components/ChatArea';
import RightSidebar from './components/RightSidebar';
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
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [selectedModel, setSelectedModel] = useState('nex-gpt-4');
  const [temperature, setTemperature] = useState(0.7);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSendMessage = async (messageText: string) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage: Message = { 
      role: 'user', 
      content: messageText.trim(),
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      console.log('🚀 [Chat Frontend] Sending message:', {
        message: messageText.trim(),
        model: selectedModel,
        temperature: temperature
      });

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: messageText.trim(),
          model: selectedModel,
          temperature: temperature
        }),
      });

      const data = await response.json();
      console.log('📨 [Chat Frontend] API response:', {
        status: response.status,
        ok: response.ok,
        requestId: data.requestId,
        hasError: !!data.error,
        errorType: data.errorType
      });

      let assistantContent: string;
      
      if (!response.ok) {
        // Handle different types of errors with appropriate user messages
        if (data.errorType === 'quota_exceeded') {
          assistantContent = data.response || 'OpenAI quota exceeded. Please try again later or contact support.';
        } else if (data.errorType === 'auth_error') {
          assistantContent = data.response || 'Authentication failed. Please refresh the page and sign in again.';
        } else if (data.isLimitReached) {
          assistantContent = data.response || `You have reached your chat limit. ${data.error}`;
        } else if (data.isRateLimit) {
          assistantContent = data.response || 'Too many requests. Please wait a moment before trying again.';
        } else if (data.response) {
          // Use the specific error response from the API
          assistantContent = data.response;
        } else {
          // Fallback for unknown errors
          assistantContent = `Error: ${data.error || 'Something went wrong. Please try again.'}`;
        }
      } else {
        assistantContent = data.response || 'Sorry, I could not process your request.';
      }
      
      const assistantMessage: Message = { 
        role: 'assistant', 
        content: assistantContent,
        timestamp: Date.now()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
    } catch (error: any) {
      console.error('❌ [Chat Frontend] Network/Request error:', {
        error: error.message,
        name: error.name,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
      
      const errorMessage: Message = { 
        role: 'assistant', 
        content: 'Network error: Unable to connect to the server. Please check your internet connection and try again.',
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
  };

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.replace('/auth/signin');
      return;
    }
    
    // TODO: Email verification check can be re-enabled later when billing or premium features are introduced
    // For now, all users can access chat immediately after signup
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="h-screen bg-gradient-to-b from-[#0d1117] to-[#1c1f26] flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"
          />
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-white text-lg font-medium"
          >
            Loading NeX AI...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="h-screen bg-gradient-to-b from-[#0d1117] to-[#1c1f26] flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-white text-lg font-medium"
          >
            Redirecting to sign in...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-screen flex overflow-hidden bg-gradient-to-b from-[#0d1117] to-[#1c1f26] relative">
      {/* Mobile Hamburger Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-gray-800/90 backdrop-blur-sm rounded-lg border border-gray-700/50 text-white hover:bg-gray-700/90 transition-colors"
      >
        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Left Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:relative z-50 lg:z-auto transition-transform duration-300 ease-in-out lg:transition-none`}>
        <LeftSidebar 
          onNewChat={handleNewChat}
          onOpenPictureGenerator={() => setActiveModal('picture')}
          onOpenVoiceGenerator={() => setActiveModal('voiceover')}
          onCloseSidebar={() => setSidebarOpen(false)}
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex">
        <ChatArea 
          messages={messages}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
        />

        {/* Right Sidebar - Hidden on mobile */}
        <div className="hidden xl:block">
          <RightSidebar 
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
            temperature={temperature}
            onTemperatureChange={setTemperature}
          />
        </div>
      </div>

      {/* Modal Components */}
      <AnimatePresence>
        {activeModal === 'picture' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <PictureGeneratorModal onClose={() => setActiveModal(null)} />
          </motion.div>
        )}
        
        {activeModal === 'voiceover' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <VoiceoverGeneratorModal onClose={() => setActiveModal(null)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}