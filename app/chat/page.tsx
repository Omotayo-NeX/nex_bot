"use client";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Send, Loader2, Sparkles, Trash2, Settings2, AlertCircle } from "lucide-react";
import { cnNex } from "@/lib/cnNex";

// --- Enhanced Types ---
type EnterMode = "send" | "type";
export type Role = "user" | "assistant" | "system";
export type Message = { 
  id: string; 
  role: Role; 
  content: string; 
  createdAt: number;
  status?: 'sending' | 'sent' | 'error';
};

type ChatError = {
  message: string;
  retryable: boolean;
};

const uid = () => Math.random().toString(36).slice(2);

// Helper for keyboard behavior
export function shouldSendOnKey(
  mode: EnterMode,
  e: Pick<React.KeyboardEvent, "key" | "shiftKey" | "ctrlKey" | "metaKey">
) {
  if (mode === "type") {
    return (e.ctrlKey || e.metaKey) && e.key === "Enter";
  }
  if (e.key !== "Enter") return false;
  if (e.shiftKey) return false;
  return true;
}

// --- Enhanced UI Components ---

// Memoized Button Component
const Button = React.memo(({ 
  className, 
  loading, 
  children, 
  ...props 
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }) => {
  return (
    <button
      className={cnNex(
        "inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium shadow-sm",
        "bg-black text-white hover:bg-zinc-800 disabled:opacity-50",
        "active:scale-95 transition-all duration-200 touch-manipulation",
        className
      )}
      disabled={props.disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        children
      )}
    </button>
  );
});
Button.displayName = "Button";

// Enhanced Textarea with auto-resize and character counter
const SmartTextarea = React.memo(({ 
  value, 
  onChange, 
  onKeyDown, 
  disabled, 
  mode,
  placeholder
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  disabled: boolean;
  mode: EnterMode;
  placeholder?: string;
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Auto-resize textarea
  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e);
    
    const textarea = e.target;
    textarea.style.height = 'auto';
    const newHeight = Math.min(textarea.scrollHeight, window.innerHeight * 0.35);
    textarea.style.height = newHeight + 'px';
  }, [onChange]);

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        placeholder={placeholder || (mode === "send" 
          ? "Ask NeX Bot anything... (Shift+Enter for newline)" 
          : "Ask NeX Bot anything... (Ctrl/Cmd+Enter to send)"
        )}
        value={value}
        rows={1}
        onChange={handleChange}
        onKeyDown={onKeyDown}
        disabled={disabled}
        className={cnNex(
          "w-full resize-none rounded-2xl border border-zinc-200 bg-white px-4 py-3 pr-16 text-sm outline-none",
          "focus:ring-2 focus:ring-black/10 focus:border-zinc-300 min-h-[44px] max-h-[35vh] leading-6",
          "disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200",
          "placeholder:text-zinc-400"
        )}
        maxLength={2000}
      />
      {/* Character counter */}
      {value.length > 500 && (
        <div className={cnNex(
          "absolute bottom-2 right-2 text-xs transition-colors",
          value.length > 1800 ? "text-red-500" : "text-zinc-400"
        )}>
          {value.length}/2000
        </div>
      )}
    </div>
  );
});
SmartTextarea.displayName = "SmartTextarea";

// Enhanced Message Bubble with timestamp and animations
const MessageBubble = React.memo(({ 
  role, 
  children, 
  timestamp, 
  status 
}: { 
  role: Role; 
  children: React.ReactNode; 
  timestamp?: number;
  status?: Message['status'];
}) => {
  const isUser = role === "user";
  
  return (
    <div 
      className={cnNex(
        "flex w-full animate-in slide-in-from-bottom-2 duration-300",
        isUser ? "justify-end" : "justify-start"
      )}
      role="article"
      aria-label={`${role} message`}
    > 
      <div className="flex flex-col max-w-[85%] sm:max-w-[80%]">
        <div
          className={cnNex(
            "whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed",
            "transition-all duration-200 hover:shadow-sm",
            isUser 
              ? "bg-gradient-to-r from-black to-zinc-800 text-white shadow-lg" 
              : "bg-gradient-to-r from-zinc-50 to-zinc-100 text-zinc-900 border border-zinc-200",
            status === 'error' && "border-red-300 bg-red-50"
          )}
        >
          {children}
          {status === 'sending' && (
            <div className="flex items-center gap-1 mt-2 opacity-60">
              <div className="w-1 h-1 bg-current rounded-full animate-pulse" />
              <span className="text-xs">Sending...</span>
            </div>
          )}
        </div>
        {timestamp && (
          <span className="text-xs text-zinc-400 mt-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {new Date(timestamp).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </span>
        )}
      </div>
    </div>
  );
});
MessageBubble.displayName = "MessageBubble";

