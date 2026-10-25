'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { canAccessAdmin, technicianCanOpen } from '@/lib/utils/permissions';
import { adminNavigation } from '@/config/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { PageLoader } from '@/components/shared/LoadingSpinner';
import type { ReactNode } from 'react';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) { router.replace('/login'); return; }
    if (user && !canAccessAdmin(user.role)) { router.replace('/portal/dashboard'); }
  }, [isLoading, isAuthenticated, user, router]);

  if (isLoading) return <PageLoader />;
  if (!isAuthenticated || !user || !canAccessAdmin(user.role)) return null;

  const blocked = user.role === 'technician' && !technicianCanOpen(pathname);

  return (
    <AppShell sections={adminNavigation} area="workshop" blocked={blocked}>
      {children}
    </AppShell>
  );
}
