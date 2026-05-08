'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { notificationDal } from '@/lib/dal/notification.dal';
import { queryKeys }       from '@/lib/api/queryKeys';
import { getErrorMessage } from '@/lib/utils/errors';
import type { ListNotificationsParams } from '@/lib/dto';

export function useNotifications(params?: ListNotificationsParams) {
  return useQuery({
    queryKey: queryKeys.notifications.list(params),
    queryFn:  async () => {
      const res = await notificationDal.list(params);
      return res.data;
    },
    refetchInterval: 30 * 1000, // poll every 30s
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationDal.markRead(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => notificationDal.markAllRead(),
    onSuccess: () => {
      toast.success('All notifications marked as read');
      qc.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}