'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { userDal }   from '@/lib/dal/user.dal';
import { queryKeys } from '@/lib/api/queryKeys';
import { getErrorMessage } from '@/lib/utils/errors';
import type { ListUsersParams } from '@/lib/dto';

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