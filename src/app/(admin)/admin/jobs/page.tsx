'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PageSkeleton } from '@/components/ui/page-skeleton';
import { TopProgress } from '@/components/ui/top-progress';
import { useAdminJobs } from '@/hooks/useAdminJobs';
import { useAdminUsers } from '@/hooks/useAdminUsers';
import { useAuthStore } from '@/stores/auth.store';
import { formatDate } from '@/lib/utils/date';
import { fullName } from '@/lib/utils/format';
import { getStatusMeta } from '@/lib/utils/jobStatus';
import { isAdmin } from '@/lib/utils/permissions';
import type { JobPriority, JobStatus } from '@/lib/dto';

const STATUSES: { label: string; value: JobStatus | '' }[] = [
  { label: 'All', value: '' },
  { label: 'Intake', value: 'intake' },
  { label: 'Diagnosing', value: 'diagnosing' },
  { label: 'Quote sent', value: 'quote_sent' },
  { label: 'Quote approved', value: 'quote_approved' },
  { label: 'In progress', value: 'in_progress' },
  { label: 'Quality check', value: 'quality_check' },
  { label: 'Ready', value: 'ready_for_pickup' },
  { label: 'Completed', value: 'completed' },
  { label: 'Quote rejected', value: 'quote_rejected' },
  { label: 'Cancelled', value: 'cancelled' },
];

const PRIORITIES: { label: string; value: JobPriority | '' }[] = [
  { label: 'All', value: '' },
  { label: 'Low', value: 'low' },
  { label: 'Normal', value: 'normal' },
  { label: 'High', value: 'high' },
  { label: 'Urgent', value: 'urgent' },
];

function jobPill(status: JobStatus) {
  if (status === 'cancelled' || status === 'quote_rejected') return 'pill bad';
  if (status === 'completed' || status === 'ready_for_pickup' || status === 'quote_approved') return 'pill ok';
  if (status === 'diagnosing' || status === 'quality_check' || status === 'quote_sent') return 'pill warn';
  if (status === 'in_progress') return 'pill brand';
  return 'pill';
}

function priorityPill(priority: JobPriority) {
  if (priority === 'urgent') return 'pill bad';
  if (priority === 'high') return 'pill warn';
  return 'pill';
}

function Pager({ page, pages, onPage }: { page: number; pages: number; onPage: (page: number) => void }) {
  if (pages <= 1) return null;
  return (
    <div className="row end">
      <button type="button" className="btn sm" disabled={page <= 1} onClick={() => onPage(page - 1)}>Previous</button>
      <span className="muted sm">Page {page} of {pages}</span>
      <button type="button" className="btn sm" disabled={page >= pages} onClick={() => onPage(page + 1)}>Next</button>
    </div>
  );
}

function TechnicianFilter({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  const users = useAdminUsers({ role: 'technician', limit: 100 });
  const techs = (users.data?.data ?? []).filter((user) => user.role === 'technician');
  return (
    <div className="field">
      <label htmlFor="jf-t">Technician</label>
      <select id="jf-t" className="input" value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="">All</option>
        {techs.map((user) => (
          <option key={user.id} value={user.id}>{fullName(user.first_name, user.last_name)}</option>
        ))}
      </select>
      {users.isError && !users.data ? <span className="hint err">Could not load technicians.</span> : null}
    </div>
  );
}

export default function AdminJobsPage() {
  const router = useRouter();
  const role = useAuthStore((state) => state.user?.role);
  const admin = role ? isAdmin(role) : false;
  const [draft, setDraft] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<JobStatus | ''>('');
  const [priority, setPriority] = useState<JobPriority | ''>('');
  const [technicianId, setTechnicianId] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timer = window.setTimeout(() => setSearch(draft.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [draft]);

  const { data, isLoading, isError, isFetching } = useAdminJobs({
    status: status || undefined,
    priority: priority || undefined,
    search: search || undefined,
    technicianId: technicianId || undefined,
    page,
    limit: 20,
  });

  const jobs = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;
  const filtered = Boolean(search || status || priority || technicianId);

  const clear = () => {
    setDraft('');
    setSearch('');
    setStatus('');
    setPriority('');
    setTechnicianId('');
    setPage(1);
  };

  if (isLoading) {
    return (
      <>
        <TopProgress active />
        <PageSkeleton kind="list" />
      </>
    );
  }

  return (
    <div className="stack">
      <TopProgress active={isFetching} />
      <div className="pagehead">
        <div className="ttl">
          <h1>Jobs</h1>
          <p className="muted">Every car in the workshop, and where it has got to.{data ? ` ${data.total} jobs.` : ''}</p>
        </div>
        <div className="row">
          <Link href="/admin/jobs/create" className="btn primary">New job</Link>
        </div>
      </div>
      <div className="card">
        <div className="filters">
          <div className="field">
            <label htmlFor="jf-q">Search</label>
            <input
              id="jf-q"
              className="input"
              type="search"
              placeholder="Job number or title"
              value={draft}
              onChange={(event) => {
                setDraft(event.target.value);
                setPage(1);
              }}
            />
          </div>
          <div className="field">
            <label htmlFor="jf-s">Status</label>
            <select
              id="jf-s"
              className="input"
              value={status}
              onChange={(event) => {
                setStatus(event.target.value as JobStatus | '');
                setPage(1);
              }}
            >
              {STATUSES.map((option) => (
                <option key={option.label} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="jf-p">Priority</label>
            <select
              id="jf-p"
              className="input"
              value={priority}
              onChange={(event) => {
                setPriority(event.target.value as JobPriority | '');
                setPage(1);
              }}
            >
              {PRIORITIES.map((option) => (
                <option key={option.label} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          {admin ? (
            <TechnicianFilter
              value={technicianId}
              onChange={(value) => {
                setTechnicianId(value);
                setPage(1);
              }}
            />
          ) : null}
          <div>
            <button type="button" className="btn" onClick={clear}>Clear</button>
          </div>
        </div>
      </div>
      {isError && !data ? (
        <div className="banner" role="alert">Failed to load jobs. Please refresh the page.</div>
      ) : null}
      {!isError && jobs.length === 0 ? (
        <div className="card">
          <div className="empty">
            <h2>No jobs match</h2>
            <p className="muted">{filtered ? 'Nothing fits those filters. Clear them to see every job.' : 'No jobs yet.'}</p>
            {filtered ? <button type="button" className="btn" onClick={clear}>Clear filters</button> : null}
          </div>
        </div>
      ) : null}
      {jobs.length > 0 ? (
        <div className="card flush">
          <div className="tw">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Job</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Estimated</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr key={job.id} className="click" onClick={() => router.push(`/admin/jobs/${job.id}`)}>
                    <td>
                      <div className="two">
                        <Link href={`/admin/jobs/${job.id}`} className="b" onClick={(event) => event.stopPropagation()}>{job.job_number}</Link>
                        <span>{job.title}</span>
                      </div>
                    </td>
                    <td><span className={priorityPill(job.priority)}>{job.priority.charAt(0).toUpperCase() + job.priority.slice(1)}</span></td>
                    <td><span className={jobPill(job.status)}>{getStatusMeta(job.status).label}</span></td>
                    <td>{formatDate(job.created_at)}</td>
                    <td>{job.estimated_completion_at ? formatDate(job.estimated_completion_at) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
      {data ? <Pager page={page} pages={totalPages} onPage={setPage} /> : null}
    </div>
  );
}
