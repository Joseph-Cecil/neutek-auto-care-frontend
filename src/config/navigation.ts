import type { UserRole } from '@/lib/dto';

export interface NavItem {
  title:  string;
  href:   string;
  icon:   string;
  roles?: UserRole[];
}

export interface NavSection {
  title:  string;
  roles?: UserRole[];
  items:  NavItem[];
}

export const portalNavigation: NavSection[] = [
  { title: 'Overview', items: [
    { title: 'Dashboard', href: '/portal/dashboard', icon: 'LayoutDashboard' },
  ]},
  { title: 'My Vehicle', items: [
    { title: 'My Jobs',     href: '/portal/jobs',      icon: 'Wrench' },
    { title: 'My Vehicles', href: '/portal/vehicles',  icon: 'Car' },
    { title: 'Quotes',      href: '/portal/quotes',    icon: 'FileText' },
    { title: 'Invoices',    href: '/portal/invoices',  icon: 'Receipt' },
  ]},
  { title: 'Account', items: [
    { title: 'Notifications', href: '/portal/notifications', icon: 'Bell' },
    { title: 'Profile',       href: '/portal/profile',       icon: 'User' },
  ]},
];

export const adminNavigation: NavSection[] = [
  { title: 'Overview', items: [
    { title: 'Dashboard', href: '/admin/dashboard', icon: 'LayoutDashboard', roles: ['admin','super_admin'] },
  ]},
  { title: 'Operations', items: [
    { title: 'Bookings',  href: '/admin/bookings',  icon: 'Calendar', roles: ['admin','super_admin','technician'] },
    { title: 'Jobs',      href: '/admin/jobs',      icon: 'Wrench',   roles: ['admin','super_admin','technician'] },
    { title: 'Customers', href: '/admin/customers', icon: 'Users',    roles: ['admin','super_admin'] },
  ]},
  { title: 'Finance', roles: ['admin','super_admin'], items: [
    { title: 'Quotes',   href: '/admin/quotes',   icon: 'FileText' },
    { title: 'Invoices', href: '/admin/invoices', icon: 'Receipt' },
    { title: 'Payments', href: '/admin/payments', icon: 'CreditCard' },
  ]},
  { title: 'Catalogue', roles: ['admin','super_admin'], items: [
    { title: 'Services', href: '/admin/services', icon: 'Package' },
    { title: 'Fleet',    href: '/admin/fleet',    icon: 'Building2' },
  ]},
  { title: 'Content', roles: ['admin','super_admin'], items: [
    { title: 'Blog', href: '/admin/blog', icon: 'BookOpen' },
  ]},
  { title: 'Insights', roles: ['admin','super_admin'], items: [
    { title: 'Analytics', href: '/admin/analytics', icon: 'BarChart3' },
  ]},
  { title: 'System', roles: ['admin','super_admin'], items: [
    { title: 'Users', href: '/admin/users', icon: 'Shield' },
  ]},
];

export function filterNavByRole(sections: NavSection[], role: UserRole): NavSection[] {
  return sections
    .filter((s) => !s.roles || s.roles.includes(role))
    .map((s) => ({ ...s, items: s.items.filter((i) => !i.roles || i.roles.includes(role)) }))
    .filter((s) => s.items.length > 0);
}