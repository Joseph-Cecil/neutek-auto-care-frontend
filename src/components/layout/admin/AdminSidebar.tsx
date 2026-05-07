'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Calendar, Wrench, Users, FileText,
  Receipt, CreditCard, Package, Building2, BookOpen,
  BarChart3, Shield, Zap, X,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useAuthStore } from '@/stores/auth.store';
import { useUIStore }   from '@/stores/ui.store';
import { Button } from '@/components/ui/button';
import type { UserRole } from '@/lib/dto';

interface NavItem  { href: string; label: string; Icon: React.ComponentType<{ className?: string }>; roles?: UserRole[]; }
interface NavSection { title: string; roles?: UserRole[]; items: NavItem[]; }

const NAV_SECTIONS: NavSection[] = [
  { title: 'Overview', items: [
    { href: '/admin/dashboard', label: 'Dashboard', Icon: LayoutDashboard, roles: ['admin','super_admin'] },
  ]},
  { title: 'Operations', items: [
    { href: '/admin/bookings',  label: 'Bookings',  Icon: Calendar, roles: ['admin','super_admin','technician'] },
    { href: '/admin/jobs',      label: 'Jobs',      Icon: Wrench,   roles: ['admin','super_admin','technician'] },
    { href: '/admin/customers', label: 'Customers', Icon: Users,    roles: ['admin','super_admin'] },
  ]},
  { title: 'Finance', roles: ['admin','super_admin'], items: [
    { href: '/admin/quotes',   label: 'Quotes',   Icon: FileText },
    { href: '/admin/invoices', label: 'Invoices', Icon: Receipt },
    { href: '/admin/payments', label: 'Payments', Icon: CreditCard },
  ]},
  { title: 'Catalogue', roles: ['admin','super_admin'], items: [
    { href: '/admin/services', label: 'Services', Icon: Package },
    { href: '/admin/fleet',    label: 'Fleet',    Icon: Building2 },
  ]},
  { title: 'Content', roles: ['admin','super_admin'], items: [
    { href: '/admin/blog', label: 'Blog', Icon: BookOpen },
  ]},
  { title: 'Insights', roles: ['admin','super_admin'], items: [
    { href: '/admin/analytics', label: 'Analytics', Icon: BarChart3 },
  ]},
  { title: 'System', roles: ['admin','super_admin'], items: [
    { href: '/admin/users', label: 'Users', Icon: Shield },
  ]},
];

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const user     = useAuthStore((s) => s.user);
  const role     = user?.role ?? 'technician';

  const visible = NAV_SECTIONS
    .filter((s) => !s.roles || s.roles.includes(role))
    .map((s) => ({ ...s, items: s.items.filter((i) => !i.roles || i.roles.includes(role)) }))
    .filter((s) => s.items.length > 0);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border/50 px-4 py-4">
        <Link href="/admin/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Zap className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-sm font-semibold">Admin Panel</span>
        </Link>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
        {visible.map((section) => (
          <div key={section.title}>
            <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              {section.title}
            </p>
            <ul className="space-y-0.5">
              {section.items.map(({ href, label, Icon }) => {
                const active = pathname === href || pathname.startsWith(href + '/');
                return (
                  <li key={href}>
                    <Link href={href} onClick={onClose} className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
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
          </div>
        ))}
      </nav>

      <div className="border-t border-border/50 px-4 py-3">
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{user?.firstName} {user?.lastName}</p>
            <p className="truncate text-xs capitalize text-muted-foreground">{user?.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AdminSidebar() {
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

export function AdminMobileSidebar() {
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