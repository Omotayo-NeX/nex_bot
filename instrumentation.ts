import { registerOTel } from '@vercel/otel';

export function register() {
  // Only register OTEL in production to avoid development console errors
  if (process.env.NODE_ENV === 'production') {
    registerOTel({ serviceName: 'ai-chatbot' });
  }
}
