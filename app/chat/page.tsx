'use client';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
    return null;
  }

  return (
    <div className="h-screen flex overflow-hidden bg-gradient-to-b from-[#0d1117] to-[#1c1f26]">
      {/* Left Sidebar */}
      <LeftSidebar 
        onNewChat={handleNewChat}
        onOpenPictureGenerator={() => setActiveModal('picture')}
        onOpenVoiceGenerator={() => setActiveModal('voiceover')}
      />

      {/* Main Chat Area */}
      <ChatArea 
        messages={messages}
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
      />

      {/* Right Sidebar */}
      <RightSidebar 
        selectedModel={selectedModel}
        onModelChange={setSelectedModel}
        temperature={temperature}
        onTemperatureChange={setTemperature}
      />

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