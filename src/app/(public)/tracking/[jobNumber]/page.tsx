'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Wifi, WifiOff, Clock, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { JobStatusBadge } from '@/components/shared/StatusBadge';
import { SectionLoader }  from '@/components/shared/LoadingSpinner';
import { StatusTimeline } from '@/components/public/tracking/StatusTimeline';
import { useTrackingRest, useTrackingSocket } from '@/hooks/useTracking';
import { formatDateTime } from '@/lib/utils/date';
import { cn } from '@/lib/utils/cn';

export default function TrackingDetailPage() {
  const params    = useParams();
  const jobNumber = (params.jobNumber as string).toUpperCase();

  // REST (primary data + SSR fallback)
  const { data: restData, isLoading, error } = useTrackingRest(jobNumber);

  // WebSocket (real-time updates — overrides REST when available)
  const { data: wsData, connected } = useTrackingSocket(jobNumber);

  const tracking = wsData ?? restData;

  if (isLoading) return <SectionLoader />;

  if (error || !tracking) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center lg:px-8">
        <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
        <h2 className="mt-4 text-xl font-bold text-white">Job not found</h2>
        <p className="mt-2 text-white/50">
          We couldn&apos;t find job <span className="font-mono text-white">{jobNumber}</span>.
          Check your job number and try again.
        </p>
        <Link href="/tracking" className="mt-6 block">
          <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 gap-2">
            <ArrowLeft className="h-4 w-4" /> Try Again
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 lg:px-8">
      {/* Back */}
      <Link href="/tracking">
        <Button variant="ghost" size="sm" className="mb-6 gap-1.5 text-white/50 hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Back to search
        </Button>
      </Link>

      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-mono text-white/40">{tracking.jobNumber}</p>
          <h1 className="mt-1 text-xl font-bold text-white">{tracking.title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className={cn('flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
            connected ? 'bg-green-500/10 text-green-400' : 'bg-white/10 text-white/40',
          )}>
            {connected
              ? <><Wifi className="h-3 w-3" /> Live</>
              : <><WifiOff className="h-3 w-3" /> Offline</>}
          </div>
          <JobStatusBadge status={tracking.status} />
        </div>
      </div>

      {/* Estimated completion */}
      {tracking.estimatedCompletionAt && (
        <Card className="mb-6 border-white/10 bg-white/5">
          <CardContent className="flex items-center gap-3 p-4">
            <Clock className="h-5 w-5 text-primary shrink-0" />
            <div>
              <p className="text-xs text-white/40">Estimated completion</p>
              <p className="text-sm font-medium text-white">
                {formatDateTime(tracking.estimatedCompletionAt)}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timeline */}
      <Card className="border-white/10 bg-white/5">
        <CardHeader>
          <CardTitle className="text-base text-white">Repair Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <StatusTimeline tracking={tracking} />
        </CardContent>
      </Card>

      {/* Portal CTA */}
      <div className="mt-6 rounded-xl border border-primary/20 bg-primary/5 p-4 text-center">
        <p className="text-sm text-white/60">
          Have an account?{' '}
          <Link href="/login" className="text-primary hover:underline font-medium">
            Sign in
          </Link>{' '}
          to approve quotes, pay invoices, and see full history.
        </p>
      </div>
    </div>
  );
}