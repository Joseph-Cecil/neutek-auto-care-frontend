import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AuthUser } from '@/lib/dto';

interface AuthState {
  accessToken:     string | null;
  user:            AuthUser | null;
  isAuthenticated: boolean;
  isLoading:       boolean;
  setAccessToken:  (token: string) => void;
  setUser:         (user: AuthUser) => void;
  setAuth:         (token: string, user: AuthUser) => void;
  clearAuth:       () => void;
  setLoading:      (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken:     null,
      user:            null,
      isAuthenticated: false,
      isLoading:       true,

      setAccessToken: (token)       => set({ accessToken: token }),
      setUser:        (user)        => set({ user, isAuthenticated: true }),
      setAuth:        (token, user) => set({ accessToken: token, user, isAuthenticated: true, isLoading: false }),
      clearAuth:      ()            => set({ accessToken: null, user: null, isAuthenticated: false, isLoading: false }),
      setLoading:     (loading)     => set({ isLoading: loading }),
    }),
    {
      name:       'neutek-auth',
      storage:    createJSONStorage(() => sessionStorage),
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    },
  ),
);