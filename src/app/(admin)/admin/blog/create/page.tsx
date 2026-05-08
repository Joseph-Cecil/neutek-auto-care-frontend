'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SectionLoader } from '@/components/shared/LoadingSpinner';
import { BlogPostForm }  from '@/components/admin/blog/BlogPostForm';
import { useCreateBlogPost, useAdminBlogCategories } from '@/hooks/useBlog';
import type { BlogPostFormData } from '@/lib/validations/blog.schema';

export default function AdminBlogCreatePage() {
  const router = useRouter();
  const { data: categories, isLoading: catsLoading } = useAdminBlogCategories();
  const { mutate: createPost, isPending } = useCreateBlogPost();

  const onSubmit = (data: BlogPostFormData) => {
    createPost(
      {
        categoryId:    data.categoryId,
        title:         data.title,
        content:       data.content,
        slug:          data.slug || undefined,
        excerpt:       data.excerpt || undefined,
        status:        data.status,
        coverImageUrl: data.coverImageUrl || undefined,
      },
      { onSuccess: () => router.push('/admin/blog') },
    );
  };

  return (
    <div className="space-y-6">
      <Link href="/admin/blog">
        <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to Blog
        </Button>
      </Link>

      <div>
        <h1 className="text-2xl font-bold">Create Post</h1>
        <p className="mt-1 text-muted-foreground">Write a new blog article</p>
      </div>

      {catsLoading ? (
        <SectionLoader />
      ) : (
        <BlogPostForm
          categories={categories ?? []}
          onSubmit={onSubmit}
          isPending={isPending}
          submitLabel="Publish Post"
        />
      )}
    </div>
  );
}