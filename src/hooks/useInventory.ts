'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { inventoryDal } from '@/lib/dal/inventory.dal';
import { queryKeys } from '@/lib/api/queryKeys';
import { notify } from '@/lib/notify';
import type { CreatePartRequest } from '@/lib/dto';

export function useInventory(page = 1, filter: 'all' | 'low' = 'all', limit = 20) {
  return useQuery({
    queryKey: queryKeys.inventory.list({ page, filter, limit }),
    queryFn: async () => (await inventoryDal.list({ page, limit, filter })).data,
  });
}

export function useCreatePart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreatePartRequest) => inventoryDal.create(body),
    onSuccess: () => {
      notify('success', 'Part saved');
      void qc.invalidateQueries({ queryKey: queryKeys.inventory.all });
    },
    onError: (error) => notify('error', error),
  });
}

export function useReceiveStock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, quantity }: { id: string; quantity: number }) => inventoryDal.receive(id, { quantity }),
    onSuccess: (_res, vars) => {
      notify('success', `${vars.quantity} added`);
      void qc.invalidateQueries({ queryKey: queryKeys.inventory.all });
    },
    onError: (error) => notify('error', error),
  });
}

export function useRestockLow() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => inventoryDal.restockLow(),
    onSuccess: (res) => {
      const n = res.data.data.restocked;
      notify('success', n ? `${n} low item${n === 1 ? '' : 's'} restocked` : 'Nothing to restock');
      void qc.invalidateQueries({ queryKey: queryKeys.inventory.all });
    },
    onError: (error) => notify('error', error),
  });
}
