'use client';

import React, { createContext, useContext, useCallback } from 'react';

interface ToastAction {
  label: string;
  onAction: () => void;
}

interface ToastOptions {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  title?: string;
  action?: ToastAction;
  duration?: number;
}

interface ToastContextType {
  showToast: (
    message: string,
    type?: 'success' | 'error' | 'warning' | 'info'
  ) => void;
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showWarning: (message: string) => void;
  showInfo: (message: string) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
  addToast: (options: ToastOptions) => void;
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
  const [toasts, setToasts] = React.useState<
    Array<ToastOptions & { id: string }>
  >([]);

  const showToast = useCallback(
    (
      message: string,
      type: 'success' | 'error' | 'warning' | 'info' = 'info'
    ) => {
      const id = Math.random().toString(36).substr(2, 9);
      const toast = { id, type, message, duration: 5000 };
      setToasts((prev) => [...prev, toast]);

      // Auto-remove after duration
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, toast.duration);
    },
    []
  );

  const addToast = useCallback((options: ToastOptions) => {
    const id = Math.random().toString(36).substr(2, 9);
    const toast = { id, ...options, duration: options.duration || 5000 };
    setToasts((prev) => [...prev, toast]);

    // Auto-remove after duration
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, toast.duration);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

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
    success: showSuccess,
    error: showError,
    warning: showWarning,
    info: showInfo,
    addToast,
  };

  const getToastIcon = (type: string) => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return 'ℹ️';
    }
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="bg-white border rounded-lg shadow-lg p-4 min-w-[300px]"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <span className="text-lg">{getToastIcon(toast.type)}</span>
                <div className="flex-1">
                  {toast.title && (
                    <h4 className="font-semibold text-gray-900 mb-1">
                      {toast.title}
                    </h4>
                  )}
                  <p className="text-gray-700">{toast.message}</p>
                  {toast.action && (
                    <button
                      onClick={toast.action.onAction}
                      className="mt-2 text-blue-600 hover:text-blue-800 font-medium"
                    >
                      {toast.action.label}
                    </button>
                  )}
                </div>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-gray-400 hover:text-gray-600 ml-4"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
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
