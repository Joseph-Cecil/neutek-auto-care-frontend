'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { scheduleDal } from '@/lib/dal/schedule.dal';
import { queryKeys } from '@/lib/api/queryKeys';
import { notify } from '@/lib/notify';

export function useSchedule() {
  return useQuery({
    queryKey: queryKeys.schedule.board,
    queryFn: async () => (await scheduleDal.board()).data.data,
  });
}

export function useAssignSchedule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { jobId: string; technicianId: string }) => scheduleDal.assign(body),
    onSuccess: (res) => {
      notify('success', `Assigned on ${res.data.data.workDate}`);
      void qc.invalidateQueries({ queryKey: queryKeys.schedule.all });
      void qc.invalidateQueries({ queryKey: queryKeys.jobs.all });
    },
    onError: (error) => notify('error', error),
  });
}

export function useSetBay() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, jobId }: { id: string; jobId: string | null }) => scheduleDal.setBay(id, jobId),
    onSuccess: (_res, vars) => {
      notify('success', vars.jobId ? 'Bay updated' : 'Bay cleared');
      void qc.invalidateQueries({ queryKey: queryKeys.schedule.all });
    },
    onError: (error) => notify('error', error),
  });
}
