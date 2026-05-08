'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { jobDal } from '@/lib/dal/job.dal';
import { queryKeys } from '@/lib/api/queryKeys';
import { getErrorMessage } from '@/lib/utils/errors';
import type { ListJobsParams, TransitionJobRequest, UpdateJobRequest } from '@/lib/dto';

export function useJobs(params?: ListJobsParams) {
  return useQuery({
    queryKey: queryKeys.jobs.list(params),
    queryFn:  async () => {
      const res = await jobDal.list(params);
      return res.data;
    },
    enabled: true,
  });
}

export function useJob(id: string) {
  return useQuery({
    queryKey: queryKeys.jobs.detail(id),
    queryFn:  async () => {
      const res = await jobDal.getById(id);
      return res.data.data;
    },
    enabled: !!id,
  });
}

export function useJobHistory(id: string) {
  return useQuery({
    queryKey: queryKeys.jobs.history(id),
    queryFn:  async () => {
      const res = await jobDal.getHistory(id);
      return res.data.data;
    },
    enabled: !!id,
  });
}

export function useTransitionJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: TransitionJobRequest }) =>
      jobDal.transition(id, body),
    onSuccess: (_res, { id }) => {
      toast.success('Job status updated');
      qc.invalidateQueries({ queryKey: queryKeys.jobs.detail(id) });
      qc.invalidateQueries({ queryKey: queryKeys.jobs.all });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useUpdateJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateJobRequest }) =>
      jobDal.update(id, body),
    onSuccess: (_res, { id }) => {
      toast.success('Job updated');
      qc.invalidateQueries({ queryKey: queryKeys.jobs.detail(id) });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}