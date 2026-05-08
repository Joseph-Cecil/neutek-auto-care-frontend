import type { UserRole } from './enums.dto';

export interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  role: UserRole;
  avatar_url: string | null;
  email_verified: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface UpdateAvatarRequest { avatarUrl: string; }

export interface ListUsersParams {
  page?: number;
  limit?: number;
  role?: UserRole;
  search?: string;
}