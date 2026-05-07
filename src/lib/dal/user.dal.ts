import apiClient from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import type {
  ApiResponse, PaginatedResponse, UserProfile,
  UpdateProfileRequest, UpdateAvatarRequest, ListUsersParams,
} from '@/lib/dto';

export const userDal = {
  me: () =>
    apiClient.get<ApiResponse<UserProfile>>(ENDPOINTS.USERS.ME),

  updateMe: (body: UpdateProfileRequest) =>
    apiClient.patch<ApiResponse<UserProfile>>(ENDPOINTS.USERS.ME, body),

  updateAvatar: (body: UpdateAvatarRequest) =>
    apiClient.patch<ApiResponse<null>>(ENDPOINTS.USERS.ME_AVATAR, body),

  list: (params?: ListUsersParams) =>
    apiClient.get<PaginatedResponse<UserProfile>>(ENDPOINTS.USERS.LIST, { params }),

  getById: (id: string) =>
    apiClient.get<ApiResponse<UserProfile>>(ENDPOINTS.USERS.BY_ID(id)),

  deleteById: (id: string) =>
    apiClient.delete<void>(ENDPOINTS.USERS.BY_ID(id)),
};