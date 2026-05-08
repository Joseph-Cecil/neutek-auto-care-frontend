import apiClient from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import type {
  ApiResponse, PaginatedResponse, BlogPost, BlogCategory,
  CreateBlogPostRequest, UpdateBlogPostRequest, ListBlogPostsParams,
} from '@/lib/dto';

export const blogDal = {
  listCategories: () =>
    apiClient.get<ApiResponse<BlogCategory[]>>(ENDPOINTS.BLOG.CATEGORIES),
  list:           (params?: ListBlogPostsParams) =>
    apiClient.get<PaginatedResponse<BlogPost>>(ENDPOINTS.BLOG.LIST, { params }),
  getBySlug:      (slug: string) =>
    apiClient.get<ApiResponse<BlogPost>>(ENDPOINTS.BLOG.BY_SLUG(slug)),
  create:         (body: CreateBlogPostRequest) =>
    apiClient.post<ApiResponse<BlogPost>>(ENDPOINTS.BLOG.CREATE, body),
  update:         (id: string, body: UpdateBlogPostRequest) =>
    apiClient.patch<ApiResponse<BlogPost>>(ENDPOINTS.BLOG.BY_ID(id), body),
  delete:         (id: string) =>
    apiClient.delete<void>(ENDPOINTS.BLOG.BY_ID(id)),
};