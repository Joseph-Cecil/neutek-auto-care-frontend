// ─────────────────────────────────────────────────────────────
// Neutek Auto Care — Auth DAL
// ─────────────────────────────────────────────────────────────
import apiClient from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import type {
  ApiResponse, LoginData, RefreshData, UserProfile,
  LoginRequest, RegisterRequest, ForgotPasswordRequest,
  ResetPasswordRequest, ChangePasswordRequest,
} from '@/lib/dto';

export const authDal = {
  login: (body: LoginRequest) =>
    apiClient.post<ApiResponse<LoginData>>(ENDPOINTS.AUTH.LOGIN, body),

  register: (body: RegisterRequest) =>
    apiClient.post<ApiResponse<LoginData>>(ENDPOINTS.AUTH.REGISTER, body),

  logout: () =>
    apiClient.post<ApiResponse<null>>(ENDPOINTS.AUTH.LOGOUT),

  refresh: () =>
    apiClient.post<ApiResponse<RefreshData>>(ENDPOINTS.AUTH.REFRESH),

  me: () =>
    apiClient.get<ApiResponse<UserProfile>>(ENDPOINTS.AUTH.ME),

  forgotPassword: (body: ForgotPasswordRequest) =>
    apiClient.post<ApiResponse<null>>(ENDPOINTS.AUTH.FORGOT_PASSWORD, body),

  resetPassword: (body: ResetPasswordRequest) =>
    apiClient.post<ApiResponse<null>>(ENDPOINTS.AUTH.RESET_PASSWORD, body),

  changePassword: (body: ChangePasswordRequest) =>
    apiClient.post<ApiResponse<null>>(ENDPOINTS.AUTH.CHANGE_PASSWORD, body),
};