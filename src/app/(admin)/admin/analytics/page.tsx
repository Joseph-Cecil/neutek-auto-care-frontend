'use client';

import { useMemo, useState } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { TopProgress } from '@/components/ui/top-progress';
import { PageSkeleton } from '@/components/ui/page-skeleton';
import {
  useDashboardStats,
  useRevenueChart,
  useJobsByStatus,
  useTopServices,
  useTechnicianPerformance,
} from '@/hooks/useAnalytics';
import { ghsAmount, pesewasToFloat } from '@/lib/utils/format';
import { getStatusMeta } from '@/lib/utils/jobStatus';
import { notify } from '@/lib/notify';
import type { RevenueGranularity } from '@/lib/dto';

const GRANULARITY_OPTIONS: { label: string; value: RevenueGranularity }[] = [
  { label: 'Daily', value: 'day' },
  { label: 'Week', value: 'week' },
  { label: 'Month', value: 'month' },
];

const CHART_COLORS = ['#C2410C', '#1C1917', '#0F766E', '#B45309', '#7C3AED', '#B42318'];

const tooltipStyle = {
  background: '#fff',
  border: '1px solid #e7e5e4',
  borderRadius: '8px',
  color: '#1c1917',
};

function durationLabel(minutes: number) {
  if (minutes < 60) return minutes + 'm';
  return (minutes / 60).toFixed(1) + 'h';
}

