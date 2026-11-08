'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { userDal }   from '@/lib/dal/user.dal';
import { queryKeys } from '@/lib/api/queryKeys';
import { getErrorMessage } from '@/lib/utils/errors';
import { notify } from '@/lib/notify';
import type { InviteUserRequest, ListUsersParams } from '@/lib/dto';

export function useAdminUsers(params?: ListUsersParams) {
  return useQuery({
    queryKey: queryKeys.users.list(params),
    queryFn:  async () => {
      const res = await userDal.list(params);
      return res.data;
    },
  });
}

export function useAdminDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => userDal.deleteById(id),
    onSuccess: () => {
      toast.success('User deleted');
      qc.invalidateQueries({ queryKey: queryKeys.users.all });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useInviteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: InviteUserRequest) => userDal.invite(body),
    onSuccess: () => {
      notify('success', 'Account created. No email was sent.');
      void qc.invalidateQueries({ queryKey: queryKeys.users.all });
    },
    onError: (error) => notify('error', error),
  });
}