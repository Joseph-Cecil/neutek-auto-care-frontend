'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Clock, User, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { JobStatusBadge } from '@/components/shared/StatusBadge';
import { SectionLoader }  from '@/components/shared/LoadingSpinner';
import { useJob, useJobHistory } from '@/hooks/useJobs';
import { getStatusMeta, JOB_STATUS_STEPS } from '@/lib/utils/jobStatus';
import { formatDate, formatDateTime } from '@/lib/utils/date';
import { cn } from '@/lib/utils/cn';

export default function PortalJobDetailPage() {
  const { id }  = useParams<{ id: string }>();
  const { data: job, isLoading, error } = useJob(id);
  const { data: history }               = useJobHistory(id);

  if (isLoading) return <SectionLoader />;

  if (error || !job) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <AlertCircle className="h-10 w-10 text-destructive" />
        <h2 className="text-lg font-semibold">Job not found</h2>
        <Link href="/portal/jobs">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Jobs
          </Button>
        </Link>
      </div>
    );
  }

  const currentStep  = getStatusMeta(job.status).step;

  return (
    <div className="space-y-6">
      {/* Back */}
      <Link href="/portal/jobs">
        <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to Jobs
        </Button>
      </Link>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-xs text-muted-foreground">{job.job_number}</p>
          <h1 className="mt-1 text-xl font-bold">{job.title}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <JobStatusBadge status={job.status} />
            <span className="text-xs text-muted-foreground capitalize">
              Priority: {job.priority}
            </span>
          </div>
        </div>
        <Link href={"/tracking/" + job.job_number}>
          <Button variant="outline" size="sm">Live Tracking</Button>
        </Link>
      </div>

      {/* Progress steps */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Repair Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between overflow-x-auto pb-2">
            {JOB_STATUS_STEPS.map((status, i) => {
              const meta    = getStatusMeta(status);
              const done    = currentStep > meta.step;
              const active  = job.status === status;
              return (
                <div key={status} className="flex flex-1 flex-col items-center min-w-[60px]">
                  {i > 0 && (
                    <div className="sr-only" />
                  )}
                  <div className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold',
                    done   ? 'border-primary bg-primary text-primary-foreground' :
                    active ? 'border-primary bg-primary/10 text-primary' :
                             'border-border text-muted-foreground',
                  )}>
                    {done ? '✓' : i + 1}
                  </div>
                  <p className={cn(
                    'mt-1 text-center text-[10px] leading-tight',
                    active ? 'font-semibold text-primary' :
                    done   ? 'text-foreground' : 'text-muted-foreground',
                  )}>
                    {meta.label}
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Job details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Job Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Created</span>
              <span>{formatDate(job.created_at)}</span>
            </div>
            {job.estimated_completion_at && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Est. Completion</span>
                <span>{formatDateTime(job.estimated_completion_at)}</span>
              </div>
            )}
            {job.actual_completion_at && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Completed</span>
                <span>{formatDateTime(job.actual_completion_at)}</span>
              </div>
            )}
            {job.description && (
              <div className="border-t border-border pt-3">
                <p className="mb-1 text-muted-foreground">Description</p>
                <p>{job.description}</p>
              </div>
            )}
            {job.completion_notes && (
              <div className="border-t border-border pt-3">
                <p className="mb-1 text-muted-foreground">Completion Notes</p>
                <p>{job.completion_notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status history */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Status History</CardTitle>
          </CardHeader>
          <CardContent>
            {!history || history.length === 0 ? (
              <p className="text-sm text-muted-foreground">No history yet</p>
            ) : (
              <ul className="space-y-3">
                {[...history].reverse().map((entry, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                    <div>
                      <JobStatusBadge status={entry.to_status} />
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {formatDateTime(entry.created_at)}
                      </p>
                      {entry.notes && (
                        <p className="mt-0.5 text-xs text-muted-foreground">{entry.notes}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}