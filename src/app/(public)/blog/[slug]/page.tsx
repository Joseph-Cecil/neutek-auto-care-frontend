'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SectionLoader } from '@/components/shared/LoadingSpinner';
import { useBlogPost } from '@/hooks/useTracking';
import { formatDate } from '@/lib/utils/date';

export default function BlogPostPage() {
  const params = useParams();
  const router = useRouter();
  const slug   = params.slug as string;

  const { data: post, isLoading, error } = useBlogPost(slug);

  if (isLoading) return <SectionLoader />;

  if (error || !post) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
        <h2 className="mt-4 text-xl font-bold text-white">Post not found</h2>
        <p className="mt-2 text-white/50">This article doesn&apos;t exist or has been removed.</p>
        <Link href="/blog" className="mt-6 block">
          <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Blog
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 lg:px-8">
      <Link href="/blog">
        <Button variant="ghost" size="sm" className="mb-8 gap-1.5 text-white/50 hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Back to Blog
        </Button>
      </Link>

      {post.cover_image_url && (
        <div className="mb-8 aspect-video overflow-hidden rounded-2xl">
          <img src={post.cover_image_url} alt={post.title} className="h-full w-full object-cover" />
        </div>
      )}

      <div className="flex items-center gap-2 text-xs text-white/40 mb-4">
        <Calendar className="h-3.5 w-3.5" />
        {formatDate(post.published_at ?? post.created_at)}
      </div>

      <h1 className="text-3xl font-bold text-white lg:text-4xl">{post.title}</h1>

      {post.excerpt && (
        <p className="mt-4 text-lg text-white/60 leading-relaxed">{post.excerpt}</p>
      )}

      <div className="mt-8 border-t border-white/10 pt-8">
        <div className="prose prose-invert max-w-none text-white/70 leading-relaxed
          [&_h2]:text-white [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-8 [&_h2]:mb-4
          [&_h3]:text-white [&_h3]:font-semibold [&_h3]:mt-6 [&_h3]:mb-3
          [&_p]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4
          [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4
          [&_li]:mb-1 [&_strong]:text-white [&_a]:text-primary [&_a]:hover:underline">
          <div dangerouslySetInnerHTML={{ __html: post.content }} />
        </div>
      </div>

      <div className="mt-12 rounded-xl border border-primary/20 bg-primary/5 p-6 text-center">
        <h3 className="text-base font-semibold text-white">Need a Diagnosis?</h3>
        <p className="mt-1 text-sm text-white/50">
          Book a service with our certified technicians today.
        </p>
        <Link href="/booking" className="mt-4 inline-block">
          <Button>Book a Service</Button>
        </Link>
      </div>
    </div>
  );
}