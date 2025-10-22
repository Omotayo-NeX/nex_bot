'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { AlertTriangle } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to error reporting service
    console.error('Global application error:', error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-red-900 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
            {/* Error Icon */}
            <div className="flex justify-center mb-6">
              <div className="bg-red-100 rounded-full p-4">
                <AlertTriangle className="w-12 h-12 text-red-500" />
              </div>
            </div>

            {/* Error Title */}
            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              Critical Error
            </h1>

            {/* Error Message */}
            <p className="text-gray-600 mb-6">
              We encountered a critical error that prevented the application from loading.
              Our team has been notified.
            </p>

            {/* Error Details (Dev Mode) */}
            {process.env.NODE_ENV === 'development' && error.message && (
              <div className="mb-6 p-4 bg-gray-100 rounded-lg text-left">
                <p className="text-xs font-mono text-gray-700 break-words">
                  {error.message}
                </p>
                {error.stack && (
                  <details className="mt-2">
                    <summary className="text-xs text-gray-500 cursor-pointer">
                      Stack trace
                    </summary>
                    <pre className="text-xs text-gray-600 mt-2 overflow-x-auto">
                      {error.stack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 justify-center">
              <Button
                onClick={reset}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                Try Again
              </Button>
              <Button
                onClick={() => (window.location.href = '/')}
                className="bg-gray-500 hover:bg-gray-600 text-white"
              >
                Reload App
              </Button>
            </div>

            {/* Help Text */}
            <p className="text-sm text-gray-500 mt-6">
              If this problem persists, please contact{' '}
              <a
                href="mailto:nexconsultingltd@gmail.com"
                className="text-red-600 hover:underline"
              >
                nexconsultingltd@gmail.com
              </a>
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}
