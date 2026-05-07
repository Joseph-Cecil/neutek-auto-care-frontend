import apiClient from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import type {
  ApiResponse, PaginatedResponse,
  Invoice, CreateInvoiceRequest, ListInvoicesParams,
} from '@/lib/dto';

export const invoiceDal = {
  list: (params?: ListInvoicesParams) =>
    apiClient.get<PaginatedResponse<Invoice>>(ENDPOINTS.INVOICES.LIST, { params }),

  create: (body: CreateInvoiceRequest) =>
    apiClient.post<ApiResponse<Invoice>>(ENDPOINTS.INVOICES.CREATE, body),

  getById: (id: string) =>
    apiClient.get<ApiResponse<Invoice>>(ENDPOINTS.INVOICES.BY_ID(id)),
};