// Enhanced Typing Indicator
const TypingIndicator = React.memo(() => {
  return (
    <div className="flex justify-start animate-in slide-in-from-bottom-2 duration-300">
      <div className="bg-gradient-to-r from-zinc-50 to-zinc-100 border border-zinc-200 rounded-2xl px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-zinc-400 [animation-delay:-0.3s]" />
            <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-zinc-400 [animation-delay:-0.15s]" />
            <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-zinc-400" />
          </div>
          <span className="text-xs text-zinc-500">NeX Bot is thinking...</span>
        </div>
      </div>
    </div>
  );
});
TypingIndicator.displayName = "TypingIndicator";

// Error Message Component
const ErrorMessage = React.memo(({ 
  error, 
  onRetry 
}: { 
  error: string; 
  onRetry?: () => void; 
}) => (
  <div className="flex justify-center animate-in slide-in-from-bottom-2 duration-300">
    <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 max-w-md">
      <div className="flex items-center gap-2 text-red-700 text-sm">
        <AlertCircle className="h-4 w-4 flex-shrink-0" />
        <span>{error}</span>
        {onRetry && (
          <button 
            onClick={onRetry}
            className="ml-2 text-red-600 hover:text-red-800 underline font-medium"
          >
            Retry
          </button>
        )}
      </div>
    </div>
  </div>
));
ErrorMessage.displayName = "ErrorMessage";

// Enhanced Header with status indicator
const ChatHeader = React.memo(({ 
  onClear, 
  mode, 
  onModeToggle,
  isOnline 
}: {
  onClear: () => void;
  mode: EnterMode;
  onModeToggle: () => void;
  isOnline: boolean;
}) => {
  return (
    <header className="mb-3 sm:mb-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-base sm:text-lg font-semibold">
          <div className="relative">
            <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-black" />
            <div className={cnNex(
              "absolute -top-1 -right-1 h-3 w-3 rounded-full border-2 border-white transition-colors",
              isOnline ? "bg-green-500" : "bg-red-500"
            )} />
          </div>
          <span>NeX Bot</span>
        </div>
        <div className="text-xs text-zinc-500 hidden sm:block">
          {isOnline ? "Online" : "Connection lost"}
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <button
          onClick={onModeToggle}
          className={cnNex(
            "group inline-flex items-center gap-2 rounded-2xl border px-2 sm:px-3 py-2 text-xs",
            "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 transition-colors"
          )}
          title={mode === "send" 
            ? "Switch to Type mode (Enter for newlines)" 
            : "Switch to Send mode (Enter to send)"
          }
        >
          <Settings2 className="h-4 w-4" />
          <span className="font-medium hidden sm:inline">
            {mode === "send" ? "Send" : "Type"}
          </span>
        </button>
        
        <Button 
          onClick={onClear} 
          className="bg-white text-zinc-700 ring-1 ring-zinc-200 hover:bg-zinc-50 px-2 sm:px-4"
        >
          <Trash2 className="h-4 w-4" />
          <span className="hidden sm:inline">Clear</span>
        </Button>
      </div>
    </header>
  );
});
ChatHeader.displayName = "ChatHeader";

// Custom Hooks for better state management
const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(true);
  
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  return isOnline;
};

