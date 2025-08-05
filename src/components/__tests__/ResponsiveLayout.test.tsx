import { render, screen } from '@testing-library/react';
import ResponsiveLayout from '../ResponsiveLayout';

// Mock next-themes
jest.mock('next-themes', () => ({
  useTheme: () => ({
    theme: 'light',
    setTheme: jest.fn(),
  }),
}));

// Mock Heroicons
jest.mock('@heroicons/react/24/outline', () => ({
  SunIcon: ({ className }: any) => (
    <svg data-testid="sun-icon" className={className} />
  ),
  MoonIcon: ({ className }: any) => (
    <svg data-testid="moon-icon" className={className} />
  ),
}));

// Mock NextUI components
jest.mock('@nextui-org/react', () => ({
  Navbar: ({ children, onMenuOpenChange, className, maxWidth }: any) => (
    <nav data-testid="navbar" className={className} data-max-width={maxWidth}>
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
  NavbarMenu: ({ children, className }: any) => (
    <div data-testid="navbar-menu" className={className}>
      {children}
    </div>
  ),
  NavbarMenuItem: ({ children }: any) => (
    <div data-testid="navbar-menu-item">{children}</div>
  ),
  NavbarMenuToggle: ({ 'aria-label': ariaLabel, className }: any) => (
    <button
      data-testid="navbar-menu-toggle"
      aria-label={ariaLabel}
      className={className}
    >
      Menu
    </button>
  ),
  Link: ({ children, href, color, className, onClick }: any) => (
    <a href={href} data-color={color} className={className} onClick={onClick}>
      {children}
    </a>
  ),
  Button: ({
    children,
    isIconOnly,
    variant,
    onPress,
    className,
    'aria-label': ariaLabel,
    ...props
  }: any) => (
    <button
      onClick={onPress}
      data-icon-only={isIconOnly}
      data-variant={variant}
      className={className}
      aria-label={ariaLabel}
      {...props}
    >
      {children}
    </button>
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
    expect(screen.getByText('Better')).toBeInTheDocument();
    expect(screen.getByText('Meet')).toBeInTheDocument();
  });

  it('hides navigation when showNavbar is false', () => {
    render(
      <ResponsiveLayout showNavbar={false}>
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

    expect(screen.getAllByText('Create Poll')).toHaveLength(2); // Desktop and mobile menu
    expect(screen.getAllByText('Features')).toHaveLength(2); // Desktop and mobile menu
  });

  it('applies responsive classes correctly', () => {
    render(
      <ResponsiveLayout>
        <div>Test Content</div>
      </ResponsiveLayout>
    );

    const main = screen.getByRole('main');
    expect(main).toHaveClass('container', 'mx-auto', 'px-4', 'py-6');
  });
});
