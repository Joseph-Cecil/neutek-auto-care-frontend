'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { serviceDal } from '@/lib/dal/service.dal';
import { queryKeys }  from '@/lib/api/queryKeys';
import { getErrorMessage } from '@/lib/utils/errors';
import type { CreateServiceRequest, UpdateServiceRequest, ListServicesParams } from '@/lib/dto';

export function useAdminServices(params?: ListServicesParams) {
  return useQuery({
    queryKey: queryKeys.services.list(params),
    queryFn:  async () => {
      const res = await serviceDal.list(params);
      return res.data;
    },
  });
}

export function useAdminServiceCategories() {
  return useQuery({
    queryKey: queryKeys.services.categories,
    queryFn:  async () => {
      const res = await serviceDal.listCategories();
      return res.data.data;
    },
    staleTime: 10 * 60 * 1000,
  });
}

export function useAdminCreateService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateServiceRequest) => serviceDal.create(body),
    onSuccess: () => {
      toast.success('Service created');
      qc.invalidateQueries({ queryKey: queryKeys.services.all });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useAdminUpdateService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateServiceRequest }) =>
      serviceDal.update(id, body),
    onSuccess: () => {
      toast.success('Service updated');
      qc.invalidateQueries({ queryKey: queryKeys.services.all });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useAdminDeleteService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => serviceDal.delete(id),
    onSuccess: () => {
      toast.success('Service deleted');
      qc.invalidateQueries({ queryKey: queryKeys.services.all });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}