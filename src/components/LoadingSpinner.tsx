'use client';

import React from 'react';
import { Spinner } from '@nextui-org/react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'white';
  text?: string;
  className?: string;
}

export default function LoadingSpinner({
  size = 'md',
  color = 'primary',
  text,
  className = '',
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const colorClasses = {
    primary: 'text-primary-600',
    secondary: 'text-gray-600',
    white: 'text-white',
  };

  return (
    <div
      className={`flex flex-col items-center justify-center space-y-4 ${className}`}
    >
      <Spinner
        size={size}
        color={color}
        className={`${sizeClasses[size]} ${colorClasses[color]}`}
        aria-label="Loading"
      />
      {text && (
        <p className={`text-sm font-medium ${colorClasses[color]} text-center`}>
          {text}
        </p>
      )}
    </div>
  );
}

// Full screen loading component for mobile
export function FullScreenLoader({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="flex flex-col items-center space-y-4 p-6">
        <Spinner
          size="lg"
          color="primary"
          className="w-16 h-16 text-primary-600"
          aria-label="Loading"
        />
        <p className="text-lg font-medium text-foreground text-center max-w-xs">
          {text}
        </p>
      </div>
    </div>
  );
}

// Inline loading component for buttons and small areas
export function InlineLoader({ size = 'sm' }: { size?: 'sm' | 'md' }) {
  return (
    <Spinner
      size={size}
      color="current"
      className="animate-spin"
      aria-label="Loading"
    />
  );
}
