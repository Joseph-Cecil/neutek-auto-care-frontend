import apiClient from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import type {
  ApiResponse, PaginatedResponse, Payment, PaystackInitResult,
  InitializePaymentRequest, RecordPaymentRequest, ListPaymentsParams,
} from '@/lib/dto';

export const paymentDal = {
  list:       (params?: ListPaymentsParams) =>
    apiClient.get<PaginatedResponse<Payment>>(ENDPOINTS.PAYMENTS.LIST, { params }),
  initialize: (body: InitializePaymentRequest) =>
    apiClient.post<ApiResponse<{ data: PaystackInitResult }>>(ENDPOINTS.PAYMENTS.INITIALIZE, body),
  record:     (body: RecordPaymentRequest) =>
    apiClient.post<ApiResponse<Payment>>(ENDPOINTS.PAYMENTS.RECORD, body),
  getById:    (id: string) =>
    apiClient.get<ApiResponse<Payment>>(ENDPOINTS.PAYMENTS.BY_ID(id)),
};