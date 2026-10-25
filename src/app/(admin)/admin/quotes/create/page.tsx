'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PageSkeleton } from '@/components/ui/page-skeleton';
import { RaiseDocumentForm } from '@/components/admin/finance/RaiseDocumentForm';
import { useCreateQuote } from '@/hooks/useQuotes';
import type { CreateQuoteRequest } from '@/lib/dto';

function NewQuote() {
  const router = useRouter();
  const presetJobId = useSearchParams().get('job') ?? undefined;
  const create = useCreateQuote();

  return (
    <RaiseDocumentForm
      kind="quote"
      presetJobId={presetJobId}
      pending={create.isPending}
      failed={create.isError}
      onSubmit={(body) => {
        create.mutate(body as CreateQuoteRequest, {
          onSuccess: (res) => router.push(`/admin/quotes/${res.data.data.id}`),
        });
      }}
    />
  );
}

export default function NewQuotePage() {
  return (
    <Suspense fallback={<PageSkeleton kind="form" />}>
      <NewQuote />
    </Suspense>
  );
}
