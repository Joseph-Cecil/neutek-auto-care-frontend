'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { blogDal } from '@/lib/dal/blog.dal';
import { queryKeys } from '@/lib/api/queryKeys';
import { getErrorMessage } from '@/lib/utils/errors';
import type {
  ListBlogPostsParams,
  CreateBlogPostRequest,
  UpdateBlogPostRequest,
} from '@/lib/dto';

export function useAdminBlogPosts(params?: ListBlogPostsParams) {
  return useQuery({
    queryKey: queryKeys.blog.list(params),
    queryFn:  async () => {
      const res = await blogDal.list(params);
      return res.data;
    },
  });
}

export function useAdminBlogCategories() {
  return useQuery({
    queryKey: queryKeys.blog.categories,
    queryFn:  async () => {
      const res = await blogDal.listCategories();
      return res.data.data;
    },
    staleTime: 10 * 60 * 1000,
  });
}

export function useAdminBlogPost(slug: string) {
  return useQuery({
    queryKey: queryKeys.blog.bySlug(slug),
    queryFn:  async () => {
      const res = await blogDal.getBySlug(slug);
      return res.data.data;
    },
    enabled: !!slug,
  });
}

export function useCreateBlogPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateBlogPostRequest) => blogDal.create(body),
    onSuccess: () => {
      toast.success('Post created');
      qc.invalidateQueries({ queryKey: queryKeys.blog.all });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useUpdateBlogPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateBlogPostRequest }) =>
      blogDal.update(id, body),
    onSuccess: () => {
      toast.success('Post updated');
      qc.invalidateQueries({ queryKey: queryKeys.blog.all });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useDeleteBlogPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => blogDal.delete(id),
    onSuccess: () => {
      toast.success('Post deleted');
      qc.invalidateQueries({ queryKey: queryKeys.blog.all });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}