import apiClient from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import type {
  ApiResponse,
  DashboardStats, RevenuePeriod, JobsByStatus, TopService,
  TechnicianPerformance, RevenueParams,
} from '@/lib/dto';

export const analyticsDal = {
  getDashboard: () =>
    apiClient.get<ApiResponse<DashboardStats>>(ENDPOINTS.ANALYTICS.DASHBOARD),

  /** NOTE: query param is 'granularity' — Swagger says 'groupBy' (WRONG) */
  getRevenue: (params?: RevenueParams) =>
    apiClient.get<ApiResponse<RevenuePeriod[]>>(ENDPOINTS.ANALYTICS.REVENUE, { params }),

  getJobsByStatus: () =>
    apiClient.get<ApiResponse<JobsByStatus[]>>(ENDPOINTS.ANALYTICS.JOBS),

  getTopServices: (limit = 10) =>
    apiClient.get<ApiResponse<TopService[]>>(ENDPOINTS.ANALYTICS.SERVICES, {
      params: { limit },
    }),

  getTechnicianPerformance: () =>
    apiClient.get<ApiResponse<TechnicianPerformance[]>>(ENDPOINTS.ANALYTICS.TECHNICIANS),
};