'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { portalNavigation } from '@/config/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { PageLoader } from '@/components/shared/LoadingSpinner';
import type { ReactNode } from 'react';

export default function PortalLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) return <PageLoader />;
  if (!isAuthenticated) return null;

  return (
    <AppShell sections={portalNavigation} area="customer">
      {children}
    </AppShell>
  );
}
