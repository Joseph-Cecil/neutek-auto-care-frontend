import type { ReactNode } from 'react';
import { PublicNavbar } from '@/components/layout/public/PublicNavbar';
import { PublicFooter } from '@/components/layout/public/PublicFooter';

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[#0A1628]">
      <PublicNavbar />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  );
}