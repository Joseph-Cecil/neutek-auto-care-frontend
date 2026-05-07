import Link from 'next/link';
import { Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background p-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary">
        <Zap className="h-8 w-8 text-primary-foreground" />
      </div>
      <div>
        <h1 className="text-6xl font-bold text-primary">404</h1>
        <h2 className="mt-2 text-2xl font-semibold">Page not found</h2>
        <p className="mt-2 max-w-md text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
      </div>
      <div className="flex gap-3">
        <Link href="/home"><Button>Go Home</Button></Link>
        <Link href="/portal/dashboard"><Button variant="outline">My Portal</Button></Link>
      </div>
    </div>
  );
}