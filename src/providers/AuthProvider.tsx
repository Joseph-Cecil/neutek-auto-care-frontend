'use client';

// ─────────────────────────────────────────────────────────────
// Silent token refresh on app load
// Calls POST /auth/refresh using the HttpOnly cookie.
// On success: store new access token in Zustand.
// On failure: clear auth state (user is logged out).
// ─────────────────────────────────────────────────────────────
import { useEffect, type ReactNode } from 'react';
import { authDal } from '@/lib/dal/auth.dal';
import { useAuthStore } from '@/stores/auth.store';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { setAuth, clearAuth, setLoading } = useAuthStore();

  useEffect(() => {
    let cancelled = false;

    async function silentRefresh() {
      try {
        // POST /auth/refresh — browser auto-sends HttpOnly cookie
        const res = await authDal.refresh();
        if (cancelled) return;

        const { accessToken } = res.data.data;

        // Also fetch the user profile
        const meRes = await authDal.me();
        if (cancelled) return;

        const user = meRes.data.data;

        // Store in Zustand — map UserProfile to AuthUser shape
        setAuth(accessToken, {
          id:         user.id,
          email:      user.email,
          firstName:  user.first_name,
          lastName:   user.last_name,
          role:       user.role,
          avatar_url: user.avatar_url,
        });
      } catch {
        if (!cancelled) {
          clearAuth();
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    silentRefresh();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <>{children}</>;
}