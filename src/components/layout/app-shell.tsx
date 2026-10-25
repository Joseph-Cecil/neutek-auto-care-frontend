'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { bookingDal } from '@/lib/dal/booking.dal';
import { customerDal } from '@/lib/dal/customer.dal';
import { jobDal } from '@/lib/dal/job.dal';
import { vehicleDal } from '@/lib/dal/vehicle.dal';
import { queryKeys } from '@/lib/api/queryKeys';
import type { Customer, Job, Notification, UserRole, Vehicle } from '@/lib/dto';
import { useMarkNotificationRead, useNotifications } from '@/hooks/useNotifications';
import { useLogout } from '@/hooks/useAuth';
import { useAuthStore } from '@/stores/auth.store';
import { filterNavByRole, type NavSection } from '@/config/navigation';
import { fullName, getInitials } from '@/lib/utils/format';
import { homeForRole } from '@/lib/utils/permissions';

const COLLAPSE_KEY = 'nt-coll';
const collapseListeners = new Set<() => void>();

function collapsedNow(): boolean {
  return window.sessionStorage.getItem(COLLAPSE_KEY) === '1';
}

function subscribeCollapsed(listener: () => void): () => void {
  collapseListeners.add(listener);
  return () => collapseListeners.delete(listener);
}

function writeCollapsed(value: boolean): void {
  if (value) window.sessionStorage.setItem(COLLAPSE_KEY, '1');
  else window.sessionStorage.removeItem(COLLAPSE_KEY);
  collapseListeners.forEach((listener) => listener());
}

const ICONS: Record<string, string> = {
  LayoutDashboard: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z',
  Calendar: 'M3 5h18v16H3zM3 10h18M8 3v4M16 3v4',
  Wrench: 'M14 6a4 4 0 0 0 5 5l-9 9a2 2 0 0 1-3-3l9-9z',
  Users: 'M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM3 20c0-3 3-5 6-5s6 2 6 5M17 11a3 3 0 0 0 0-6M21 20c0-2-1-4-3-5',
  FileText: 'M6 3h9l4 4v14H6zM14 3v5h5M9 13h7M9 17h7',
  Receipt: 'M6 3h9l4 4v14H6zM14 3v5h5M9 13h7M9 17h7',
  CreditCard: 'M3 7h18v10H3zM12 9.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z',
  Package: 'M3 12V3h9l9 9-9 9z',
  Building2: 'M2 6h11v10H2zM13 9h5l3 3v4h-8zM6 19a1.5 1.5 0 1 0 0-3M17 19a1.5 1.5 0 1 0 0-3',
  BookOpen: 'M4 20l4-1L19 8l-3-3L5 16z',
  BarChart3: 'M4 20V10M10 20V4M16 20v-8M22 20H2',
  Shield: 'M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6z',
  Car: 'M3 13l2-6h14l2 6v5H3zM3 13h18M7 16h.01M17 16h.01',
  Bell: 'M6 16V11a6 6 0 0 1 12 0v5l2 2H4zM10 21h4',
  User: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c0-4 4-6 8-6s8 2 8 6',
  Star: 'M12 3l2.6 6.4L21 10l-5 4.2L17.4 21 12 17.8 6.6 21 8 14.2 3 10l6.4-.6z',
  Chat: 'M4 5h16v11H9l-5 4z',
};

const SEGMENT_LABEL: Record<string, string> = {
  dashboard: 'Dashboard',
  bookings: 'Bookings',
  jobs: 'Jobs',
  customers: 'Customers',
  quotes: 'Quotes',
  invoices: 'Invoices',
  payments: 'Payments',
  services: 'Services',
  fleet: 'Fleet',
  blog: 'Blog',
  analytics: 'Analytics',
  users: 'Users',
  feedback: 'Feedback',
  reminders: 'Reminders',
  messages: 'Messages',
  vehicles: 'My vehicles',
  notifications: 'Notifications',
  profile: 'Profile',
};

function Icon({ name }: { name: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={ICONS[name] ?? ICONS.LayoutDashboard} />
    </svg>
  );
}

