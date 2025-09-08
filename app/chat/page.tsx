'use client';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ChatPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  useEffect(() => {
    if (status === 'loading') return; // Still loading
    
    if (!session) {
      // Not authenticated, redirect to signin
      router.replace('/auth/signin');
      return;
    }
    
    // User is authenticated, redirect to main dashboard
    router.replace('/');
  }, [session, status, router]);

  // Show loading while checking session or redirecting
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-white text-lg">
          {status === 'loading' ? 'Loading...' : 'Welcome! Redirecting to NeX AI Dashboard...'}
        </p>
      </div>
    </div>
  );
}
