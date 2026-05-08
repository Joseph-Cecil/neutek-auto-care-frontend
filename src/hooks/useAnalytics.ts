'use client';

import { useQuery } from '@tanstack/react-query';
import { analyticsDal } from '@/lib/dal/analytics.dal';
import { queryKeys }    from '@/lib/api/queryKeys';
import type { RevenueParams } from '@/lib/dto';

export function useDashboardStats() {
  return useQuery({
    queryKey: queryKeys.analytics.dashboard,
    queryFn:  async () => {
      const res = await analyticsDal.getDashboard();
      return res.data.data;
    },
    staleTime: 2 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });
}

export function useRevenueChart(params?: RevenueParams) {
  return useQuery({
    queryKey: queryKeys.analytics.revenue(params),
    queryFn:  async () => {
      const res = await analyticsDal.getRevenue(params);
      return res.data.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useJobsByStatus() {
  return useQuery({
    queryKey: queryKeys.analytics.jobs,
    queryFn:  async () => {
      const res = await analyticsDal.getJobsByStatus();
      return res.data.data;
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function useTopServices(limit = 10) {
  return useQuery({
    queryKey: queryKeys.analytics.services(limit),
    queryFn:  async () => {
      const res = await analyticsDal.getTopServices(limit);
      return res.data.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useTechnicianPerformance() {
  return useQuery({
    queryKey: queryKeys.analytics.technicians,
    queryFn:  async () => {
      const res = await analyticsDal.getTechnicianPerformance();
      return res.data.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}