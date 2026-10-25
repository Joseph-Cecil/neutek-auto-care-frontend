'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { PageSkeleton } from '@/components/ui/page-skeleton';
import { TopProgress } from '@/components/ui/top-progress';
import { useJobs } from '@/hooks/useJobs';
import { formatDate } from '@/lib/utils/date';
import { getStatusMeta } from '@/lib/utils/jobStatus';
import type { JobStatus } from '@/lib/dto';

const STATUS_FILTERS: { label: string; value: JobStatus | undefined }[] = [
  { label: 'All',          value: undefined },
  { label: 'Active',       value: 'in_progress' },
  { label: 'Diagnosing',   value: 'diagnosing' },
  { label: 'Quote Sent',   value: 'quote_sent' },
  { label: 'Ready',        value: 'ready_for_pickup' },
  { label: 'Completed',    value: 'completed' },
];

function jobPill(status: JobStatus): string {
  if (status === 'completed' || status === 'ready_for_pickup') return 'pill ok';
  if (status === 'cancelled' || status === 'quote_rejected') return 'pill bad';
  if (status === 'diagnosing' || status === 'quality_check' || status === 'quote_sent') return 'pill warn';
  if (status === 'in_progress' || status === 'quote_approved') return 'pill brand';
  return 'pill';
}

export default function PortalJobsPage() {
  const [status, setStatus] = useState<JobStatus | undefined>(undefined);
  const [page, setPage] = useState(1);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const { data, isLoading, isError } = useJobs({
    page,
    limit: 10,
    status,
  });

  const jobs       = data?.data       ?? [];
  const totalPages = data?.totalPages ?? 1;
  const total      = data?.total      ?? 0;

  const choose = (index: number) => {
    const next = STATUS_FILTERS[index];
    if (!next) return;
    setStatus(next.value);
    setPage(1);
    tabRefs.current[index]?.focus();
  };

  return (
    <>
      <TopProgress active={isLoading} />
      {isLoading ? <PageSkeleton kind="list" /> : (
        <>
          <div className="pagehead">
            <div className="ttl">
              <h1>My jobs</h1>
              <p className="muted">Every visit, with its latest status.</p>
              {!isError && data ? <p className="faint sm">{total} {total === 1 ? 'job' : 'jobs'}</p> : null}
            </div>
            <div className="row">
              <Link href="/booking" className="btn primary">Book service</Link>
            </div>
          </div>
          <div className="tabs" role="tablist" aria-label="Job status">
            {STATUS_FILTERS.map(({ label, value }, index) => (
              <button
                key={label}
                ref={(node) => { tabRefs.current[index] = node; }}
                type="button"
                className="tab"
                role="tab"
                aria-selected={status === value}
                onClick={() => choose(index)}
                onKeyDown={(event) => {
                  if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
                  event.preventDefault();
                  const delta = event.key === 'ArrowRight' ? 1 : -1;
                  const next = (index + delta + STATUS_FILTERS.length) % STATUS_FILTERS.length;
                  choose(next);
                }}
              >
                {label}
              </button>
            ))}
          </div>
          {isError && !data ? (
            <div className="banner" role="alert">Failed to load your jobs. Please refresh the page.</div>
          ) : jobs.length === 0 ? (
            <div className="card">
              <div className="empty">
                <h2>No jobs found</h2>
                <p className="muted">You have no repair jobs matching this filter.</p>
                <Link href="/booking" className="btn primary">Book a service</Link>
              </div>
            </div>
          ) : (
            <div className="stack">
              <div className="card flush">
                <div className="tw">
                  <table className="tbl">
                    <thead>
                      <tr>
                        <th>Job</th>
                        <th>Status</th>
                        <th>Updated</th>
                      </tr>
                    </thead>
                    <tbody>
                      {jobs.map((job) => (
                        <tr key={job.id}>
                          <td>
                            <Link href={'/portal/jobs/' + job.id} className="b">{job.job_number}</Link>
                            <div className="faint sm">{job.title}</div>
                          </td>
                          <td><span className={jobPill(job.status)}>{getStatusMeta(job.status).label}</span></td>
                          <td>
                            <div>{formatDate(job.updated_at)}</div>
                            {job.estimated_completion_at ? (
                              <div className="faint sm">Est. done {formatDate(job.estimated_completion_at)}</div>
                            ) : null}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              {totalPages > 1 ? (
                <div className="row sb">
                  <span className="muted sm">Page {page} of {totalPages}</span>
                  <div className="row">
                    <button type="button" className="btn sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
                    <button type="button" className="btn sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</button>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </>
      )}
    </>
  );
}
