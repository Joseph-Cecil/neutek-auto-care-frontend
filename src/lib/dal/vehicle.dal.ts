import apiClient from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import type {
  ApiResponse, PaginatedResponse, Vehicle, CreateVehicleRequest, UpdateVehicleRequest, ListVehiclesParams,
} from '@/lib/dto';

export const vehicleDal = {
  list:           (params?: ListVehiclesParams) =>
    apiClient.get<PaginatedResponse<Vehicle>>(ENDPOINTS.VEHICLES.LIST, { params }),
  listByCustomer: (customerId: string) =>
    apiClient.get<ApiResponse<Vehicle[]>>(ENDPOINTS.VEHICLES.BY_CUSTOMER(customerId)),
  getById:        (id: string) =>
    apiClient.get<ApiResponse<Vehicle>>(ENDPOINTS.VEHICLES.BY_ID(id)),
  create:         (body: CreateVehicleRequest) =>
    apiClient.post<ApiResponse<Vehicle>>(ENDPOINTS.VEHICLES.CREATE, body),
  update:         (id: string, body: UpdateVehicleRequest) =>
    apiClient.patch<ApiResponse<Vehicle>>(ENDPOINTS.VEHICLES.BY_ID(id), body),
  delete:         (id: string) =>
    apiClient.delete<void>(ENDPOINTS.VEHICLES.BY_ID(id)),
};