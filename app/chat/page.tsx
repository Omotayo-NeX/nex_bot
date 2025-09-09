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
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: messageText.trim(),
          model: selectedModel,
          temperature: temperature
        }),
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

  const handleNewChat = () => {
    setMessages([]);
  };

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.replace('/auth/signin');
      return;
    }
    
    // Check if user's email is verified - handle both null and undefined cases
    if (session.user && session.user.emailVerified === null) {
      router.replace('/verify-email');
      return;
    }
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