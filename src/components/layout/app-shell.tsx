'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { bookingDal } from '@/lib/dal/booking.dal';
import { customerDal } from '@/lib/dal/customer.dal';
import { invoiceDal } from '@/lib/dal/invoice.dal';
import { jobDal } from '@/lib/dal/job.dal';
import { quoteDal } from '@/lib/dal/quote.dal';
import { vehicleDal } from '@/lib/dal/vehicle.dal';
import { queryKeys } from '@/lib/api/queryKeys';
import type { Customer, Job, Notification, UserRole, Vehicle } from '@/lib/dto';
import { useMarkNotificationRead, useNotifications } from '@/hooks/useNotifications';
import { NeutekLogo } from '@/components/brand/NeutekLogo';
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
  Box: 'M3 7l9-4 9 4v10l-9 4-9-4zM3 7l9 4 9-4M12 11v10',
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
  inventory: 'Inventory',
  schedule: 'Schedule',
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
  const meta = noteMeta(note);
  const jobId = meta?.jobId;
  if (typeof jobId === 'string' && jobId) {
    return area === 'workshop' ? `/admin/jobs/${jobId}` : `/portal/jobs/${jobId}`;
  }
  const invoiceId = meta?.invoiceId;
  if (typeof invoiceId === 'string' && invoiceId) {
    return area === 'workshop' ? `/admin/invoices/${invoiceId}` : `/portal/invoices/${invoiceId}`;
  }
  const quoteId = meta?.quoteId;
  if (typeof quoteId === 'string' && quoteId) {
    return area === 'workshop' ? `/admin/quotes/${quoteId}` : `/portal/quotes/${quoteId}`;
  }
  return area === 'workshop' ? '/admin/dashboard' : '/portal/notifications';
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
  const menuBtnRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchSheetInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(q.trim()), 250);
    return () => window.clearTimeout(timer);
  }, [q]);

  // Close popovers on outside pointerdown without a full-screen overlay.
  // A transparent fixed dismiss layer was eating the first click on selects/filters.
  useEffect(() => {
    if (!pop) return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (target.closest('.popwrap')) return;
      if (target.closest('.searchsheet')) return;
      if (target.closest('.searchbtn')) return;
      setPop('');
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [pop]);

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileOpen(false);
        menuBtnRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (pop !== 'search') return;
    const id = window.requestAnimationFrame(() => {
      const mobile = window.matchMedia('(max-width: 900px)').matches;
      (mobile ? searchSheetInputRef.current : searchInputRef.current)?.focus();
    });
    return () => window.cancelAnimationFrame(id);
  }, [pop]);

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
  const quotesNeedingAction = useQuery({
    queryKey: queryKeys.quotes.actionCount(area === 'customer' ? 'sent' : 'draft'),
    queryFn: async () => (
      await quoteDal.list({ status: area === 'customer' ? 'sent' : 'draft', limit: 1, page: 1 })
    ).data,
  });
  const invoicesSent = useQuery({
    queryKey: queryKeys.invoices.actionCount('sent'),
    queryFn: async () => (await invoiceDal.list({ status: 'sent', limit: 1, page: 1 })).data,
    enabled: area === 'customer',
  });
  const invoicesPartial = useQuery({
    queryKey: queryKeys.invoices.actionCount('partially_paid'),
    queryFn: async () => (await invoiceDal.list({ status: 'partially_paid', limit: 1, page: 1 })).data,
    enabled: area === 'customer',
  });
  const invoicesOverdue = useQuery({
    queryKey: queryKeys.invoices.actionCount('overdue'),
    queryFn: async () => (await invoiceDal.list({ status: 'overdue', limit: 1, page: 1 })).data,
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
  const unreadTotal = notes.data?.total ?? unread.length;
  const pendingCount = pendingBookings.data?.total ?? 0;
  const quoteActionCount = quotesNeedingAction.data?.total ?? 0;
  const invoiceActionCount = area === 'customer'
    ? (invoicesSent.data?.total ?? 0)
      + (invoicesPartial.data?.total ?? 0)
      + (invoicesOverdue.data?.total ?? 0)
    : (invoicesOverdue.data?.total ?? 0);
  const name = fullName(user?.firstName, user?.lastName);
  const crumbs = crumbsFor(pathname, area, home);
  const sideClass = `sidebar${collapsed ? ' collapsed' : ''}${mobileOpen ? ' open' : ''}`;

  function navBadgeCount(href: string): number {
    if (href === '/admin/bookings') return pendingCount;
    if (href === '/admin/quotes' || href === '/portal/quotes') return quoteActionCount;
    if (href === '/admin/invoices' || href === '/portal/invoices') return invoiceActionCount;
    if (href === '/portal/notifications') return unreadTotal;
    return 0;
  }

  function closePop() {
    setPop('');
  }

  function closeMenu() {
    setMobileOpen(false);
    menuBtnRef.current?.focus();
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

  function renderSearchHits() {
    return (
      <>
        {shown.map((hit) => (
          <button key={hit.key} type="button" className="it" onClick={() => go(hit.href)}>
            <span className="b">{hit.title}</span>
            <span className="faint sm">{hit.subtitle}</span>
          </button>
        ))}
        {shown.length === 0 && searchPending ? <div className="muted sm pad">Searching…</div> : null}
        {shown.length === 0 && !searchPending && searchFailed ? <div className="muted sm pad">Could not search.</div> : null}
        {shown.length === 0 && !searchPending && !searchFailed ? <div className="muted sm pad">Nothing matches that.</div> : null}
      </>
    );
  }

  const lastCrumb = crumbs[crumbs.length - 1];
  const parentCrumb = crumbs.length > 1 ? crumbs[crumbs.length - 2] : null;

  return (
    <div className="nt-shell">
      <a className="skip" href="#main-content">Skip to content</a>
      <div className="shell">
        <nav className={sideClass} aria-label="Primary">
          <NeutekLogo href={home} onClick={() => setMobileOpen(false)} />
          <div className="menu">
            {menu.map((section) => (
              <div key={section.title}>
                <div className="mgrp">{section.title}</div>
                {section.items.map((item) => {
                  const current = pathname === item.href || pathname.startsWith(`${item.href}/`);
                  const count = navBadgeCount(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`mi${count > 0 ? ' has' : ''}`}
                      aria-current={current ? 'page' : undefined}
                      title={count > 0 ? `${item.title} (${count})` : item.title}
                      onClick={() => setMobileOpen(false)}
                    >
                      <Icon name={item.icon} />
                      <span className="lbl">{item.title}</span>
                      {count > 0 ? <span className="cnt">{count > 99 ? '99+' : count}</span> : null}
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
          <button type="button" className="scrim navscrim" aria-label="Close menu" onClick={closeMenu} />
        ) : null}
        <div className="main">
          <header className="topbar" onKeyDown={(event) => { if (event.key === 'Escape') closePop(); }}>
            <div className="row nowrap">
              <button
                ref={menuBtnRef}
                type="button"
                className="btn ghost icbtn menubtn"
                aria-label="Open menu"
                aria-expanded={mobileOpen}
                onClick={() => setMobileOpen(true)}
              >
                <IconPath d="M4 7h16M4 12h16M4 17h16" />
              </button>
              <nav aria-label="Breadcrumb" className="crumbs">
                <span className="crumb-full">
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
                </span>
                <span className="crumb-short">
                  {parentCrumb?.href ? (
                    <>
                      <Link href={parentCrumb.href}>{parentCrumb.label}</Link>
                      <span aria-hidden="true">/</span>
                    </>
                  ) : null}
                  <b aria-current="page">{lastCrumb?.label}</b>
                </span>
              </nav>
            </div>
            <div className="row nowrap">
              <button
                type="button"
                className="btn ghost icbtn searchbtn"
                aria-label="Search"
                aria-expanded={pop === 'search'}
                onClick={() => setPop((value) => value === 'search' ? '' : 'search')}
              >
                <IconPath d="M11 5a6 6 0 1 0 3.7 10.7L21 21" />
              </button>
              <div className="popwrap search">
                <label className="sr" htmlFor="tb-search">Search</label>
                <input
                  ref={searchInputRef}
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
                  <div className="pop searchpop" aria-label="Search results">
                    {renderSearchHits()}
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
          {pop === 'search' ? (
            <div className="searchsheet" role="search">
              <div className="row nowrap">
                <label className="sr" htmlFor="tb-search-sheet">Search</label>
                <input
                  ref={searchSheetInputRef}
                  id="tb-search-sheet"
                  className="input"
                  type="search"
                  placeholder="Search plates, jobs, people"
                  value={q}
                  autoComplete="off"
                  onChange={(event) => setQ(event.target.value)}
                />
                <button type="button" className="btn ghost icbtn" aria-label="Close search" onClick={closePop}>
                  <IconPath d="M6 6l12 12M18 6L6 18" />
                </button>
              </div>
              {ready ? (
                <div className="pop searchpop" aria-label="Search results">
                  {renderSearchHits()}
                </div>
              ) : (
                <div className="muted sm pad">Type at least 2 characters.</div>
              )}
            </div>
          ) : null}
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
