'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState, type ReactNode } from 'react';

interface QueryProviderProps {
  children: ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  // Create QueryClient per-request to avoid shared state between requests
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // ── Caching strategy for millions of users ──────────
            staleTime:            60 * 1000,   // 1 minute — data stays fresh
            gcTime:               5 * 60 * 1000, // 5 minutes — keep in cache
            retry:                (failureCount, error) => {
              // Don't retry on 4xx errors — only on network/5xx
              if (typeof error === 'object' && error !== null && 'response' in error) {
                const status = (error as { response?: { status?: number } }).response?.status;
                if (status && status >= 400 && status < 500) return false;
              }
              return failureCount < 2;
            },
            retryDelay:           (attempt) => Math.min(1000 * 2 ** attempt, 10000),
            refetchOnWindowFocus: false,   // prevent aggressive refetching
            refetchOnReconnect:   true,
          },
          mutations: {
            retry: false,
          },
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