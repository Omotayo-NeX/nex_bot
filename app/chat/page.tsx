'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ChatRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to the main dashboard page
    router.replace('/');
  }, [router]);

  // Optional: Show a loading message while redirecting
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-white text-lg">Redirecting to NeX AI Dashboard...</p>
      </div>
    </div>
  );
}
