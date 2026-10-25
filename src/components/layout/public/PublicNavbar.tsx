'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { homeForRole } from '@/lib/utils/permissions';

const LINKS = [
  { href: '/home', label: 'Home' },
  { href: '/services', label: 'Services' },
  { href: '/booking', label: 'Book service' },
  { href: '/tracking', label: 'Track' },
  { href: '/blog', label: 'Blog' },
];

export function PublicNavbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const accountHref = user ? homeForRole(user.role) : '/login';

  return (
    <header className="pubbar">
      <div className="in">
        <Link href="/home" className="brandlink" aria-label="Neutek Auto Care home">
          <span className="mark">NT</span>
          <span>
            <span className="b" style={{ display: 'block', lineHeight: 1.1 }}>Neutek</span>
            <span className="faint sm">Auto Care</span>
          </span>
        </Link>
        <nav aria-label="Site" className={open ? 'pubnav open' : 'pubnav'}>
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={pathname === link.href || (link.href !== '/home' && pathname.startsWith(link.href)) ? 'page' : undefined}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="row" style={{ marginLeft: 'auto', gap: 8, flexWrap: 'nowrap' }}>
          {isAuthenticated ? (
            <Link href={accountHref} className="btn ghost hide">Open my account</Link>
          ) : (
            <Link href="/login" className="btn ghost hide">Sign in</Link>
          )}
          <Link href="/booking" className="btn primary">Book service</Link>
          <button type="button" className="btn ghost pubmenu" aria-label="Menu" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
            Menu
          </button>
        </div>
      </div>
    </header>
  );
}
