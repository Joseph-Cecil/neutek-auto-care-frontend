import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/providers';

const inter = Inter({
  subsets:  ['latin'],
  variable: '--font-inter',
  display:  'swap',
});

export const metadata: Metadata = {
  title: {
    default:  'Neutek Auto Care',
    template: '%s | Neutek Auto Care',
  },
  description: 'Smart Diagnostics. ECU Repair. Complete Auto Care.',
  keywords:    ['auto care', 'car repair', 'ECU repair', 'diagnostics', 'Ghana', 'Accra'],
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'https://neutekautocare.com'),
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor:   '#0A1628',
  width:        'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}