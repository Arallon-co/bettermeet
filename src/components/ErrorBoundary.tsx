'use client';

import React from 'react';
import { Card, CardBody, CardHeader, Button, Chip } from '@nextui-org/react';
import {
  ExclamationTriangleIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
}

export default class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return (
          <FallbackComponent
            error={this.state.error!}
            resetError={this.resetError}
          />
        );
      }

      return (
        <DefaultErrorFallback
          error={this.state.error!}
          resetError={this.resetError}
        />
      );
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
}

function DefaultErrorFallback({ error, resetError }: ErrorFallbackProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="flex flex-col items-center space-y-2 pb-4">
          <div className="w-16 h-16 bg-danger-50 rounded-full flex items-center justify-center">
            <ExclamationTriangleIcon className="w-8 h-8 text-danger-600" />
          </div>
          <h1 className="text-xl font-semibold text-foreground">
            Something went wrong
          </h1>
          <Chip color="danger" variant="flat" size="sm">
            Error
          </Chip>
        </CardHeader>

        <CardBody className="space-y-4">
          <p className="text-sm text-foreground-600 text-center">
            We encountered an unexpected error. Please try again or contact
            support if the problem persists.
          </p>

          {process.env.NODE_ENV === 'development' && (
            <details className="text-xs">
              <summary className="cursor-pointer text-foreground-500 hover:text-foreground-700 mb-2">
                Error Details (Development)
              </summary>
              <pre className="bg-foreground-50 p-3 rounded-lg overflow-auto text-foreground-600">
                {error.message}
                {error.stack && `\n\n${error.stack}`}
              </pre>
            </details>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              color="primary"
              variant="solid"
              onPress={resetError}
              startContent={<ArrowPathIcon className="w-4 h-4" />}
              className="flex-1 min-h-[44px]"
            >
              Try Again
            </Button>

            <Button
              color="default"
              variant="bordered"
              onPress={() => (window.location.href = '/')}
              className="flex-1 min-h-[44px]"
            >
              Go Home
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

// Hook for functional components to handle errors
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null);

  const handleError = React.useCallback((error: Error) => {
    console.error('Error caught by useErrorHandler:', error);
    setError(error);
  }, []);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  return { error, handleError, resetError };
}

// Error display component for functional components
export function ErrorDisplay({
  error,
  onRetry,
  onReset,
}: {
  error: Error;
  onRetry?: () => void;
  onReset?: () => void;
}) {
  return (
    <Card className="w-full">
      <CardBody className="text-center space-y-4">
        <div className="w-12 h-12 bg-danger-50 rounded-full flex items-center justify-center mx-auto">
          <ExclamationTriangleIcon className="w-6 h-6 text-danger-600" />
        </div>

        <div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            An error occurred
          </h3>
          <p className="text-sm text-foreground-600">
            {error.message || 'Something went wrong. Please try again.'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          {onRetry && (
            <Button
              color="primary"
              variant="solid"
              onPress={onRetry}
              startContent={<ArrowPathIcon className="w-4 h-4" />}
              className="flex-1 min-h-[44px]"
            >
              Retry
            </Button>
          )}

          {onReset && (
            <Button
              color="default"
              variant="bordered"
              onPress={onReset}
              className="flex-1 min-h-[44px]"
            >
              Reset
            </Button>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
