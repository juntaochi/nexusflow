'use client';

import { useEffect } from 'react';

export function ConsoleErrorFilter() {
  useEffect(() => {
    const originalError = console.error;

    console.error = (...args: unknown[]) => {
      const text = args
        .map((a) => {
          if (typeof a === 'string') return a;
          if (a instanceof Error) return a.message;
          try {
            return String(a);
          } catch {
            return '';
          }
        })
        .join(' ');

      // IDKitWidget (Radix Dialog) accessibility warning; noisy during demo.
      if (text.includes('DialogContent') && text.includes('DialogTitle')) return;

      originalError.apply(console, args as unknown as Parameters<typeof console.error>);
    };

    return () => {
      console.error = originalError;
    };
  }, []);

  return null;
}
