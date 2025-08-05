'use client';

import React from 'react';
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenu,
  NavbarMenuToggle,
  NavbarMenuItem,
  Button,
  Link,
} from '@nextui-org/react';
import { useTheme } from 'next-themes';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  showNavbar?: boolean;
}

export default function ResponsiveLayout({
  children,
  showNavbar = true,
}: ResponsiveLayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const { theme, setTheme } = useTheme();

  const menuItems = [
    { name: 'Create Poll', href: '/create' },
    { name: 'About', href: '/about' },
  ];

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <div className="min-h-screen bg-background">
      {showNavbar && (
        <Navbar
          onMenuOpenChange={setIsMenuOpen}
          className="border-b border-divider bg-background/80 backdrop-blur-md"
          maxWidth="xl"
        >
          <NavbarContent>
            <NavbarMenuToggle
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              className="sm:hidden"
            />
            <NavbarBrand>
              <Link href="/" className="font-bold text-inherit">
                <span className="text-primary-600">Better</span>Meet
              </Link>
            </NavbarBrand>
          </NavbarContent>

          <NavbarContent className="hidden sm:flex gap-4" justify="center">
            {menuItems.map((item) => (
              <NavbarItem key={item.name}>
                <Link
                  color="foreground"
                  href={item.href}
                  className="font-medium hover:text-primary-600 transition-colors"
                >
                  {item.name}
                </Link>
              </NavbarItem>
            ))}
          </NavbarContent>

          <NavbarContent justify="end">
            <NavbarItem>
              <Button
                isIconOnly
                variant="light"
                onPress={toggleTheme}
                className="min-h-[44px] min-w-[44px]"
                aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              >
                {theme === 'light' ? (
                  <MoonIcon className="h-5 w-5" />
                ) : (
                  <SunIcon className="h-5 w-5" />
                )}
              </Button>
            </NavbarItem>
          </NavbarContent>

          <NavbarMenu className="pt-6">
            {menuItems.map((item) => (
              <NavbarMenuItem key={item.name}>
                <Link
                  color="foreground"
                  href={item.href}
                  className="w-full py-3 px-4 text-lg font-medium hover:text-primary-600 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              </NavbarMenuItem>
            ))}
          </NavbarMenu>
        </Navbar>
      )}

      <main className="container mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-12">
        <div className="max-w-4xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
