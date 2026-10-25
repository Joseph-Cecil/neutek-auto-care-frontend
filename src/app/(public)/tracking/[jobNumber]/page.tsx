'use client';

import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { TopProgress } from '@/components/ui/top-progress';
import { useTrackingRest, useTrackingSocket } from '@/hooks/useTracking';
import { JOB_STATUS_STEPS, getStatusMeta } from '@/lib/utils/jobStatus';
import { formatDateTime } from '@/lib/utils/date';
import type { JobStatus } from '@/lib/dto';

function TrackResult() {
  const params = useParams<{ jobNumber: string }>();
  const phone = useSearchParams().get('phone') ?? '';
  const jobNumber = decodeURIComponent(params.jobNumber).toUpperCase();
  const last4 = phone.replace(/\D/g, '').slice(-4);
  const rest = useTrackingRest(jobNumber, last4);
  const socket = useTrackingSocket(jobNumber);
  const tracking = socket.data ?? rest.data;

  if (last4.length !== 4) {
    return (
      <div className="card" style={{ marginTop: 16 }}>
        <div className="empty">
          <h2>We could not find that</h2>
          <p className="muted">Open tracking again and enter the last 4 digits of the phone.</p>
          <Link href="/tracking" className="btn" style={{ marginTop: 8 }}>Track another car</Link>
        </div>
      </div>
    );
  }

  if (rest.isLoading) {
    return (
      <>
        <TopProgress active />
        <p className="muted" style={{ marginTop: 16 }}>Looking up that job.</p>
      </>
    );
  }

  if (rest.isError || !tracking) {
    return (
      <div className="card" style={{ marginTop: 16 }}>
        <div className="empty">
          <h2>We could not find that</h2>
          <p className="muted">Check the job number and the last 4 digits, then try again.</p>
          <Link href="/tracking" className="btn" style={{ marginTop: 8 }}>Track another car</Link>
        </div>
      </div>
    );
  }

  const off = tracking.status === 'cancelled' || tracking.status === 'quote_rejected';
  const current = JOB_STATUS_STEPS.indexOf(tracking.status);
  const whenFor = (status: JobStatus) => {
    const hit = [...tracking.history].reverse().find((entry) => entry.toStatus === status);
    return hit ? formatDateTime(hit.createdAt) : '';
  };

  return (
    <div className="card stack s" style={{ marginTop: 8 }}>
      <div className="row sb">
        <div>
          <p className="faint sm">{tracking.jobNumber}</p>
          <h1 style={{ fontSize: 26 }}>{tracking.title}</h1>
          {tracking.vehicleInfo ? <p className="muted">{tracking.vehicleInfo}</p> : null}
        </div>
        <span className={off ? 'pill bad' : 'pill brand'}>{getStatusMeta(tracking.status).label}</span>
      </div>
      {socket.connected ? <p className="faint sm">Live updates are on.</p> : null}
      {off ? (
        <div className="banner info" role="status">
          {tracking.status === 'cancelled' ? 'This job was cancelled.' : 'The quote was rejected, so the work is paused.'}
        </div>
      ) : (
        <ol className="tl">
          {JOB_STATUS_STEPS.map((status, index) => {
            const cls = current < 0 ? 'todo' : index < current ? 'done' : index === current ? 'cur' : 'todo';
            return (
              <li key={status} className={cls}>
                <span className="dot" aria-hidden="true">{cls === 'done' ? '✓' : index + 1}</span>
                <span>{getStatusMeta(status).label}</span>
                {cls === 'cur' ? <span className="pill brand">Current</span> : null}
                <span className="when">{whenFor(status)}</span>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

export default function TrackingDetailPage() {
  return (
    <div className="pubwrap">
      <section className="sec" style={{ maxWidth: 720, margin: '0 auto' }}>
        <Link href="/tracking" className="btn ghost">Track another car</Link>
        <Suspense fallback={<p className="muted">Looking up that job.</p>}>
          <TrackResult />
        </Suspense>
      </section>
    </div>
  );
}
