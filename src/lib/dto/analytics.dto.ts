import type { JobStatus, RevenueGranularity } from './enums.dto';

export interface DashboardStats {
  totalRevenuePesewas: number;
  revenueThisMonthPesewas: number;
  revenueLastMonthPesewas: number;
  totalJobs: number;
  activeJobs: number;
  completedJobsThisMonth: number;
  totalCustomers: number;
  newCustomersThisMonth: number;
  totalBookings: number;
  pendingBookings: number;
  averageJobDurationMinutes: number;
}

export interface RevenuePeriod {
  period: string;
  revenuePesewas: number;
  jobCount: number;
}

export interface JobsByStatus {
  status: JobStatus;
  count: number;
}

export interface TopService {
  serviceId: string;
  serviceName: string;
  jobCount: number;
  revenuePesewas: number;
}

export interface TechnicianPerformance {
  technicianId: string;
  technicianName: string;
  completedJobs: number;
  averageCompletionHours: number;
}

export interface RevenueParams {
  granularity?: RevenueGranularity;
  from?: string;
  to?: string;
}