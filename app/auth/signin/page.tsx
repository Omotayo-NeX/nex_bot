'use client';

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/contexts/AuthContext";

function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  useEffect(() => {
    // If user is already signed in, redirect to intended destination
    if (user) {
      const redirectUrl = searchParams.get('redirect') || '/chat';
      router.push(redirectUrl);
    }

    // Check for success messages in URL params
    if (searchParams.get('verified') === 'true') {
      setError('');  // Clear any existing errors
      setSuccess('Email verified successfully! You can now sign in.');
    } else if (searchParams.get('message') === 'password_reset_success') {
      setError('');  // Clear any existing errors
      setSuccess('Password updated successfully! You can now sign in with your new password.');
    }
  }, [user, router, searchParams]);

  const handleCredentialsSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Call the Supabase signin API route
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to sign in');
        setLoading(false);
        return;
      }

      // Set the session in Supabase client
      if (data.session) {
        await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });

        // Redirect after successful sign-in
        const redirectUrl = searchParams.get('redirect') || '/chat';
        router.push(redirectUrl);
      }
    } catch (err: any) {
      console.error('Sign in error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const redirectUrl = searchParams.get('redirect') || '/chat';
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirectUrl)}`,
        },
      });

      if (error) {
        setError(error.message);
      }
    } catch (err: any) {
      console.error('Google sign in error:', err);
      setError('Failed to sign in with Google. Please try again.');
    }
  };

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
            Welcome back
          </h2>
          <p className="mt-2 text-gray-400">
            Sign in to your NeX AI account
          </p>
        </div>

        {/* Sign In Form */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-8 shadow-2xl">
          <form onSubmit={handleCredentialsSignIn} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-900/50 border border-red-600/50 rounded-lg text-red-200 text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 bg-green-900/50 border border-green-600/50 rounded-lg text-green-200 text-sm">
                {success}
              </div>
            )}

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
                placeholder="Enter your email"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-blue-400 hover:text-blue-300 transition-colors duration-200"
                >
                  Forgot password?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg hover:shadow-blue-500/25"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-grow border-t border-gray-600"></div>
            <span className="px-4 text-gray-400 text-sm">Or continue with</span>
            <div className="flex-grow border-t border-gray-600"></div>
          </div>

          {/* Google Sign In */}
          <button
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-900 font-medium py-3 px-6 rounded-xl transition-all duration-200 hover:scale-105 shadow-lg"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign in with Google
          </button>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Don't have an account?{" "}
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
    </div>
  );
}

export default function SignIn() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black flex items-center justify-center text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading...</p>
        </div>
      </div>
    }>
      <SignInForm />
    </Suspense>
  );
}
