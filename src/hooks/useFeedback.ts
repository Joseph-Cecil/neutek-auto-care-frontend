'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { feedbackDal } from '@/lib/dal/feedback.dal';
import { queryKeys } from '@/lib/api/queryKeys';
import { getStatusCode } from '@/lib/utils/errors';
import { notify } from '@/lib/notify';
import type { CreateFeedbackRequest, UpdateFeedbackRequest } from '@/lib/dto';

export function useFeedbackList(page = 1) {
  return useQuery({
    queryKey: queryKeys.feedback.list({ page }),
    queryFn: async () => (await feedbackDal.list({ page, limit: 20 })).data,
  });
}

export function useJobFeedback(jobId: string) {
  return useQuery({
    queryKey: queryKeys.feedback.byJob(jobId),
    queryFn: async () => (await feedbackDal.getByJob(jobId)).data.data,
    enabled: !!jobId,
    retry: (failureCount, error) => getStatusCode(error) !== 404 && failureCount < 2,
  });
}

export function useSubmitFeedback(jobId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Omit<CreateFeedbackRequest, 'jobId'>) => feedbackDal.create({ ...body, jobId }),
    onSuccess: () => {
      notify('success', 'Thank you for your feedback');
      void qc.invalidateQueries({ queryKey: queryKeys.feedback.byJob(jobId) });
      void qc.invalidateQueries({ queryKey: queryKeys.feedback.all });
    },
    onError: (error) => notify('error', error),
  });
}

export function useUpdateFeedback() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateFeedbackRequest }) => feedbackDal.update(id, body),
    onSuccess: () => {
      notify('success', 'Feedback updated');
      void qc.invalidateQueries({ queryKey: queryKeys.feedback.all });
    },
    onError: (error) => notify('error', error),
  });
}
