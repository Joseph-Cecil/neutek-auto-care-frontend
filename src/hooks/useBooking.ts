'use client';

import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { bookingDal } from '@/lib/dal/booking.dal';
import { getErrorMessage } from '@/lib/utils/errors';
import type { CreateBookingRequest } from '@/lib/dto';

export function useCreateBooking() {
  return useMutation({
    mutationFn: (data: CreateBookingRequest) => bookingDal.create(data),
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}