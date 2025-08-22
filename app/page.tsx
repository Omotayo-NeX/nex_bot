"use client";
import { useState } from "react";

export default function ChatPage() {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! I'm NeX Bot. How can I help you?", isBot: true }
  ]);
  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (!input.trim()) return;
    
    setMessages(prev => [
      ...prev,
      { id: Date.now(), text: input, isBot: false },
      { id: Date.now() + 1, text: `Echo: ${input}`, isBot: true }
    ]);
    setInput("");
  };

  return (
    <div className="max-w-2xl mx-auto p-4 h-screen flex flex-col">
      <h1 className="text-2xl font-bold mb-4">NeX Bot</h1>
      
      <div className="flex-1 border rounded p-4 overflow-y-auto space-y-2">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`p-2 rounded max-w-xs ${
              msg.isBot 
                ? "bg-gray-100 text-left" 
                : "bg-black text-white ml-auto text-right"
            }`}
          >
            {msg.text}
          </div>
        ))}
      </div>
      
      <div className="mt-4 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && sendMessage()}
          className="flex-1 border rounded px-3 py-2"
          placeholder="Type a message..."
        />
        <button
          onClick={sendMessage}
          className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
        >
          Send
        </button>
      </div>
    </div>
  );
}
