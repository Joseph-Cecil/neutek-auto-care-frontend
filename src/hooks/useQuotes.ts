'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { quoteDal } from '@/lib/dal/quote.dal';
import { queryKeys } from '@/lib/api/queryKeys';
import { getErrorMessage } from '@/lib/utils/errors';
import type { ListQuotesParams, CreateQuoteRequest, RejectQuoteRequest } from '@/lib/dto';

export function useQuotes(params?: ListQuotesParams) {
  return useQuery({
    queryKey: queryKeys.quotes.list(params),
    queryFn:  async () => {
      const res = await quoteDal.list(params);
      return res.data;
    },
  });
}

export function useQuote(id: string) {
  return useQuery({
    queryKey: queryKeys.quotes.detail(id),
    queryFn:  async () => {
      const res = await quoteDal.getById(id);
      return res.data.data;
    },
    enabled: !!id,
  });
}

export function useCreateQuote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateQuoteRequest) => quoteDal.create(body),
    onSuccess: () => {
      toast.success('Quote created');
      qc.invalidateQueries({ queryKey: queryKeys.quotes.all });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useApproveQuote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => quoteDal.approve(id),
    onSuccess: (_res, id) => {
      toast.success('Quote approved — repair work will begin shortly');
      qc.invalidateQueries({ queryKey: queryKeys.quotes.detail(id) });
      qc.invalidateQueries({ queryKey: queryKeys.quotes.all });
      qc.invalidateQueries({ queryKey: queryKeys.jobs.all });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useRejectQuote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body?: RejectQuoteRequest }) =>
      quoteDal.reject(id, body),
    onSuccess: (_res, { id }) => {
      toast.success('Quote rejected');
      qc.invalidateQueries({ queryKey: queryKeys.quotes.detail(id) });
      qc.invalidateQueries({ queryKey: queryKeys.quotes.all });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}