export default function AdminAnalyticsPage() {
  const [granularity, setGranularity] = useState<RevenueGranularity>('month');
  const [technicianId, setTechnicianId] = useState('all');

  const { data: stats, isLoading: statsLoading, isError: statsError } = useDashboardStats();
  const {
    data: revenue,
    isLoading: revenueLoading,
    isError: revenueError,
  } = useRevenueChart({ granularity });
  const { data: jobsByStatus, isLoading: jobsLoading, isError: jobsError } = useJobsByStatus();
  const {
    data: topServices,
    isLoading: servicesLoading,
    isError: servicesError,
  } = useTopServices(8);
  const {
    data: technicians,
    isLoading: techLoading,
    isError: techError,
  } = useTechnicianPerformance();

  const revenueChange =
    stats && stats.revenueLastMonthPesewas > 0
      ? parseFloat(
          (
            ((stats.revenueThisMonthPesewas - stats.revenueLastMonthPesewas) /
              stats.revenueLastMonthPesewas) *
            100
          ).toFixed(1),
        )
      : null;

  const visibleTechnicians = useMemo(() => {
    const rows = technicians ?? [];
    if (technicianId === 'all') return rows;
    return rows.filter((tech) => tech.technicianId === technicianId);
  }, [technicians, technicianId]);

  const noFile = () => notify('success', 'No file is downloaded.');

  if (statsLoading && !stats) {
    return (
      <>
        <TopProgress active />
        <PageSkeleton kind="dashboard" />
      </>
    );
  }

  return (
    <>
      <TopProgress active={statsLoading || revenueLoading || jobsLoading || servicesLoading || techLoading} />
      <div className="pagehead">
        <div className="ttl">
          <h1>Analytics</h1>
          <p className="muted">Revenue, workload and who is delivering.</p>
        </div>
        <div className="row">
          <div className="tabs" role="tablist" aria-label="Period" style={{ margin: 0 }}>
            {GRANULARITY_OPTIONS.map(({ label, value }) => (
              <button
                key={value}
                type="button"
                className="tab"
                role="tab"
                aria-selected={granularity === value}
                onClick={() => setGranularity(value)}
              >
                {label}
              </button>
            ))}
          </div>
          <button type="button" className="btn" onClick={noFile}>
            Export report
          </button>
        </div>
      </div>

      <div className="stack">
        {statsError && !stats ? (
          <div className="banner" role="alert">
            Failed to load workshop totals.
          </div>
        ) : stats ? (
          <div className="card">
            <div className="grid g4">
              <div className="fig">
                <span className="l">Total revenue</span>
                <span className="v">GHS {ghsAmount(stats.totalRevenuePesewas)}</span>
                <span className="sm">
                  {revenueChange !== null ? (
                    <span className={revenueChange >= 0 ? 'pill ok' : 'pill warn'}>
                      {revenueChange}% vs last month
                    </span>
                  ) : null}{' '}
                  <span className="faint">This month GHS {ghsAmount(stats.revenueThisMonthPesewas)}</span>
                </span>
              </div>
              <div className="fig">
                <span className="l">Total jobs</span>
                <span className="v">{stats.totalJobs.toLocaleString()}</span>
                <span className="faint sm">{stats.activeJobs} active now</span>
              </div>
              <div className="fig">
                <span className="l">Total customers</span>
                <span className="v">{stats.totalCustomers.toLocaleString()}</span>
                <span className="faint sm">+{stats.newCustomersThisMonth} this month</span>
              </div>
              <div className="fig">
                <span className="l">Avg job duration</span>
                <span className="v">{durationLabel(stats.averageJobDurationMinutes)}</span>
                <span className="faint sm">{stats.completedJobsThisMonth} completed this month</span>
              </div>
            </div>
          </div>
        ) : null}

        <div className="card">
          <h2 style={{ marginBottom: 12 }}>Revenue (GHS)</h2>
          {revenueLoading && !revenue ? (
            <p className="muted">Loading revenue.</p>
          ) : revenueError && !revenue ? (
            <div className="banner" role="alert">
              Failed to load revenue.
            </div>
          ) : !revenue || revenue.length === 0 ? (
            <div className="empty">
              <h2>No revenue data available</h2>
            </div>
          ) : (
            <div style={{ width: '100%', height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={revenue.map((row) => ({
                    period: row.period,
                    revenue: pesewasToFloat(row.revenuePesewas),
                    jobs: row.jobCount,
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                  <XAxis dataKey="period" tick={{ fill: '#78716c', fontSize: 11 }} tickLine={false} />
                  <YAxis
                    yAxisId="revenue"
                    tick={{ fill: '#78716c', fontSize: 11 }}
                    tickLine={false}
                    tickFormatter={(value: number) => 'GHS ' + value.toLocaleString()}
                  />
                  <YAxis
                    yAxisId="jobs"
                    orientation="right"
                    tick={{ fill: '#78716c', fontSize: 11 }}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(value, name) => {
                      const amount = typeof value === 'number' ? value : Number(value ?? 0);
                      return String(name) === 'revenue'
                        ? [`GHS ${amount.toLocaleString()}`, 'Revenue']
                        : [amount, 'Jobs'];
                    }}
                  />
                  <Legend />
                  <Line
                    yAxisId="revenue"
                    type="monotone"
                    dataKey="revenue"
                    stroke="#C2410C"
                    strokeWidth={2}
                    dot={false}
                    name="Revenue (GHS)"
                  />
                  <Line
                    yAxisId="jobs"
                    type="monotone"
                    dataKey="jobs"
                    stroke="#0F766E"
                    strokeWidth={2}
                    dot={false}
                    name="Jobs"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="grid g2">
          <div className="card">
            <h2 style={{ marginBottom: 12 }}>Jobs by status</h2>
            {jobsLoading && !jobsByStatus ? (
              <p className="muted">Loading jobs by status.</p>
            ) : jobsError && !jobsByStatus ? (
              <div className="banner" role="alert">
                Failed to load jobs by status.
              </div>
            ) : !jobsByStatus || jobsByStatus.length === 0 ? (
              <div className="empty">
                <h2>No data available</h2>
              </div>
            ) : (
              <div className="row" style={{ alignItems: 'center' }}>
                <div style={{ width: '100%', maxWidth: 280, height: 200 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={jobsByStatus} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={80} innerRadius={40}>
                        {jobsByStatus.map((entry, index) => (
                          <Cell key={entry.status} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={tooltipStyle}
                        formatter={(value, name) => [
                          `${Number(value ?? 0)} jobs`,
                          getStatusMeta(String(name) as Parameters<typeof getStatusMeta>[0]).label,
                        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <ul className="stack s" style={{ listStyle: 'none', margin: 0, padding: 0, minWidth: 180, flex: 1 }}>
                  {jobsByStatus.map((entry, index) => (
                    <li key={entry.status} className="row sb">
                      <span className="row" style={{ gap: 8 }}>
                        <span
                          aria-hidden="true"
                          style={{
                            width: 10,
                            height: 10,
                            borderRadius: 999,
                            background: CHART_COLORS[index % CHART_COLORS.length],
                          }}
                        />
                        <span>{getStatusMeta(entry.status).label}</span>
                      </span>
                      <b className="num">{entry.count}</b>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="card">
            <h2 style={{ marginBottom: 12 }}>Top services by revenue (GHS)</h2>
            {servicesLoading && !topServices ? (
              <p className="muted">Loading top services.</p>
            ) : servicesError && !topServices ? (
              <div className="banner" role="alert">
                Failed to load top services.
              </div>
            ) : !topServices || topServices.length === 0 ? (
              <div className="empty">
                <h2>No data available</h2>
              </div>
            ) : (
              <div style={{ width: '100%', height: 240 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={topServices.map((service) => ({
                      name: service.serviceName.length > 15 ? service.serviceName.slice(0, 15) + '...' : service.serviceName,
                      revenue: pesewasToFloat(service.revenuePesewas),
                    }))}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" horizontal={false} />
                    <XAxis
                      type="number"
                      tick={{ fill: '#78716c', fontSize: 10 }}
                      tickLine={false}
                      tickFormatter={(value: number) => 'GHS ' + value.toLocaleString()}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={{ fill: '#78716c', fontSize: 10 }}
                      tickLine={false}
                      width={100}
                    />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      formatter={(value) => [`GHS ${Number(value ?? 0).toLocaleString()}`, 'Revenue']}
                    />
                    <Bar dataKey="revenue" fill="#C2410C" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        <div className="card flush">
          <div className="row sb" style={{ padding: '20px 24px 8px' }}>
            <h2>Technician performance</h2>
            <div className="row">
              <label className="sr" htmlFor="an-tech">
                Technician
              </label>
              <select
                id="an-tech"
                className="input"
                style={{ width: 200 }}
                value={technicianId}
                onChange={(event) => setTechnicianId(event.target.value)}
                disabled={!technicians || technicians.length === 0}
              >
                <option value="all">All technicians</option>
                {(technicians ?? []).map((tech) => (
                  <option key={tech.technicianId} value={tech.technicianId}>
                    {tech.technicianName}
                  </option>
                ))}
              </select>
              <button type="button" className="btn" onClick={noFile}>
                Export
              </button>
            </div>
          </div>
          {techLoading && !technicians ? (
            <p className="muted" style={{ padding: '8px 24px 20px' }}>
              Loading technician performance.
            </p>
          ) : techError && !technicians ? (
            <div className="banner" role="alert" style={{ margin: '8px 24px 20px' }}>
              Failed to load technician performance.
            </div>
          ) : !technicians || technicians.length === 0 ? (
            <div className="empty">
              <h2>No technician data available</h2>
            </div>
          ) : (
            <div className="tw">
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Technician</th>
                    <th className="num">Completed jobs</th>
                    <th className="num">Average hours</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleTechnicians.map((tech) => (
                    <tr key={tech.technicianId}>
                      <td className="b">{tech.technicianName}</td>
                      <td className="num">{tech.completedJobs}</td>
                      <td className="num">{tech.averageCompletionHours.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
