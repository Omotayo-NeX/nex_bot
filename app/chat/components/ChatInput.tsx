'use client';
import { useState, useRef, useEffect } from 'react';
import { Send, Mic, Square, Loader2, Image as ImageIcon, X } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { hapticFeedback } from '@/lib/utils/haptics';

interface ChatInputProps {
  onSendMessage: (message: string, images?: string[]) => void;
  isLoading: boolean;
}

export default function ChatInput({ onSendMessage, isLoading }: ChatInputProps) {
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));

    if (imageFiles.length === 0) {
      alert('Please select valid image files');
      return;
    }

    const newImages: string[] = [];
    let loadedCount = 0;

    imageFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newImages.push(reader.result as string);
        loadedCount++;

        if (loadedCount === imageFiles.length) {
          setSelectedImages(prev => [...prev, ...newImages].slice(0, 4)); // Max 4 images
        }
      };
      reader.onerror = () => {
        console.error('Error reading file:', file.name);
        loadedCount++;

        if (loadedCount === imageFiles.length) {
          setSelectedImages(prev => [...prev, ...newImages].slice(0, 4));
        }
      };
      reader.readAsDataURL(file);
    });

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && selectedImages.length === 0) || isLoading) return;

    hapticFeedback.light(); // Add haptic feedback on send
    onSendMessage(input || 'What do you see in this image?', selectedImages.length > 0 ? selectedImages : undefined);
    setInput('');
    setSelectedImages([]);

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
      hapticFeedback.medium(); // Haptic when stopping recording
      recognition.stop();
      setIsRecording(false);
    } else {
      try {
        hapticFeedback.light(); // Haptic when starting recording
        recognition.start();
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        alert('Failed to start speech recognition. Please try again.');
        setIsRecording(false);
      }
    }
  };

  return (
    <footer
      className="fixed bottom-0 left-0 lg:left-[280px] right-0 border-t border-nex-border bg-nex-surface/95 backdrop-blur-md z-40"
      style={{
        paddingBottom: 'max(env(safe-area-inset-bottom), 12px)'
      }}
    >
      <div className="mx-auto max-w-4xl px-4 py-3">
        <form onSubmit={handleSubmit}>
          {/* Image Previews */}
          {selectedImages.length > 0 && (
            <div className="mb-2 flex gap-2 flex-wrap">
              {selectedImages.map((image, index) => (
                <div key={index} className="relative group">
                  <Image
                    src={image}
                    alt={`Upload ${index + 1}`}
                    width={80}
                    height={80}
                    className="rounded-lg object-cover border border-nex-border"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Remove image"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-end gap-2 rounded-2xl border border-nex-border bg-nex-bg/60 px-3 py-2 backdrop-blur focus-within:border-nex-gradient-end/50 transition-all duration-200">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                adjustTextareaHeight();
              }}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about marketing, automation, or business growth..."
              className="flex-1 resize-none bg-transparent outline-none px-2 py-2 text-sm leading-5 text-white placeholder-nex-text-muted min-h-[44px] max-h-[160px]"
              disabled={isLoading}
              rows={1}
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                lineHeight: '1.25rem'
              }}
            />

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageSelect}
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-3 sm:p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-nex-text-muted hover:text-nex-gradient-end disabled:text-gray-600 disabled:cursor-not-allowed transition-all duration-200 rounded-lg hover:bg-nex-gradient-end/10"
              disabled={isLoading || selectedImages.length >= 4}
              title={selectedImages.length >= 4 ? 'Maximum 4 images' : 'Upload image'}
              aria-label="Upload image"
            >
              <ImageIcon className="h-5 w-5" />
            </button>

            <button
              type="button"
              onClick={startRecording}
              className={`p-3 sm:p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg transition-all duration-200 ${
                isRecording
                  ? 'text-red-400 animate-pulse bg-red-500/10'
                  : speechSupported
                    ? 'text-nex-text-muted hover:text-nex-gradient-end hover:bg-nex-gradient-end/10'
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
              disabled={(!input.trim() && selectedImages.length === 0) || isLoading}
              className="p-3 sm:p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-nex-text-muted hover:text-nex-gradient-end disabled:text-gray-600 disabled:cursor-not-allowed transition-all duration-200 rounded-lg hover:bg-nex-gradient-end/10 hover:shadow-[0_0_10px_rgba(163,65,255,0.3)]"
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
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse block" />
              <span>Listening... Speak now</span>
            </p>
          </motion.div>
        )}
      </div>
    </footer>
  );
}