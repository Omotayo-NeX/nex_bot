/**
 * Utility functions for exporting chat conversations
 * Supports Markdown, JSON, and plain text formats
 */

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Export conversation as Markdown
 */
export function exportAsMarkdown(conversation: Conversation): string {
  const lines: string[] = [];

  // Header
  lines.push(`# ${conversation.title}`);
  lines.push('');

  if (conversation.createdAt) {
    lines.push(`**Created:** ${new Date(conversation.createdAt).toLocaleString()}`);
  }
  if (conversation.updatedAt) {
    lines.push(`**Last Updated:** ${new Date(conversation.updatedAt).toLocaleString()}`);
  }
  lines.push('');
  lines.push('---');
  lines.push('');

  // Messages
  conversation.messages.forEach((message, index) => {
    const role = message.role === 'user' ? '👤 You' : '🤖 NeX AI';
    const timestamp = message.timestamp
      ? ` _(${new Date(message.timestamp).toLocaleTimeString()})_`
      : '';

    lines.push(`### ${role}${timestamp}`);
    lines.push('');
    lines.push(message.content);
    lines.push('');

    if (index < conversation.messages.length - 1) {
      lines.push('---');
      lines.push('');
    }
  });

  // Footer
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('_Exported from NeX AI - https://ai.nexconsultingltd.com_');

  return lines.join('\n');
}

/**
 * Export conversation as plain text
 */
export function exportAsText(conversation: Conversation): string {
  const lines: string[] = [];

  // Header
  lines.push(conversation.title.toUpperCase());
  lines.push('='.repeat(conversation.title.length));
  lines.push('');

  if (conversation.createdAt) {
    lines.push(`Created: ${new Date(conversation.createdAt).toLocaleString()}`);
  }
  if (conversation.updatedAt) {
    lines.push(`Last Updated: ${new Date(conversation.updatedAt).toLocaleString()}`);
  }
  lines.push('');
  lines.push('-'.repeat(60));
  lines.push('');

  // Messages
  conversation.messages.forEach((message, index) => {
    const role = message.role === 'user' ? 'You' : 'NeX AI';
    const timestamp = message.timestamp
      ? ` (${new Date(message.timestamp).toLocaleTimeString()})`
      : '';

    lines.push(`[${role}]${timestamp}`);
    lines.push(message.content);
    lines.push('');

    if (index < conversation.messages.length - 1) {
      lines.push('-'.repeat(60));
      lines.push('');
    }
  });

  // Footer
  lines.push('');
  lines.push('-'.repeat(60));
  lines.push('Exported from NeX AI - https://ai.nexconsultingltd.com');

  return lines.join('\n');
}

/**
 * Export conversation as JSON
 */
export function exportAsJSON(conversation: Conversation): string {
  return JSON.stringify(
    {
      ...conversation,
      exportedAt: new Date().toISOString(),
      exportedFrom: 'NeX AI',
      version: '1.0',
    },
    null,
    2
  );
}

/**
 * Download a file to the user's computer
 */
export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export conversation in the specified format
 */
export function exportConversation(
  conversation: Conversation,
  format: 'markdown' | 'text' | 'json'
) {
  const timestamp = new Date().toISOString().split('T')[0];
  const sanitizedTitle = conversation.title
    .replace(/[^a-z0-9]/gi, '_')
    .toLowerCase()
    .substring(0, 50);

  let content: string;
  let filename: string;
  let mimeType: string;

  switch (format) {
    case 'markdown':
      content = exportAsMarkdown(conversation);
      filename = `${sanitizedTitle}_${timestamp}.md`;
      mimeType = 'text/markdown';
      break;

    case 'text':
      content = exportAsText(conversation);
      filename = `${sanitizedTitle}_${timestamp}.txt`;
      mimeType = 'text/plain';
      break;

    case 'json':
      content = exportAsJSON(conversation);
      filename = `${sanitizedTitle}_${timestamp}.json`;
      mimeType = 'application/json';
      break;

    default:
      throw new Error(`Unsupported format: ${format}`);
  }

  downloadFile(content, filename, mimeType);
}

/**
 * Export all conversations as a single JSON file
 */
export function exportAllConversations(conversations: Conversation[]) {
  const timestamp = new Date().toISOString().split('T')[0];
  const data = {
    exportedAt: new Date().toISOString(),
    exportedFrom: 'NeX AI',
    version: '1.0',
    totalConversations: conversations.length,
    conversations,
  };

  const content = JSON.stringify(data, null, 2);
  downloadFile(content, `nex_ai_conversations_${timestamp}.json`, 'application/json');
}
