import type { NotificationChannel } from './enums.dto';

export interface Notification {
  id: string;
  user_id: string | null;
  customer_id: string | null;
  channel: NotificationChannel;
  title: string;
  body: string;
  data: Record<string, unknown> | null;
  is_read: boolean;
  sent_at: string | null;
  created_at: string;
}

export interface ListNotificationsParams {
  page?: number;
  limit?: number;
  isRead?: boolean;
}