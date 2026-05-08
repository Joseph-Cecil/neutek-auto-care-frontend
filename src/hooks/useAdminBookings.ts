'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { bookingDal } from '@/lib/dal/booking.dal';
import { queryKeys }  from '@/lib/api/queryKeys';
import { getErrorMessage } from '@/lib/utils/errors';
import type { ListBookingsParams, UpdateBookingRequest } from '@/lib/dto';

export function useAdminBookings(params?: ListBookingsParams) {
  return useQuery({
    queryKey: queryKeys.bookings.list(params),
    queryFn:  async () => {
      const res = await bookingDal.list(params);
      return res.data;
    },
  });
}

export function useAdminBooking(id: string) {
  return useQuery({
    queryKey: queryKeys.bookings.detail(id),
    queryFn:  async () => {
      const res = await bookingDal.getById(id);
      return res.data.data;
    },
    enabled: !!id,
  });
}

export function useUpdateBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateBookingRequest }) =>
      bookingDal.update(id, body),
    onSuccess: (_res, { id }) => {
      toast.success('Booking updated');
      qc.invalidateQueries({ queryKey: queryKeys.bookings.all });
      qc.invalidateQueries({ queryKey: queryKeys.bookings.detail(id) });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useCancelBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => bookingDal.cancel(id),
    onSuccess: (_res, id) => {
      toast.success('Booking cancelled');
      qc.invalidateQueries({ queryKey: queryKeys.bookings.all });
      qc.invalidateQueries({ queryKey: queryKeys.bookings.detail(id) });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}