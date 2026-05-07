'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { useUIStore }   from '@/stores/ui.store';
import { canAccessAdmin } from '@/lib/utils/permissions';
import { AdminSidebar, AdminMobileSidebar } from '@/components/layout/admin/AdminSidebar';
import { AdminHeader }  from '@/components/layout/admin/AdminHeader';
import { PageLoader }   from '@/components/shared/LoadingSpinner';
import { cn } from '@/lib/utils/cn';
import type { ReactNode } from 'react';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router          = useRouter();
  const user            = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading       = useAuthStore((s) => s.isLoading);
  const sidebarOpen     = useUIStore((s) => s.sidebarOpen);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) { router.replace('/login'); return; }
    if (user && !canAccessAdmin(user.role)) { router.replace('/portal/dashboard'); }
  }, [isLoading, isAuthenticated, user, router]);

  if (isLoading) return <PageLoader />;
  if (!isAuthenticated || !user || !canAccessAdmin(user.role)) return null;

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />
      <AdminMobileSidebar />
      <div className={cn(
        'flex min-h-screen flex-col transition-all duration-300',
        sidebarOpen ? 'lg:pl-64' : 'lg:pl-0',
      )}>
        <AdminHeader />
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}