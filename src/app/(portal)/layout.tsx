'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { useUIStore }   from '@/stores/ui.store';
import { PortalSidebar, PortalMobileSidebar } from '@/components/layout/portal/PortalSidebar';
import { PortalHeader } from '@/components/layout/portal/PortalHeader';
import { PageLoader }   from '@/components/shared/LoadingSpinner';
import { cn } from '@/lib/utils/cn';
import type { ReactNode } from 'react';

export default function PortalLayout({ children }: { children: ReactNode }) {
  const router          = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading       = useAuthStore((s) => s.isLoading);
  const sidebarOpen     = useUIStore((s) => s.sidebarOpen);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) return <PageLoader />;
  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-background">
      <PortalSidebar />
      <PortalMobileSidebar />
      <div className={cn(
        'flex min-h-screen flex-col transition-all duration-300',
        sidebarOpen ? 'lg:pl-64' : 'lg:pl-0',
      )}>
        <PortalHeader />
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}