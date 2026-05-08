'use client';

import { useQuery } from '@tanstack/react-query';
import { serviceDal } from '@/lib/dal/service.dal';
import { queryKeys }  from '@/lib/api/queryKeys';
import type { ListServicesParams } from '@/lib/dto';

export function useServiceCategories() {
  return useQuery({
    queryKey: queryKeys.services.categories,
    queryFn:  async () => {
      const res = await serviceDal.listCategories();
      return res.data.data;
    },
    staleTime: 10 * 60 * 1000,
  });
}

export function useServices(params?: ListServicesParams) {
  return useQuery({
    queryKey: queryKeys.services.list(params),
    queryFn:  async () => {
      const res = await serviceDal.list(params);
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useService(id: string) {
  return useQuery({
    queryKey: queryKeys.services.detail(id),
    queryFn:  async () => {
      const res = await serviceDal.getById(id);
      return res.data.data;
    },
    enabled:  !!id,
    staleTime: 5 * 60 * 1000,
  });
}