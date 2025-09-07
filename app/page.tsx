"use client";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

// Function to check if a message is an error or rate limit
function isErrorMessage(text: string): boolean {
  return text.includes('⚠️') || 
         text.includes('Rate limit') || 
         text.includes('Daily limit') ||
         text.includes('error') ||
         text.includes('Error');
}

export default function ChatPage() {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hi! I'm NeX AI, developed by Nex Consulting Limited in Abuja. I'm your conversational expert in digital marketing & AI automation. I can help you create strategies, content calendars, automation workflows, and more! For advanced business consultation, visit nexconsultingltd.com", isBot: true }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
  const [activeRightTab, setActiveRightTab] = useState("Chat");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMessage = { id: Date.now(), text: input, isBot: false };
    setMessages(prev => [...prev, userMessage]);
    
    const currentInput = input;
    setInput("");
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: messages.map(msg => ({
            role: msg.isBot ? 'assistant' : 'user',
            content: msg.text
          })).concat([{ role: 'user', content: currentInput }]),
          conversationId: Date.now().toString()
        }),
      });
      
      const data = await response.json();
      
      // Handle rate limiting or other structured errors
      if (!response.ok || data.isRateLimit || data.isError) {
        setMessages(prev => [
          ...prev,
          { id: Date.now() + 1, text: data.message || data.error || "Sorry, I'm having trouble responding right now.", isBot: true }
        ]);
      } else {
        setMessages(prev => [
          ...prev,
          { id: Date.now() + 1, text: data.message, isBot: true }
        ]);
      }
    } catch (error) {
      setMessages(prev => [
        ...prev,
        { id: Date.now() + 1, text: "Sorry, I'm having trouble responding right now.", isBot: true }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black flex">
      {/* Left Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-80 bg-gray-900/95 backdrop-blur-xl border-r border-gray-800/50 transition-all duration-300 ease-in-out ${leftSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-6 border-b border-gray-800/50">
            <div className="flex items-center justify-between mb-6">
              <div className="flex-1 flex justify-center">
                <div className="relative w-12 h-12">
                  <Image 
                    src="/Nex_logomark_white.png" 
                    alt="NeX Logo" 
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
              <button
                onClick={() => setLeftSidebarOpen(false)}
                className="lg:hidden text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-800/50"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* New Chat Button */}
            <button 
              onClick={() => {
                setMessages([
                  { id: 1, text: "Hi! I'm NeX AI, developed by Nex Consulting Limited in Abuja. I'm your conversational expert in digital marketing & AI automation. I can help you create strategies, content calendars, automation workflows, and more! For advanced business consultation, visit nexconsultingltd.com", isBot: true }
                ]);
                setInput("");
              }}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25 group"
            >
              <div className="flex items-center justify-center space-x-2">
                <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>New Chat</span>
              </div>
            </button>
          </div>
          
          {/* Feature Buttons */}
          <div className="px-6 py-4 border-b border-gray-800/50">
            <div className="space-y-3">
              {/* AI VoiceOver */}
              <Link
                href="/voiceover"
                className="w-full group relative overflow-hidden bg-gradient-to-r from-gray-800 to-gray-700 hover:from-blue-900/50 hover:to-purple-900/50 rounded-xl p-4 transition-all duration-300 hover:scale-105 hover:shadow-xl block"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 14.142M9 5L5 9H3a2 2 0 00-2 2v2a2 2 0 002 2h2l4 4V5z" />
                    </svg>
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-white font-semibold">AI VoiceOver</div>
                    <div className="text-gray-400 text-sm">Convert your text into voice</div>
                  </div>
                  <span className="text-xs bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-1 rounded-full font-medium animate-pulse">New</span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>

              {/* Picture Generator */}
              <Link
                href="/picture-generator"
                className="w-full group relative overflow-hidden bg-gradient-to-r from-gray-800 to-gray-700 hover:from-blue-900/50 hover:to-purple-900/50 rounded-xl p-4 transition-all duration-300 hover:scale-105 hover:shadow-xl block"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-white font-semibold">Picture Generator</div>
                    <div className="text-gray-400 text-sm">Create stunning visuals</div>
                  </div>
                  <span className="text-xs bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-3 py-1 rounded-full font-medium animate-pulse">New</span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/10 to-cyan-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>
            </div>
          </div>
          
          {/* Chat Sections */}
          <div className="flex-1 px-6 py-4 overflow-y-auto">
            {/* Pinned Chats */}
            <div className="mb-6">
              <h3 className="text-gray-400 text-sm font-semibold mb-3 uppercase tracking-wider">Pinned Chats</h3>
              <div className="space-y-2">
                <div className="text-gray-500 text-sm py-3 px-4 rounded-lg bg-gray-800/50 border border-gray-700/30">
                  No pinned chats yet
                </div>
              </div>
            </div>
            
            {/* Recent Chats */}
            <div className="mb-6">
              <h3 className="text-gray-400 text-sm font-semibold mb-3 uppercase tracking-wider">Recent Chats</h3>
              <div className="space-y-2">
                <div className="text-gray-300 text-sm py-3 px-4 rounded-lg hover:bg-gray-800/50 cursor-pointer transition-all duration-200 border border-transparent hover:border-gray-700/30 hover:shadow-lg">
                  Chat about NeX AI features
                </div>
                <div className="text-gray-300 text-sm py-3 px-4 rounded-lg hover:bg-gray-800/50 cursor-pointer transition-all duration-200 border border-transparent hover:border-gray-700/30 hover:shadow-lg">
                  UI Design Discussion
                </div>
                <div className="text-gray-300 text-sm py-3 px-4 rounded-lg hover:bg-gray-800/50 cursor-pointer transition-all duration-200 border border-transparent hover:border-gray-700/30 hover:shadow-lg">
                  API Integration Help
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Left Sidebar Overlay for Mobile */}
      {leftSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setLeftSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 shadow-lg">
          <div className="flex items-center justify-between">
            {/* Left side - Mobile menu button and NeX AI text */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setLeftSidebarOpen(true)}
                className="lg:hidden text-white/80 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              
              {/* NeX AI Brand Text */}
              <h1 className="text-xl lg:text-2xl font-bold text-white tracking-wide">NeX AI</h1>
            </div>
            
            {/* Right side - Bot Avatar */}
            <div className="flex items-center space-x-3">
              {/* Bot Avatar with inline SVG */}
              <div className="relative">
                <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white/20 hover:scale-105 transition-transform duration-200">
                  {/* Modern Robot Head SVG */}
                  <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="6" y="8" width="12" height="10" rx="3" ry="3" />
                    <line x1="12" y1="4" x2="12" y2="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <circle cx="12" cy="4" r="1.5" />
                    <circle cx="9" cy="12" r="1.5" />
                    <circle cx="15" cy="12" r="1.5" />
                    <rect x="10" y="15" width="4" height="1.5" rx="0.75" />
                  </svg>
                </div>
                {/* Online status indicator */}
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white shadow-sm animate-pulse"></div>
              </div>
              
              {/* Settings button (desktop only) */}
              <button
                onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
                className="hidden xl:flex items-center justify-center w-10 h-10 text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200 rounded-lg hover:scale-105"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Chat Content */}
        <div className="flex-1 flex">
          {/* Messages Area */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1 p-6 overflow-y-auto" style={{ paddingBottom: '120px' }}>
              <div className="max-w-4xl mx-auto">
                {/* Welcome Message - Centered */}
                {messages.length === 1 && (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-2xl p-4">
                      <div className="relative w-12 h-12">
                        <Image 
                          src="/Nex_logomark_white.png" 
                          alt="NeX AI" 
                          fill
                          className="object-contain"
                        />
                      </div>
                    </div>
                    <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                      Welcome to NeX AI
                    </h2>
                    <p className="text-gray-300 text-lg max-w-md mx-auto">
                      Your intelligent assistant ready to help with any questions, creative tasks, or conversations.
                    </p>
                  </div>
                )}
                
                {/* Chat Messages */}
                <div className="space-y-6">
                  {messages.map((msg, index) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'} animate-fadeIn`}
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className={`max-w-xs sm:max-w-md lg:max-w-2xl px-6 py-4 rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl ${
                        msg.isBot
                          ? isErrorMessage(msg.text)
                            ? "bg-red-900/50 text-red-100 border border-red-600/30 rounded-bl-sm backdrop-blur-sm"
                            : "bg-gray-800/80 border border-gray-700/50 text-gray-100 rounded-bl-sm backdrop-blur-sm hover:bg-gray-800/90"
                          : "bg-gradient-to-r from-blue-600 via-blue-500 to-purple-600 text-white rounded-br-sm shadow-blue-500/25 hover:shadow-blue-500/40"
                      }`}>
                        {msg.isBot && (
                          <div className="flex items-center mb-3">
                            <div className="w-7 h-7 relative mr-3 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 p-1">
                              <Image 
                                src="/Nex_logomark_white.png" 
                                alt="NeX AI" 
                                fill
                                className="object-contain rounded-full"
                              />
                            </div>
                            <span className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
                              {isErrorMessage(msg.text) ? (
                                <span className="text-red-300 flex items-center gap-1">
                                  <span className="text-red-400">⚠️</span>
                                  System Notice
                                </span>
                              ) : (
                                'NeX AI'
                              )}
                            </span>
                          </div>
                        )}
                        <p className="text-sm leading-relaxed">{msg.text}</p>
                        {!msg.isBot && (
                          <div className="flex justify-end mt-2">
                            <span className="text-xs text-white/70">You</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {/* Loading indicator */}
                  {isLoading && (
                    <div className="flex justify-start animate-fadeIn">
                      <div className="bg-gray-800/80 border border-gray-700/50 text-gray-100 px-6 py-4 rounded-2xl rounded-bl-sm shadow-lg backdrop-blur-sm">
                        <div className="flex items-center space-x-3">
                          <div className="w-7 h-7 relative rounded-full bg-gradient-to-r from-blue-600 to-purple-600 p-1">
                            <Image 
                              src="/Nex_logomark_white.png" 
                              alt="NeX AI" 
                              fill
                              className="object-contain rounded-full"
                            />
                          </div>
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>
            </div>
            
            {/* Input Area - Fixed at bottom */}
            <div className={`fixed bottom-0 left-0 right-0 lg:left-80 ${rightSidebarOpen ? 'xl:right-80' : 'xl:right-0'} bg-[#0d0d1a] border-t border-gray-800 p-4 z-30`}>
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-3 bg-gray-800/80 backdrop-blur-sm rounded-2xl p-3 border border-gray-700/50 shadow-xl hover:shadow-2xl transition-shadow duration-300">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && sendMessage()}
                      disabled={isLoading}
                      className="w-full bg-transparent text-white placeholder:text-gray-400 px-4 py-3 focus:outline-none text-sm"
                      placeholder="Ask NeX AI anything..."
                    />
                  </div>
                  
                  {/* Icon Buttons */}
                  <div className="flex items-center gap-2">
                    {/* Mic Button */}
                    <button className="p-2 text-gray-400 hover:text-white transition-all duration-200 rounded-lg hover:bg-gray-700/50 hover:scale-105">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                      </svg>
                    </button>
                    
                    {/* Image Upload Button */}
                    <button className="p-2 text-gray-400 hover:text-white transition-all duration-200 rounded-lg hover:bg-gray-700/50 hover:scale-105">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </button>
                    
                    {/* Send Button */}
                    <button
                      onClick={sendMessage}
                      disabled={!input.trim() || isLoading}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white p-2 rounded-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg hover:shadow-blue-500/25"
                    >
                      <svg 
                        className="w-5 h-5" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" 
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Sidebar */}
          {rightSidebarOpen && (
            <div className="hidden xl:block w-80 bg-gray-900/95 backdrop-blur-xl border-l border-gray-800/50 transition-all duration-300">
              <div className="flex flex-col h-full">
                {/* Right Sidebar Header */}
                <div className="px-6 py-4 border-b border-gray-800/50">
                  <div className="flex space-x-1">
                    {['Chat', 'Images', 'Code'].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveRightTab(tab)}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:scale-105 ${
                          activeRightTab === tab
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                            : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Right Sidebar Content */}
                <div className="flex-1 p-6">
                  {activeRightTab === 'Chat' && (
                    <div className="space-y-6">
                      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/30 shadow-lg">
                        <h3 className="text-lg font-semibold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                          Chat Settings
                        </h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium mb-2 text-gray-300">AI Model</label>
                            <select className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200">
                              <option>NeX GPT-4</option>
                              <option>NeX Claude</option>
                              <option>NeX Gemini</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2 text-gray-300">Temperature</label>
                            <input 
                              type="range" 
                              className="w-full accent-blue-500" 
                              min="0" 
                              max="1" 
                              step="0.1" 
                              defaultValue="0.7" 
                            />
                            <div className="flex justify-between text-xs text-gray-400 mt-1">
                              <span>Focused</span>
                              <span>Creative</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  {activeRightTab === 'Images' && (
                    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/30 shadow-lg">
                      <h3 className="text-lg font-semibold mb-4 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Image Gallery</h3>
                      <p className="text-gray-400 text-center py-8">No images generated yet.</p>
                    </div>
                  )}
                  {activeRightTab === 'Code' && (
                    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/30 shadow-lg">
                      <h3 className="text-lg font-semibold mb-4 bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">Code Snippets</h3>
                      <p className="text-gray-400 text-center py-8">No code snippets saved yet.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="bg-gray-900/50 backdrop-blur-sm border-t border-gray-800/50 px-6 py-3">
          <div className="text-center text-xs text-gray-500">
            Powered by NeX AI Technology
          </div>
        </div>
      </div>
    </div>
  );
}