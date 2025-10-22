'use client';

import { useState } from 'react';
import { Download, FileText, FileJson, FileCode } from 'lucide-react';
import { Button } from './ui/Button';
import { Card, CardContent } from './ui/Card';
import { exportConversation, Conversation } from '@/lib/utils/exportChat';
import { toast } from '@/lib/hooks/useToast';

interface ExportChatButtonProps {
  conversation: Conversation;
  variant?: 'icon' | 'button';
}

export function ExportChatButton({ conversation, variant = 'button' }: ExportChatButtonProps) {
  const [showMenu, setShowMenu] = useState(false);

  const handleExport = (format: 'markdown' | 'text' | 'json') => {
    try {
      exportConversation(conversation, format);
      toast.success('Chat exported successfully', `Downloaded as ${format.toUpperCase()}`);
      setShowMenu(false);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Export failed', 'Could not export conversation');
    }
  };

  if (variant === 'icon') {
    return (
      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Export conversation"
        >
          <Download className="w-5 h-5" />
        </button>

        {showMenu && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowMenu(false)}
            />

            {/* Menu */}
            <Card className="absolute right-0 mt-2 w-56 z-50 shadow-xl">
              <CardContent className="p-2">
                <div className="space-y-1">
                  <button
                    onClick={() => handleExport('markdown')}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <FileCode className="w-4 h-4 text-blue-500" />
                    <span>Markdown (.md)</span>
                  </button>

                  <button
                    onClick={() => handleExport('text')}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <FileText className="w-4 h-4 text-gray-500" />
                    <span>Plain Text (.txt)</span>
                  </button>

                  <button
                    onClick={() => handleExport('json')}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <FileJson className="w-4 h-4 text-green-500" />
                    <span>JSON (.json)</span>
                  </button>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <Button
        variant="secondary"
        size="sm"
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-2"
      >
        <Download className="w-4 h-4" />
        Export Chat
      </Button>

      {showMenu && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowMenu(false)}
          />

          {/* Menu */}
          <Card className="absolute left-0 mt-2 w-64 z-50 shadow-xl">
            <CardContent className="p-3">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">
                Export Format
              </h4>
              <div className="space-y-2">
                <button
                  onClick={() => handleExport('markdown')}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FileCode className="w-5 h-5 text-blue-500" />
                  <div className="text-left">
                    <div className="font-medium">Markdown</div>
                    <div className="text-xs text-gray-500">Formatted for documentation</div>
                  </div>
                </button>

                <button
                  onClick={() => handleExport('text')}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FileText className="w-5 h-5 text-gray-500" />
                  <div className="text-left">
                    <div className="font-medium">Plain Text</div>
                    <div className="text-xs text-gray-500">Simple readable format</div>
                  </div>
                </button>

                <button
                  onClick={() => handleExport('json')}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FileJson className="w-5 h-5 text-green-500" />
                  <div className="text-left">
                    <div className="font-medium">JSON</div>
                    <div className="text-xs text-gray-500">Structured data format</div>
                  </div>
                </button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
