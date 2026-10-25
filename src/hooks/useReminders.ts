'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { reminderDal } from '@/lib/dal/reminder.dal';
import { queryKeys } from '@/lib/api/queryKeys';
import { notify } from '@/lib/notify';
import type { CreateReminderRequest, UpdateReminderSettingsRequest } from '@/lib/dto';

export function useReminders(page = 1) {
  return useQuery({
    queryKey: queryKeys.reminders.list({ page }),
    queryFn: async () => (await reminderDal.list({ page, limit: 20 })).data,
  });
}

export function useCreateReminder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateReminderRequest) => reminderDal.create(body),
    onSuccess: () => {
      notify('success', 'Service schedule saved');
      void qc.invalidateQueries({ queryKey: queryKeys.reminders.all });
    },
    onError: (error) => notify('error', error),
  });
}

export function useSendReminder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => reminderDal.send(id),
    onSuccess: () => {
      notify('success', 'Reminder marked sent');
      void qc.invalidateQueries({ queryKey: queryKeys.reminders.all });
    },
    onError: (error) => notify('error', error),
  });
}

export function useSendDueReminders() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => reminderDal.sendDue(),
    onSuccess: (res) => {
      const sent = res.data.data.sent;
      notify('success', sent ? `${sent} reminder${sent === 1 ? '' : 's'} marked sent` : 'Nothing due to send');
      void qc.invalidateQueries({ queryKey: queryKeys.reminders.all });
    },
    onError: (error) => notify('error', error),
  });
}

export function useUpdateReminderSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateReminderSettingsRequest) => reminderDal.updateSettings(body),
    onSuccess: () => {
      notify('success', 'Reminder rules saved');
      void qc.invalidateQueries({ queryKey: queryKeys.reminders.all });
    },
    onError: (error) => notify('error', error),
  });
}
