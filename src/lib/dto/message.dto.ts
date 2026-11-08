export interface MessageTemplate {
  id: string;
  stage: string;
  name: string;
  body: string;
  sms_enabled: boolean;
  whatsapp_enabled: boolean;
  automatic: boolean;
  sort_order: number;
}

export interface MessageTemplateSummary {
  automatic: number;
  total: number;
}

export interface MessageTemplateListResponse {
  success: true;
  data: MessageTemplate[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  summary: MessageTemplateSummary;
}

export interface UpdateMessageTemplateRequest {
  body?: string;
  sms?: boolean;
  whatsapp?: boolean;
  automatic?: boolean;
}

export interface MessageDelivery {
  id: string;
  template_id: string | null;
  template_name: string;
  recipient_name: string;
  recipient_phone: string | null;
  channel: 'none';
  status: 'recorded';
  detail: string;
  created_at: string;
}

export interface MessageLogSummary {
  recordedThisWeek: number;
  delivered: number;
}

export interface MessageLogResponse {
  success: true;
  data: MessageDelivery[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  summary: MessageLogSummary;
}
