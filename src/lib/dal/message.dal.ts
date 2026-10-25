import apiClient from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import type {
  ApiResponse,
  MessageDelivery,
  MessageLogResponse,
  MessageTemplate,
  MessageTemplateListResponse,
  UpdateMessageTemplateRequest,
} from '@/lib/dto';

export const messageDal = {
  templates: (params?: { page?: number; limit?: number }) =>
    apiClient.get<MessageTemplateListResponse>(ENDPOINTS.MESSAGES.TEMPLATES, { params }),
  update: (id: string, body: UpdateMessageTemplateRequest) =>
    apiClient.patch<ApiResponse<MessageTemplate>>(ENDPOINTS.MESSAGES.TEMPLATE(id), body),
  recordTest: (id: string) =>
    apiClient.post<ApiResponse<MessageDelivery>>(ENDPOINTS.MESSAGES.TEST(id)),
  deliveries: (params?: { page?: number; limit?: number }) =>
    apiClient.get<MessageLogResponse>(ENDPOINTS.MESSAGES.LOG, { params }),
};
