'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { messageDal } from '@/lib/dal/message.dal';
import { queryKeys } from '@/lib/api/queryKeys';
import { notify } from '@/lib/notify';
import type { UpdateMessageTemplateRequest } from '@/lib/dto';

export function useMessageTemplates(page = 1) {
  return useQuery({
    queryKey: queryKeys.messages.templates({ page }),
    queryFn: async () => (await messageDal.templates({ page, limit: 20 })).data,
  });
}

export function useMessageLog(page = 1) {
  return useQuery({
    queryKey: queryKeys.messages.deliveries({ page }),
    queryFn: async () => (await messageDal.deliveries({ page, limit: 20 })).data,
  });
}

export function useUpdateMessageTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateMessageTemplateRequest }) => messageDal.update(id, body),
    onSuccess: () => {
      notify('success', 'Message saved');
      void qc.invalidateQueries({ queryKey: queryKeys.messages.all });
    },
    onError: (error) => notify('error', error),
  });
}

export function useRecordMessageTest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => messageDal.recordTest(id),
    onSuccess: () => {
      notify('success', 'Test recorded. Nothing was sent.');
      void qc.invalidateQueries({ queryKey: queryKeys.messages.all });
    },
    onError: (error) => notify('error', error),
  });
}
