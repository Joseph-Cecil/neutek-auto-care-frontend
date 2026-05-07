'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { authDal } from '@/lib/dal/auth.dal';
import { useAuthStore } from '@/stores/auth.store';
import { queryKeys } from '@/lib/api/queryKeys';
import { getErrorMessage, applyServerErrors } from '@/lib/utils/errors';
import type {
  LoginRequest, RegisterRequest,
  ForgotPasswordRequest, ResetPasswordRequest,
} from '@/lib/dto';
import type { UseFormSetError, FieldValues } from 'react-hook-form';

export function useCurrentUser() {
  const user            = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading       = useAuthStore((s) => s.isLoading);
  return { user, isAuthenticated, isLoading };
}

export function useLogin() {
  const router      = useRouter();
  const { setAuth } = useAuthStore();
  const qc          = useQueryClient();

  return useMutation({
    mutationFn: (data: LoginRequest) => authDal.login(data),
    onSuccess: (res) => {
      const { accessToken, user } = res.data.data;
      setAuth(accessToken, user);
      qc.setQueryData(queryKeys.auth.me, user);
      toast.success('Welcome back, ' + user.firstName + '!');
      router.push(user.role === 'customer' ? '/portal/dashboard' : '/admin/dashboard');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useRegister() {
  const router      = useRouter();
  const { setAuth } = useAuthStore();

  return useMutation({
    mutationFn: (data: RegisterRequest) => authDal.register(data),
    onSuccess: (res) => {
      const { accessToken, user } = res.data.data;
      setAuth(accessToken, user);
      toast.success('Account created! Welcome to Neutek Auto Care.');
      router.push('/portal/dashboard');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useLogout() {
  const router        = useRouter();
  const { clearAuth } = useAuthStore();
  const qc            = useQueryClient();

  return useCallback(async () => {
    try {
      await authDal.logout();
    } catch {
      // Always clear local state even if server call fails
    } finally {
      clearAuth();
      qc.clear();
      router.push('/login');
    }
  }, [clearAuth, qc, router]);
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (data: ForgotPasswordRequest) => authDal.forgotPassword(data),
    onSuccess: () => {
      toast.success("If an account exists with that email, you'll receive a reset link.");
    },
    onError: () => {
      // Always show success — prevent email enumeration
      toast.success("If an account exists with that email, you'll receive a reset link.");
    },
  });
}

export function useResetPassword() {
  const router = useRouter();
  return useMutation({
    mutationFn: (data: ResetPasswordRequest) => authDal.resetPassword(data),
    onSuccess: () => {
      toast.success('Password reset successfully. Please log in.');
      router.push('/login');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useChangePassword<T extends FieldValues>({
  setError,
  onSuccess,
}: {
  setError?: UseFormSetError<T>;
  onSuccess?: () => void;
} = {}) {
  return useMutation({
    mutationFn: authDal.changePassword,
    onSuccess: () => {
      toast.success('Password changed successfully.');
      onSuccess?.();
    },
    onError: (error) => {
      if (setError) {
        applyServerErrors(error, setError, 'root' as never);
      } else {
        toast.error(getErrorMessage(error));
      }
    },
  });
}