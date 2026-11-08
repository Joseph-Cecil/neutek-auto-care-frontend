'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { TopProgress } from '@/components/ui/top-progress';
import { PageSkeleton } from '@/components/ui/page-skeleton';
import { BlogPostForm } from '@/components/admin/blog/BlogPostForm';
import { useAdminBlogCategories, useUpdateBlogPost } from '@/hooks/useBlog';
import { blogDal } from '@/lib/dal/blog.dal';
import { queryKeys } from '@/lib/api/queryKeys';
import type { BlogPostFormData } from '@/lib/validations/blog.schema';

export default function AdminBlogEditPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const {
    data: post,
    isLoading: postLoading,
    isError,
  } = useQuery({
    queryKey: queryKeys.blog.detail(id),
    queryFn: async () => {
      const res = await blogDal.getById(id);
      return res.data.data;
    },
    enabled: !!id,
    retry: false,
  });

  const categories = useAdminBlogCategories();
  const { mutate: updatePost, isPending } = useUpdateBlogPost();
  const failed = isError && !post;

  const onSubmit = (data: BlogPostFormData) => {
    updatePost(
      {
        id,
        body: {
          categoryId: data.categoryId,
          title: data.title,
          content: data.content,
          slug: data.slug || undefined,
          excerpt: data.excerpt || undefined,
          status: data.status,
          coverImageUrl: data.coverImageUrl || undefined,
        },
      },
      { onSuccess: () => router.push('/admin/blog') },
    );
  };

  if ((postLoading || categories.isLoading) && !failed) {
    return (
      <>
        <TopProgress active />
        <PageSkeleton kind="form" />
      </>
    );
  }

  if (failed || !post) {
    return (
      <>
        <div className="pagehead">
          <div className="ttl">
            <div className="row">
              <Link href="/admin/blog" className="btn sm">
                Back to blog
              </Link>
            </div>
            <h1 style={{ marginTop: 8 }}>Edit post</h1>
          </div>
        </div>
        <div className="banner" role="alert">
          Could not load this post.
        </div>
      </>
    );
  }

  return (
    <>
      <TopProgress active={isPending || categories.isFetching} />
      <div className="pagehead">
        <div className="ttl">
          <div className="row">
            <Link href="/admin/blog" className="btn sm">
              Back to blog
            </Link>
          </div>
          <h1 style={{ marginTop: 8 }}>Edit post</h1>
          <p className="muted">{post.slug}</p>
        </div>
      </div>

      {categories.isError && !categories.data ? (
        <div className="banner" role="alert" style={{ marginBottom: 16 }}>
          Could not load categories.
        </div>
      ) : null}

      <BlogPostForm
        categories={categories.data ?? []}
        defaultValues={{
          categoryId: post.category_id,
          title: post.title,
          content: post.content,
          slug: post.slug,
          excerpt: post.excerpt ?? '',
          status: post.status,
          coverImageUrl: post.cover_image_url ?? '',
        }}
        onSubmit={onSubmit}
        isPending={isPending}
        submitLabel="Update Post"
      />
    </>
  );
}
