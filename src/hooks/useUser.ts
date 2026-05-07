'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { userDal } from '@/lib/dal/user.dal';
import { useAuthStore } from '@/stores/auth.store';
import { queryKeys } from '@/lib/api/queryKeys';
import { getErrorMessage } from '@/lib/utils/errors';
import { compressAndUpload } from '@/lib/utils/upload';
import type { UpdateProfileRequest } from '@/lib/dto';

export function useProfile() {
  return useQuery({
    queryKey: queryKeys.auth.me,
    queryFn:  async () => {
      const res = await userDal.me();
      return res.data.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateProfile() {
  const qc          = useQueryClient();
  const { setUser } = useAuthStore();

  return useMutation({
    mutationFn: (data: UpdateProfileRequest) => userDal.updateMe(data),
    onSuccess: (res) => {
      const profile = res.data.data;
      qc.setQueryData(queryKeys.auth.me, profile);
      setUser({
        id:         profile.id,
        email:      profile.email,
        firstName:  profile.first_name,
        lastName:   profile.last_name,
        role:       profile.role,
        avatar_url: profile.avatar_url,
      });
      toast.success('Profile updated successfully.');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useUpdateAvatar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const publicUrl = await compressAndUpload(file, 'avatars');
      await userDal.updateAvatar({ avatarUrl: publicUrl });
      return publicUrl;
    },
    onSuccess: (publicUrl) => {
      qc.setQueryData(queryKeys.auth.me, (old: Record<string, unknown> | undefined) =>
        old ? { ...old, avatar_url: publicUrl } : old,
      );
      toast.success('Avatar updated.');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}