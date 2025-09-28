'use client';
import { useState, useRef, useEffect } from 'react';
import { Send, Mic, Square, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

export default function ChatInput({ onSendMessage, isLoading }: ChatInputProps) {
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [speechSupported, setSpeechSupported] = useState(true);
  const inputRef = useRef<HTMLTextAreaElement>(null);

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
      const scrollHeight = textarea.scrollHeight;
      const minHeight = 44; // ~1 row
      const maxHeight = 160; // ~6 rows
      const newHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight);
      textarea.style.height = newHeight + 'px';
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

  return (
    <footer className="fixed bottom-0 left-0 lg:left-[280px] right-0 border-t border-white/10 bg-[#0d0d0d] z-40">
      <div className="mx-auto max-w-4xl px-4 py-3">
        <form onSubmit={handleSubmit}>
          <div className="flex items-end gap-2 rounded-2xl border border-white/10 bg-black/40 px-3 py-2 backdrop-blur">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                adjustTextareaHeight();
              }}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about marketing, automation, or business growth..."
              className="flex-1 resize-none bg-transparent outline-none px-2 py-2 text-sm leading-5 text-white placeholder-gray-400 min-h-[44px] max-h-[160px]"
              disabled={isLoading}
              rows={1}
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                lineHeight: '1.25rem'
              }}
            />

            <button
              type="button"
              onClick={startRecording}
              className={`p-2 rounded-lg transition-all hover:text-white/70 ${
                isRecording
                  ? 'text-red-400 animate-pulse'
                  : speechSupported
                    ? 'text-gray-400 hover:text-white'
                    : 'text-gray-600 cursor-not-allowed'
              }`}
              disabled={isLoading || !speechSupported}
              title={!speechSupported ? 'Speech recognition not supported in this browser' : isRecording ? 'Stop recording' : 'Start voice input'}
              aria-label="Voice input"
            >
              {isRecording ? <Square className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </button>

            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="p-2 text-gray-400 hover:text-white/70 disabled:text-gray-600 disabled:cursor-not-allowed transition-all"
              aria-label="Send message"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </button>
          </div>
        </form>

        {isRecording && (
          <motion.div
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="mt-2 text-center"
          >
            <p className="text-xs text-red-400 flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span>Listening... Speak now</span>
            </p>
          </motion.div>
        )}
      </div>
    </footer>
  );
}