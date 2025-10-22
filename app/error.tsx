'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-nex-navy via-nex-navy-light to-nex-navy flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
        {/* Error Icon */}
        <div className="flex justify-center mb-6">
          <div className="bg-red-100 rounded-full p-4">
            <AlertCircle className="w-12 h-12 text-red-500" />
          </div>
        </div>

        {/* Error Title */}
        <h1 className="text-2xl font-heading font-bold text-nex-navy mb-3">
          Oops! Something went wrong
        </h1>

        {/* Error Message */}
        <p className="text-gray-600 mb-6">
          We encountered an unexpected error. Don't worry, this has been logged and we'll look into it.
        </p>

        {/* Error Details (Dev Mode) */}
        {process.env.NODE_ENV === 'development' && error.message && (
          <div className="mb-6 p-4 bg-gray-100 rounded-lg text-left">
            <p className="text-xs font-mono text-gray-700 break-words">
              {error.message}
            </p>
            {error.digest && (
              <p className="text-xs text-gray-500 mt-2">
                Error ID: {error.digest}
              </p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 justify-center">
          <Button
            variant="primary"
            onClick={reset}
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>
          <Button
            variant="secondary"
            onClick={() => (window.location.href = '/')}
            className="flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            Go Home
          </Button>
        </div>

        {/* Help Text */}
        <p className="text-sm text-gray-500 mt-6">
          If this problem persists, please{' '}
          <a
            href="mailto:nexconsultingltd@gmail.com"
            className="text-nex-yellow hover:underline"
          >
            contact support
          </a>
        </p>
      </div>
    </div>
  );
}
