'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, Calendar, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SectionLoader } from '@/components/shared/LoadingSpinner';
import { Pagination } from '@/components/shared/Pagination';
import { useBlogPosts, useBlogCategories } from '@/hooks/useTracking';
import { formatDate } from '@/lib/utils/date';
import { cn } from '@/lib/utils/cn';

export default function BlogPage() {
  const [search,     setSearch]     = useState('');
  const [category,   setCategory]   = useState<string | undefined>(undefined);
  const [page,       setPage]       = useState(1);
  const [inputValue, setInputValue] = useState('');

  const { data: categories } = useBlogCategories();
  const { data, isLoading }  = useBlogPosts({ categoryId: category, search, page });

  const posts      = data?.data       ?? [];
  const totalPages = data?.totalPages ?? 1;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(inputValue);
    setPage(1);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
      {/* Header */}
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold text-white lg:text-5xl">Knowledge Centre</h1>
        <p className="mt-4 text-white/50 max-w-xl mx-auto">
          Tips, guides, and insights on vehicle maintenance, diagnostics, and ECU repair.
        </p>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="mb-6 flex gap-2 max-w-md mx-auto">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
          <Input value={inputValue} onChange={(e) => setInputValue(e.target.value)}
            placeholder="Search articles..."
            className="pl-9 border-white/20 bg-white/10 text-white placeholder:text-white/30 focus:border-primary" />
        </div>
        <Button type="submit" variant="outline" className="border-white/20 text-white hover:bg-white/10">
          Search
        </Button>
      </form>

      {/* Category filters */}
      {categories && categories.length > 0 && (
        <div className="mb-8 flex flex-wrap gap-2 justify-center">
          <button onClick={() => { setCategory(undefined); setPage(1); }}
            className={cn('rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
              !category
                ? 'border-primary bg-primary text-white'
                : 'border-white/20 text-white/60 hover:border-primary/50 hover:text-white',
            )}>
            All Topics
          </button>
          {categories.map((cat) => (
            <button key={cat.id} onClick={() => { setCategory(cat.id); setPage(1); }}
              className={cn('rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
                category === cat.id
                  ? 'border-primary bg-primary text-white'
                  : 'border-white/20 text-white/60 hover:border-primary/50 hover:text-white',
              )}>
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {/* Posts */}
      {isLoading ? <SectionLoader /> : posts.length === 0 ? (
        <div className="py-16 text-center text-white/40">No articles found</div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link key={post.id} href={"/blog/" + post.slug}>
              <article className="group h-full rounded-2xl border border-white/10 bg-white/5 overflow-hidden transition-all hover:border-primary/30">
                {post.cover_image_url ? (
                  <div className="aspect-video overflow-hidden">
                    <img src={post.cover_image_url} alt={post.title}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                  </div>
                ) : (
                  <div className="aspect-video bg-gradient-to-br from-primary/20 to-blue-600/10 flex items-center justify-center">
                    <span className="text-4xl">🔧</span>
                  </div>
                )}
                <div className="p-5">
                  <div className="flex items-center gap-2 text-xs text-white/40">
                    <Calendar className="h-3 w-3" />
                    {formatDate(post.published_at ?? post.created_at)}
                  </div>
                  <h2 className="mt-2 text-base font-semibold text-white group-hover:text-primary transition-colors line-clamp-2">
                    {post.title}
                  </h2>
                  {post.excerpt && (
                    <p className="mt-2 text-sm text-white/50 line-clamp-2">{post.excerpt}</p>
                  )}
                  <div className="mt-4 flex items-center gap-1 text-xs font-medium text-primary">
                    Read more <ChevronRight className="h-3 w-3" />
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} className="mt-10" />
    </div>
  );
}