'use client';

import { Toaster } from 'sonner';

/** Prototype toast. Mount this on a redesigned screen. The app toaster in Providers is unchanged. */
export function NtToaster() {
  return (
    <Toaster
      position="bottom-center"
      duration={2600}
      toastOptions={{
        style: {
          background: '#FFFFFF',
          color: '#1C1917',
          border: '1px solid #E7E2DA',
          borderRadius: '8px',
          boxShadow: '0 8px 24px rgba(28, 25, 23, 0.12)',
          padding: '12px 20px',
          fontFamily: 'var(--font-jakarta), system-ui, sans-serif',
        },
      }}
    />
  );
}
