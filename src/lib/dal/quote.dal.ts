import apiClient from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import type {
  ApiResponse, PaginatedResponse, Quote,
  CreateQuoteRequest, RejectQuoteRequest, ListQuotesParams,
} from '@/lib/dto';

export const quoteDal = {
  list:    (params?: ListQuotesParams) =>
    apiClient.get<PaginatedResponse<Quote>>(ENDPOINTS.QUOTES.LIST, { params }),
  create:  (body: CreateQuoteRequest) =>
    apiClient.post<ApiResponse<Quote>>(ENDPOINTS.QUOTES.CREATE, body),
  getById: (id: string) =>
    apiClient.get<ApiResponse<Quote>>(ENDPOINTS.QUOTES.BY_ID(id)),
  approve: (id: string) =>
    apiClient.post<ApiResponse<null>>(ENDPOINTS.QUOTES.APPROVE(id)),
  reject:  (id: string, body?: RejectQuoteRequest) =>
    apiClient.post<ApiResponse<null>>(ENDPOINTS.QUOTES.REJECT(id), body ?? {}),
};