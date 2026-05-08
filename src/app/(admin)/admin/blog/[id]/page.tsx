'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SectionLoader } from '@/components/shared/LoadingSpinner';
import { BlogPostForm }  from '@/components/admin/blog/BlogPostForm';
import {
  useAdminBlogCategories, useUpdateBlogPost,
} from '@/hooks/useBlog';
import { useQuery } from '@tanstack/react-query';
import { blogDal }  from '@/lib/dal/blog.dal';
import { queryKeys } from '@/lib/api/queryKeys';
import type { BlogPostFormData } from '@/lib/validations/blog.schema';

export default function AdminBlogEditPage() {
  const { id }   = useParams<{ id: string }>();
  const router   = useRouter();

  const { data: post, isLoading: postLoading, error } = useQuery({
    queryKey: queryKeys.blog.detail(id),
    queryFn:  async () => {
      const res = await blogDal.getBySlug(id);
      return res.data.data;
    },
    enabled: !!id,
    retry:   false,
  });

  const { data: categories, isLoading: catsLoading } = useAdminBlogCategories();
  const { mutate: updatePost, isPending } = useUpdateBlogPost();

  const onSubmit = (data: BlogPostFormData) => {
    updatePost(
      {
        id,
        body: {
          categoryId:    data.categoryId,
          title:         data.title,
          content:       data.content,
          slug:          data.slug || undefined,
          excerpt:       data.excerpt || undefined,
          status:        data.status,
          coverImageUrl: data.coverImageUrl || undefined,
        },
      },
      { onSuccess: () => router.push('/admin/blog') },
    );
  };

  if (postLoading || catsLoading) return <SectionLoader />;

  if (error || !post) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <AlertCircle className="h-10 w-10 text-destructive" />
        <h2 className="text-lg font-semibold">Post not found</h2>
        <Link href="/admin/blog">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Blog
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link href="/admin/blog">
        <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to Blog
        </Button>
      </Link>

      <div>
        <h1 className="text-2xl font-bold">Edit Post</h1>
        <p className="mt-1 font-mono text-sm text-muted-foreground">{post.slug}</p>
      </div>

      <BlogPostForm
        categories={categories ?? []}
        defaultValues={{
          categoryId:    post.category_id,
          title:         post.title,
          content:       post.content,
          slug:          post.slug,
          excerpt:       post.excerpt ?? '',
          status:        post.status,
          coverImageUrl: post.cover_image_url ?? '',
        }}
        onSubmit={onSubmit}
        isPending={isPending}
        submitLabel="Update Post"
      />
    </div>
  );
}