'use client';

import { useState } from 'react';
import Link from 'next/link';
import { TopProgress } from '@/components/ui/top-progress';
import { useBlogCategories, useBlogPosts } from '@/hooks/useTracking';
import { formatDate } from '@/lib/utils/date';

export default function BlogPage() {
  const [search, setSearch] = useState('');
  const [draft, setDraft] = useState('');
  const [category, setCategory] = useState<string | undefined>();
  const posts = useBlogPosts({ categoryId: category, search, page: 1 });
  const categories = useBlogCategories();
  const rows = posts.data?.data ?? [];
  const failed = posts.isError && !posts.data;

  return (
    <div className="pubwrap" id="page-blog">
      <TopProgress active={posts.isLoading} />
      <section className="sec">
        <h1 style={{ fontSize: 36 }}>From the workshop</h1>
        <p className="muted" style={{ margin: '8px 0 24px' }}>Short, practical notes for driving in Accra.</p>
        <form
          className="row"
          style={{ marginBottom: 24 }}
          onSubmit={(event) => {
            event.preventDefault();
            setSearch(draft.trim());
          }}
        >
          <label className="sr" htmlFor="blog-q" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden' }}>Search articles</label>
          <input id="blog-q" className="input" style={{ maxWidth: 320 }} value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Search articles" />
          <button type="submit" className="btn">Search</button>
        </form>
        {categories.data && categories.data.length > 0 ? (
          <div className="row" style={{ marginBottom: 24 }}>
            <button type="button" className={!category ? 'pill brand' : 'pill'} onClick={() => setCategory(undefined)}>All</button>
            {categories.data.map((item) => (
              <button key={item.id} type="button" className={category === item.id ? 'pill brand' : 'pill'} onClick={() => setCategory(item.id)}>
                {item.name}
              </button>
            ))}
          </div>
        ) : null}
        {failed ? (
          <div className="banner" role="alert">Could not load articles.</div>
        ) : posts.isLoading ? (
          <p className="muted">Loading articles.</p>
        ) : rows.length === 0 ? (
          <div className="card"><div className="empty"><h2>No articles yet</h2><p className="muted">Nothing is published.</p></div></div>
        ) : (
          <div className="grid g3">
            {rows.map((post) => {
              const cat = categories.data?.find((item) => item.id === post.category_id)?.name;
              return (
                <article key={post.id} className="card stack s">
                  {cat ? <span className="pill" style={{ alignSelf: 'flex-start' }}>{cat}</span> : null}
                  <h2 style={{ fontSize: 20 }}>{post.title}</h2>
                  <p className="faint sm">{formatDate(post.published_at ?? post.created_at)}</p>
                  {post.excerpt ? <p className="muted">{post.excerpt}</p> : null}
                  <div><Link href={`/blog/${post.slug}`} className="btn sm">Read article</Link></div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
