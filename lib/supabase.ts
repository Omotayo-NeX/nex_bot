import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
}

if (!supabaseAnonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable');
}

// Validate key format (JWT tokens start with eyJ)
if (!supabaseAnonKey.startsWith('eyJ')) {
  console.warn('Warning: SUPABASE_ANON_KEY should be a JWT token starting with eyJ');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    debug: false, // Disable debug to reduce console noise
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce', // Use PKCE flow for better security
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  },
  global: {
    headers: {
      'X-Client-Info': 'nex-ai-chatbot',
    },
  },
});

// Suppress console errors for "Invalid Refresh Token: Already Used"
if (typeof window !== 'undefined') {
  const originalConsoleError = console.error;
  console.error = (...args: any[]) => {
    const errorMessage = args[0]?.message || args[0] || '';
    // Suppress specific Supabase token refresh errors that are handled by onAuthStateChange
    if (
      typeof errorMessage === 'string' &&
      (errorMessage.includes('Invalid Refresh Token: Already Used') ||
       errorMessage.includes('refresh_token_not_found'))
    ) {
      // Silently ignore these errors as they're handled in AuthContext
      return;
    }
    originalConsoleError.apply(console, args);
  };
}

// Debug logging
console.log('🔧 Supabase Client Configuration:', {
  url: supabaseUrl,
  keyPrefix: supabaseAnonKey?.substring(0, 20) + '...',
  keyLength: supabaseAnonKey?.length,
});

// Server-side client with service role key
export const supabaseAdmin = supabaseServiceRoleKey
  ? createClient(
      supabaseUrl,
      supabaseServiceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
  : null; // Return null if service role key is not provided