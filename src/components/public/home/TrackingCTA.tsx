'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin } from 'lucide-react';
import { Input }  from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function TrackingCTA() {
  const [jobNumber, setJobNumber] = useState('');
  const router = useRouter();

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = jobNumber.trim().toUpperCase();
    if (trimmed) router.push('/tracking/' + trimmed);
  };

  return (
    <section className="py-20 lg:py-28 bg-gradient-to-r from-primary/10 to-blue-600/10">
      <div className="mx-auto max-w-4xl px-4 text-center lg:px-8">
        <div className="mb-4 flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/20">
            <MapPin className="h-7 w-7 text-primary" />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-white lg:text-4xl">
          Track Your Repair in Real Time
        </h2>
        <p className="mt-4 max-w-xl mx-auto text-white/50">
          Enter your job number to see live status updates, approve quotes, and pay invoices.
        </p>

        <form onSubmit={handleTrack}
          className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
            <Input
              value={jobNumber}
              onChange={(e) => setJobNumber(e.target.value)}
              placeholder="e.g. JOB-20240115-000042"
              className="h-12 pl-9 border-white/20 bg-white/10 text-white placeholder:text-white/30 focus:border-primary"
            />
          </div>
          <Button type="submit" size="lg" className="h-12 w-full px-8 sm:w-auto"
            disabled={!jobNumber.trim()}>
            Track Now
          </Button>
        </form>

        <p className="mt-4 text-xs text-white/30">
          Your job number was sent via SMS/email when your vehicle was checked in.
        </p>
      </div>
    </section>
  );
}