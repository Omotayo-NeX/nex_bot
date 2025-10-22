import { useEffect, useCallback } from 'react';

export type KeyboardShortcut = {
  key: string;
  ctrl?: boolean;
  meta?: boolean; // Command on Mac, Windows key on Windows
  shift?: boolean;
  alt?: boolean;
  description: string;
  action: () => void;
};

/**
 * Hook for registering keyboard shortcuts
 *
 * @example
 * useKeyboardShortcuts([
 *   {
 *     key: 'k',
 *     meta: true, // Cmd+K on Mac, Ctrl+K on Windows
 *     description: 'Open search',
 *     action: () => setSearchOpen(true)
 *   }
 * ]);
 */
export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatches = shortcut.ctrl ? event.ctrlKey : !event.ctrlKey;
        const metaMatches = shortcut.meta ? event.metaKey : !event.metaKey;
        const shiftMatches = shortcut.shift ? event.shiftKey : !event.shiftKey;
        const altMatches = shortcut.alt ? event.altKey : !event.altKey;

        // If meta (Command/Cmd) is required, also allow Ctrl on Windows/Linux
        const modifierMatches = shortcut.meta
          ? (event.metaKey || event.ctrlKey) && shiftMatches && altMatches
          : ctrlMatches && metaMatches && shiftMatches && altMatches;

        if (keyMatches && modifierMatches) {
          event.preventDefault();
          shortcut.action();
          break;
        }
      }
    },
    [shortcuts]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
}

/**
 * Format shortcut key for display
 * Shows Cmd on Mac, Ctrl on Windows/Linux
 */
export function formatShortcutKey(shortcut: Omit<KeyboardShortcut, 'action' | 'description'>): string {
  const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const parts: string[] = [];

  if (shortcut.meta) {
    parts.push(isMac ? '⌘' : 'Ctrl');
  }
  if (shortcut.ctrl) {
    parts.push('Ctrl');
  }
  if (shortcut.shift) {
    parts.push('⇧');
  }
  if (shortcut.alt) {
    parts.push(isMac ? '⌥' : 'Alt');
  }

  parts.push(shortcut.key.toUpperCase());

  return parts.join(isMac ? '' : '+');
}

/**
 * Get platform-specific modifier key name
 */
export function getModifierKey(): string {
  const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  return isMac ? '⌘' : 'Ctrl';
}
