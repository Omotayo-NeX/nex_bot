'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('❌ Error getting session:', error);
          // If session retrieval fails, clear any stale auth state
          if (error.message?.includes('session_missing') || error.message?.includes('Auth session missing')) {
            console.log('🔄 Clearing stale auth state...');
            await supabase.auth.signOut();
            setSession(null);
            setUser(null);
          }
        } else {
          setSession(session);
          setUser(session?.user ?? null);
          if (session) {
            console.log('✅ Session loaded:', session.user?.email);
          } else {
            console.log('ℹ️ No active session found');
          }
        }
      } catch (error: any) {
        console.error('❌ Error in getInitialSession:', error);
        // Clear auth state on error
        setSession(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state changed:', event, session?.user?.email, 'pathname:', pathname);

        // Handle token refresh events
        if (event === 'TOKEN_REFRESHED') {
          console.log('🔄 Token refreshed successfully');
        }

        // Note: TOKEN_REFRESH_FAILED is not a standard Supabase auth event
        // Session will be null automatically on auth errors

        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Handle sign in - redirect to chat only from auth pages
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('✅ Sign in detected, pathname:', pathname);
          // Only redirect from auth pages or home page, not from other app pages
          if (pathname === '/' || pathname.startsWith('/auth/')) {
            console.log('🚀 Redirecting to chat after sign in from:', pathname);
            router.push('/chat');
          } else {
            console.log('🔄 Already on correct page, no redirect needed');
          }
        }

        // Handle sign out - redirect to home
        if (event === 'SIGNED_OUT') {
          console.log('🚪 Sign out detected');
          setUser(null);
          setSession(null);
          if (pathname.startsWith('/chat')) {
            console.log('🚪 Redirecting to home after sign out');
            router.push('/');
          }
        }
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
      }
    } catch (error) {
      console.error('Error in signOut:', error);
    }
  };

  const value = {
    user,
    session,
    loading,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}