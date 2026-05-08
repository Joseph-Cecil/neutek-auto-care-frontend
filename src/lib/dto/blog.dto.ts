import type { BlogStatus } from './enums.dto';

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface BlogPost {
  id: string;
  category_id: string;
  author_id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  status: BlogStatus;
  cover_image_url: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface CreateBlogPostRequest {
  categoryId: string;
  title: string;
  content: string;
  slug?: string;
  excerpt?: string;
  status?: BlogStatus;
  coverImageUrl?: string;
}

export type UpdateBlogPostRequest = Partial<CreateBlogPostRequest>;

export interface ListBlogPostsParams {
  page?: number;
  limit?: number;
  status?: BlogStatus;
  categoryId?: string;
  search?: string;
}