import apiClient from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import type {
  ApiResponse,
  CreatePartRequest,
  InventoryListResponse,
  InventoryPart,
  ReceiveStockRequest,
} from '@/lib/dto';

export const inventoryDal = {
  list: (params?: { page?: number; limit?: number; filter?: 'all' | 'low' }) =>
    apiClient.get<InventoryListResponse>(ENDPOINTS.INVENTORY.LIST, { params }),
  create: (body: CreatePartRequest) =>
    apiClient.post<ApiResponse<InventoryPart>>(ENDPOINTS.INVENTORY.CREATE, body),
  receive: (id: string, body: ReceiveStockRequest) =>
    apiClient.post<ApiResponse<InventoryPart>>(ENDPOINTS.INVENTORY.RECEIVE(id), body),
  restockLow: () =>
    apiClient.post<ApiResponse<{ restocked: number }>>(ENDPOINTS.INVENTORY.RESTOCK_LOW),
};
