'use client';

import React, { Component, ReactNode } from 'react';
import { ThemeConfig } from '@/lib/themes';

interface ErrorBoundaryProps {
  children: ReactNode;
  theme?: ThemeConfig;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const theme = this.props.theme;
      const defaultTheme = {
        bgSecondary: '#1f2937',
        border: '#374151',
        textPrimary: '#ffffff',
        textSecondary: '#9ca3af',
        buttonPrimary: '#22c55e',
      };

      const activeTheme = theme || defaultTheme;

      return (
        <div
          className="rounded-xl p-8 text-center"
          style={{
            background: activeTheme.bgSecondary,
            border: `2px solid ${activeTheme.border}`,
          }}
        >
          <div className="mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ef4444"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mx-auto"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>

          <h2
            className="text-2xl font-bold mb-2"
            style={{ color: activeTheme.textPrimary }}
          >
            Something went wrong
          </h2>

          <p
            className="text-sm mb-4"
            style={{ color: activeTheme.textSecondary }}
          >
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>

          <button
            onClick={this.handleReset}
            className="px-6 py-2 rounded-lg font-bold transition-all hover:scale-105"
            style={{
              background: activeTheme.buttonPrimary,
              color: '#ffffff',
            }}
          >
            Try Again
          </button>

          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details className="mt-4 text-left">
              <summary
                className="cursor-pointer text-sm font-bold mb-2"
                style={{ color: activeTheme.textSecondary }}
              >
                Error Details (Development Only)
              </summary>
              <pre
                className="text-xs p-4 rounded overflow-auto"
                style={{
                  background: '#000000',
                  color: '#22c55e',
                  maxHeight: '200px',
                }}
              >
                {this.state.error.stack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

