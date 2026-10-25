'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { PublicNavbar } from '@/components/layout/public/PublicNavbar';
import { PublicFooter } from '@/components/layout/public/PublicFooter';

export default function PublicLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (pathname === '/home') return children;

  return (
    <div className="nt-ui" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <PublicNavbar />
      <main id="main-content" style={{ flex: 1, outline: 'none' }} tabIndex={-1}>
        {children}
      </main>
      <PublicFooter />
    </div>
  );
}
