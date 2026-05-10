import type { UserRole } from './enums.dto';

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatar_url: string | null;
  email_verified?: boolean;
}

export interface LoginData {
  accessToken: string;
  user: AuthUser;
}

export interface RefreshData {
  accessToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface ForgotPasswordRequest { email: string; }
export interface ResetPasswordRequest  { token: string; password: string; }
export interface ChangePasswordRequest { currentPassword: string; newPassword: string; }