function roleTitle(role: UserRole): string {
  if (role === 'technician') return 'Technician';
  if (role === 'customer') return 'Customer';
  return 'Workshop manager';
}

function jobHeadline(job: Job & { customer_concern?: string | null }): string {
  return job.title || job.customer_concern || job.job_number;
}

function noteMeta(note: Notification): Record<string, unknown> | null {
  return note.metadata ?? note.data ?? null;
}

function notificationHref(note: Notification, area: 'workshop' | 'customer'): string {
  const jobId = noteMeta(note)?.jobId;
  if (typeof jobId === 'string' && jobId) {
    return area === 'workshop' ? `/admin/jobs/${jobId}` : `/portal/jobs/${jobId}`;
  }
  return '/portal/notifications';
}

interface Crumb {
  label: string;
  href?: string;
}

function crumbsFor(pathname: string, area: 'workshop' | 'customer', home: string): Crumb[] {
  const parts = pathname.split('/').filter(Boolean);
  const section = parts[1] ?? '';
  const root: Crumb = { label: area === 'workshop' ? 'Workshop' : 'Customer', href: home };
  const sectionLabel = area === 'customer' && section === 'jobs'
    ? 'My jobs'
    : (SEGMENT_LABEL[section] ?? 'Page');
  const tail = parts.slice(2);
  if (tail.length === 0) return [root, { label: sectionLabel }];
  const raw = tail[tail.length - 1] ?? '';
  const last = raw === 'create' ? (section === 'jobs' ? 'New job' : 'New') : raw;
  return [root, { label: sectionLabel, href: `/${parts[0]}/${section}` }, { label: last }];
}

interface Hit {
  key: string;
  title: string;
  subtitle: string;
  href: string;
}

