'use client';

import { type ReactNode } from 'react';
import { Toaster } from 'sonner';
import { QueryProvider } from './QueryProvider';
import { AuthProvider } from './AuthProvider';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <QueryProvider>
      <AuthProvider>
        {children}
        <Toaster
          position="top-right"
          richColors
          closeButton
          duration={4000}
          toastOptions={{
            style: {
              background: 'hsl(222 40% 10%)',
              border:     '1px solid hsl(222 30% 18%)',
              color:      'hsl(210 40% 96%)',
            },
          }}
        />
      </AuthProvider>
    </QueryProvider>
  );
}