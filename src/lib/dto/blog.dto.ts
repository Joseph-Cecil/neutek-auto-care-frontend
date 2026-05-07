// ─────────────────────────────────────────────────────────────
// Neutek Auto Care — Blog DTOs
// ─────────────────────────────────────────────────────────────
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
  content: string;          // Markdown or HTML
  status: BlogStatus;
  cover_image_url: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface CreateBlogPostRequest {
  categoryId: string;
  title: string;            // max 500 chars
  content: string;
  slug?: string;            // auto-generated if omitted
  excerpt?: string;         // max 500 chars
  status?: BlogStatus;      // default 'draft'
  coverImageUrl?: string;
}

export type UpdateBlogPostRequest = Partial<CreateBlogPostRequest>;

export interface ListBlogPostsParams {
  page?: number;
  limit?: number;
  status?: BlogStatus;      // public always uses 'published'
  categoryId?: string;
  search?: string;
}