export function AppShell({
  sections,
  area,
  blocked = false,
  children,
}: {
  sections: NavSection[];
  area: 'workshop' | 'customer';
  blocked?: boolean;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();
  const markRead = useMarkNotificationRead();
  const role = user?.role ?? 'customer';
  const home = homeForRole(role);
  const menu = filterNavByRole(sections, role);
  const collapsed = useSyncExternalStore(subscribeCollapsed, collapsedNow, () => false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [pop, setPop] = useState<'' | 'search' | 'bell' | 'acct'>('');
  const [q, setQ] = useState('');
  const [debounced, setDebounced] = useState('');

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(q.trim()), 250);
    return () => window.clearTimeout(timer);
  }, [q]);

  const ready = debounced.length > 1 && pop === 'search';
  const canSearchPeople = area === 'workshop' && (role === 'admin' || role === 'super_admin');

  const people = useQuery({
    queryKey: queryKeys.customers.list({ search: debounced, page: 1 }),
    queryFn: async () => (await customerDal.list({ search: debounced, limit: 5, page: 1 })).data,
    enabled: ready && canSearchPeople,
  });
  const jobs = useQuery({
    queryKey: queryKeys.jobs.list({ search: debounced, page: 1 }),
    queryFn: async () => (await jobDal.list({ search: debounced, limit: 5, page: 1 })).data,
    enabled: ready,
  });
  const vehicles = useQuery({
    queryKey: queryKeys.vehicles.list({ search: debounced, page: 1 }),
    queryFn: async () => (await vehicleDal.list({ search: debounced, limit: 5, page: 1 })).data,
    enabled: ready,
  });
  const pendingBookings = useQuery({
    queryKey: queryKeys.bookings.pendingCount,
    queryFn: async () => (await bookingDal.list({ status: 'pending', limit: 1, page: 1 })).data,
    enabled: area === 'workshop',
  });
  const notes = useNotifications({ isRead: false, limit: 8, page: 1 });

  const hits: Hit[] = [];
  if (canSearchPeople) {
    for (const person of (people.data?.data ?? []) as Customer[]) {
      hits.push({
        key: `c-${person.id}`,
        title: fullName(person.first_name, person.last_name),
        subtitle: `Customer · ${person.phone}`,
        href: '/admin/customers',
      });
    }
  }
  for (const vehicle of (vehicles.data?.data ?? []) as Vehicle[]) {
    hits.push({
      key: `v-${vehicle.id}`,
      title: vehicle.license_plate,
      subtitle: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
      href: area === 'workshop' ? '/admin/jobs' : '/portal/vehicles',
    });
  }
  for (const job of (jobs.data?.data ?? []) as Job[]) {
    hits.push({
      key: `j-${job.id}`,
      title: job.job_number,
      subtitle: `${jobHeadline(job)} · ${job.status}`,
      href: area === 'workshop' ? `/admin/jobs/${job.id}` : `/portal/jobs/${job.id}`,
    });
  }
  const shown = hits.slice(0, 7);
  const searchQueries = [jobs, vehicles, ...(canSearchPeople ? [people] : [])];
  const searchPending = searchQueries.some((item) => item.isLoading);
  const searchFailed = searchQueries.every((item) => item.isError);

  const unread = notes.data?.data ?? [];
  const pendingCount = pendingBookings.data?.total ?? 0;
  const name = fullName(user?.firstName, user?.lastName);
  const crumbs = crumbsFor(pathname, area, home);
  const sideClass = `sidebar${collapsed ? ' collapsed' : ''}${mobileOpen ? ' open' : ''}`;

  function closePop() {
    setPop('');
  }

  function go(href: string) {
    setPop('');
    setQ('');
    setMobileOpen(false);
    router.push(href);
  }

  function toggleCollapse() {
    writeCollapsed(!collapsed);
  }

  return (
    <div className="nt-shell">
      <a className="skip" href="#main-content">Skip to content</a>
      <div className="shell">
        <nav className={sideClass} aria-label="Primary">
          <Link href={home} className="brand" onClick={() => setMobileOpen(false)}>
            <span className="mark">NT</span>
            <span className="t"><span className="b">Neutek</span><span className="faint sm">Auto Care</span></span>
          </Link>
          <div className="menu">
            {menu.map((section) => (
              <div key={section.title}>
                <div className="mgrp">{section.title}</div>
                {section.items.map((item) => {
                  const current = pathname === item.href || pathname.startsWith(`${item.href}/`);
                  const count = item.href === '/admin/bookings' ? pendingCount : 0;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`mi${count > 0 ? ' has' : ''}`}
                      aria-current={current ? 'page' : undefined}
                      title={item.title}
                      onClick={() => setMobileOpen(false)}
                    >
                      <Icon name={item.icon} />
                      <span className="lbl">{item.title}</span>
                      {count > 0 ? <span className="cnt">{count}</span> : null}
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>
          <div className="collwrap">
            <button
              type="button"
              className="mi"
              aria-expanded={collapsed ? 'false' : 'true'}
              title={collapsed ? 'Expand menu' : 'Collapse menu'}
              onClick={toggleCollapse}
            >
              <IconPath d={collapsed ? 'M9 6l6 6-6 6' : 'M15 6l-6 6 6 6'} />
              <span className="lbl">{collapsed ? 'Expand menu' : 'Collapse menu'}</span>
            </button>
          </div>
        </nav>
        {mobileOpen ? (
          <button type="button" className="scrim navscrim" aria-label="Close menu" onClick={() => setMobileOpen(false)} />
        ) : null}
        <div className="main">
          <header className="topbar" onKeyDown={(event) => { if (event.key === 'Escape') closePop(); }}>
            <div className="row nowrap">
              <button type="button" className="btn ghost icbtn menubtn" aria-label="Open menu" onClick={() => setMobileOpen(true)}>
                <IconPath d="M4 7h16M4 12h16M4 17h16" />
              </button>
              <nav aria-label="Breadcrumb" className="crumbs">
                {crumbs.map((crumb, index) => {
                  const last = index === crumbs.length - 1;
                  return (
                    <span key={`${crumb.label}-${index}`} className="crumb">
                      {last || !crumb.href ? (
                        <b aria-current="page">{crumb.label}</b>
                      ) : (
                        <>
                          <Link href={crumb.href}>{crumb.label}</Link>
                          <span aria-hidden="true">/</span>
                        </>
                      )}
                    </span>
                  );
                })}
              </nav>
            </div>
            <div className="row nowrap">
              <div className="popwrap search">
                <label className="sr" htmlFor="tb-search">Search</label>
                <input
                  id="tb-search"
                  className="input"
                  type="search"
                  placeholder="Search plates, jobs, people"
                  value={q}
                  autoComplete="off"
                  onChange={(event) => { setQ(event.target.value); setPop('search'); }}
                  onFocus={() => setPop('search')}
                />
                {ready ? (
                  <div className="pop searchpop" role="listbox" aria-label="Search results">
                    {shown.map((hit) => (
                      <button key={hit.key} type="button" className="it" onClick={() => go(hit.href)}>
                        <span className="b">{hit.title}</span>
                        <span className="faint sm">{hit.subtitle}</span>
                      </button>
                    ))}
                    {shown.length === 0 && searchPending ? <div className="muted sm pad">Searching…</div> : null}
                    {shown.length === 0 && !searchPending && searchFailed ? <div className="muted sm pad">Could not search.</div> : null}
                    {shown.length === 0 && !searchPending && !searchFailed ? <div className="muted sm pad">Nothing matches that.</div> : null}
                  </div>
                ) : null}
              </div>
              <div className="popwrap">
                <button
                  type="button"
                  className="btn ghost icbtn"
                  aria-label="Notifications"
                  aria-expanded={pop === 'bell'}
                  onClick={() => setPop((value) => value === 'bell' ? '' : 'bell')}
                >
                  <Icon name="Bell" />
                  {unread.length > 0 ? <span className="dot-n">{unread.length}</span> : null}
                </button>
                {pop === 'bell' ? (
                  <div className="pop bellpop">
                    <div className="b pad-h">Unread</div>
                    {notes.isLoading ? <div className="muted sm pad">Loading notifications</div> : null}
                    {notes.isError && !notes.data ? <div className="muted sm pad">Could not load notifications.</div> : null}
                    {!notes.isLoading && !(notes.isError && !notes.data) && unread.length === 0 ? (
                      <div className="muted sm pad">You are all caught up.</div>
                    ) : null}
                    {unread.map((note) => (
                      <button
                        key={note.id}
                        type="button"
                        className="it"
                        onClick={() => {
                          markRead.mutate(note.id);
                          go(notificationHref(note, area));
                        }}
                      >
                        <span className="b">{note.title}</span>
                        <span className="faint sm">{note.body}</span>
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
              <div className="popwrap">
                <button
                  type="button"
                  className="acct"
                  aria-haspopup="menu"
                  aria-expanded={pop === 'acct'}
                  onClick={() => setPop((value) => value === 'acct' ? '' : 'acct')}
                >
                  <span className="avatar" aria-hidden="true">{getInitials(name || ' ')}</span>
                  <span className="who">
                    <span className="b block">{name}</span>
                    <span className="faint sm">{user ? roleTitle(user.role) : ''}</span>
                  </span>
                </button>
                {pop === 'acct' ? (
                  <div className="pop acctpop" role="menu">
                    {role === 'customer' ? (
                      <Link href="/portal/profile" className="it" role="menuitem" onClick={closePop}>
                        <span className="b">Profile</span>
                      </Link>
                    ) : null}
                    <button type="button" className="it" role="menuitem" onClick={() => { closePop(); void logout(); }}>
                      <span className="b">Sign out</span>
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </header>
          {pop ? <button type="button" className="dismiss" aria-label="Close" onClick={closePop} /> : null}
          <main className="page nt-ui" id="main-content" tabIndex={-1}>
            {blocked ? (
              <div className="denied">
                <h1>You do not have access to this page.</h1>
                <Link href="/admin/jobs">Back to jobs</Link>
              </div>
            ) : children}
          </main>
        </div>
      </div>
    </div>
  );
}

function IconPath({ d }: { d: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}
