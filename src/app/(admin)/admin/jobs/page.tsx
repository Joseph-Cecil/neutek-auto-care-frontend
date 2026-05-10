'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Wrench, Plus, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageHeader }    from '@/components/admin/shared/PageHeader';
import { JobStatusBadge } from '@/components/shared/StatusBadge';
import { SectionLoader }  from '@/components/shared/LoadingSpinner';
import { EmptyState }     from '@/components/shared/EmptyState';
import { ErrorAlert }     from '@/components/shared/ErrorAlert';
import { Pagination }     from '@/components/shared/Pagination';
import { useAdminJobs }   from '@/hooks/useAdminJobs';
import { formatDate }     from '@/lib/utils/date';
import { cn }             from '@/lib/utils/cn';
import type { JobStatus, JobPriority } from '@/lib/dto';

const STATUS_TABS: { label: string; value: JobStatus | undefined }[] = [
  { label: 'All',        value: undefined },
  { label: 'Intake',     value: 'intake' },
  { label: 'Diagnosing', value: 'diagnosing' },
  { label: 'Quote Sent', value: 'quote_sent' },
  { label: 'In Progress',value: 'in_progress' },
  { label: 'QC Check',   value: 'quality_check' },
  { label: 'Ready',      value: 'ready_for_pickup' },
  { label: 'Completed',  value: 'completed' },
];

const PRIORITY_COLOR: Record<JobPriority, string> = {
  low:    'text-gray-400',
  normal: 'text-blue-400',
  high:   'text-amber-400',
  urgent: 'text-red-400',
};

export default function AdminJobsPage() {
  const [status, setStatus] = useState<JobStatus | undefined>(undefined);
  const [page,   setPage]   = useState(1);

  const { data, isLoading, error } = useAdminJobs({ status, page, limit: 20 });

  const jobs       = data?.data       ?? [];
  const totalPages = data?.totalPages ?? 1;
  const total      = data?.total      ?? 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Jobs"
        description={total + " total jobs"}
        action={
          <Link href="/admin/jobs/create">
            <Button className="gap-1.5">
              <Plus className="h-4 w-4" /> Create Job
            </Button>
          </Link>
        }
      />

      {/* Status tabs */}
      <div className="flex flex-wrap gap-2">
        {STATUS_TABS.map(({ label, value }) => (
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
        <ErrorAlert message="Failed to load jobs. Please refresh the page." />
      ) : jobs.length === 0 ? (
        <EmptyState
          icon={<Wrench className="h-6 w-6" />}
          title="No jobs found"
          description="No jobs match the current filter."
        />
      ) : (
        <div className="space-y-2">
          {jobs.map((job) => (
            <Link key={job.id} href={"/admin/jobs/" + job.id}>
              <Card className="cursor-pointer transition-all hover:border-primary/40">
                <CardContent className="flex items-center justify-between gap-4 p-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{job.title}</span>
                      <JobStatusBadge status={job.status} />
                      <span className={cn(
                        'text-xs font-medium capitalize',
                        PRIORITY_COLOR[job.priority],
                      )}>
                        {job.priority}
                      </span>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <span className="font-mono">{job.job_number}</span>
                      <span>Created: {formatDate(job.created_at)}</span>
                      {job.estimated_completion_at && (
                        <span>Est: {formatDate(job.estimated_completion_at)}</span>
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