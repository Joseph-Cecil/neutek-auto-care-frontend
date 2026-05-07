'use client';

import { useQuery } from '@tanstack/react-query';
import { AlertCircle, CheckCircle, Clock, DollarSign, Users, Wrench, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SectionLoader } from '@/components/shared/LoadingSpinner';
import { analyticsDal }  from '@/lib/dal/analytics.dal';
import { queryKeys }     from '@/lib/api/queryKeys';
import { pesewasToGHS }  from '@/lib/utils/format';

function StatCard({ title, value, subtitle, Icon, iconBg = 'bg-primary/10' }: {
  title: string; value: string; subtitle: string;
  Icon: React.ComponentType<{ className?: string }>; iconBg?: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-start justify-between p-5">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="mt-1 text-2xl font-bold">{value}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
        </div>
        <div className={"flex h-10 w-10 items-center justify-center rounded-xl " + iconBg}>
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminDashboardPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.analytics.dashboard,
    queryFn:  async () => { const res = await analyticsDal.getDashboard(); return res.data.data; },
    staleTime: 2 * 60 * 1000,
  });

  if (isLoading) return <SectionLoader />;

  if (error || !data) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-destructive">
        <AlertCircle className="h-5 w-5 shrink-0" />
        <p className="text-sm">Failed to load dashboard stats. Please refresh.</p>
      </div>
    );
  }

  const revenueChange = data.revenueLastMonthPesewas > 0
    ? (((data.revenueThisMonthPesewas - data.revenueLastMonthPesewas) / data.revenueLastMonthPesewas) * 100).toFixed(1)
    : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold lg:text-3xl">Dashboard</h1>
        <p className="mt-1 text-muted-foreground">Overview of your workshop&apos;s performance</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Revenue"    value={pesewasToGHS(data.totalRevenuePesewas)}
          subtitle={"This month: " + pesewasToGHS(data.revenueThisMonthPesewas)}
          Icon={DollarSign} iconBg="bg-green-500/10" />
        <StatCard title="Total Jobs"       value={data.totalJobs.toLocaleString()}
          subtitle={data.activeJobs + " currently active"}
          Icon={Wrench} iconBg="bg-blue-500/10" />
        <StatCard title="Total Customers"  value={data.totalCustomers.toLocaleString()}
          subtitle={"+" + data.newCustomersThisMonth + " this month"}
          Icon={Users} iconBg="bg-violet-500/10" />
        <StatCard title="Total Bookings"   value={data.totalBookings.toLocaleString()}
          subtitle={data.pendingBookings + " pending review"}
          Icon={Calendar} iconBg="bg-amber-500/10" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">This Month Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{pesewasToGHS(data.revenueThisMonthPesewas)}</p>
            {revenueChange !== null && (
              <p className={"mt-1 text-xs " + (parseFloat(revenueChange) >= 0 ? 'text-green-500' : 'text-red-500')}>
                {parseFloat(revenueChange) >= 0 ? '↑' : '↓'} {Math.abs(parseFloat(revenueChange))}% vs last month
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-green-500" />
              <p className="text-2xl font-bold">{data.completedJobsThisMonth}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Job Duration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="h-6 w-6 text-blue-500" />
              <p className="text-2xl font-bold">
                {data.averageJobDurationMinutes < 60
                  ? data.averageJobDurationMinutes + "m"
                  : (data.averageJobDurationMinutes / 60).toFixed(1) + "h"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}