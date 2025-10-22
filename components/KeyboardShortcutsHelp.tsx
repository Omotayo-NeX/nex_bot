'use client';

import { useState, useEffect } from 'react';
import { Keyboard, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { formatShortcutKey, useKeyboardShortcuts } from '@/lib/hooks/useKeyboardShortcuts';

interface ShortcutGroup {
  title: string;
  shortcuts: Array<{
    key: string;
    ctrl?: boolean;
    meta?: boolean;
    shift?: boolean;
    alt?: boolean;
    description: string;
  }>;
}

const SHORTCUT_GROUPS: ShortcutGroup[] = [
  {
    title: 'Navigation',
    shortcuts: [
      { key: '/', description: 'Focus search', meta: false },
      { key: 'n', meta: true, description: 'New chat' },
      { key: 'a', meta: true, description: 'Open analytics' },
      { key: 's', meta: true, description: 'Open settings' },
    ],
  },
  {
    title: 'Chat',
    shortcuts: [
      { key: 'Enter', description: 'Send message', meta: false },
      { key: 'Enter', shift: true, description: 'New line', meta: false },
      { key: 'k', meta: true, description: 'Clear chat' },
    ],
  },
  {
    title: 'General',
    shortcuts: [
      { key: '?', shift: true, description: 'Show shortcuts', meta: false },
      { key: 'Escape', description: 'Close dialog', meta: false },
    ],
  },
];

export function KeyboardShortcutsHelp() {
  const [isOpen, setIsOpen] = useState(false);

  // Register the shortcut to open this dialog
  useKeyboardShortcuts([
    {
      key: '?',
      shift: true,
      description: 'Show keyboard shortcuts',
      action: () => setIsOpen(true),
    },
    {
      key: 'Escape',
      description: 'Close dialog',
      action: () => setIsOpen(false),
    },
  ]);

  // Prevent body scroll when dialog is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-nex-yellow text-nex-navy p-3 rounded-full shadow-lg hover:bg-nex-yellow-dark transition-all hover:scale-110 z-40"
        aria-label="Show keyboard shortcuts"
      >
        <Keyboard className="w-5 h-5" />
      </button>
    );
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        onClick={() => setIsOpen(false)}
      />

      {/* Dialog */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <Card className="max-w-2xl w-full max-h-[80vh] overflow-y-auto">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Keyboard className="w-6 h-6 text-nex-yellow" />
                Keyboard Shortcuts
              </CardTitle>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            <div className="space-y-6">
              {SHORTCUT_GROUPS.map((group) => (
                <div key={group.title}>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                    {group.title}
                  </h3>
                  <div className="space-y-2">
                    {group.shortcuts.map((shortcut, index) => (
                      <div
                        key={`${group.title}-${index}`}
                        className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50"
                      >
                        <span className="text-gray-700">{shortcut.description}</span>
                        <kbd className="px-3 py-1.5 text-sm font-mono bg-gray-100 border border-gray-300 rounded-md shadow-sm">
                          {formatShortcutKey(shortcut)}
                        </kbd>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t">
              <p className="text-sm text-gray-600 text-center">
                Press <kbd className="px-2 py-1 text-xs font-mono bg-gray-100 border border-gray-300 rounded">?</kbd> to toggle this help,{' '}
                <kbd className="px-2 py-1 text-xs font-mono bg-gray-100 border border-gray-300 rounded">Esc</kbd> to close
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
