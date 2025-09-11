'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic, Square, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import ChatBubble from './ChatBubble';

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
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [speechSupported, setSpeechSupported] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
          console.log('Speech recognition started');
          setIsRecording(true);
        };

        recognition.onresult = (event: any) => {
          console.log('Speech recognition result:', event.results);
          if (event.results.length > 0) {
            const transcript = event.results[0][0].transcript;
            setInput(prev => prev + (prev ? ' ' : '') + transcript);
            inputRef.current?.focus();
            adjustTextareaHeight();
          }
        };

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsRecording(false);
          if (event.error === 'not-allowed') {
            alert('Microphone access denied. Please allow microphone permissions and try again.');
          } else if (event.error === 'no-speech') {
            alert('No speech was detected. Please try again.');
          } else {
            alert(`Speech recognition error: ${event.error}`);
          }
        };

        recognition.onend = () => {
          console.log('Speech recognition ended');
          setIsRecording(false);
        };

        setRecognition(recognition);
      } else {
        setSpeechSupported(false);
        console.warn('Speech recognition not supported');
      }
    }

    return () => {
      if (recognition) {
        recognition.abort();
      }
    };
  }, []);

  // Auto-resize textarea
  const adjustTextareaHeight = () => {
    const textarea = inputRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    onSendMessage(input);
    setInput('');
    
    // Reset textarea height
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const startSuggestion = (text: string) => {
    setInput(text);
    inputRef.current?.focus();
    adjustTextareaHeight();
  };

  const startRecording = () => {
    if (!speechSupported) {
      alert('Speech recognition is not supported in your browser. Please use Chrome or Edge for voice input.');
      return;
    }

    if (!recognition) {
      alert('Speech recognition is not initialized. Please refresh the page and try again.');
      return;
    }

    if (isRecording) {
      recognition.stop();
      setIsRecording(false);
    } else {
      try {
        recognition.start();
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        alert('Failed to start speech recognition. Please try again.');
        setIsRecording(false);
      }
    }
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
      <div className="flex-1 overflow-y-auto px-6 py-6">
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

      {/* Input Area */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.3 }}
        className="border-t bg-[#0d0d0d] p-4"
      >
        <form onSubmit={handleSubmit} className="flex items-end space-x-4">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                adjustTextareaHeight();
              }}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about marketing, automation, or business growth..."
              className="w-full min-h-[50px] max-h-[120px] px-4 py-3 pr-12 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 resize-none transition-all"
              disabled={isLoading}
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            />
            
            <button
              type="button"
              onClick={startRecording}
              className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-2 rounded-lg transition-all ${
                isRecording 
                  ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse shadow-lg shadow-red-500/25' 
                  : speechSupported 
                    ? 'bg-gray-700/50 hover:bg-gray-600/50 text-gray-400 hover:text-white' 
                    : 'bg-gray-800 text-gray-600 cursor-not-allowed'
              }`}
              disabled={isLoading || !speechSupported}
              title={!speechSupported ? 'Speech recognition not supported in this browser' : isRecording ? 'Stop recording' : 'Start voice input'}
            >
              {isRecording ? <Square className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-2xl transition-all transform disabled:cursor-not-allowed disabled:scale-100"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </motion.button>
        </form>

        <div className="mt-3 text-center">
          {isRecording ? (
            <motion.p 
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-xs text-red-400 flex items-center justify-center space-x-2"
            >
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span>Listening... Speak now</span>
            </motion.p>
          ) : null}
        </div>
      </motion.div>
    </div>
  );
}