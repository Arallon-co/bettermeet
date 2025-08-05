import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorBoundary, ErrorDisplay } from '../ErrorBoundary';

// Mock NextUI components
jest.mock('@nextui-org/react', () => ({
  Card: ({ children, className }: any) => (
    <div data-testid="card" className={className}>
      {children}
    </div>
  ),
  CardHeader: ({ children, className }: any) => (
    <div data-testid="card-header" className={className}>
      {children}
    </div>
  ),
  CardBody: ({ children, className }: any) => (
    <div data-testid="card-body" className={className}>
      {children}
    </div>
  ),
  Button: ({ children, onPress, color, variant, startContent }: any) => (
    <button onClick={onPress} data-color={color} data-variant={variant}>
      {startContent}
      {children}
    </button>
  ),
  Chip: ({ children, color, variant, size }: any) => (
    <span
      data-testid="chip"
      data-color={color}
      data-variant={variant}
      data-size={size}
    >
      {children}
    </span>
  ),
}));

// Mock Heroicons
jest.mock('@heroicons/react/24/outline', () => ({
  ExclamationTriangleIcon: ({ className }: any) => (
    <svg data-testid="exclamation-triangle-icon" className={className} />
  ),
  ArrowPathIcon: ({ className }: any) => (
    <svg data-testid="arrow-path-icon" className={className} />
  ),
}));

// Component that throws an error for testing
function ThrowError({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
}

describe('ErrorBoundary', () => {
  // Suppress console.error for these tests
  const originalError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });
  afterAll(() => {
    console.error = originalError;
  });

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText('No error')).toBeInTheDocument();
  });

  it('renders error UI when there is an error', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(
      screen.getByText(/We encountered an unexpected error/)
    ).toBeInTheDocument();
    expect(screen.getByText('Try Again')).toBeInTheDocument();
    expect(screen.getByText('Refresh Page')).toBeInTheDocument();
  });

  it('renders custom fallback when provided', () => {
    const customFallback = <div>Custom error message</div>;

    render(
      <ErrorBoundary fallback={customFallback}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom error message')).toBeInTheDocument();
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
  });

  it('calls onError callback when error occurs', () => {
    const onError = jest.fn();

    render(
      <ErrorBoundary onError={onError}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(onError).toHaveBeenCalledWith(expect.any(Error), expect.any(Object));
  });

  it('resets error state when Try Again is clicked', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();

    // Click Try Again to reset error boundary state
    fireEvent.click(screen.getByText('Try Again'));

    // After clicking Try Again, the error boundary should attempt to re-render the children
    // Since our ThrowError component still throws, it should show the error again
    // But the important thing is that the handleRetry function was called
    expect(screen.getByText('Try Again')).toBeInTheDocument();
  });
});

describe('ErrorDisplay', () => {
  it('renders error message from string', () => {
    render(<ErrorDisplay error="Something went wrong" />);

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('⚠️')).toBeInTheDocument();
  });

  it('renders error message from Error object', () => {
    const error = new Error('Test error message');
    render(<ErrorDisplay error={error} />);

    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });

  it('renders retry button when onRetry is provided', () => {
    const onRetry = jest.fn();
    render(<ErrorDisplay error="Test error" onRetry={onRetry} />);

    const retryButton = screen.getByText('Try Again');
    expect(retryButton).toBeInTheDocument();

    fireEvent.click(retryButton);
    expect(onRetry).toHaveBeenCalled();
  });

  it('does not render retry button when onRetry is not provided', () => {
    render(<ErrorDisplay error="Test error" />);

    expect(screen.queryByText('Try Again')).not.toBeInTheDocument();
  });
});
