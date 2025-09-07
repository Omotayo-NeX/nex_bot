'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Plus, Download } from 'lucide-react';
function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

// Function to check if a message is an error or rate limit
function isErrorMessage(content: string): boolean {
  return content.includes('⚠️') || 
         content.includes('Rate limit') || 
         content.includes('Daily limit') ||
         content.includes('error') ||
         content.includes('Error');
}

// Function to format messages as clean text with natural styling
function formatMessage(content: string): React.JSX.Element {
  // Split content into paragraphs with better spacing handling
  const paragraphs = content.split(/\n\s*\n+/).filter(p => p.trim());
  
  return (
    <div className="space-y-5">
      {paragraphs.map((paragraph, index) => {
        const trimmedParagraph = paragraph.trim();
        if (!trimmedParagraph) return null;
        
        // Check if it's a numbered list
        if (trimmedParagraph.match(/^[\d]+\.\s/)) {
          const items = trimmedParagraph.split(/\n(?=\d+\.\s)/);
          return (
            <div key={index} className="space-y-3">
              {items.map((item, itemIndex) => {
                const cleanItem = item.replace(/^\d+\.\s*/, '').trim();
                return (
                  <div key={itemIndex} className="flex items-start gap-3">
                    <span className="text-blue-400 font-semibold mt-0.5 flex-shrink-0">{itemIndex + 1}.</span>
                    <span className="flex-1 leading-relaxed text-gray-100">{cleanItem}</span>
                  </div>
                );
              })}
            </div>
          );
        } 
        // Check if it's a bulleted list
        else if (trimmedParagraph.match(/^[-•*]\s/) || trimmedParagraph.includes('\n- ') || trimmedParagraph.includes('\n• ')) {
          const items = trimmedParagraph.split(/\n(?=[-•*]\s)|\n(?=- )|\n(?=• )/);
          return (
            <div key={index} className="space-y-3">
              {items.map((item, itemIndex) => {
                const cleanItem = item.replace(/^[-•*]\s*/, '').replace(/^- /, '').replace(/^• /, '').trim();
                if (!cleanItem) return null;
                return (
                  <div key={itemIndex} className="flex items-start gap-3">
                    <span className="text-blue-400 mt-1.5 flex-shrink-0">•</span>
                    <span className="flex-1 leading-relaxed text-gray-100">{cleanItem}</span>
                  </div>
                );
              })}
            </div>
          );
        }
        // Check if it's a heading (starts with uppercase and is short)
        else if (trimmedParagraph.length < 60 && trimmedParagraph.match(/^[A-Z][^.!?]*:?\s*$/) && !trimmedParagraph.includes(' ')) {
          return (
            <h3 key={index} className="text-lg font-semibold text-blue-300 leading-relaxed">
              {trimmedParagraph}
            </h3>
          );
        }
        // Regular paragraph with improved spacing
        else {
          return (
            <div key={index} className="leading-relaxed text-gray-100 space-y-2">
              {trimmedParagraph.split('\n').map((line, lineIndex) => (
                <p key={lineIndex} className={lineIndex > 0 ? "mt-2" : ""}>
                  {line.trim()}
                </p>
              ))}
            </div>
          );
        }
      })}
    </div>
  );
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingChunks, setPendingChunks] = useState<string[]>([]);
  const [conversationId, setConversationId] = useState<string>('');
  const [currentChatId, setCurrentChatId] = useState<string>('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load conversation from localStorage on mount
  useEffect(() => {
    const currentConvId = Date.now().toString();
    setConversationId(currentConvId);
    setCurrentChatId(currentConvId);
    
    const savedMessages = localStorage.getItem('nex_conversation');
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages);
        setMessages(parsed);
      } catch (error) {
        console.error('Failed to load conversation:', error);
      }
    }
  }, []);

  // Save messages to localStorage whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('nex_conversation', JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  // Function to add next chunk after delay
  const sendNextChunk = async () => {
    if (pendingChunks.length === 0) return;
    
    const nextChunk = pendingChunks[0];
    const remainingChunks = pendingChunks.slice(1);
    
    // Add the next chunk as a new message
    const chunkMessage: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: nextChunk,
    };
    
    setMessages((prev) => [...prev, chunkMessage]);
    setPendingChunks(remainingChunks);
    
    // If there are more chunks, schedule the next one
    if (remainingChunks.length > 0) {
      setTimeout(() => sendNextChunk(), 2000); // 2 second delay between chunks
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    // Clear any pending chunks when starting new conversation
    setPendingChunks([]);

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: [...messages, userMessage],
          conversationId: conversationId
        }),
      });

      const data = await response.json();

      // Handle rate limiting or other structured errors
      if (!response.ok || data.isRateLimit || data.isError) {
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.message || data.error || 'An error occurred. Please try again.',
        };
        setMessages((prev) => [...prev, errorMessage]);
        return;
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      
      // Handle chunked responses
      if (data.hasMore && data.chunks) {
        setPendingChunks(data.chunks);
        // Start sending chunks after a short delay
        setTimeout(() => sendNextChunk(), 2000);
      }
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setPendingChunks([]);
    localStorage.removeItem('nex_conversation');
    
    // Generate new chat ID
    const newChatId = Date.now().toString();
    setCurrentChatId(newChatId);
    setConversationId(newChatId);
  };

  const handleDownloadChat = () => {
    const chatData = {
      chatId: currentChatId,
      timestamp: new Date().toISOString(),
      messages: messages
    };
    
    const dataStr = JSON.stringify(chatData, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `nex-chat-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the object URL
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-screen bg-gray-950 text-white" style={{ display: 'grid', gridTemplateRows: 'auto 1fr auto' }}>
      <header className="flex items-center justify-between p-4 border-b border-gray-800 bg-gray-900">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <Sparkles className="h-6 w-6 text-blue-400" />
          NeX AI
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadChat}
            disabled={messages.length === 0}
            className="flex items-center gap-2 px-3 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
          >
            <Download className="h-4 w-4" />
            Download Chat
          </button>
          <button
            onClick={handleNewChat}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            <Plus className="h-4 w-4" />
            New Chat
          </button>
        </div>
      </header>

      <div
        ref={scrollRef}
        className="overflow-y-auto p-4 space-y-4 bg-gray-950"
      >
        {messages.length === 0 && (
          <div className="flex justify-start">
            <div className="bg-gray-800 text-gray-100 px-6 py-4 rounded-xl max-w-2xl">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-5 w-5 text-blue-400" />
                <span className="font-semibold">NeX AI</span>
              </div>
              <p className="text-gray-300">
                Hi! I&apos;m NeX AI, your conversational expert in digital marketing & AI automation. 
                I can help you create strategies, content calendars, automation workflows, and more! 💬
              </p>
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              'flex w-full',
              message.role === 'user' ? 'justify-end' : 'justify-start',
            )}
          >
            <div
              className={cn(
                'max-w-4xl px-6 py-4 rounded-xl',
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : isErrorMessage(message.content)
                  ? 'bg-red-900/50 text-red-100 border border-red-600/30'
                  : 'bg-gray-800 text-gray-100',
              )}
            >
              {message.role === 'assistant' ? (
                <>
                  {isErrorMessage(message.content) && (
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-red-400 text-lg">⚠️</span>
                      <span className="text-red-300 font-medium text-sm">System Notice</span>
                    </div>
                  )}
                  {formatMessage(message.content)}
                </>
              ) : (
                <p className="text-white leading-relaxed whitespace-pre-line">{message.content}</p>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-800 px-6 py-4 rounded-xl">
              <div className="flex items-center space-x-1">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-blue-400" />
                  <span className="text-sm text-gray-300">NeX AI is thinking</span>
                </div>
                <div className="flex space-x-1 ml-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                    style={{ animationDelay: '0.1s' }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                    style={{ animationDelay: '0.2s' }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-gray-900 border-t border-gray-700 p-4" style={{ marginLeft: '260px', marginRight: '300px' }}>
        <div className="flex gap-3 w-full">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask NeX AI anything..."
            className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-white placeholder-gray-400"
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors font-medium"
          >
            <Send className="h-4 w-4" />
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
