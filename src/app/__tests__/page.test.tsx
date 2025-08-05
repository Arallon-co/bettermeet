import { render, screen } from '@testing-library/react';
import { NextUIProvider } from '@nextui-org/react';
import { ToastProvider } from '@/components/ToastProvider';
import Home from '../page';

// Mock ResponsiveLayout
jest.mock('@/components/ResponsiveLayout', () => {
  return function MockResponsiveLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return <div data-testid="responsive-layout">{children}</div>;
  };
});

// Mock other components
jest.mock('@/components/LoadingSpinner', () => {
  return function MockLoadingSpinner() {
    return <div data-testid="loading-spinner">Loading...</div>;
  };
});

jest.mock('@/components/TimezoneSelector', () => ({
  TimezoneSelector: ({ onChange }: any) => (
    <div data-testid="timezone-selector">
      <button onClick={() => onChange('America/New_York')}>
        Select Timezone
      </button>
    </div>
  ),
}));

// Wrapper component for NextUI provider
const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <NextUIProvider>
    <ToastProvider>{children}</ToastProvider>
  </NextUIProvider>
);

describe('Home', () => {
  it('renders the welcome message', () => {
    render(<Home />, { wrapper: Wrapper });

    const heading = screen.getByRole('heading', {
      name: /bettermeet/i,
    });

    expect(heading).toBeInTheDocument();
  });

  it('renders the subtitle', () => {
    render(<Home />, { wrapper: Wrapper });

    const subtitle = screen.getByText(/smart scheduling across timezones/i);

    expect(subtitle).toBeInTheDocument();
  });

  it('renders action buttons', () => {
    render(<Home />, { wrapper: Wrapper });

    const createButton = screen.getByRole('button', { name: /create poll/i });
    const learnMoreButton = screen.getByRole('button', { name: /learn more/i });

    expect(createButton).toBeInTheDocument();
    expect(learnMoreButton).toBeInTheDocument();
  });
});
