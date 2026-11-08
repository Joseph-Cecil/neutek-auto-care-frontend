import apiClient from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import type {
  ApiResponse,
  CreateReminderRequest,
  ReminderListResponse,
  ReminderSettings,
  ServiceReminder,
  UpdateReminderSettingsRequest,
} from '@/lib/dto';

export const reminderDal = {
  list: (params?: { page?: number; limit?: number }) =>
    apiClient.get<ReminderListResponse>(ENDPOINTS.REMINDERS.LIST, { params }),
  create: (body: CreateReminderRequest) =>
    apiClient.post<ApiResponse<ServiceReminder>>(ENDPOINTS.REMINDERS.CREATE, body),
  send: (id: string) =>
    apiClient.post<ApiResponse<ServiceReminder>>(ENDPOINTS.REMINDERS.SEND(id)),
  sendDue: () =>
    apiClient.post<ApiResponse<{ sent: number }>>(ENDPOINTS.REMINDERS.SEND_DUE),
  updateSettings: (body: UpdateReminderSettingsRequest) =>
    apiClient.patch<ApiResponse<ReminderSettings>>(ENDPOINTS.REMINDERS.SETTINGS, body),
};
