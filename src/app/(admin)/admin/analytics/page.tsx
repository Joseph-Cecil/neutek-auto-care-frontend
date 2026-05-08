'use client';

import { useState } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { DollarSign, Wrench, Users, TrendingUp, Clock, Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader }    from '@/components/admin/shared/PageHeader';
import { StatsCard }     from '@/components/admin/shared/StatsCard';
import { SectionLoader } from '@/components/shared/LoadingSpinner';
import {
  useDashboardStats, useRevenueChart,
  useJobsByStatus, useTopServices, useTechnicianPerformance,
} from '@/hooks/useAnalytics';
import { pesewasToGHS, pesewasToFloat } from '@/lib/utils/format';
import { getStatusMeta } from '@/lib/utils/jobStatus';
import { cn } from '@/lib/utils/cn';
import type { RevenueGranularity } from '@/lib/dto';

const GRANULARITY_OPTIONS: { label: string; value: RevenueGranularity }[] = [
  { label: 'Daily',   value: 'day' },
  { label: 'Weekly',  value: 'week' },
  { label: 'Monthly', value: 'month' },
];

const CHART_COLORS = ['#0066FF', '#3B9EFF', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444'];

export default function AdminAnalyticsPage() {
  const [granularity, setGranularity] = useState<RevenueGranularity>('month');

  const { data: stats,        isLoading: statsLoading }   = useDashboardStats();
  const { data: revenue,      isLoading: revenueLoading } = useRevenueChart({ granularity });
  const { data: jobsByStatus, isLoading: jobsLoading }    = useJobsByStatus();
  const { data: topServices,  isLoading: servicesLoading } = useTopServices(8);
  const { data: technicians,  isLoading: techLoading }    = useTechnicianPerformance();

  const revenueChange = stats && stats.revenueLastMonthPesewas > 0
    ? parseFloat((
        ((stats.revenueThisMonthPesewas - stats.revenueLastMonthPesewas) /
          stats.revenueLastMonthPesewas) * 100
      ).toFixed(1))
    : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        description="Workshop performance overview"
      />

      {/* KPI Stats */}
      {statsLoading ? (
        <SectionLoader />
      ) : stats ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatsCard
            title="Total Revenue"
            value={pesewasToGHS(stats.totalRevenuePesewas)}
            subtitle={"This month: " + pesewasToGHS(stats.revenueThisMonthPesewas)}
            icon={<DollarSign className="h-5 w-5 text-green-400" />}
            iconBg="bg-green-500/10"
            trend={revenueChange !== null ? { value: revenueChange, label: 'vs last month' } : undefined}
          />
          <StatsCard
            title="Total Jobs"
            value={stats.totalJobs.toLocaleString()}
            subtitle={stats.activeJobs + " active now"}
            icon={<Wrench className="h-5 w-5 text-blue-400" />}
            iconBg="bg-blue-500/10"
          />
          <StatsCard
            title="Total Customers"
            value={stats.totalCustomers.toLocaleString()}
            subtitle={"+" + stats.newCustomersThisMonth + " this month"}
            icon={<Users className="h-5 w-5 text-violet-400" />}
            iconBg="bg-violet-500/10"
          />
          <StatsCard
            title="Avg Job Duration"
            value={
              stats.averageJobDurationMinutes < 60
                ? stats.averageJobDurationMinutes + "m"
                : (stats.averageJobDurationMinutes / 60).toFixed(1) + "h"
            }
            subtitle={stats.completedJobsThisMonth + " completed this month"}
            icon={<Clock className="h-5 w-5 text-amber-400" />}
            iconBg="bg-amber-500/10"
          />
        </div>
      ) : null}

      {/* Revenue Chart */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-4 w-4 text-primary" /> Revenue Over Time
          </CardTitle>
          <div className="flex gap-1">
            {GRANULARITY_OPTIONS.map(({ label, value }) => (
              <button key={value}
                onClick={() => setGranularity(value)}
                className={cn(
                  'rounded px-2.5 py-1 text-xs font-medium transition-colors',
                  granularity === value
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground',
                )}>
                {label}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          {revenueLoading ? (
            <div className="flex h-64 items-center justify-center">
              <SectionLoader />
            </div>
          ) : !revenue || revenue.length === 0 ? (
            <div className="flex h-64 items-center justify-center text-muted-foreground text-sm">
              No revenue data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={revenue.map((r) => ({
                period:   r.period,
                revenue:  pesewasToFloat(r.revenuePesewas),
                jobs:     r.jobCount,
              }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="period"
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                  tickLine={false}
                />
                <YAxis
                  yAxisId="revenue"
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                  tickLine={false}
                  tickFormatter={(v) => "GHS " + v.toLocaleString()}
                />
                <YAxis
                  yAxisId="jobs"
                  orientation="right"
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background:   'hsl(var(--card))',
                    border:       '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    color:        'hsl(var(--foreground))',
                  }}
                  formatter={(value: number, name: string) =>
                    name === 'revenue'
                      ? ["GHS " + value.toLocaleString(), 'Revenue']
                      : [value, 'Jobs']
                  }
                />
                <Legend />
                <Line
                  yAxisId="revenue"
                  type="monotone"
                  dataKey="revenue"
                  stroke="#0066FF"
                  strokeWidth={2}
                  dot={false}
                  name="Revenue (GHS)"
                />
                <Line
                  yAxisId="jobs"
                  type="monotone"
                  dataKey="jobs"
                  stroke="#10B981"
                  strokeWidth={2}
                  dot={false}
                  name="Jobs"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Jobs by Status — Pie */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Jobs by Status</CardTitle>
          </CardHeader>
          <CardContent>
            {jobsLoading ? (
              <SectionLoader />
            ) : !jobsByStatus || jobsByStatus.length === 0 ? (
              <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
                No data available
              </div>
            ) : (
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={jobsByStatus}
                      dataKey="count"
                      nameKey="status"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      innerRadius={40}
                    >
                      {jobsByStatus.map((entry, i) => (
                        <Cell
                          key={entry.status}
                          fill={CHART_COLORS[i % CHART_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background:   'hsl(var(--card))',
                        border:       '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        color:        'hsl(var(--foreground))',
                      }}
                      formatter={(value: number, name: string) => [
                        value + " jobs",
                        getStatusMeta(name as Parameters<typeof getStatusMeta>[0]).label,
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <ul className="min-w-[140px] space-y-1.5">
                  {jobsByStatus.map((entry, i) => (
                    <li key={entry.status} className="flex items-center gap-2 text-xs">
                      <div
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ background: CHART_COLORS[i % CHART_COLORS.length] }}
                      />
                      <span className="text-muted-foreground">
                        {getStatusMeta(entry.status).label}
                      </span>
                      <span className="ml-auto font-medium">{entry.count}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Services — Bar */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Services by Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            {servicesLoading ? (
              <SectionLoader />
            ) : !topServices || topServices.length === 0 ? (
              <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
                No data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={topServices.map((s) => ({
                    name:    s.serviceName.length > 15
                               ? s.serviceName.slice(0, 15) + '...'
                               : s.serviceName,
                    revenue: pesewasToFloat(s.revenuePesewas),
                    jobs:    s.jobCount,
                  }))}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                  <XAxis
                    type="number"
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                    tickLine={false}
                    tickFormatter={(v) => "GHS " + v.toLocaleString()}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                    tickLine={false}
                    width={100}
                  />
                  <Tooltip
                    contentStyle={{
                      background:   'hsl(var(--card))',
                      border:       '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      color:        'hsl(var(--foreground))',
                    }}
                    formatter={(value: number) => ["GHS " + value.toLocaleString(), 'Revenue']}
                  />
                  <Bar dataKey="revenue" fill="#0066FF" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Technician Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Award className="h-4 w-4 text-primary" /> Technician Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          {techLoading ? (
            <SectionLoader />
          ) : !technicians || technicians.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No technician data available
            </div>
          ) : (
            <div className="space-y-3">
              {technicians.map((tech, i) => (
                <div key={tech.technicianId}
                  className="flex items-center gap-4 rounded-lg border border-border p-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {i + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{tech.technicianName}</p>
                    <div className="mt-0.5 flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <span>{tech.completedJobs} jobs completed</span>
                      <span>
                        Avg {tech.averageCompletionHours.toFixed(1)}h per job
                      </span>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-lg font-bold text-primary">{tech.completedJobs}</p>
                    <p className="text-xs text-muted-foreground">jobs</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}