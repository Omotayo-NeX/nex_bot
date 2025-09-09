'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

function ResetPasswordContent() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Extract access_token and refresh_token from URL fragment or search params
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const urlParams = new URLSearchParams(window.location.search);
    
    const accessTokenFromHash = hashParams.get('access_token');
    const refreshTokenFromHash = hashParams.get('refresh_token');
    const accessTokenFromParams = urlParams.get('access_token');
    const refreshTokenFromParams = urlParams.get('refresh_token');
    
    const token = accessTokenFromHash || accessTokenFromParams;
    const refresh = refreshTokenFromHash || refreshTokenFromParams;
    
    if (token && refresh) {
      setAccessToken(token);
      setRefreshToken(refresh);
    } else {
      toast.error('Invalid or expired reset link');
      router.push('/forgot-password');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validation
    if (!password.trim()) {
      toast.error('Please enter a new password');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      setLoading(false);
      return;
    }

    if (!accessToken || !refreshToken) {
      toast.error('Invalid reset session. Please request a new reset link');
      setLoading(false);
      return;
    }

    try {
      // Set the session with the tokens from the reset link
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      if (sessionError) {
        console.error('Invalid or expired reset session:', sessionError);
        toast.error('Invalid or expired reset link. Please request a new one.');
        setLoading(false);
        return;
      }

      // Update the password using Supabase
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      });

      if (updateError) {
        console.error('Password update error:', updateError);
        toast.error(updateError.message || 'Failed to update password');
      } else {
        toast.success('Password updated successfully! Redirecting to sign in...');
        setTimeout(() => {
          router.push('/auth/signin?message=password_reset_success');
        }, 2000);
      }
    } catch (error) {
      console.error('Reset password error:', error);
      toast.error('Network error. Please try again');
    } finally {
      setLoading(false);
    }
  };

  if (!accessToken || !refreshToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p>Validating reset link...</p>
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
            Set new password
          </h2>
          <p className="mt-2 text-gray-400">
            Enter your new password below
          </p>
        </div>

        {/* Reset Form */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                New password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter new password (min. 6 characters)"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                Confirm new password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Confirm your new password"
              />
            </div>

            {/* Password Requirements */}
            <div className="bg-gray-700/30 border border-gray-600/30 rounded-lg p-4 text-sm text-gray-300">
              <p className="font-medium mb-2">Password requirements:</p>
              <ul className="space-y-1 text-xs">
                <li className={`flex items-center space-x-2 ${password.length >= 6 ? 'text-green-400' : 'text-gray-400'}`}>
                  <span>{password.length >= 6 ? '✓' : '○'}</span>
                  <span>At least 6 characters</span>
                </li>
                <li className={`flex items-center space-x-2 ${password === confirmPassword && password ? 'text-green-400' : 'text-gray-400'}`}>
                  <span>{password === confirmPassword && password ? '✓' : '○'}</span>
                  <span>Passwords match</span>
                </li>
              </ul>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg hover:shadow-green-500/25"
            >
              {loading ? 'Updating password...' : 'Update password'}
            </button>
          </form>

          {/* Navigation Links */}
          <div className="mt-6 text-center">
            <Link 
              href="/auth/signin"
              className="text-gray-400 hover:text-gray-300 font-medium transition-colors duration-200"
            >
              ← Back to sign in
            </Link>
          </div>
        </div>

        {/* Security Notice */}
        <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-4 text-sm text-yellow-200">
          <div className="flex items-start space-x-3">
            <svg className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-medium mb-1">Secure Password Reset</p>
              <p>This reset link can only be used once and will expire soon. Make sure to choose a strong, unique password.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPassword() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}