const useOptimizedScroll = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isUserScrolling = useRef(false);
  const scrollTimeout = useRef<NodeJS.Timeout>();
  
  const scrollToBottom = useCallback(() => {
    if (!isUserScrolling.current && scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, []);
  
  const handleScroll = useCallback(() => {
    isUserScrolling.current = true;
    clearTimeout(scrollTimeout.current);
    scrollTimeout.current = setTimeout(() => {
      isUserScrolling.current = false;
    }, 1500);
  }, []);
  
  return { scrollRef, scrollToBottom, handleScroll };
};

// Main Chat Component
export default function ImprovedChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: uid(),
      role: "assistant",
      content: "Hi! I'm NeX Bot, your AI assistant for NeX Consulting. I can help you with our services, proposals, and marketing automation solutions. How can I assist you today?",
      createdAt: Date.now(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<EnterMode>("send");
  const [error, setError] = useState<ChatError | null>(null);
  
  const isOnline = useOnlineStatus();
  const { scrollRef, scrollToBottom, handleScroll } = useOptimizedScroll();
  
  // Load persisted mode
  useEffect(() => {
    try {
      const saved = localStorage.getItem("nexbot_enter_mode") as EnterMode | null;
      if (saved === "send" || saved === "type") setMode(saved);
    } catch {}
  }, []);

  // Persist mode
  useEffect(() => {
    try {
      localStorage.setItem("nexbot_enter_mode", mode);
    } catch {}
  }, [mode]);

  // Auto-scroll with optimization
  useEffect(() => {
    scrollToBottom();
  }, [messages, loading, scrollToBottom]);

  // Optimized message update function
  const updateLastAssistantMessage = useCallback((content: string) => {
    setMessages(prev => {
      const newMessages = [...prev];
      const lastIndex = newMessages.length - 1;
      if (lastIndex >= 0 && newMessages[lastIndex].role === 'assistant') {
        newMessages[lastIndex] = {
          ...newMessages[lastIndex],
          content
        };
      }
      return newMessages;
    });
  }, []);

  const onSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading || !isOnline) return;

    const userMsg: Message = { 
      id: uid(), 
      role: "user", 
      content: trimmed, 
      createdAt: Date.now(),
      status: 'sent'
    };
    
    const assistantMsg: Message = { 
      id: uid(), 
      role: "assistant", 
      content: "", 
      createdAt: Date.now() 
    };

    setMessages(prev => [...prev, userMsg, assistantMsg]);
    setInput("");
    setLoading(true);
    setError(null);

    // Create abort controller for cleanup
    const abortController = new AbortController();

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          messages: [...messages, userMsg].map(({ role, content }) => ({ role, content })) 
        }),
        signal: abortController.signal
      });

      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
      }

      if (!res.body) {
        throw new Error("No response stream available");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        if (chunk) {
          accumulatedContent += chunk;
          updateLastAssistantMessage(accumulatedContent);
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') return; // Cleanup, not an error
      
      console.error('Chat error:', err);
      setError({
        message: err.message || "Failed to send message. Please try again.",
        retryable: true
      });
      
      // Remove the failed assistant message
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }

    // Cleanup function
    return () => abortController.abort();
  };

  const onRetry = useCallback(() => {
    if (error?.retryable) {
      setError(null);
      onSend();
    }
  }, [error]);

  const onClear = useCallback(() => {
    setMessages([
      {
        id: uid(),
        role: "assistant",
        content: "New conversation started! How can I help you with NeX Consulting today?",
        createdAt: Date.now(),
      },
    ]);
    setError(null);
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (shouldSendOnKey(mode, e)) {
      e.preventDefault();
      onSend();
    }
  }, [mode, onSend]);

  const toggleMode = useCallback(() => {
    setMode(prev => prev === "send" ? "type" : "send");
  }, []);

  const disabled = useMemo(() => loading || !input.trim() || !isOnline, [loading, input, isOnline]);

  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-4xl flex-col p-3 sm:p-4 md:p-6 lg:p-8">
      <ChatHeader 
        onClear={onClear}
        mode={mode}
        onModeToggle={toggleMode}
        isOnline={isOnline}
      />

      {/* Chat viewport with optimized scrolling */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="min-h-0 flex-1 space-y-2 sm:space-y-3 overflow-y-auto rounded-2xl sm:rounded-3xl border border-zinc-200 bg-white p-3 sm:p-4 md:p-6"
        role="log"
        aria-live="polite"
        aria-label="Chat conversation"
      >
        {messages.map((message, index) => (
          <div key={message.id} className="group">
            <MessageBubble 
              role={message.role}
              timestamp={message.createdAt}
              status={message.status}
            >
              {message.content}
            </MessageBubble>
          </div>
        ))}
        
        {loading && <TypingIndicator />}
        {error && <ErrorMessage error={error.message} onRetry={onRetry} />}
      </div>

      {/* Enhanced composer */}
      <div className="mt-3 sm:mt-4 grid grid-cols-[1fr_auto] gap-2">
        <SmartTextarea
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          mode={mode}
        />
        <Button onClick={onSend} disabled={disabled} loading={loading}>
          <Send className="h-4 w-4" />
          <span className="hidden sm:inline">Send</span>
        </Button>
      </div>

      {/* Status footer */}
      <footer className="mx-auto mt-2 text-center text-[11px] leading-5 text-zinc-500">
        {!isOnline ? (
          <span className="text-red-500">⚠️ You're offline. Messages will be sent when connection is restored.</span>
        ) : mode === "send" ? (
          "Enter sends • Shift+Enter adds newline"
        ) : (
          "Enter adds newline • Ctrl/Cmd+Enter sends"
        )}
      </footer>
    </div>
  );
}
