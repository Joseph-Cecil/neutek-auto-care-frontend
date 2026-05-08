import Link from 'next/link';
import { Zap, Phone, Mail, MapPin } from 'lucide-react';

const FOOTER_LINKS = {
  Services: [
    { label: 'ECU Repair',       href: '/services' },
    { label: 'Engine Diagnostics', href: '/services' },
    { label: 'Brake Repair',     href: '/services' },
    { label: 'Oil Service',      href: '/services' },
    { label: 'Fleet Maintenance',href: '/services' },
  ],
  Company: [
    { label: 'Home',        href: '/home' },
    { label: 'Services',    href: '/services' },
    { label: 'Book Service',href: '/booking' },
    { label: 'Track My Car',href: '/tracking' },
    { label: 'Blog',        href: '/blog' },
  ],
  Account: [
    { label: 'Sign In',         href: '/login' },
    { label: 'Create Account',  href: '/register' },
    { label: 'Customer Portal', href: '/portal/dashboard' },
    { label: 'Track Repair',    href: '/tracking' },
  ],
};

export function PublicFooter() {
  return (
    <footer className="border-t border-white/10 bg-[#0A1628]">
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">

          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/home" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-bold text-white">Neutek Auto Care</p>
                <p className="text-xs text-white/40">Smart Diagnostics & ECU Repair</p>
              </div>
            </Link>
            <p className="mt-4 text-sm text-white/50 leading-relaxed max-w-xs">
              Ghana&apos;s leading technology-driven automotive service company.
              Advanced diagnostics, ECU repair, and complete vehicle care.
            </p>
            <div className="mt-6 space-y-2">
              <a href="tel:+233XXXXXXXXX" className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors">
                <Phone className="h-4 w-4 text-primary" /> +233 XX XXX XXXX
              </a>
              <a href="mailto:info@neutekautocare.com" className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors">
                <Mail className="h-4 w-4 text-primary" /> info@neutekautocare.com
              </a>
              <p className="flex items-center gap-2 text-sm text-white/50">
                <MapPin className="h-4 w-4 text-primary shrink-0" /> Accra, Ghana
              </p>
            </div>
          </div>

          {/* Links */}
          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <h3 className="mb-3 text-sm font-semibold text-white">{title}</h3>
              <ul className="space-y-2">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <Link href={href} className="text-sm text-white/50 hover:text-white transition-colors">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 sm:flex-row">
          <p className="text-xs text-white/30">
            &copy; {new Date().getFullYear()} Neutek Auto Care. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a href="https://wa.me/233XXXXXXXXX" target="_blank" rel="noopener noreferrer"
              className="text-xs text-white/30 hover:text-white transition-colors">
              WhatsApp
            </a>
            <span className="text-white/20">·</span>
            <Link href="/blog" className="text-xs text-white/30 hover:text-white transition-colors">Blog</Link>
            <span className="text-white/20">·</span>
            <Link href="/tracking" className="text-xs text-white/30 hover:text-white transition-colors">Track Repair</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}