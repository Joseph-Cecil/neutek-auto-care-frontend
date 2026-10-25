'use client';

import { useMutation } from '@tanstack/react-query';
import { bookingDal } from '@/lib/dal/booking.dal';
import { notify } from '@/lib/notify';
import type { CreateBookingRequest } from '@/lib/dto';

export function useCreateBooking() {
  return useMutation({
    mutationFn: (data: CreateBookingRequest) => bookingDal.create(data),
    onError: (error) => {
      notify('error', error);
    },
  });
}