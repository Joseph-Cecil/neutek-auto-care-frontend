'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Wrench, ChevronRight, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input }  from '@/components/ui/input';
import { JobStatusBadge } from '@/components/shared/StatusBadge';
import { SectionLoader }  from '@/components/shared/LoadingSpinner';
import { EmptyState }     from '@/components/shared/EmptyState';
import { ErrorAlert }     from '@/components/shared/ErrorAlert';
import { Pagination }     from '@/components/shared/Pagination';
import { useJobs }        from '@/hooks/useJobs';
import { useAuthStore }   from '@/stores/auth.store';
import { formatDate }     from '@/lib/utils/date';
import { cn }             from '@/lib/utils/cn';
import type { JobStatus } from '@/lib/dto';

const STATUS_FILTERS: { label: string; value: JobStatus | undefined }[] = [
  { label: 'All',          value: undefined },
  { label: 'Active',       value: 'in_progress' },
  { label: 'Diagnosing',   value: 'diagnosing' },
  { label: 'Quote Sent',   value: 'quote_sent' },
  { label: 'Ready',        value: 'ready_for_pickup' },
  { label: 'Completed',    value: 'completed' },
];

export default function PortalJobsPage() {
  const user   = useAuthStore((s) => s.user);
  const [status, setStatus] = useState<JobStatus | undefined>(undefined);
  const [page,   setPage]   = useState(1);

  const { data, isLoading, error } = useJobs({
    page,
    limit: 10,
    status,
  });

  const jobs       = data?.data       ?? [];
  const totalPages = data?.totalPages ?? 1;
  const total      = data?.total      ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold lg:text-3xl">My Jobs</h1>
          <p className="mt-1 text-muted-foreground">
            {total} job{total !== 1 ? 's' : ''} total
          </p>
        </div>
        <Link href="/booking">
          <Button className="gap-1.5">
            <Wrench className="h-4 w-4" /> Book New Service
          </Button>
        </Link>
      </div>

      {/* Status filters */}
      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map(({ label, value }) => (
          <button key={label}
            onClick={() => { setStatus(value); setPage(1); }}
            className={cn(
              'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
              status === value
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border text-muted-foreground hover:border-primary/50 hover:text-foreground',
            )}>
            {label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <SectionLoader />
      ) : error ? (
        <ErrorAlert message="Failed to load your jobs. Please refresh the page." />
      ) : jobs.length === 0 ? (
        <EmptyState
          icon={<Wrench className="h-6 w-6" />}
          title="No jobs found"
          description="You have no repair jobs matching this filter."
          action={{ label: 'Book a Service', onClick: () => window.location.href = '/booking' }}
        />
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <Link key={job.id} href={"/portal/jobs/" + job.id}>
              <Card className="cursor-pointer transition-all hover:border-primary/40">
                <CardContent className="flex items-center justify-between gap-4 p-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{job.title}</p>
                      <JobStatusBadge status={job.status} />
                    </div>
                    <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <span className="font-mono">{job.job_number}</span>
                      <span>{formatDate(job.created_at)}</span>
                      {job.estimated_completion_at && (
                        <span>Est. done: {formatDate(job.estimated_completion_at)}</span>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}