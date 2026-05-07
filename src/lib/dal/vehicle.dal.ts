import apiClient from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import type {
  ApiResponse,
  Vehicle, CreateVehicleRequest, UpdateVehicleRequest,
} from '@/lib/dto';

export const vehicleDal = {
  listByCustomer: (customerId: string) =>
    apiClient.get<ApiResponse<Vehicle[]>>(ENDPOINTS.VEHICLES.BY_CUSTOMER(customerId)),

  getById: (id: string) =>
    apiClient.get<ApiResponse<Vehicle>>(ENDPOINTS.VEHICLES.BY_ID(id)),

  create: (body: CreateVehicleRequest) =>
    apiClient.post<ApiResponse<Vehicle>>(ENDPOINTS.VEHICLES.CREATE, body),

  update: (id: string, body: UpdateVehicleRequest) =>
    apiClient.patch<ApiResponse<Vehicle>>(ENDPOINTS.VEHICLES.BY_ID(id), body),

  delete: (id: string) =>
    apiClient.delete<void>(ENDPOINTS.VEHICLES.BY_ID(id)),
};