'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Wrench, Car, FileText,
  Receipt, Bell, User, Zap, X,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useAuthStore } from '@/stores/auth.store';
import { useUIStore } from '@/stores/ui.store';
import { fullName, getInitials } from '@/lib/utils/format';
import { Button } from '@/components/ui/button';

const NAV_ITEMS = [
  { href: '/portal/dashboard',     label: 'Dashboard',     Icon: LayoutDashboard },
  { href: '/portal/jobs',          label: 'My Jobs',       Icon: Wrench },
  { href: '/portal/vehicles',      label: 'My Vehicles',   Icon: Car },
  { href: '/portal/quotes',        label: 'Quotes',        Icon: FileText },
  { href: '/portal/invoices',      label: 'Invoices',      Icon: Receipt },
  { href: '/portal/notifications', label: 'Notifications', Icon: Bell },
  { href: '/portal/profile',       label: 'Profile',       Icon: User },
];

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const user     = useAuthStore((s) => s.user);
  const name     = fullName(user?.firstName, user?.lastName);
  const initials = getInitials(name);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border/50 px-4 py-4">
        <Link href="/portal/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Zap className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-sm font-semibold">Neutek Portal</span>
        </Link>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {NAV_ITEMS.map(({ href, label, Icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/');
            return (
              <li key={href}>
                <Link href={href} onClick={onClose} className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  active
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}>
                  <Icon className="h-4 w-4 shrink-0" />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-border/50 px-4 py-3">
        <Link href="/portal/profile" onClick={onClose}>
          <div className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-muted">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{name}</p>
              <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}

export function PortalSidebar() {
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  return (
    <aside className={cn(
      'hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:z-30',
      'w-64 border-r border-border bg-card transition-all duration-300',
      !sidebarOpen && 'lg:hidden',
    )}>
      <SidebarContent />
    </aside>
  );
}

export function PortalMobileSidebar() {
  const { mobileSidebarOpen, setMobileSidebarOpen } = useUIStore();
  if (!mobileSidebarOpen) return null;
  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        onClick={() => setMobileSidebarOpen(false)} />
      <aside className="fixed inset-y-0 left-0 z-50 w-72 bg-card shadow-2xl lg:hidden">
        <SidebarContent onClose={() => setMobileSidebarOpen(false)} />
      </aside>
    </>
  );
}