import apiClient from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import type {
  ApiResponse, PaginatedResponse,
  FleetAccount, FleetVehicle,
  CreateFleetAccountRequest, AddFleetVehicleRequest,
} from '@/lib/dto';

export const fleetDal = {
  list: (params?: { page?: number; limit?: number }) =>
    apiClient.get<PaginatedResponse<FleetAccount>>(ENDPOINTS.FLEET.LIST, { params }),

  create: (body: CreateFleetAccountRequest) =>
    apiClient.post<ApiResponse<FleetAccount>>(ENDPOINTS.FLEET.CREATE, body),

  getById: (id: string) =>
    apiClient.get<ApiResponse<FleetAccount>>(ENDPOINTS.FLEET.BY_ID(id)),

  update: (id: string, body: Partial<CreateFleetAccountRequest>) =>
    apiClient.patch<ApiResponse<FleetAccount>>(ENDPOINTS.FLEET.BY_ID(id), body),

  listVehicles: (id: string) =>
    apiClient.get<ApiResponse<FleetVehicle[]>>(ENDPOINTS.FLEET.VEHICLES(id)),

  addVehicle: (id: string, body: AddFleetVehicleRequest) =>
    apiClient.post<ApiResponse<FleetVehicle>>(ENDPOINTS.FLEET.VEHICLES(id), body),
};