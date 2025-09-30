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
    debug: process.env.NODE_ENV === 'development',
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  global: {
    headers: {
      'X-Client-Info': 'nex-ai-chatbot',
    },
  },
});

// Debug logging
console.log('🔧 Supabase Client Configuration:', {
  url: supabaseUrl,
  keyPrefix: supabaseAnonKey?.substring(0, 20) + '...',
  keyLength: supabaseAnonKey?.length,
  fullKey: supabaseAnonKey, // Temporary - remove after debugging
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