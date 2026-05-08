import apiClient from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import type {
  ApiResponse, PaginatedResponse, Service, ServiceCategory,
  CreateServiceRequest, UpdateServiceRequest, ListServicesParams,
} from '@/lib/dto';

export const serviceDal = {
  listCategories: () =>
    apiClient.get<ApiResponse<ServiceCategory[]>>(ENDPOINTS.SERVICES.CATEGORIES),
  list:    (params?: ListServicesParams) =>
    apiClient.get<PaginatedResponse<Service>>(ENDPOINTS.SERVICES.LIST, { params }),
  getById: (id: string) =>
    apiClient.get<ApiResponse<Service>>(ENDPOINTS.SERVICES.BY_ID(id)),
  create:  (body: CreateServiceRequest) =>
    apiClient.post<ApiResponse<Service>>(ENDPOINTS.SERVICES.CREATE, body),
  update:  (id: string, body: UpdateServiceRequest) =>
    apiClient.patch<ApiResponse<Service>>(ENDPOINTS.SERVICES.BY_ID(id), body),
  delete:  (id: string) =>
    apiClient.delete<void>(ENDPOINTS.SERVICES.BY_ID(id)),
};