'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState, type ReactNode } from 'react';

export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime:            60 * 1000,
            gcTime:               5 * 60 * 1000,
            retry: (failureCount, error) => {
              if (
                typeof error === 'object' &&
                error !== null &&
                'response' in error
              ) {
                const status = (error as { response?: { status?: number } })
                  .response?.status;
                if (status && status >= 400 && status < 500) return false;
              }
              return failureCount < 2;
            },
            retryDelay:           (attempt) => Math.min(1000 * 2 ** attempt, 10_000),
            refetchOnWindowFocus: false,
            refetchOnReconnect:   true,
          },
          mutations: { retry: false },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
      )}
    </QueryClientProvider>
  );
}