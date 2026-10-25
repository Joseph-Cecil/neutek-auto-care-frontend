'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { PageSkeleton } from '@/components/ui/page-skeleton';
import { TopProgress } from '@/components/ui/top-progress';
import { useJob, useJobHistory } from '@/hooks/useJobs';
import { getStatusMeta, JOB_STATUS_STEPS } from '@/lib/utils/jobStatus';
import { formatDate, formatDateTime } from '@/lib/utils/date';
import type { JobStatus } from '@/lib/dto';

function jobPill(status: JobStatus): string {
  if (status === 'completed' || status === 'ready_for_pickup') return 'pill ok';
  if (status === 'cancelled' || status === 'quote_rejected') return 'pill bad';
  if (status === 'diagnosing' || status === 'quality_check' || status === 'quote_sent') return 'pill warn';
  if (status === 'in_progress' || status === 'quote_approved') return 'pill brand';
  return 'pill';
}

export default function PortalJobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: job, isLoading, isError } = useJob(id);
  const { data: history, isLoading: historyLoading, isError: historyError } = useJobHistory(id);

  const currentStep = job ? getStatusMeta(job.status).step : 0;
  const offTrack = job?.status === 'cancelled' || job?.status === 'quote_rejected';

  const whenFor = (status: JobStatus): string | null => {
    if (!history || historyError) return null;
    const matches = history.filter((entry) => entry.to_status === status);
    const last = matches[matches.length - 1];
    return last ? formatDateTime(last.created_at) : null;
  };

  return (
    <>
      <TopProgress active={isLoading || historyLoading} />
      {isLoading ? <PageSkeleton kind="detail" /> : isError && !job ? (
        <div className="stack">
          <div className="banner" role="alert">Could not load this job.</div>
          <Link href="/portal/jobs" className="btn sm">Back to my jobs</Link>
        </div>
      ) : !job ? (
        <div className="stack">
          <div className="banner info" role="status">This job could not be found.</div>
          <Link href="/portal/jobs" className="btn sm">Back to my jobs</Link>
        </div>
      ) : (
        <>
          <div className="pagehead">
            <div className="ttl">
              <div className="row">
                <Link href="/portal/jobs" className="btn sm">Back to my jobs</Link>
              </div>
              <div className="row">
                <h1>{job.job_number}</h1>
                <span className={jobPill(job.status)}>{getStatusMeta(job.status).label}</span>
              </div>
              <p className="muted">{job.title} · Priority {job.priority}</p>
            </div>
            <div className="row">
              <Link href={'/tracking/' + job.job_number} className="btn sm">Live tracking</Link>
            </div>
          </div>
          <div className="stack">
            <div className="card stack s">
              <h2>Latest from the workshop</h2>
              {job.description ? <p>{job.description}</p> : <p className="muted">No workshop note yet.</p>}
              {job.completion_notes ? <p className="muted">Completion notes: {job.completion_notes}</p> : null}
            </div>
            <div className="card stack s">
              <h2>Progress</h2>
              {offTrack ? (
                <div className="banner info">
                  {job.status === 'cancelled'
                    ? 'This job was cancelled.'
                    : 'This quote was rejected, so the usual progress is paused.'}
                </div>
              ) : null}
              <div className="stack s">
                {JOB_STATUS_STEPS.map((status) => {
                  const meta = getStatusMeta(status);
                  const done = !offTrack && currentStep > meta.step;
                  const active = job.status === status;
                  const when = whenFor(status);
                  return (
                    <div key={status} className="row sb">
                      <span className="row">
                        <span className={active ? 'pill brand' : done ? 'pill ok' : 'pill'}>{meta.label}</span>
                        {active ? <span className="pill brand">Current</span> : null}
                      </span>
                      {when ? <span className="faint sm">{when}</span> : null}
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="card stack s">
              <h2>Job details</h2>
              <dl className="kv">
                <dt>Created</dt>
                <dd>{formatDate(job.created_at)}</dd>
                {job.estimated_completion_at ? (
                  <>
                    <dt>Est. completion</dt>
                    <dd>{formatDateTime(job.estimated_completion_at)}</dd>
                  </>
                ) : null}
                {job.actual_completion_at ? (
                  <>
                    <dt>Completed</dt>
                    <dd>{formatDateTime(job.actual_completion_at)}</dd>
                  </>
                ) : null}
              </dl>
            </div>
            <div className="card stack s">
              <h2>Status history</h2>
              {historyLoading ? (
                <p className="muted">Loading status history.</p>
              ) : historyError && !history ? (
                <div className="banner" role="alert">Failed to load status history.</div>
              ) : !history || history.length === 0 ? (
                <p className="muted">No history yet</p>
              ) : (
                <div className="stack s">
                  {[...history].reverse().map((entry) => (
                    <div key={entry.id}>
                      <span className={jobPill(entry.to_status)}>{getStatusMeta(entry.to_status).label}</span>
                      <p className="faint sm">{formatDateTime(entry.created_at)}</p>
                      {entry.notes ? <p className="muted sm">{entry.notes}</p> : null}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
