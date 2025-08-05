import { render, screen } from '@testing-library/react';
import { LoadingSpinner, FullPageLoadingSpinner } from '../LoadingSpinner';

// Mock HeroUI Spinner component
jest.mock('@heroui/react', () => ({
  Spinner: ({ size, color }: any) => (
    <div data-testid="spinner" data-size={size} data-color={color} />
  ),
}));

describe('LoadingSpinner', () => {
  it('renders with default props', () => {
    render(<LoadingSpinner />);

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
        label="Please wait..."
        className="custom-class"
      />
    );

    const spinner = screen.getByTestId('spinner');
    expect(spinner).toHaveAttribute('data-size', 'lg');
    expect(spinner).toHaveAttribute('data-color', 'secondary');
    expect(screen.getByText('Please wait...')).toBeInTheDocument();
  });

  it('renders without label when label is empty', () => {
    render(<LoadingSpinner label="" />);

    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });
});

describe('FullPageLoadingSpinner', () => {
  it('renders full page spinner with default label', () => {
    render(<FullPageLoadingSpinner />);

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

  it('renders with custom label', () => {
    render(<FullPageLoadingSpinner label="Saving changes..." />);

    expect(screen.getByText('Saving changes...')).toBeInTheDocument();
  });
});
