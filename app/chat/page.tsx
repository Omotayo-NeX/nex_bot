"use client";
import React, { useState, useRef, useEffect } from "react";
import { Send, Loader2, Sparkles, Trash2 } from "lucide-react";

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hi! I am NeX Bot, your AI assistant for NeX Consulting. How can I help you today?"
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMessage] })
      });

      if (!response.body) throw new Error("No response");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = "";

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: ""
      };

      setMessages(prev => [...prev, assistantMsg]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        assistantMessage += chunk;

        setMessages(prev => 
          prev.map(msg => 
            msg.id === assistantMsg.id 
              ? { ...msg, content: assistantMessage }
              : msg
          )
        );
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([{
      id: "1",
      role: "assistant",
      content: "Hi! I am NeX Bot, your AI assistant for NeX Consulting. How can I help you today?"
    }]);
  };

  return (
    <div className="max-w-4xl mx-auto h-screen flex flex-col p-4">
      <header className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <Sparkles className="h-6 w-6" />
          NeX Bot
        </div>
        <button
          onClick={clearChat}
          className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
        >
          <Trash2 className="h-4 w-4" />
          Clear
        </button>
      </header>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto bg-white border rounded-lg p-4 space-y-4"
      >
        {messages.map(message => (
          <div
            key={message.id}
            className={cn(
              "flex w-full",
              message.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            <div
              className={cn(
                "max-w-xs lg:max-w-md xl:max-w-lg px-4 py-2 rounded-lg",
                message.role === "user"
                  ? "bg-black text-white"
                  : "bg-gray-100 text-gray-900"
              )}
            >
              {message.content}
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 px-4 py-2 rounded-lg">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && sendMessage()}
          placeholder="Ask NeX Bot anything..."
          className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          disabled={loading}
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 flex items-center gap-2"
        >
          <Send className="h-4 w-4" />
          Send
        </button>
      </div>
    </div>
  );
}
