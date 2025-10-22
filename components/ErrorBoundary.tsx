'use client';

import React, { Component, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './ui/Button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Reusable Error Boundary component
 * Wrap sections of your app to catch errors and show fallback UI
 *
 * @example
 * <ErrorBoundary>
 *   <SomeComponent />
 * </ErrorBoundary>
 *
 * @example
 * <ErrorBoundary fallback={<CustomErrorUI />}>
 *   <SomeComponent />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to error reporting service
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Call optional onError callback
    this.props.onError?.(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="flex items-center justify-center p-8">
          <div className="max-w-md w-full bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-red-100 rounded-full p-3">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Something went wrong
            </h3>

            <p className="text-sm text-gray-600 mb-4">
              This component encountered an error and couldn't be displayed.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mb-4 p-3 bg-white rounded-lg text-left">
                <p className="text-xs font-mono text-gray-700 break-words">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <Button
              variant="primary"
              size="sm"
              onClick={this.handleReset}
              className="flex items-center gap-2 mx-auto"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook version for functional components
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return setError;
}
