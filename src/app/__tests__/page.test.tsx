import { render, screen } from '@testing-library/react';
import { HeroUIProvider } from '@heroui/react';
import Home from '../page';

// Wrapper component for HeroUI provider
const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <HeroUIProvider>{children}</HeroUIProvider>
);

describe('Home', () => {
  it('renders the welcome message', () => {
    render(<Home />, { wrapper: Wrapper });

    const heading = screen.getByRole('heading', {
      name: /welcome to bettermeet/i,
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
    const joinButton = screen.getByRole('button', { name: /join poll/i });

    expect(createButton).toBeInTheDocument();
    expect(joinButton).toBeInTheDocument();
  });
});
