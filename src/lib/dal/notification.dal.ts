import apiClient from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import type {
  ApiResponse, PaginatedResponse, Notification, ListNotificationsParams,
} from '@/lib/dto';

export const notificationDal = {
  list:        (params?: ListNotificationsParams) =>
    apiClient.get<PaginatedResponse<Notification>>(ENDPOINTS.NOTIFICATIONS.LIST, { params }),
  markRead:    (id: string) =>
    apiClient.patch<ApiResponse<null>>(ENDPOINTS.NOTIFICATIONS.MARK_READ(id)),
  markAllRead: () =>
    apiClient.post<ApiResponse<null>>(ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ),
};