'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'sonner';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const [resending, setResending] = useState(false);
  
  const error = searchParams.get('error');

  useEffect(() => {
    // Show error messages from URL params
    if (error === 'email_not_verified') {
      toast.error('Please verify your email before signing in');
    } else if (error === 'verification_failed') {
      toast.error('Email verification failed. Please try again');
    } else if (error === 'no_code') {
      toast.error('Invalid verification link');
    }

    // If user is already verified, redirect them
    if (session?.user?.emailVerified) {
      router.push('/chat');
    }
  }, [error, session, router]);

  const handleResendVerification = async () => {
    if (!session?.user?.email) {
      toast.error('No email found for resending verification');
      return;
    }

    setResending(true);
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: session.user.email }),
      });

      const data = await response.json();
      
      if (response.ok) {
        toast.success('Verification email sent! Please check your inbox');
      } else {
        toast.error(data.error || 'Failed to resend verification email');
      }
    } catch (error) {
      toast.error('Network error. Please try again');
    } finally {
      setResending(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black flex flex-col items-center justify-center text-white p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Logo and Header */}
        <div className="text-center">
          <div className="mx-auto w-20 h-20 relative mb-6">
            <Image 
              src="/Nex_logomark_white.png" 
              alt="NeX Logo" 
              fill
              className="object-contain"
            />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Verify your email
          </h2>
          <p className="mt-2 text-gray-400">
            Complete your account setup
          </p>
        </div>

        {/* Verification Instructions */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-8 shadow-2xl">
          <div className="text-center space-y-6">
            {/* Email Icon */}
            <div className="mx-auto w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-white">
                Check your email inbox
              </h3>
              
              <p className="text-gray-300 leading-relaxed">
                We've sent a verification link to{' '}
                <span className="font-medium text-blue-400">
                  {session?.user?.email || 'your email address'}
                </span>
                . Click the link in the email to verify your account before logging in.
              </p>

              <div className="bg-blue-900/30 border border-blue-600/30 rounded-lg p-4 text-sm text-blue-200">
                <p className="font-medium mb-1">📧 Email not arriving?</p>
                <p>Check your spam folder or click the button below to resend.</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleResendVerification}
                disabled={resending || !session?.user?.email}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg hover:shadow-blue-500/25"
              >
                {resending ? 'Sending...' : 'Resend verification email'}
              </button>

              <Link 
                href="/auth/signin"
                className="block w-full bg-gray-700/50 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 hover:scale-105 text-center"
              >
                Back to sign in
              </Link>
            </div>
          </div>
        </div>

        {/* Help Text */}
        <div className="text-center text-sm text-gray-500">
          <p>
            Still having trouble? Contact our{' '}
            <Link href="/support" className="text-blue-400 hover:text-blue-300 transition-colors">
              support team
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmail() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}