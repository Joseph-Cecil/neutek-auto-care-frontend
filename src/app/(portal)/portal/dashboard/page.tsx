'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { PageSkeleton } from '@/components/ui/page-skeleton';
import { TopProgress } from '@/components/ui/top-progress';
import { useAuthStore } from '@/stores/auth.store';
import { jobDal } from '@/lib/dal/job.dal';
import { notificationDal } from '@/lib/dal/notification.dal';
import { queryKeys } from '@/lib/api/queryKeys';
import { timeAgo } from '@/lib/utils/format';
import { getStatusMeta } from '@/lib/utils/jobStatus';
import type { JobStatus } from '@/lib/dto';

function jobPill(status: JobStatus): string {
  if (status === 'completed' || status === 'ready_for_pickup') return 'pill ok';
  if (status === 'cancelled' || status === 'quote_rejected') return 'pill bad';
  if (status === 'diagnosing' || status === 'quality_check' || status === 'quote_sent') return 'pill warn';
  if (status === 'in_progress' || status === 'quote_approved') return 'pill brand';
  return 'pill';
}

export default function PortalDashboardPage() {
  const user = useAuthStore((s) => s.user);

  const { data: jobsData, isLoading: jobsLoading, isError: jobsError } = useQuery({
    queryKey: queryKeys.jobs.list({ status: 'in_progress', page: 1 }),
    queryFn:  async () => { const res = await jobDal.list({ status: 'in_progress', limit: 5 }); return res.data; },
    enabled:  !!user,
  });

  const { data: notifData, isLoading: notifLoading, isError: notifError } = useQuery({
    queryKey: queryKeys.notifications.list({ isRead: false }),
    queryFn:  async () => { const res = await notificationDal.list({ isRead: false, limit: 5 }); return res.data; },
    enabled:  !!user,
  });

  const activeJobs    = jobsData?.data ?? [];
  const notifications = notifData?.data ?? [];
  const unreadCount   = notifData?.total ?? 0;
  const name          = user?.firstName?.trim() || 'there';

  return (
    <>
      <TopProgress active={jobsLoading || notifLoading} />
      {jobsLoading ? <PageSkeleton kind="dashboard" /> : (
        <>
          <div className="pagehead">
            <div className="ttl">
              <h1>Hello, {name}</h1>
              <p className="muted">Here is where things stand with your car.</p>
            </div>
            <div className="row">
              <Link href="/booking" className="btn primary">Book service</Link>
            </div>
          </div>
          <div className="grid g2">
            <div className="card stack s">
              <div className="row sb">
                <h2>Your car in the workshop</h2>
                <Link href="/portal/jobs" className="btn sm">All jobs</Link>
              </div>
              {jobsError && !jobsData ? (
                <div className="banner" role="alert">Failed to load active jobs.</div>
              ) : activeJobs.length === 0 ? (
                <p className="muted">Nothing in the workshop right now.</p>
              ) : (
                <div className="mlist always" role="list">
                  {activeJobs.map((job) => (
                    <div key={job.id} className="mrow" role="listitem">
                      <div className="mrow-body">
                        <span className="b">{job.title || job.job_number}</span>
                        <span className="muted sm">{job.job_number}</span>
                        <span className="row" style={{ marginTop: 4 }}>
                          <span className={jobPill(job.status)}>{getStatusMeta(job.status).label}</span>
                        </span>
                      </div>
                      <div className="mrow-act">
                        <Link href={'/portal/jobs/' + job.id} className="btn sm primary">Open</Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="card stack s">
              <div className="row sb">
                <h2>Notifications</h2>
                <div className="row">
                  {unreadCount > 0 ? <span className="pill brand">{unreadCount > 9 ? '9+' : unreadCount}</span> : null}
                  <Link href="/portal/notifications" className="btn sm">View all</Link>
                </div>
              </div>
              {notifLoading ? (
                <p className="muted">Loading notifications.</p>
              ) : notifError && !notifData ? (
                <div className="banner" role="alert">Failed to load notifications.</div>
              ) : notifications.length === 0 ? (
                <p className="muted">You&apos;re all caught up.</p>
              ) : (
                <div className="mlist always" role="list">
                  {notifications.map((n) => (
                    <Link key={n.id} href="/portal/notifications" className="mrow" role="listitem">
                      <div className="mrow-body">
                        <span className="b">{n.title}</span>
                        <span className="muted sm">{n.body}</span>
                        <span className="faint sm">{timeAgo(n.created_at)}</span>
                      </div>
                    </Link>
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
