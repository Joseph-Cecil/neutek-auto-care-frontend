'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { diagnosticDal } from '@/lib/dal/diagnostic.dal';
import { queryKeys } from '@/lib/api/queryKeys';
import { getStatusCode } from '@/lib/utils/errors';
import { notify } from '@/lib/notify';
import type { CreateDiagnosticRequest } from '@/lib/dto';

export function useJobDiagnostic(jobId: string) {
  return useQuery({
    queryKey: queryKeys.diagnostics.byJob(jobId),
    queryFn: async () => {
      const res = await diagnosticDal.getByJobId(jobId);
      return res.data.data;
    },
    enabled: !!jobId,
    retry: (failureCount, error) => getStatusCode(error) !== 404 && failureCount < 2,
  });
}

export function useCreateDiagnostic(jobId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Omit<CreateDiagnosticRequest, 'jobId'>) => diagnosticDal.create({ ...body, jobId }),
    onSuccess: () => {
      notify('success', 'Diagnostic saved');
      void qc.invalidateQueries({ queryKey: queryKeys.diagnostics.byJob(jobId) });
    },
    onError: (error) => notify('error', error),
  });
}
