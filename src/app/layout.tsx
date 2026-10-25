import type { Metadata, Viewport } from 'next';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import './nt-screens.css';
import { Providers } from '@/providers';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-jakarta',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Neutek Auto Care',
    template: '%s | Neutek Auto Care',
  },
  description: 'Smart Diagnostics. ECU Repair. Complete Auto Care.',
  keywords: ['auto care', 'car repair', 'ECU repair', 'diagnostics', 'Ghana', 'Accra'],
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'https://neutekautocare.com'),
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#0A1628',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jakarta.variable}`} suppressHydrationWarning>
      <body className="bg-background min-h-screen font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
