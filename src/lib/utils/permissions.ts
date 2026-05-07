// ─────────────────────────────────────────────────────────────
// Neutek Auto Care — Permission Utilities
// ─────────────────────────────────────────────────────────────
import type { UserRole } from '@/lib/dto';

/** Check if a role is in an allowed list */
export function hasRole(userRole: UserRole, allowedRoles: UserRole[]): boolean {
  return allowedRoles.includes(userRole);
}

/** Admin or Super Admin */
export function isAdmin(role: UserRole): boolean {
  return role === 'admin' || role === 'super_admin';
}

/** Super Admin only */
export function isSuperAdmin(role: UserRole): boolean {
  return role === 'super_admin';
}

/** Technician (includes admins for convenience) */
export function isTechnician(role: UserRole): boolean {
  return role === 'technician' || isAdmin(role);
}

/** Customer portal access */
export function isCustomer(role: UserRole): boolean {
  return role === 'customer';
}

/** Can access admin dashboard */
export function canAccessAdmin(role: UserRole): boolean {
  return isAdmin(role) || role === 'technician';
}

/** Can manage users */
export function canManageUsers(role: UserRole): boolean {
  return isAdmin(role);
}

/** Can manage financial data */
export function canManageFinance(role: UserRole): boolean {
  return isAdmin(role);
}

/** Can create/manage jobs */
export function canManageJobs(role: UserRole): boolean {
  return isAdmin(role) || role === 'technician';
}

/** Can view analytics */
export function canViewAnalytics(role: UserRole): boolean {
  return isAdmin(role);
}