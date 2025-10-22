import { z } from 'zod';

export const chatMessageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string().min(1, 'Message content is required'),
  images: z.array(z.string().url()).optional(),
});

export const chatRequestSchema = z.object({
  message: z.string().min(1, 'Message is required').max(10000, 'Message too long').optional(),
  messages: z.array(chatMessageSchema).optional(),
  model: z.string().optional(),
  temperature: z.number().min(0).max(2).optional(),
}).refine(data => data.message || (data.messages && data.messages.length > 0), {
  message: 'Either message or messages array is required',
});

export type ChatRequest = z.infer<typeof chatRequestSchema>;
export type ChatMessage = z.infer<typeof chatMessageSchema>;
