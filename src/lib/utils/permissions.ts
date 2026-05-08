import type { UserRole } from '@/lib/dto';

export function hasRole(userRole: UserRole, allowedRoles: UserRole[]): boolean {
  return allowedRoles.includes(userRole);
}

export function isAdmin(role: UserRole): boolean {
  return role === 'admin' || role === 'super_admin';
}

export function isSuperAdmin(role: UserRole): boolean {
  return role === 'super_admin';
}

export function isTechnician(role: UserRole): boolean {
  return role === 'technician' || isAdmin(role);
}

export function isCustomer(role: UserRole): boolean {
  return role === 'customer';
}

export function canAccessAdmin(role: UserRole): boolean {
  return isAdmin(role) || role === 'technician';
}

export function canManageUsers(role: UserRole):   boolean { return isAdmin(role); }
export function canManageFinance(role: UserRole): boolean { return isAdmin(role); }
export function canManageJobs(role: UserRole): boolean {
  return isAdmin(role) || role === 'technician';
}
export function canViewAnalytics(role: UserRole): boolean { return isAdmin(role); }