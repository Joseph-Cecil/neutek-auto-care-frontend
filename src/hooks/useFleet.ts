'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { fleetDal } from '@/lib/dal/fleet.dal';
import { queryKeys } from '@/lib/api/queryKeys';
import { getErrorMessage } from '@/lib/utils/errors';
import type { CreateFleetAccountRequest, AddFleetVehicleRequest } from '@/lib/dto';

export function useFleetAccounts(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: queryKeys.fleet.list(params),
    queryFn:  async () => {
      const res = await fleetDal.list(params);
      return res.data;
    },
  });
}

export function useFleetAccount(id: string) {
  return useQuery({
    queryKey: queryKeys.fleet.detail(id),
    queryFn:  async () => {
      const res = await fleetDal.getById(id);
      return res.data.data;
    },
    enabled: !!id,
  });
}

export function useFleetVehicles(id: string) {
  return useQuery({
    queryKey: queryKeys.fleet.vehicles(id),
    queryFn:  async () => {
      const res = await fleetDal.listVehicles(id);
      return res.data.data;
    },
    enabled: !!id,
  });
}

export function useCreateFleetAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateFleetAccountRequest) => fleetDal.create(body),
    onSuccess: () => {
      toast.success('Fleet account created');
      qc.invalidateQueries({ queryKey: queryKeys.fleet.all });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useUpdateFleetAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<CreateFleetAccountRequest> }) =>
      fleetDal.update(id, body),
    onSuccess: (_res, { id }) => {
      toast.success('Fleet account updated');
      qc.invalidateQueries({ queryKey: queryKeys.fleet.detail(id) });
      qc.invalidateQueries({ queryKey: queryKeys.fleet.all });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useAddFleetVehicle(fleetId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: AddFleetVehicleRequest) => fleetDal.addVehicle(fleetId, body),
    onSuccess: () => {
      toast.success('Vehicle added to fleet');
      qc.invalidateQueries({ queryKey: queryKeys.fleet.vehicles(fleetId) });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}