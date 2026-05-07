import apiClient from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import type {
  ApiResponse, PaginatedResponse,
  Customer, CreateCustomerRequest, UpdateCustomerRequest, ListCustomersParams,
} from '@/lib/dto';

export const customerDal = {
  list: (params?: ListCustomersParams) =>
    apiClient.get<PaginatedResponse<Customer>>(ENDPOINTS.CUSTOMERS.LIST, { params }),

  create: (body: CreateCustomerRequest) =>
    apiClient.post<ApiResponse<Customer>>(ENDPOINTS.CUSTOMERS.CREATE, body),

  getById: (id: string) =>
    apiClient.get<ApiResponse<Customer>>(ENDPOINTS.CUSTOMERS.BY_ID(id)),

  update: (id: string, body: UpdateCustomerRequest) =>
    apiClient.patch<ApiResponse<Customer>>(ENDPOINTS.CUSTOMERS.BY_ID(id), body),

  delete: (id: string) =>
    apiClient.delete<void>(ENDPOINTS.CUSTOMERS.BY_ID(id)),
};