'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'sonner';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!email.trim()) {
      toast.error('Please enter your email address');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        setEmailSent(true);
        toast.success('Password reset email sent! Check your inbox');
      } else if (response.status === 429) {
        toast.error('Too many requests. Please wait before trying again');
      } else {
        toast.error(data.error || 'Failed to send password reset email');
      }
    } catch (error) {
      toast.error('Network error. Please try again');
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black flex flex-col items-center justify-center text-white p-4">
        <div className="max-w-md w-full space-y-8">
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
              Check your email
            </h2>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-8 shadow-2xl text-center space-y-6">
            <div className="mx-auto w-16 h-16 bg-green-600/20 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-white">
                Reset link sent!
              </h3>
              
              <p className="text-gray-300 leading-relaxed">
                We've sent a password reset link to{' '}
                <span className="font-medium text-blue-400">{email}</span>.
                Follow the instructions in the email to reset your password.
              </p>

              <div className="bg-yellow-900/30 border border-yellow-600/30 rounded-lg p-4 text-sm text-yellow-200">
                <p className="font-medium mb-1">⏰ Link expires in 1 hour</p>
                <p>If you don't see the email, check your spam folder. The reset link will redirect to your account.</p>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => {
                  setEmailSent(false);
                  setEmail('');
                }}
                className="w-full bg-gray-700/50 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 hover:scale-105"
              >
                Send another email
              </button>

              <Link 
                href="/auth/signin"
                className="block w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 hover:scale-105 text-center shadow-lg hover:shadow-blue-500/25"
              >
                Back to sign in
              </Link>
            </div>
          </div>
        </div>
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
            Reset your password
          </h2>
          <p className="mt-2 text-gray-400">
            Enter your email to receive a reset link
          </p>
        </div>

        {/* Reset Form */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter your email address"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg hover:shadow-blue-500/25"
            >
              {loading ? 'Sending reset link...' : 'Send reset link'}
            </button>
          </form>

          {/* Navigation Links */}
          <div className="mt-6 space-y-4">
            <div className="text-center">
              <Link 
                href="/auth/signin"
                className="text-gray-400 hover:text-gray-300 font-medium transition-colors duration-200"
              >
                ← Back to sign in
              </Link>
            </div>
            
            <div className="text-center">
              <p className="text-gray-400">
                Don't have an account?{' '}
                <Link 
                  href="/auth/signup" 
                  className="text-blue-400 hover:text-blue-300 font-medium transition-colors duration-200"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4 text-sm text-blue-200">
          <div className="flex items-start space-x-3">
            <svg className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-medium mb-1">Security Notice</p>
              <p>For your security, password reset links expire after 1 hour. If you don't receive the email within a few minutes, please check your spam folder.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}