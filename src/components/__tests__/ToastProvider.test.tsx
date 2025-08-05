import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useToast, ToastProvider } from '../ToastProvider';

// Mock HeroUI components
jest.mock('@heroui/react', () => ({
  Card: ({ children, className }: any) => (
    <div data-testid="toast-card" className={className}>
      {children}
    </div>
  ),
  CardBody: ({ children, className }: any) => (
    <div data-testid="toast-body" className={className}>
      {children}
    </div>
  ),
  Button: ({
    children,
    onPress,
    isIconOnly,
    size,
    variant,
    color,
    className,
  }: any) => (
    <button
      onClick={onPress}
      data-icon-only={isIconOnly}
      data-size={size}
      data-variant={variant}
      data-color={color}
      className={className}
    >
      {children}
    </button>
  ),
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  AnimatePresence: ({ children }: any) => <div>{children}</div>,
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

// Test component that uses the toast hook
function TestComponent() {
  const { success, error, warning, info, addToast } = useToast();

  return (
    <div>
      <button onClick={() => success('Success message')}>Success</button>
      <button onClick={() => error('Error message')}>Error</button>
      <button onClick={() => warning('Warning message')}>Warning</button>
      <button onClick={() => info('Info message')}>Info</button>
      <button
        onClick={() =>
          addToast({
            type: 'success',
            message: 'Custom toast',
            title: 'Custom Title',
            action: {
              label: 'Action',
              onAction: () => console.log('Action clicked'),
            },
          })
        }
      >
        Custom Toast
      </button>
    </div>
  );
}

describe('ToastProvider', () => {
  it('throws error when useToast is used outside provider', () => {
    // Suppress console.error for this test
    const originalError = console.error;
    console.error = jest.fn();

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useToast must be used within a ToastProvider');

    console.error = originalError;
  });

  it('renders success toast', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('Success'));

    expect(screen.getByText('Success message')).toBeInTheDocument();
    expect(screen.getByText('✅')).toBeInTheDocument();
  });

  it('renders error toast', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('Error'));

    expect(screen.getByText('Error message')).toBeInTheDocument();
    expect(screen.getByText('❌')).toBeInTheDocument();
  });

  it('renders warning toast', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('Warning'));

    expect(screen.getByText('Warning message')).toBeInTheDocument();
    expect(screen.getByText('⚠️')).toBeInTheDocument();
  });

  it('renders info toast', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('Info'));

    expect(screen.getByText('Info message')).toBeInTheDocument();
    expect(screen.getByText('ℹ️')).toBeInTheDocument();
  });

  it('renders custom toast with title and action', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('Custom Toast'));

    expect(screen.getByText('Custom Title')).toBeInTheDocument();
    expect(screen.getByText('Custom toast')).toBeInTheDocument();

    const actionButton = screen.getByText('Action');
    expect(actionButton).toBeInTheDocument();

    fireEvent.click(actionButton);
    expect(consoleSpy).toHaveBeenCalledWith('Action clicked');

    consoleSpy.mockRestore();
  });

  it('removes toast when close button is clicked', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('Success'));
    expect(screen.getByText('Success message')).toBeInTheDocument();

    const closeButton = screen.getByText('×');
    fireEvent.click(closeButton);

    expect(screen.queryByText('Success message')).not.toBeInTheDocument();
  });

  it('auto-removes toast after duration', async () => {
    // Mock timers
    jest.useFakeTimers();

    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('Success'));
    expect(screen.getByText('Success message')).toBeInTheDocument();

    // Fast-forward time
    jest.advanceTimersByTime(5000);

    await waitFor(() => {
      expect(screen.queryByText('Success message')).not.toBeInTheDocument();
    });

    jest.useRealTimers();
  });
});
