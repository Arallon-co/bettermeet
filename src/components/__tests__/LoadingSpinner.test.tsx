import { render, screen } from '@testing-library/react';
import LoadingSpinner, { FullScreenLoader } from '../LoadingSpinner';

// Mock NextUI Spinner component
jest.mock('@nextui-org/react', () => ({
  Spinner: ({ size, color }: any) => (
    <div data-testid="spinner" data-size={size} data-color={color} />
  ),
}));

describe('LoadingSpinner', () => {
  it('renders with default props', () => {
    render(<LoadingSpinner text="Loading..." />);

    const spinner = screen.getByTestId('spinner');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveAttribute('data-size', 'md');
    expect(spinner).toHaveAttribute('data-color', 'primary');
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders with custom props', () => {
    render(
      <LoadingSpinner
        size="lg"
        color="secondary"
        text="Please wait..."
        className="custom-class"
      />
    );

    const spinner = screen.getByTestId('spinner');
    expect(spinner).toHaveAttribute('data-size', 'lg');
    expect(spinner).toHaveAttribute('data-color', 'secondary');
    expect(screen.getByText('Please wait...')).toBeInTheDocument();
  });

  it('renders without text when text is empty', () => {
    render(<LoadingSpinner text="" />);

    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });
});

describe('FullScreenLoader', () => {
  it('renders full screen loader with default text', () => {
    render(<FullScreenLoader />);

    const container =
      screen.getByTestId('spinner').parentElement?.parentElement;
    expect(container).toHaveClass(
      'fixed',
      'inset-0',
      'flex',
      'items-center',
      'justify-center'
    );
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders with custom text', () => {
    render(<FullScreenLoader text="Saving changes..." />);

    expect(screen.getByText('Saving changes...')).toBeInTheDocument();
  });
});
