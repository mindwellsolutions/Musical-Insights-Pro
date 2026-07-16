'use client';

/**
 * Error boundary for chord progression builder
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ChordProgressionErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Chord Progression Builder Error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-[#1a1a1a] border border-[#333333] rounded-lg p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
            <p className="text-[#a0a0a0] mb-6">
              The Chord Progression Builder encountered an error. Please try refreshing the page.
            </p>
            {this.state.error && (
              <div className="mb-6 p-4 bg-[#2a2a2a] rounded text-left">
                <p className="text-sm text-red-400 font-mono">
                  {this.state.error.message}
                </p>
              </div>
            )}
            <Button
              onClick={this.handleReset}
              className="bg-[#3b82f6] hover:bg-[#2563eb] gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Reload Page
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

