'use client';

import { useState } from 'react';

export type ToastVariant = 'default' | 'destructive';

export interface Toast {
  title: string;
  description: string;
  variant?: ToastVariant;
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = ({ title, description, variant = 'default' }: Toast) => {
    setToasts((current) => [...current, { title, description, variant }]);
  };

  // For simplicity, toasts will be logged to console; in a real app, render them in UI
  useEffect(() => {
    if (toasts.length > 0) {
      console.log('Toast:', toasts[toasts.length - 1]);
      // Clear after some time
      const timer = setTimeout(() => setToasts((current) => current.slice(1)), 3000);
      return () => clearTimeout(timer);
    }
  }, [toasts]);

  return { toast, toasts };
}