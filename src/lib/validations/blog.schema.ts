import { z } from 'zod';

export const blogPostSchema = z.object({
  categoryId:    z.string().uuid('Please select a category'),
  title:         z.string().min(1, 'Title is required').max(500),
  content:       z.string().min(1, 'Content is required'),
  slug:          z.string().max(500).optional(),
  excerpt:       z.string().max(500).optional(),
  status:        z.enum(['draft', 'published', 'archived']).default('draft'),
  coverImageUrl: z.string().url().optional().or(z.literal('')),
});

export type BlogPostFormData = z.infer<typeof blogPostSchema>;