import type { ReactNode } from 'react';

interface PublicLayoutProps {
  children: ReactNode;
}

/**
 * Public layout — wraps all marketing / public pages.
 * Navbar and Footer are rendered here.
 */
export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* PublicNavbar will be added in script 02 */}
      <main className="flex-1">{children}</main>
      {/* PublicFooter will be added in script 02 */}
    </div>
  );
}