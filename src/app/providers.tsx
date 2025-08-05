'use client';

import { NextUIProvider } from '@nextui-org/react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { ToastProvider } from '@/components/ToastProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextUIProvider>
      <NextThemesProvider attribute="class" defaultTheme="light">
        <ToastProvider>{children}</ToastProvider>
      </NextThemesProvider>
    </NextUIProvider>
  );
}
