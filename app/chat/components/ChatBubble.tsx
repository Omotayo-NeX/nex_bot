'use client';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { User, Bot, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ChatBubbleProps {
  message: {
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
    images?: string[];
  };
  index: number;
  userName?: string;
}

export default function ChatBubble({ message, index, userName }: ChatBubbleProps) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.3, 
        delay: index * 0.05,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-6`}
    >
      <div className={`flex ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start space-x-3 max-w-4xl group`}>
        {/* Avatar */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: index * 0.05 + 0.2, type: "spring", stiffness: 500 }}
          className={`flex-shrink-0 ${isUser ? 'ml-3' : 'mr-3'}`}
        >
          {isUser ? (
            <div className="w-8 h-8 bg-gradient-to-br from-nex-gradient-start to-nex-gradient-end rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(163,65,255,0.4)]">
              <User className="w-4 h-4 text-white" />
            </div>
          ) : (
            <div className="w-8 h-8 bg-gradient-to-br from-nex-gradient-start to-nex-gradient-end rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(163,65,255,0.4)]">
              <Bot className="w-4 h-4 text-white" />
            </div>
          )}
        </motion.div>

        {/* Message Bubble */}
        <div className={`relative flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
          {/* Timestamp */}
          <div className={`text-xs text-nex-text-muted mb-1 px-1 ${isUser ? 'text-right' : 'text-left'}`}>
            {isUser ? (userName || 'You') : 'NeX AI'} • {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>

          {/* Message Content */}
          <motion.div
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300, duration: 0.2 }}
            className={`relative px-6 py-4 rounded-2xl max-w-2xl shadow-lg ${
              isUser
                ? 'bg-gradient-to-br from-nex-gradient-start to-nex-gradient-end text-white shadow-[0_0_15px_rgba(163,65,255,0.3)]'
                : 'bg-nex-surface/80 backdrop-blur-sm border border-nex-border/50 text-nex-text'
            }`}
          >
            {/* Images if present */}
            {message.images && message.images.length > 0 && (
              <div className={`mb-3 grid ${message.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'} gap-2`}>
                {message.images.map((img, idx) => (
                  <div key={idx} className="relative rounded-lg overflow-hidden">
                    <Image
                      src={img}
                      alt={`Uploaded image ${idx + 1}`}
                      width={200}
                      height={200}
                      className="w-full h-auto object-cover"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Message Text */}
            <div className={`prose ${isUser ? 'prose-invert' : 'prose-slate'} max-w-none prose-sm md:prose-base`}>
              {isUser ? (
                <p className="whitespace-pre-wrap leading-relaxed text-white m-0">
                  {message.content}
                </p>
              ) : (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  className="markdown-content"
                  components={{
                    // Headings
                    h1: ({ node, ...props }) => <h1 className="text-2xl font-bold text-white mt-6 mb-4 first:mt-0 tracking-tight" {...props} />,
                    h2: ({ node, ...props }) => <h2 className="text-xl font-bold text-white mt-6 mb-3 first:mt-0 tracking-tight" {...props} />,
                    h3: ({ node, ...props }) => <h3 className="text-lg font-semibold text-white mt-5 mb-3 first:mt-0 tracking-tight" {...props} />,
                    h4: ({ node, ...props }) => <h4 className="text-base font-semibold text-white mt-4 mb-2 first:mt-0 tracking-tight" {...props} />,

                    // Paragraphs
                    p: ({ node, ...props }) => <p className="text-nex-text leading-7 mb-4 last:mb-0" {...props} />,

                    // Lists
                    ul: ({ node, ...props }) => <ul className="list-disc list-outside ml-5 mb-5 space-y-1.5 text-nex-text marker:text-nex-text-muted" {...props} />,
                    ol: ({ node, ...props }) => <ol className="list-decimal list-outside ml-5 mb-5 space-y-1.5 text-nex-text marker:text-nex-text-muted" {...props} />,
                    li: ({ node, ...props }) => <li className="text-nex-text leading-7 pl-2" {...props} />,

                    // Strong/Bold
                    strong: ({ node, ...props }) => <strong className="font-semibold text-white" {...props} />,

                    // Em/Italic
                    em: ({ node, ...props }) => <em className="italic text-nex-text" {...props} />,

                    // Code
                    code: ({ node, inline, ...props }: any) =>
                      inline ? (
                        <code className="bg-nex-bg/70 text-nex-gradient-end px-1.5 py-0.5 rounded text-sm font-mono border border-nex-border/30" {...props} />
                      ) : (
                        <code className="block bg-nex-bg/70 text-nex-gradient-end p-3 rounded-lg text-sm font-mono overflow-x-auto my-3 border border-nex-border/30" {...props} />
                      ),

                    // Pre (code blocks)
                    pre: ({ node, ...props }) => <pre className="bg-nex-bg/70 rounded-lg p-4 overflow-x-auto my-4 border border-nex-border/30" {...props} />,

                    // Links
                    a: ({ node, ...props }) => <a className="text-nex-gradient-end hover:text-nex-gradient-start underline transition-colors" {...props} />,

                    // Blockquotes
                    blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-nex-gradient-end pl-4 italic text-nex-text-muted my-4" {...props} />,

                    // Horizontal Rule
                    hr: ({ node, ...props }) => <hr className="border-nex-border my-6" {...props} />,

                    // Tables
                    table: ({ node, ...props }) => <table className="w-full border-collapse my-4" {...props} />,
                    thead: ({ node, ...props }) => <thead className="bg-nex-bg/50" {...props} />,
                    tbody: ({ node, ...props }) => <tbody className="divide-y divide-nex-border" {...props} />,
                    tr: ({ node, ...props }) => <tr className="border-b border-nex-border" {...props} />,
                    th: ({ node, ...props }) => <th className="px-4 py-2 text-left text-white font-semibold" {...props} />,
                    td: ({ node, ...props }) => <td className="px-4 py-2 text-nex-text" {...props} />,
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              )}
            </div>

            {/* Copy Button */}
            {!isUser && (
              <button
                onClick={copyToClipboard}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-200 p-1.5 rounded-lg bg-nex-bg/50 hover:bg-nex-gradient-end/20 text-nex-text-muted hover:text-nex-gradient-end border border-nex-border/30"
                title="Copy message"
              >
                {copied ? (
                  <Check className="w-3 h-3" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </button>
            )}

            {/* Message Tail */}
            <div
              className={`absolute top-3 w-3 h-3 transform rotate-45 ${
                isUser
                  ? 'right-0 translate-x-1/2 bg-gradient-to-br from-nex-gradient-start to-nex-gradient-end'
                  : 'left-0 -translate-x-1/2 bg-nex-surface/80 border-l border-t border-nex-border/50'
              }`}
            />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}