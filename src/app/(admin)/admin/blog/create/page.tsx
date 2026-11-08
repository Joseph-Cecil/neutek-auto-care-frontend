'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { TopProgress } from '@/components/ui/top-progress';
import { PageSkeleton } from '@/components/ui/page-skeleton';
import { BlogPostForm } from '@/components/admin/blog/BlogPostForm';
import { useCreateBlogPost, useAdminBlogCategories } from '@/hooks/useBlog';
import type { BlogPostFormData } from '@/lib/validations/blog.schema';

export default function AdminBlogCreatePage() {
  const router = useRouter();
  const categories = useAdminBlogCategories();
  const { mutate: createPost, isPending } = useCreateBlogPost();

  const onSubmit = (data: BlogPostFormData) => {
    createPost(
      {
        categoryId: data.categoryId,
        title: data.title,
        content: data.content,
        slug: data.slug || undefined,
        excerpt: data.excerpt || undefined,
        status: data.status,
        coverImageUrl: data.coverImageUrl || undefined,
      },
      { onSuccess: () => router.push('/admin/blog') },
    );
  };

  if (categories.isLoading && !categories.data) {
    return (
      <>
        <TopProgress active />
        <PageSkeleton kind="form" />
      </>
    );
  }

  return (
    <>
      <TopProgress active={categories.isFetching || isPending} />
      <div className="pagehead">
        <div className="ttl">
          <div className="row">
            <Link href="/admin/blog" className="btn sm">
              Back to blog
            </Link>
          </div>
          <h1 style={{ marginTop: 8 }}>New post</h1>
          <p className="muted">Drafts stay private until you publish them.</p>
        </div>
      </div>

      <div className="stack">
        {categories.isError && !categories.data ? (
          <div className="banner" role="alert">
            Could not load categories.
          </div>
        ) : null}
        <BlogPostForm
          categories={categories.data ?? []}
          onSubmit={onSubmit}
          isPending={isPending}
          submitLabel="Publish Post"
        />
      </div>
    </>
  );
}
