'use client';

import { useEffect, type ReactNode } from 'react';
import { authDal } from '@/lib/dal/auth.dal';
import { useAuthStore } from '@/stores/auth.store';

export function AuthProvider({ children }: { children: ReactNode }) {
  const { setAuth, clearAuth, setLoading } = useAuthStore();

  useEffect(() => {
    let cancelled = false;

    async function silentRefresh() {
      try {
        const res   = await authDal.refresh();
        const meRes = await authDal.me();
        if (cancelled) return;

        const { accessToken } = res.data.data;
        const user            = meRes.data.data;

        setAuth(accessToken, {
          id:         user.id,
          email:      user.email,
          firstName:  user.first_name,
          lastName:   user.last_name,
          role:       user.role,
          avatar_url: user.avatar_url,
        });
      } catch {
        if (!cancelled) clearAuth();
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    silentRefresh();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <>{children}</>;
}