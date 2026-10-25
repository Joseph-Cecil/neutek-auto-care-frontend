'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { PageSkeleton } from '@/components/ui/page-skeleton';
import { TopProgress } from '@/components/ui/top-progress';
import { useAdminJob, useAdminTransitionJob, useAdminUpdateJob } from '@/hooks/useAdminJobs';
import { useJobHistory } from '@/hooks/useJobs';
import { useAdminUsers } from '@/hooks/useAdminUsers';
import { useCustomer } from '@/hooks/useCustomers';
import { useVehicle } from '@/hooks/useVehicles';
import { useAuthStore } from '@/stores/auth.store';
import { formatDate, formatDateTime } from '@/lib/utils/date';
import { formatPhone, fullName } from '@/lib/utils/format';
import { VALID_TRANSITIONS, getStatusMeta } from '@/lib/utils/jobStatus';
import { isAdmin } from '@/lib/utils/permissions';
import type { JobPriority, JobStatus } from '@/lib/dto';

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

function TechnicianField({ jobId, assignedId }: { jobId: string; assignedId: string | null }) {
  const users = useAdminUsers({ role: 'technician', limit: 100 });
  const update = useAdminUpdateJob();
  const techs = (users.data?.data ?? []).filter((user) => user.role === 'technician' && (user.is_active || user.id === assignedId));
  const known = techs.some((user) => user.id === assignedId);

  return (
    <div className="field">
      <TopProgress active={users.isFetching || update.isPending} />
      <label htmlFor="jb-tech">Technician</label>
      <select
        id="jb-tech"
        className="input"
        value={assignedId ?? ''}
        disabled={update.isPending}
        onChange={(event) => {
          const value = event.target.value;
          update.mutate({ id: jobId, body: { assignedTechnicianId: value || null } });
        }}
      >
        <option value="">Unassigned</option>
        {assignedId && !known ? <option value={assignedId}>Assigned technician</option> : null}
        {techs.map((user) => (
          <option key={user.id} value={user.id}>{fullName(user.first_name, user.last_name)}</option>
        ))}
      </select>
      {users.isError && !users.data ? (
        <span className="hint err">Could not load technicians.</span>
      ) : (
        <span className="hint">Saves as soon as you choose.</span>
      )}
    </div>
  );
}

