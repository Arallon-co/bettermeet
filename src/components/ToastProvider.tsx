'use client';

import React, { createContext, useContext, useCallback } from 'react';

interface ToastContextType {
  showToast: (
    message: string,
    type?: 'success' | 'error' | 'warning' | 'info'
  ) => void;
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showWarning: (message: string) => void;
  showInfo: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

interface ToastProviderProps {
  children: React.ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const showToast = useCallback(
    (
      message: string,
      type: 'success' | 'error' | 'warning' | 'info' = 'info'
    ) => {
      // For now, use console.log and alert as fallback
      // TODO: Implement proper toast system when HeroUI toast is available
      console.log(`[${type.toUpperCase()}] ${message}`);

      // Show alert for errors
      if (type === 'error') {
        alert(`Error: ${message}`);
      }
    },
    []
  );

  const showSuccess = useCallback(
    (message: string) => {
      showToast(message, 'success');
    },
    [showToast]
  );

  const showError = useCallback(
    (message: string) => {
      showToast(message, 'error');
    },
    [showToast]
  );

  const showWarning = useCallback(
    (message: string) => {
      showToast(message, 'warning');
    },
    [showToast]
  );

  const showInfo = useCallback(
    (message: string) => {
      showToast(message, 'info');
    },
    [showToast]
  );

  const value = {
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };

  return (
    <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
  );
}

// Utility functions for common toast messages
export const toastMessages = {
  pollCreated: 'Poll created successfully! Share the link with participants.',
  pollUpdated: 'Poll updated successfully!',
  responseSubmitted: 'Your response has been submitted successfully!',
  linkCopied: 'Link copied to clipboard!',
  errorOccurred: 'An error occurred. Please try again.',
  networkError: 'Network error. Please check your connection.',
  timezoneDetected: 'Your timezone has been automatically detected.',
  offlineMode: 'You are currently offline. Changes will sync when reconnected.',
  syncComplete: 'All changes have been synced successfully.',
} as const;

// Hook for handling async operations with toast feedback
export function useAsyncToast() {
  const { showSuccess, showError } = useToast();

  const handleAsync = useCallback(
    async <T,>(
      asyncFn: () => Promise<T>,
      successMessage?: string,
      errorMessage?: string
    ): Promise<T | null> => {
      try {
        const result = await asyncFn();
        if (successMessage) {
          showSuccess(successMessage);
        }
        return result;
      } catch (error) {
        const message =
          errorMessage ||
          (error instanceof Error ? error.message : 'An error occurred');
        showError(message);
        return null;
      }
    },
    [showSuccess, showError]
  );

  return { handleAsync };
}
