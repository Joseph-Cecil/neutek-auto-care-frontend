'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { customerDal } from '@/lib/dal/customer.dal';
import { queryKeys }   from '@/lib/api/queryKeys';
import { getErrorMessage } from '@/lib/utils/errors';
import type { CreateCustomerRequest, UpdateCustomerRequest, ListCustomersParams } from '@/lib/dto';

export function useCustomers(params?: ListCustomersParams) {
  return useQuery({
    queryKey: queryKeys.customers.list(params),
    queryFn:  async () => {
      const res = await customerDal.list(params);
      return res.data;
    },
  });
}

export function useCustomer(id: string) {
  return useQuery({
    queryKey: queryKeys.customers.detail(id),
    queryFn:  async () => {
      const res = await customerDal.getById(id);
      return res.data.data;
    },
    enabled: !!id,
  });
}

export function useCreateCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateCustomerRequest) => customerDal.create(body),
    onSuccess: () => {
      toast.success('Customer created');
      qc.invalidateQueries({ queryKey: queryKeys.customers.all });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useUpdateCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateCustomerRequest }) =>
      customerDal.update(id, body),
    onSuccess: (_res, { id }) => {
      toast.success('Customer updated');
      qc.invalidateQueries({ queryKey: queryKeys.customers.all });
      qc.invalidateQueries({ queryKey: queryKeys.customers.detail(id) });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useDeleteCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => customerDal.delete(id),
    onSuccess: () => {
      toast.success('Customer deleted');
      qc.invalidateQueries({ queryKey: queryKeys.customers.all });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}