export default function AdminJobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const role = useAuthStore((state) => state.user?.role);
  const admin = role ? isAdmin(role) : false;
  const { data: job, isLoading, isFetching } = useAdminJob(id);
  const { data: history, isLoading: historyLoading, isError: historyError, isFetching: historyFetching } = useJobHistory(id);
  const customer = useCustomer(job?.customer_id ?? '');
  const vehicle = useVehicle(job?.vehicle_id ?? '');
  const { mutate: transition, isPending: transitioning } = useAdminTransitionJob();

  const [showTransition, setShowTransition] = useState(false);
  const [targetStatus, setTargetStatus] = useState<JobStatus | null>(null);
  const [notes, setNotes] = useState('');

  if (isLoading) {
    return (
      <>
        <TopProgress active />
        <PageSkeleton kind="detail" />
      </>
    );
  }

  if (!job) {
    return (
      <div className="stack">
        <Link href="/admin/jobs" className="btn sm">Back to jobs</Link>
        <div className="banner" role="alert">Could not load this job.</div>
      </div>
    );
  }

  const nextStatuses = VALID_TRANSITIONS[job.status];

  const handleTransition = () => {
    if (!targetStatus) return;
    transition(
      { id, body: { status: targetStatus, notes: notes || undefined } },
      { onSuccess: () => { setShowTransition(false); setNotes(''); setTargetStatus(null); } },
    );
  };

  return (
    <div className="stack">
      <TopProgress active={isFetching || historyFetching || transitioning || customer.isFetching || vehicle.isFetching} />
      <div className="pagehead">
        <div className="ttl">
          <div className="row">
            <Link href="/admin/jobs" className="btn sm">Back to jobs</Link>
          </div>
          <div className="row">
            <h1>{job.job_number}</h1>
            <span className={jobPill(job.status)}>{getStatusMeta(job.status).label}</span>
            <span className={priorityPill(job.priority)}>{job.priority.charAt(0).toUpperCase() + job.priority.slice(1)}</span>
          </div>
          <p className="muted">{job.title}</p>
        </div>
        {nextStatuses.length > 0 ? (
          <div className="row">
            {nextStatuses.map((status) => (
              <button
                key={status}
                type="button"
                className={status === 'cancelled' || status === 'quote_rejected' ? 'btn sm danger' : 'btn sm'}
                disabled={transitioning}
                onClick={() => { setTargetStatus(status); setShowTransition(true); }}
              >
                {getStatusMeta(status).label}
              </button>
            ))}
          </div>
        ) : (
          <p className="muted sm">No further status moves.</p>
        )}
      </div>
      <div className="grid g2">
        <div className="card stack s">
          <h2>Customer and vehicle</h2>
          {customer.isError && !customer.data ? <div className="banner" role="alert">Could not load the customer.</div> : null}
          {vehicle.isError && !vehicle.data ? <div className="banner" role="alert">Could not load the vehicle.</div> : null}
          <dl className="kv">
            <dt>Customer</dt>
            <dd className="b">{customer.data ? fullName(customer.data.first_name, customer.data.last_name) : customer.isLoading ? 'Loading customer.' : '—'}</dd>
            <dt>Phone</dt>
            <dd>{customer.data ? formatPhone(customer.data.phone) : '—'}</dd>
            <dt>Vehicle</dt>
            <dd>{vehicle.data ? `${vehicle.data.year} ${vehicle.data.make} ${vehicle.data.model}` : vehicle.isLoading ? 'Loading vehicle.' : '—'}</dd>
            <dt>Plate</dt>
            <dd>{vehicle.data?.license_plate ?? '—'}</dd>
            <dt>Colour</dt>
            <dd>{vehicle.data?.color ?? '—'}</dd>
            <dt>Mileage</dt>
            <dd>{vehicle.data?.mileage != null ? `${vehicle.data.mileage.toLocaleString()} km` : '—'}</dd>
          </dl>
        </div>
        <div className="card stack s">
          <h2>Description and intake notes</h2>
          <div>
            <div className="faint sm">Description</div>
            <p>{job.description || '—'}</p>
          </div>
          <div>
            <div className="faint sm">Intake notes</div>
            <p>{job.intake_notes || '—'}</p>
          </div>
          {job.completion_notes ? (
            <div>
              <div className="faint sm">Completion notes</div>
              <p>{job.completion_notes}</p>
            </div>
          ) : null}
          <div>
            <div className="faint sm">Created</div>
            <p>{formatDate(job.created_at)}</p>
          </div>
          <div>
            <div className="faint sm">Estimated completion</div>
            <p>{job.estimated_completion_at ? formatDateTime(job.estimated_completion_at) : '—'}</p>
          </div>
          {job.actual_completion_at ? (
            <div>
              <div className="faint sm">Completed</div>
              <p>{formatDateTime(job.actual_completion_at)}</p>
            </div>
          ) : null}
          {admin ? (
            <TechnicianField jobId={id} assignedId={job.assigned_technician_id} />
          ) : (
            <div>
              <div className="faint sm">Technician</div>
              <p>{job.assigned_technician_id ?? 'Unassigned'}</p>
            </div>
          )}
        </div>
      </div>
      <div className="card stack s">
        <h2>Quote and invoice</h2>
        <div className="row">
          <Link href={`/admin/quotes/create?job=${id}`} className="btn sm primary">New quote</Link>
          <Link href={`/admin/invoices/create?job=${id}`} className="btn sm">New invoice</Link>
          <Link href={`/admin/quotes?jobId=${id}`} className="btn sm">View quotes</Link>
          <Link href={`/admin/invoices?jobId=${id}`} className="btn sm">View invoices</Link>
          <Link href={`/tracking/${job.job_number}`} className="btn sm" target="_blank">Public tracking</Link>
        </div>
      </div>
      <div className="card flush">
        <div style={{ padding: '20px 24px 8px' }}><h2>Status history</h2></div>
        {historyLoading ? <p className="muted" style={{ padding: '0 24px 20px' }}>Loading history.</p> : null}
        {historyError && !history ? (
          <div className="banner" role="alert" style={{ margin: '0 24px 20px' }}>Failed to load status history.</div>
        ) : null}
        {!historyLoading && !historyError && (!history || history.length === 0) ? (
          <p className="muted" style={{ padding: '0 24px 20px' }}>No history yet</p>
        ) : null}
        {history && history.length > 0 ? (
          <div className="tw">
            <table className="tbl">
              <thead>
                <tr>
                  <th>From</th>
                  <th>To</th>
                  <th>Note</th>
                  <th>When</th>
                </tr>
              </thead>
              <tbody>
                {[...history].reverse().map((entry) => (
                  <tr key={entry.id}>
                    <td>{entry.from_status ? getStatusMeta(entry.from_status).label : '—'}</td>
                    <td>{getStatusMeta(entry.to_status).label}</td>
                    <td>{entry.notes || '—'}</td>
                    <td>{formatDateTime(entry.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
      {showTransition && targetStatus ? (
        <div className="scrim" onMouseDown={() => setShowTransition(false)}>
          <div
            className="dlg"
            role="dialog"
            aria-modal="true"
            aria-labelledby="status-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <h2 id="status-title">Update status to {getStatusMeta(targetStatus).label}</h2>
            <p className="muted">{getStatusMeta(targetStatus).description}</p>
            <div className="field">
              <label htmlFor="status-notes">Notes</label>
              <textarea
                id="status-notes"
                className="input"
                rows={3}
                value={notes}
                placeholder="Add notes (optional)"
                onChange={(event) => setNotes(event.target.value)}
              />
            </div>
            <div className="row end">
              <button type="button" className="btn" onClick={() => setShowTransition(false)}>Cancel</button>
              <button
                type="button"
                className={transitioning ? 'btn primary nt-loading' : 'btn primary'}
                data-variant="primary"
                disabled={transitioning}
                onClick={handleTransition}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
