'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { TopProgress } from '@/components/ui/top-progress';
import { PageSkeleton } from '@/components/ui/page-skeleton';
import { useAdminBlogPosts, useAdminBlogCategories, useDeleteBlogPost } from '@/hooks/useBlog';
import { formatDate } from '@/lib/utils/date';
import type { BlogStatus } from '@/lib/dto';

const STATUS_TABS: { label: string; value: BlogStatus | undefined }[] = [
  { label: 'All', value: undefined },
  { label: 'Draft', value: 'draft' },
  { label: 'Published', value: 'published' },
  { label: 'Archived', value: 'archived' },
];

function statusPill(status: BlogStatus) {
  if (status === 'published') return 'pill ok';
  if (status === 'archived') return 'pill warn';
  return 'pill';
}

function statusLabel(status: BlogStatus) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function Pager({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <div className="row">
      <button type="button" className="btn sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
        Previous
      </button>
      <span className="muted sm">
        Page {page} of {totalPages}
      </span>
      <button
        type="button"
        className="btn sm"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Next
      </button>
    </div>
  );
}

export default function AdminBlogPage() {
  const [status, setStatus] = useState<BlogStatus | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, isError } = useAdminBlogPosts({ status, page, limit: 15 });
  const categories = useAdminBlogCategories();
  const { mutate: deletePost, isPending: deleting } = useDeleteBlogPost();

  const posts = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;
  const total = data?.total ?? 0;
  const failed = isError && !data;

  useEffect(() => {
    if (!deleteId) return;
    dialogRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !deleting) setDeleteId(null);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [deleteId, deleting]);

  if (isLoading && !data) {
    return (
      <>
        <TopProgress active />
        <PageSkeleton kind="list" />
      </>
    );
  }

  return (
    <>
      <TopProgress active={isLoading || deleting} />
      <div className="pagehead">
        <div className="ttl">
          <h1>Blog</h1>
          <p className="muted">Write and publish notes for the public site. {total} posts.</p>
        </div>
        <div className="row">
          <Link href="/admin/blog/create" className="btn primary">
            New post
          </Link>
        </div>
      </div>

      <div className="tabs" role="tablist" aria-label="Post status">
        {STATUS_TABS.map(({ label, value }) => (
          <button
            key={label}
            type="button"
            className="tab"
            role="tab"
            aria-selected={status === value}
            onClick={() => {
              setStatus(value);
              setPage(1);
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {failed ? (
        <div className="banner" role="alert">
          Failed to load blog posts.
        </div>
      ) : posts.length === 0 ? (
        <div className="card">
          <div className="empty">
            <h2>No posts yet</h2>
            <p className="muted">Create your first blog post.</p>
            <Link href="/admin/blog/create" className="btn primary">
              New post
            </Link>
          </div>
        </div>
      ) : (
        <div className="stack">
          <div className="card flush">
            <div className="tw">
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>
                      <span className="sr">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {posts.map((post) => {
                    const category = categories.data?.find((item) => item.id === post.category_id)?.name;
                    return (
                      <tr key={post.id}>
                        <td>
                          <div className="two">
                            <b>{post.title}</b>
                            <span>{post.slug}</span>
                          </div>
                        </td>
                        <td>{category ?? '—'}</td>
                        <td>{formatDate(post.published_at ?? post.created_at)}</td>
                        <td>
                          <span className={statusPill(post.status)}>{statusLabel(post.status)}</span>
                        </td>
                        <td>
                          <div className="row" style={{ gap: 16 }}>
                            {post.status === 'published' ? (
                              <a className="lnk" href={'/blog/' + post.slug} target="_blank" rel="noreferrer">
                                View
                              </a>
                            ) : null}
                            <Link className="lnk" href={'/admin/blog/' + post.id}>
                              Edit
                            </Link>
                            <button type="button" className="btn sm danger" onClick={() => setDeleteId(post.id)}>
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          <Pager page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}

      {deleteId ? (
        <div
          className="scrim"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !deleting) setDeleteId(null);
          }}
        >
          <div
            ref={dialogRef}
            className="dlg"
            role="dialog"
            aria-modal="true"
            aria-labelledby="blog-delete-title"
            tabIndex={-1}
          >
            <h2 id="blog-delete-title">Delete post</h2>
            <p className="muted">This will permanently delete the blog post. This cannot be undone.</p>
            <div className="row end">
              <button type="button" className="btn" disabled={deleting} onClick={() => setDeleteId(null)}>
                Cancel
              </button>
              <button
                type="button"
                className={deleting ? 'btn danger nt-loading' : 'btn danger'}
                data-variant="danger"
                disabled={deleting}
                onClick={() => {
                  deletePost(deleteId, { onSuccess: () => setDeleteId(null) });
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
