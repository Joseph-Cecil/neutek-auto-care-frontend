'use client';

import { useQuery } from '@tanstack/react-query';
import { bookingDal } from '@/lib/dal/booking.dal';
import { queryKeys } from '@/lib/api/queryKeys';

export function useBookingStatus(bookingNumber: string, phoneLast4: string) {
  return useQuery({
    queryKey: queryKeys.bookings.byNumber(bookingNumber, phoneLast4),
    queryFn: async () => {
      const res = await bookingDal.getByNumber(bookingNumber, phoneLast4);
      return res.data.data;
    },
    enabled: !!bookingNumber && phoneLast4.length === 4,
    retry: false,
  });
}
