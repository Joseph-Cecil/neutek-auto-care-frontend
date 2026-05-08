'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { paymentDal } from '@/lib/dal/payment.dal';
import { queryKeys }  from '@/lib/api/queryKeys';
import { getErrorMessage } from '@/lib/utils/errors';
import type { ListPaymentsParams, RecordPaymentRequest } from '@/lib/dto';

export function useAdminPayments(params?: ListPaymentsParams) {
  return useQuery({
    queryKey: queryKeys.payments.list(params),
    queryFn:  async () => {
      const res = await paymentDal.list(params);
      return res.data;
    },
  });
}

export function useRecordPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: RecordPaymentRequest) => paymentDal.record(body),
    onSuccess: () => {
      toast.success('Payment recorded');
      qc.invalidateQueries({ queryKey: queryKeys.payments.all });
      qc.invalidateQueries({ queryKey: queryKeys.invoices.all });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}