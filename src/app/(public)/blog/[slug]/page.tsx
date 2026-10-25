'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { TopProgress } from '@/components/ui/top-progress';
import { useBlogPost } from '@/hooks/useTracking';
import { formatDate } from '@/lib/utils/date';

export default function BlogPostPage() {
  const slug = useParams<{ slug: string }>().slug;
  const { data: post, isLoading, isError } = useBlogPost(slug);

  if (isLoading) {
    return (
      <div className="pubwrap">
        <TopProgress active />
        <section className="sec"><p className="muted">Loading the article.</p></section>
      </div>
    );
  }

  if (isError || !post) {
    return (
      <div className="pubwrap">
        <section className="sec" style={{ maxWidth: 680, margin: '0 auto' }}>
          <div className="card">
            <div className="empty">
              <h1 style={{ fontSize: 20 }}>Article not found</h1>
              <p className="muted">That address does not match a published post.</p>
              <Link href="/blog" className="btn" style={{ marginTop: 8 }}>Back to blog</Link>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="pubwrap">
      <section className="sec" style={{ maxWidth: 680, margin: '0 auto' }}>
        <Link href="/blog" className="btn ghost">Back to blog</Link>
        <article className="stack s" style={{ marginTop: 16 }}>
          <h1 style={{ fontSize: 34, lineHeight: 1.15 }}>{post.title}</h1>
          <p className="faint sm">{formatDate(post.published_at ?? post.created_at)}</p>
          <div
            style={{ fontSize: 17, lineHeight: 1.7, display: 'flex', flexDirection: 'column', gap: 16 }}
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </article>
      </section>
    </div>
  );
}
