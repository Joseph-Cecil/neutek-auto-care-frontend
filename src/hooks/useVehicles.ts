'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { vehicleDal } from '@/lib/dal/vehicle.dal';
import { queryKeys }  from '@/lib/api/queryKeys';
import { getErrorMessage } from '@/lib/utils/errors';
import type { CreateVehicleRequest, UpdateVehicleRequest } from '@/lib/dto';

export function useCustomerVehicles(customerId: string) {
  return useQuery({
    queryKey: queryKeys.vehicles.byCustomer(customerId),
    queryFn:  async () => {
      const res = await vehicleDal.listByCustomer(customerId);
      return res.data.data;
    },
    enabled: !!customerId,
  });
}

export function useVehicle(id: string) {
  return useQuery({
    queryKey: queryKeys.vehicles.detail(id),
    queryFn:  async () => {
      const res = await vehicleDal.getById(id);
      return res.data.data;
    },
    enabled: !!id,
  });
}

export function useCreateVehicle(customerId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateVehicleRequest) => vehicleDal.create(body),
    onSuccess: () => {
      toast.success('Vehicle added successfully');
      qc.invalidateQueries({ queryKey: queryKeys.vehicles.byCustomer(customerId) });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useUpdateVehicle(customerId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateVehicleRequest }) =>
      vehicleDal.update(id, body),
    onSuccess: (_res, { id }) => {
      toast.success('Vehicle updated');
      qc.invalidateQueries({ queryKey: queryKeys.vehicles.byCustomer(customerId) });
      qc.invalidateQueries({ queryKey: queryKeys.vehicles.detail(id) });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useDeleteVehicle(customerId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => vehicleDal.delete(id),
    onSuccess: () => {
      toast.success('Vehicle removed');
      qc.invalidateQueries({ queryKey: queryKeys.vehicles.byCustomer(customerId) });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}