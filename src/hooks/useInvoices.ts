'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { invoiceDal } from '@/lib/dal/invoice.dal';
import { paymentDal } from '@/lib/dal/payment.dal';
import { queryKeys }  from '@/lib/api/queryKeys';
import { getErrorMessage } from '@/lib/utils/errors';
import type { ListInvoicesParams, InitializePaymentRequest } from '@/lib/dto';

export function useInvoices(params?: ListInvoicesParams) {
  return useQuery({
    queryKey: queryKeys.invoices.list(params),
    queryFn:  async () => {
      const res = await invoiceDal.list(params);
      return res.data;
    },
  });
}

export function useInvoice(id: string) {
  return useQuery({
    queryKey: queryKeys.invoices.detail(id),
    queryFn:  async () => {
      const res = await invoiceDal.getById(id);
      return res.data.data;
    },
    enabled: !!id,
  });
}

export function useInitializePayment() {
  return useMutation({
    mutationFn: (body: InitializePaymentRequest) => paymentDal.initialize(body),
    onSuccess: (res) => {
      const url = res.data.data?.data?.authorization_url;
      if (url) {
        window.location.href = url;
      } else {
        toast.error('Could not get payment URL');
      }
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}