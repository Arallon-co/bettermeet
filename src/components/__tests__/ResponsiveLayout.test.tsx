import { render, screen } from '@testing-library/react';
import { ResponsiveLayout } from '../ResponsiveLayout';

// Mock HeroUI components
jest.mock('@heroui/react', () => ({
  Navbar: ({ children, isBordered }: any) => (
    <nav data-testid="navbar" data-bordered={isBordered}>
      {children}
    </nav>
  ),
  NavbarBrand: ({ children }: any) => (
    <div data-testid="navbar-brand">{children}</div>
  ),
  NavbarContent: ({ children, className, justify }: any) => (
    <div
      data-testid="navbar-content"
      className={className}
      data-justify={justify}
    >
      {children}
    </div>
  ),
  NavbarItem: ({ children, className }: any) => (
    <div data-testid="navbar-item" className={className}>
      {children}
    </div>
  ),
  Link: ({ children, href, color, className }: any) => (
    <a href={href} data-color={color} className={className}>
      {children}
    </a>
  ),
  Button: ({ children, as: Component = 'button', ...props }: any) => (
    <Component {...props}>{children}</Component>
  ),
}));

describe('ResponsiveLayout', () => {
  it('renders children correctly', () => {
    render(
      <ResponsiveLayout>
        <div>Test Content</div>
      </ResponsiveLayout>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('shows navigation by default', () => {
    render(
      <ResponsiveLayout>
        <div>Test Content</div>
      </ResponsiveLayout>
    );

    expect(screen.getByTestId('navbar')).toBeInTheDocument();
    expect(screen.getByText('BetterMeet')).toBeInTheDocument();
  });

  it('hides navigation when showNavigation is false', () => {
    render(
      <ResponsiveLayout showNavigation={false}>
        <div>Test Content</div>
      </ResponsiveLayout>
    );

    expect(screen.queryByTestId('navbar')).not.toBeInTheDocument();
  });

  it('renders navigation links correctly', () => {
    render(
      <ResponsiveLayout>
        <div>Test Content</div>
      </ResponsiveLayout>
    );

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Create Poll')).toBeInTheDocument();
    expect(screen.getByText('Get Started')).toBeInTheDocument();
  });

  it('applies responsive classes correctly', () => {
    render(
      <ResponsiveLayout>
        <div>Test Content</div>
      </ResponsiveLayout>
    );

    const main = screen.getByRole('main');
    expect(main).toHaveClass(
      'container',
      'mx-auto',
      'px-4',
      'py-6',
      'max-w-7xl'
    );
  });
});
