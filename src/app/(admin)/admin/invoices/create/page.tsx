'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PageSkeleton } from '@/components/ui/page-skeleton';
import { RaiseDocumentForm } from '@/components/admin/finance/RaiseDocumentForm';
import { useCreateInvoice } from '@/hooks/useInvoices';
import type { CreateInvoiceRequest } from '@/lib/dto';

function NewInvoice() {
  const router = useRouter();
  const presetJobId = useSearchParams().get('job') ?? undefined;
  const create = useCreateInvoice();

  return (
    <RaiseDocumentForm
      kind="invoice"
      presetJobId={presetJobId}
      pending={create.isPending}
      failed={create.isError}
      onSubmit={(body) => {
        create.mutate(body as CreateInvoiceRequest, {
          onSuccess: (res) => router.push(`/admin/invoices/${res.data.data.id}`),
        });
      }}
    />
  );
}

export default function NewInvoicePage() {
  return (
    <Suspense fallback={<PageSkeleton kind="form" />}>
      <NewInvoice />
    </Suspense>
  );
}
