'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Wrench, FileText, Receipt, Bell, ArrowRight, Clock, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { JobStatusBadge } from '@/components/shared/StatusBadge';
import { SectionLoader }  from '@/components/shared/LoadingSpinner';
import { ErrorAlert }     from '@/components/shared/ErrorAlert';
import { useAuthStore }    from '@/stores/auth.store';
import { jobDal }          from '@/lib/dal/job.dal';
import { notificationDal } from '@/lib/dal/notification.dal';
import { queryKeys }       from '@/lib/api/queryKeys';
import { timeAgo, fullName } from '@/lib/utils/format';

export default function PortalDashboardPage() {
  const user = useAuthStore((s) => s.user);

  const { data: jobsData, isLoading: jobsLoading, error: jobsError } = useQuery({
    queryKey: queryKeys.jobs.list({ status: 'in_progress', page: 1 }),
    queryFn:  async () => { const res = await jobDal.list({ status: 'in_progress', limit: 5 }); return res.data; },
    enabled:  !!user,
  });

  const { data: notifData } = useQuery({
    queryKey: queryKeys.notifications.list({ isRead: false }),
    queryFn:  async () => { const res = await notificationDal.list({ isRead: false, limit: 5 }); return res.data; },
    enabled:  !!user,
  });

  const activeJobs    = jobsData?.data ?? [];
  const notifications = notifData?.data ?? [];
  const unreadCount   = notifData?.total ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold lg:text-3xl">
          Welcome back, {user?.firstName ?? 'there'} 👋
        </h1>
        <p className="mt-1 text-muted-foreground">Here&apos;s what&apos;s happening with your vehicles.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { href: '/booking',         label: 'Book Service', Icon: Clock,    color: 'bg-blue-500/10 text-blue-400' },
          { href: '/portal/jobs',     label: 'My Jobs',      Icon: Wrench,   color: 'bg-violet-500/10 text-violet-400' },
          { href: '/portal/quotes',   label: 'My Quotes',    Icon: FileText, color: 'bg-amber-500/10 text-amber-400' },
          { href: '/portal/invoices', label: 'My Invoices',  Icon: Receipt,  color: 'bg-green-500/10 text-green-400' },
        ].map(({ href, label, Icon, color }) => (
          <Link key={href} href={href}>
            <Card className="cursor-pointer transition-all hover:border-primary/50">
              <CardContent className="flex flex-col items-center gap-2 p-4 text-center">
                <div className={"flex h-10 w-10 items-center justify-center rounded-xl " + color}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-xs font-medium">{label}</span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-semibold">Active Jobs</CardTitle>
            <Link href="/portal/jobs">
              <Button variant="ghost" size="sm" className="gap-1 text-xs text-muted-foreground">
                View all <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {jobsLoading ? (
              <SectionLoader className="py-8" />
            ) : jobsError ? (
              <ErrorAlert message="Failed to load active jobs." className="text-xs" />
            ) : activeJobs.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-8 text-center">
                <CheckCircle2 className="h-8 w-8 text-green-500" />
                <p className="text-sm text-muted-foreground">No active jobs right now</p>
                <Link href="/booking">
                  <Button size="sm" variant="outline">Book a Service</Button>
                </Link>
              </div>
            ) : (
              <ul className="space-y-3">
                {activeJobs.map((job) => (
                  <li key={job.id}>
                    <Link href={"/portal/jobs/" + job.id}>
                      <div className="flex items-center justify-between rounded-lg border border-border/50 p-3 transition-colors hover:bg-muted/50">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{job.title}</p>
                          <p className="text-xs text-muted-foreground">{job.job_number}</p>
                        </div>
                        <JobStatusBadge status={job.status} />
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              Notifications
              {unreadCount > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </CardTitle>
            <Link href="/portal/notifications">
              <Button variant="ghost" size="sm" className="gap-1 text-xs text-muted-foreground">
                View all <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-8 text-center">
                <Bell className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">You&apos;re all caught up!</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {notifications.map((n) => (
                  <li key={n.id} className="rounded-lg border border-border/50 p-3">
                    <div className="flex items-start gap-2">
                      {!n.is_read && <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />}
                      <div className="min-w-0">
                        <p className="text-sm font-medium">{n.title}</p>
                        <p className="text-xs text-muted-foreground">{n.body}</p>
                        <p className="mt-1 text-xs text-muted-foreground/60">{timeAgo(n.created_at)}</p>
                      </div>
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