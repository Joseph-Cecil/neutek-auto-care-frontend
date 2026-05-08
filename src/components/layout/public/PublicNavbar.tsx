'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Zap, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/auth.store';
import { cn } from '@/lib/utils/cn';

const NAV_LINKS = [
  { href: '/home',     label: 'Home' },
  { href: '/services', label: 'Services' },
  { href: '/booking',  label: 'Book Service' },
  { href: '/tracking', label: 'Track My Car' },
  { href: '/blog',     label: 'Blog' },
];

export function PublicNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname      = usePathname();
  const user          = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const portalHref = user?.role === 'customer' ? '/portal/dashboard' : '/admin/dashboard';

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#0A1628]/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">

        {/* Logo */}
        <Link href="/home" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-bold text-white leading-none">Neutek</p>
            <p className="text-[10px] text-white/50 leading-none">Auto Care</p>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map(({ href, label }) => (
            <Link key={href} href={href} className={cn(
              'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              pathname === href || pathname.startsWith(href + '/')
                ? 'bg-white/10 text-white'
                : 'text-white/60 hover:bg-white/5 hover:text-white',
            )}>
              {label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden items-center gap-2 lg:flex">
          {isAuthenticated ? (
            <Link href={portalHref}>
              <Button size="sm" className="gap-1.5">
                My Portal <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-white/70 hover:text-white hover:bg-white/10">
                  Sign In
                </Button>
              </Link>
              <Link href="/booking">
                <Button size="sm" className="gap-1.5">
                  Book Service <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white lg:hidden"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-white/10 bg-[#0A1628] px-4 py-4 lg:hidden">
          <nav className="flex flex-col gap-1">
            {NAV_LINKS.map(({ href, label }) => (
              <Link key={href} href={href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  pathname === href
                    ? 'bg-white/10 text-white'
                    : 'text-white/60 hover:bg-white/5 hover:text-white',
                )}>
                {label}
              </Link>
            ))}
          </nav>
          <div className="mt-4 flex flex-col gap-2 border-t border-white/10 pt-4">
            {isAuthenticated ? (
              <Link href={portalHref} onClick={() => setMobileOpen(false)}>
                <Button className="w-full">My Portal</Button>
              </Link>
            ) : (
              <>
                <Link href="/login" onClick={() => setMobileOpen(false)}>
                  <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10">
                    Sign In
                  </Button>
                </Link>
                <Link href="/booking" onClick={() => setMobileOpen(false)}>
                  <Button className="w-full">Book Service</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}