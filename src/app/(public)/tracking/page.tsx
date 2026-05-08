'use client';

import { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Zap } from 'lucide-react';
import { Input }  from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SectionLoader } from '@/components/shared/LoadingSpinner';

function TrackingSearch() {
  const [jobNumber, setJobNumber] = useState('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = jobNumber.trim().toUpperCase();
    if (trimmed) router.push('/tracking/' + trimmed);
  };

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="w-full max-w-lg text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/20">
          <Zap className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-white lg:text-4xl">Track Your Car</h1>
        <p className="mt-3 text-white/50">
          Enter your job number to see real-time repair status, approve quotes, and pay invoices.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
            <Input
              value={jobNumber}
              onChange={(e) => setJobNumber(e.target.value.toUpperCase())}
              placeholder="JOB-20240115-000042"
              className="pl-9 h-12 border-white/20 bg-white/10 font-mono text-white placeholder:text-white/30 focus:border-primary"
            />
          </div>
          <Button type="submit" size="lg" className="h-12 px-8" disabled={!jobNumber.trim()}>
            Track Now
          </Button>
        </form>

        <p className="mt-4 text-xs text-white/30">
          Your job number was sent via SMS/email when your vehicle was checked in.
        </p>
      </div>
    </div>
  );
}

export default function TrackingPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 lg:px-8">
      <Suspense fallback={<SectionLoader />}>
        <TrackingSearch />
      </Suspense>
    </div>
  );
}