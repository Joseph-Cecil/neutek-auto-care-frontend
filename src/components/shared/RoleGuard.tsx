'use client';

import { useAuthStore } from '@/stores/auth.store';
import { hasRole } from '@/lib/utils/permissions';
import type { UserRole } from '@/lib/dto';
import type { ReactNode } from 'react';

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: ReactNode;
  fallback?: ReactNode;
}

export function RoleGuard({ allowedRoles, children, fallback = null }: RoleGuardProps) {
  const user = useAuthStore((s) => s.user);
  if (!user) return <>{fallback}</>;
  if (!hasRole(user.role, allowedRoles)) return <>{fallback}</>;
  return <>{children}</>;
}