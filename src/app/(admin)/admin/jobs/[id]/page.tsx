'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, AlertCircle, Wrench,
  ChevronDown, Clock, User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { JobStatusBadge } from '@/components/shared/StatusBadge';
import { SectionLoader, LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useAdminJob, useAdminTransitionJob } from '@/hooks/useAdminJobs';
import { useJobHistory } from '@/hooks/useJobs';
import { VALID_TRANSITIONS, getStatusMeta } from '@/lib/utils/jobStatus';
import { formatDateTime, formatDate } from '@/lib/utils/date';
import type { JobStatus } from '@/lib/dto';

export default function AdminJobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: job, isLoading, error } = useAdminJob(id);
  const { data: history }               = useJobHistory(id);
  const { mutate: transition, isPending: transitioning } = useAdminTransitionJob();

  const [showTransition, setShowTransition] = useState(false);
  const [targetStatus,   setTargetStatus]   = useState<JobStatus | null>(null);
  const [notes,          setNotes]          = useState('');

  if (isLoading) return <SectionLoader />;

  if (error || !job) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <AlertCircle className="h-10 w-10 text-destructive" />
        <h2 className="text-lg font-semibold">Job not found</h2>
        <Link href="/admin/jobs">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Jobs
          </Button>
        </Link>
      </div>
    );
  }

  const validNextStatuses = VALID_TRANSITIONS[job.status];

  const handleTransition = () => {
    if (!targetStatus) return;
    transition(
      { id, body: { status: targetStatus, notes: notes || undefined } },
      { onSuccess: () => { setShowTransition(false); setNotes(''); setTargetStatus(null); } },
    );
  };

  return (
    <div className="space-y-6">
      <Link href="/admin/jobs">
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
            <span className="text-xs capitalize text-muted-foreground">
              Priority: {job.priority}
            </span>
          </div>
        </div>

        {/* Transition button */}
        {validNextStatuses.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="gap-1.5" disabled={transitioning}>
                {transitioning && <LoadingSpinner size="sm" className="mr-1" />}
                Update Status <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {validNextStatuses.map((status) => (
                <DropdownMenuItem key={status}
                  onClick={() => { setTargetStatus(status); setShowTransition(true); }}>
                  <JobStatusBadge status={status} className="mr-2" />
                  {getStatusMeta(status).label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Job info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Wrench className="h-4 w-4 text-primary" /> Job Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Created</span>
              <span>{formatDate(job.created_at)}</span>
            </div>
            {job.estimated_completion_at && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" /> Est. Completion
                </span>
                <span>{formatDateTime(job.estimated_completion_at)}</span>
              </div>
            )}
            {job.actual_completion_at && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Completed</span>
                <span>{formatDateTime(job.actual_completion_at)}</span>
              </div>
            )}
            {job.assigned_technician_id && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1">
                  <User className="h-3.5 w-3.5" /> Technician
                </span>
                <span className="font-mono text-xs">{job.assigned_technician_id}</span>
              </div>
            )}
            {job.description && (
              <div className="border-t border-border pt-3">
                <p className="mb-1 text-muted-foreground">Description</p>
                <p>{job.description}</p>
              </div>
            )}
            {job.intake_notes && (
              <div className="border-t border-border pt-3">
                <p className="mb-1 text-muted-foreground">Intake Notes</p>
                <p>{job.intake_notes}</p>
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
                      <div className="flex flex-wrap items-center gap-1.5">
                        {entry.from_status && (
                          <>
                            <JobStatusBadge status={entry.from_status} />
                            <span className="text-muted-foreground">→</span>
                          </>
                        )}
                        <JobStatusBadge status={entry.to_status} />
                      </div>
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

      {/* Quick links */}
      <div className="flex flex-wrap gap-3">
        <Link href={"/admin/quotes?jobId=" + id}>
          <Button variant="outline" size="sm">View Quotes</Button>
        </Link>
        <Link href={"/admin/invoices?jobId=" + id}>
          <Button variant="outline" size="sm">View Invoices</Button>
        </Link>
        <Link href={"/tracking/" + job.job_number} target="_blank">
          <Button variant="outline" size="sm">Public Tracking</Button>
        </Link>
      </div>

      {/* Transition dialog */}
      <Dialog open={showTransition} onOpenChange={setShowTransition}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Update Status to{' '}
              {targetStatus ? getStatusMeta(targetStatus).label : ''}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {targetStatus ? getStatusMeta(targetStatus).description : ''}
            </p>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes (optional)..."
              rows={3}
            />
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowTransition(false)}>
              Cancel
            </Button>
            <Button onClick={handleTransition} disabled={transitioning}>
              {transitioning && <LoadingSpinner size="sm" className="mr-2" />}
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}