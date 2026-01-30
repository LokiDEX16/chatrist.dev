'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    showDetails: false,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // Call optional error handler
    this.props.onError?.(error, errorInfo);

    // In production, you would send this to an error tracking service
    // e.g., Sentry, LogRocket, etc.
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    });
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    // Try to redirect to user's dashboard, fallback to /dashboard for middleware redirect
    window.location.href = '/dashboard';
  };

  private toggleDetails = () => {
    this.setState((prev) => ({ showDetails: !prev.showDetails }));
  };

  public render() {
    if (this.state.hasError) {
      // Custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-[400px] flex items-center justify-center p-4">
          <Card className="w-full max-w-lg">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle className="text-xl">Something went wrong</CardTitle>
              <CardDescription>
                We're sorry, but something unexpected happened. Please try again.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
                <Button onClick={this.handleReset} variant="default">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
                <Button onClick={this.handleReload} variant="outline">
                  Reload Page
                </Button>
                <Button onClick={this.handleGoHome} variant="ghost">
                  <Home className="mr-2 h-4 w-4" />
                  Go Home
                </Button>
              </div>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="mt-4">
                  <button
                    onClick={this.toggleDetails}
                    className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                  >
                    {this.state.showDetails ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                    {this.state.showDetails ? 'Hide' : 'Show'} error details
                  </button>

                  {this.state.showDetails && (
                    <div className="mt-2 rounded-md bg-muted p-4 text-sm">
                      <p className="font-semibold text-red-600">
                        {this.state.error.name}: {this.state.error.message}
                      </p>
                      {this.state.errorInfo && (
                        <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap text-xs text-muted-foreground">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      )}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Higher-order component to wrap a component with ErrorBoundary
 */
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  fallback?: ReactNode
) {
  return function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    );
  };
}

/**
 * Async error boundary for handling async errors in client components
 */
interface AsyncErrorBoundaryProps {
  children: ReactNode;
  error?: Error | null;
  reset?: () => void;
}

export function AsyncErrorBoundary({ children, error, reset }: AsyncErrorBoundaryProps) {
  if (error) {
    return (
      <div className="min-h-[200px] flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <CardTitle className="text-lg">Error loading data</CardTitle>
            <CardDescription>{error.message || 'An unexpected error occurred'}</CardDescription>
          </CardHeader>
          <CardContent>
            {reset && (
              <Button onClick={reset} className="w-full">
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}

/**
 * Loading fallback component
 */
interface LoadingFallbackProps {
  message?: string;
}

export function LoadingFallback({ message = 'Loading...' }: LoadingFallbackProps) {
  return (
    <div className="min-h-[200px] flex items-center justify-center p-4">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]" />
        <p className="mt-2 text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}

/**
 * Empty state component
 */
interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="min-h-[200px] flex items-center justify-center p-4">
      <div className="text-center">
        {icon && <div className="mx-auto mb-4">{icon}</div>}
        <h3 className="text-lg font-medium">{title}</h3>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
        {action && <div className="mt-4">{action}</div>}
      </div>
    </div>
  );
}
