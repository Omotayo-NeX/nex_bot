'use client';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Image as ImageIcon, Mic, Wallet, TrendingUp, Sparkles } from 'lucide-react';
import { useSettings } from '@/lib/contexts/SettingsContext';
import LeftSidebar from './components/LeftSidebar';
import ChatArea from './components/ChatArea';
import Navbar from './components/Navbar';
import DashboardView from './components/DashboardView';
import dynamic from 'next/dynamic';

// Lazy load heavy modal components
const PictureGeneratorModal = dynamic(() => import('./components/PictureGeneratorModal'), {
  loading: () => <div className="fixed inset-0 bg-black/50 flex items-center justify-center"><div className="text-white">Loading...</div></div>,
  ssr: false
});

const VoiceoverGeneratorModal = dynamic(() => import('./components/VoiceoverGeneratorModal'), {
  loading: () => <div className="fixed inset-0 bg-black/50 flex items-center justify-center"><div className="text-white">Loading...</div></div>,
  ssr: false
});

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  images?: string[];
}

type ModalType = 'picture' | 'voiceover' | null;

export default function ChatPage() {
  const { user, session, loading } = useAuth();
  const router = useRouter();
  const { selectedModel, temperature } = useSettings();

  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [conversationTitle, setConversationTitle] = useState<string>('');
  const [showChat, setShowChat] = useState(false);

  const handleSendMessage = async (messageText: string, images?: string[]) => {
    if ((!messageText.trim() && (!images || images.length === 0)) || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: messageText.trim(),
      timestamp: Date.now(),
      images: images
    };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Check if we have a valid session
      if (!session?.access_token) {
        console.error('❌ [Chat Frontend] No access token found');
        const errorMessage: Message = {
          role: 'assistant',
          content: 'Your session has expired. Please sign out and sign back in to continue.',
          timestamp: Date.now()
        };
        setMessages(prev => [...prev, errorMessage]);
        setIsLoading(false);
        return;
      }

      console.log('🚀 [Chat Frontend] Sending message:', {
        message: messageText.trim(),
        model: selectedModel,
        temperature: temperature,
        hasToken: !!session.access_token
      });

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(msg => ({
            role: msg.role,
            content: msg.content,
            images: msg.images
          })),
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

      const updatedMessages = [...messages, userMessage, assistantMessage];
      setMessages(updatedMessages);

      // Save conversation after each exchange
      await saveConversation(updatedMessages);
      
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

  const generateConversationTitle = (messages: Message[]): string => {
    if (messages.length === 0) return 'New Conversation';

    const firstUserMessage = messages.find(msg => msg.role === 'user');
    if (!firstUserMessage) return 'New Conversation';

    // Use first 50 characters of the first user message as title
    const title = firstUserMessage.content.substring(0, 50);
    return title.length < firstUserMessage.content.length ? title + '...' : title;
  };

  const saveConversation = async (messages: Message[]) => {
    if (!user?.id || messages.length < 2) return;

    try {
      const title = conversationTitle || generateConversationTitle(messages);

      if (currentConversationId) {
        // Update existing conversation with new messages
        const newMessages = messages.slice(-2); // Only send the latest user and assistant messages
        await fetch(`/api/conversations/${currentConversationId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`
          },
          body: JSON.stringify({
            title,
            newMessages: newMessages.map(msg => ({
              role: msg.role,
              content: msg.content
            }))
          })
        });
      } else {
        // Create new conversation
        const response = await fetch('/api/conversations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`
          },
          body: JSON.stringify({
            title,
            messages: messages.map(msg => ({
              role: msg.role,
              content: msg.content
            }))
          })
        });

        if (response.ok) {
          const conversation = await response.json();
          setCurrentConversationId(conversation.id);
          setConversationTitle(conversation.title);
        }
      }
    } catch (error) {
      console.error('Failed to save conversation:', error);
    }
  };

  const loadConversation = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/conversations/${conversationId}`, {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      });
      if (response.ok) {
        const conversation = await response.json();
        const formattedMessages = conversation.messages.map((msg: any) => ({
          role: msg.role,
          content: msg.content,
          timestamp: new Date(msg.createdAt).getTime()
        }));

        setMessages(formattedMessages);
        setCurrentConversationId(conversation.id);
        setConversationTitle(conversation.title);
        setShowChat(true); // Show chat interface when loading a conversation
      }
    } catch (error) {
      console.error('Failed to load conversation:', error);
    }
  };

  const handleNewChat = () => {
    console.log('🎯 handleNewChat called - switching to chat view');
    setMessages([]);
    setCurrentConversationId(null);
    setConversationTitle('');
    setShowChat(true); // Show the chat interface
    console.log('✅ showChat set to true');
  };

  useEffect(() => {
    if (loading) return;

    if (!user) {
      // Add a small delay to prevent race conditions with auth state updates
      const timeoutId = setTimeout(() => {
        if (!user) {
          console.log('🔄 No user found, redirecting to home...');
          router.replace('/');
        }
      }, 1000);

      return () => clearTimeout(timeoutId);
    }

    // TODO: Email verification check can be re-enabled later when billing or premium features are introduced
    // For now, all users can access chat immediately after signup
  }, [user, loading]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center relative overflow-hidden bg-nex-bg">
        {/* Premium Background matching main dashboard */}
        <div className="fixed inset-0 z-0 pointer-events-none bg-nex-bg">

          {/* Primary orb - top left - PURPLE */}
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.25, 0.4, 0.25]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-0 left-0 w-[800px] h-[800px] rounded-full blur-[120px]"
            style={{
              background: 'radial-gradient(circle, rgba(163, 63, 244, 0.3), transparent 70%)'
            }}
          />

          {/* Secondary orb - bottom right - NAVY BLUE */}
          <motion.div
            animate={{
              scale: [1, 1.15, 1],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 3
            }}
            className="absolute bottom-0 right-0 w-[700px] h-[700px] rounded-full blur-[120px]"
            style={{
              background: 'radial-gradient(circle, rgba(24, 33, 112, 0.35), transparent 70%)'
            }}
          />

          {/* Accent orb - center right - VIOLET */}
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.2, 0.35, 0.2]
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 5
            }}
            className="absolute top-1/2 right-1/4 w-[600px] h-[600px] rounded-full blur-[100px]"
            style={{
              background: 'radial-gradient(circle, rgba(108, 61, 217, 0.25), transparent 70%)'
            }}
          />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center relative z-10"
        >
          {/* Gradient Ring Spinner */}
          <div className="relative w-20 h-20 mx-auto mb-6">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-20 h-20 border-4 border-transparent border-t-nex-purple border-r-nex-gradient-start border-b-nex-gradient-end rounded-full"
            />
            <div className="absolute inset-0 w-20 h-20 border-4 border-nex-purple/20 rounded-full" />
          </div>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-white text-xl font-semibold mb-2"
          >
            Loading NeX AI...
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-gray-400 text-sm"
          >
            Preparing your AI workspace
          </motion.p>
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center relative overflow-hidden bg-nex-bg">
        {/* Premium Background matching main dashboard */}
        <div className="fixed inset-0 z-0 pointer-events-none bg-nex-bg">

          {/* Primary orb - top left - PURPLE */}
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.25, 0.4, 0.25]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-0 left-0 w-[800px] h-[800px] rounded-full blur-[120px]"
            style={{
              background: 'radial-gradient(circle, rgba(163, 63, 244, 0.3), transparent 70%)'
            }}
          />

          {/* Secondary orb - bottom right - NAVY BLUE */}
          <motion.div
            animate={{
              scale: [1, 1.15, 1],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 3
            }}
            className="absolute bottom-0 right-0 w-[700px] h-[700px] rounded-full blur-[120px]"
            style={{
              background: 'radial-gradient(circle, rgba(24, 33, 112, 0.35), transparent 70%)'
            }}
          />

          {/* Accent orb - center right - VIOLET */}
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.2, 0.35, 0.2]
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 5
            }}
            className="absolute top-1/2 right-1/4 w-[600px] h-[600px] rounded-full blur-[100px]"
            style={{
              background: 'radial-gradient(circle, rgba(108, 61, 217, 0.25), transparent 70%)'
            }}
          />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center relative z-10"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-3 border-transparent border-t-nex-purple border-r-nex-gradient-end rounded-full mx-auto mb-4"
          />
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
    <div className="h-screen flex flex-col overflow-hidden relative" style={{
      backgroundColor: '#0E0E12'
    }}>
      {/* Top Navigation Bar */}
      <Navbar
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        sidebarOpen={sidebarOpen}
      />

      {/* Main Content Container */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-[280px_1fr] overflow-hidden relative">

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
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:relative z-50 lg:z-auto transition-transform duration-300 ease-in-out lg:transition-none w-[280px]`}>
        <LeftSidebar
          onNewChat={handleNewChat}
          onCloseSidebar={() => setSidebarOpen(false)}
          onLoadConversation={loadConversation}
        />
      </div>

      {/* Main Content Area */}
      <main className="flex flex-col min-w-0 h-full overflow-hidden">
        {!showChat && messages.length === 0 ? (
          <DashboardView
            onStartChat={handleNewChat}
            onOpenPictureGenerator={() => setActiveModal('picture')}
            onOpenVoiceGenerator={() => setActiveModal('voiceover')}
            onNavigateToExpensa={() => router.push('/expensa')}
          />
        ) : (
          <ChatArea
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
          />
        )}
      </main>

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
      </div>
    </div>
  );
}