'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { PageSkeleton } from '@/components/ui/page-skeleton';
import { TopProgress } from '@/components/ui/top-progress';
import { analyticsDal } from '@/lib/dal/analytics.dal';
import { queryKeys } from '@/lib/api/queryKeys';
import { ghsAmount } from '@/lib/utils/format';

function durationLabel(minutes: number) {
  if (minutes < 60) return `${minutes}m`;
  return `${(minutes / 60).toFixed(1)}h`;
}

export default function AdminDashboardPage() {
  const { data, isLoading, isError, isFetching } = useQuery({
    queryKey: queryKeys.analytics.dashboard,
    queryFn: async () => {
      const res = await analyticsDal.getDashboard();
      return res.data.data;
    },
    staleTime: 2 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <>
        <TopProgress active />
        <PageSkeleton kind="dashboard" />
      </>
    );
  }

  const change = data && data.revenueLastMonthPesewas > 0
    ? ((data.revenueThisMonthPesewas - data.revenueLastMonthPesewas) / data.revenueLastMonthPesewas) * 100
    : null;

  return (
    <div className="stack">
      <TopProgress active={isFetching} />
      <div className="pagehead">
        <div className="ttl">
          <h1>Dashboard</h1>
          <p className="muted">How the workshop is doing.</p>
        </div>
      </div>
      {isError && !data ? (
        <div className="banner" role="alert">Failed to load dashboard stats. Please refresh.</div>
      ) : null}
      {!isError && !data ? (
        <div className="card">
          <div className="empty">
            <h2>No dashboard figures</h2>
            <p className="muted">Refresh the page to try again.</p>
          </div>
        </div>
      ) : null}
      {data ? (
        <div className="card">
          <div className="grid g4">
            <div className="fig stack s">
              <span className="l">Revenue this month</span>
              <span className="v">GHS {ghsAmount(data.revenueThisMonthPesewas)}</span>
              {change !== null ? (
                <span className="sm">
                  <span className={change >= 0 ? 'pill ok' : 'pill bad'}>
                    {change >= 0 ? '+' : ''}{Math.abs(change).toFixed(1)}%
                  </span>{' '}
                  <span className="faint">on GHS {ghsAmount(data.revenueLastMonthPesewas)} last month</span>
                </span>
              ) : (
                <span className="sm faint">No revenue last month to compare</span>
              )}
              <span className="sm faint">Total GHS {ghsAmount(data.totalRevenuePesewas)}</span>
            </div>
            <div className="fig stack s">
              <span className="l">Active jobs</span>
              <span className="v">{data.activeJobs.toLocaleString()}</span>
              <Link href="/admin/jobs" className="btn sm">View jobs</Link>
            </div>
            <div className="fig stack s">
              <span className="l">Pending bookings</span>
              <span className="v">{data.pendingBookings.toLocaleString()}</span>
              <Link href="/admin/bookings" className="btn sm">View bookings</Link>
            </div>
            <div className="fig stack s">
              <span className="l">Customers</span>
              <span className="v">{data.totalCustomers.toLocaleString()}</span>
              <span className="sm faint">+{data.newCustomersThisMonth} this month</span>
            </div>
            <div className="fig stack s">
              <span className="l">Total jobs</span>
              <span className="v">{data.totalJobs.toLocaleString()}</span>
            </div>
            <div className="fig stack s">
              <span className="l">Total bookings</span>
              <span className="v">{data.totalBookings.toLocaleString()}</span>
            </div>
            <div className="fig stack s">
              <span className="l">Completed this month</span>
              <span className="v">{data.completedJobsThisMonth.toLocaleString()}</span>
            </div>
            <div className="fig stack s">
              <span className="l">Average job duration</span>
              <span className="v">{durationLabel(data.averageJobDurationMinutes)}</span>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
