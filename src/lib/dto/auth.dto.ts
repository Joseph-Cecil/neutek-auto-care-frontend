// ─────────────────────────────────────────────────────────────
// Neutek Auto Care — Auth DTOs
// NOTE: Login/Register response user object uses camelCase
//       (different from UserProfile which uses snake_case)
// ─────────────────────────────────────────────────────────────
import type { UserRole } from './enums.dto';

/** User object inside login / register response body */
export interface AuthUser {
  id: string;
  email: string;
  firstName: string;   // camelCase — intentional (differs from UserProfile)
  lastName: string;    // camelCase — intentional
  role: UserRole;
  avatar_url: string | null;  // snake_case — as returned by API
}

/** data field of POST /auth/login & POST /auth/register */
export interface LoginData {
  accessToken: string;
  user: AuthUser;
}

/** data field of POST /auth/refresh */
export interface RefreshData {
  accessToken: string;
}

// ── Request bodies ───────────────────────────────────────────

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

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}