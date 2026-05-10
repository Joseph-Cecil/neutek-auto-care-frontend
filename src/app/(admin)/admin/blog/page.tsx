'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BookOpen, Plus, Pencil, Trash2, Eye } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageHeader }    from '@/components/admin/shared/PageHeader';
import { StatusBadge }   from '@/components/shared/StatusBadge';
import { SectionLoader } from '@/components/shared/LoadingSpinner';
import { EmptyState }    from '@/components/shared/EmptyState';
import { Pagination }    from '@/components/shared/Pagination';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { ErrorAlert }    from '@/components/shared/ErrorAlert';
import { useAdminBlogPosts, useDeleteBlogPost } from '@/hooks/useBlog';
import { formatDate }  from '@/lib/utils/date';
import { cn }          from '@/lib/utils/cn';
import type { BlogStatus } from '@/lib/dto';

const STATUS_TABS: { label: string; value: BlogStatus | undefined }[] = [
  { label: 'All',       value: undefined },
  { label: 'Draft',     value: 'draft' },
  { label: 'Published', value: 'published' },
  { label: 'Archived',  value: 'archived' },
];

const STATUS_VARIANT: Record<BlogStatus, 'default' | 'success' | 'warning' | 'danger' | 'info' | 'muted'> = {
  draft:     'muted',
  published: 'success',
  archived:  'warning',
};

export default function AdminBlogPage() {
  const [status,   setStatus]   = useState<BlogStatus | undefined>(undefined);
  const [page,     setPage]     = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading, error } = useAdminBlogPosts({ status, page, limit: 15 });
  const { mutate: deletePost, isPending: deleting } = useDeleteBlogPost();

  const posts      = data?.data       ?? [];
  const totalPages = data?.totalPages ?? 1;
  const total      = data?.total      ?? 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Blog"
        description={total + " posts"}
        action={
          <Link href="/admin/blog/create">
            <Button className="gap-1.5">
              <Plus className="h-4 w-4" /> New Post
            </Button>
          </Link>
        }
      />

      <div className="flex flex-wrap gap-2">
        {STATUS_TABS.map(({ label, value }) => (
          <button key={label}
            onClick={() => { setStatus(value); setPage(1); }}
            className={cn(
              'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
              status === value
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border text-muted-foreground hover:border-primary/50 hover:text-foreground',
            )}>
            {label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <SectionLoader />
      ) : error ? (
        <ErrorAlert message="Failed to load blog posts. Please refresh the page." />
      ) : posts.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="h-6 w-6" />}
          title="No posts yet"
          description="Create your first blog post."
          action={{ label: 'Create Post', onClick: () => window.location.href = '/admin/blog/create' }}
        />
      ) : (
        <div className="space-y-2">
          {posts.map((post) => (
            <Card key={post.id}>
              <CardContent className="flex items-start justify-between gap-4 p-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium line-clamp-1">{post.title}</p>
                    <StatusBadge
                      label={post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                      variant={STATUS_VARIANT[post.status]}
                    />
                  </div>
                  {post.excerpt && (
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-1">
                      {post.excerpt}
                    </p>
                  )}
                  <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span className="font-mono">{post.slug}</span>
                    {post.published_at
                      ? <span>Published {formatDate(post.published_at)}</span>
                      : <span>Created {formatDate(post.created_at)}</span>}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  {post.status === 'published' && (
                    <Link href={"/blog/" + post.slug} target="_blank">
                      <Button size="sm" variant="ghost">
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  )}
                  <Link href={"/admin/blog/" + post.id}>
                    <Button size="sm" variant="ghost">
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                  <Button size="sm" variant="ghost"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => setDeleteId(post.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Delete Post"
        description="This will permanently delete the blog post. This cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={() => {
          if (deleteId) deletePost(deleteId, { onSuccess: () => setDeleteId(null) });
        }}
        isPending={deleting}
      />
    </div>
  );
}