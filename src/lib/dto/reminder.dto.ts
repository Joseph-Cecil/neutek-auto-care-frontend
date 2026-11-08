export type ReminderDisplayStatus = 'due_soon' | 'overdue' | 'upcoming' | 'reminder_sent' | 'booked';

export interface ServiceReminder {
  id: string;
  vehicle_id: string;
  license_plate: string;
  year: number;
  make: string;
  model: string;
  customer_id: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  service_name: string;
  basis: string;
  due_on: string;
  display_status: ReminderDisplayStatus;
  sent_at: string | null;
}

export interface ReminderSummary {
  dueOrOverdue: number;
  sentThisMonth: number;
}

export interface ReminderSettings {
  remind_days_before: boolean;
  remind_again: boolean;
  whatsapp_then_sms: boolean;
}

export interface ReminderListResponse {
  success: true;
  data: ServiceReminder[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  summary: ReminderSummary;
  settings: ReminderSettings;
}

export interface CreateReminderRequest {
  vehicleId: string;
  serviceName: string;
  basis: string;
  dueOn: string;
}

export interface UpdateReminderSettingsRequest {
  remindDaysBefore?: boolean;
  remindAgain?: boolean;
  whatsappThenSms?: boolean;
}
