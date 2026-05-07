// ─────────────────────────────────────────────────────────────
// Neutek Auto Care — User DTOs
// Fields are snake_case as returned by GET /users/me, /users/:id
// ─────────────────────────────────────────────────────────────
import type { UserRole } from './enums.dto';

export interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  role: UserRole;
  avatar_url: string | null;
  email_verified: boolean;    // NOTE: Swagger shows 'is_verified' — that is wrong
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface UpdateAvatarRequest {
  avatarUrl: string;  // publicUrl from presign response
}

export interface ListUsersParams {
  page?: number;
  limit?: number;
  role?: UserRole;
  search?: string;
}