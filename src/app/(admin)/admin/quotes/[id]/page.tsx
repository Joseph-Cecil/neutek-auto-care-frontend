'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge }   from '@/components/shared/StatusBadge';
import { SectionLoader } from '@/components/shared/LoadingSpinner';
import { useQuote }      from '@/hooks/useQuotes';
import { pesewasToGHS }  from '@/lib/utils/format';
import { formatDate }    from '@/lib/utils/date';
import type { QuoteStatus } from '@/lib/dto';

const STATUS_VARIANT: Record<QuoteStatus, 'default' | 'success' | 'warning' | 'danger' | 'info' | 'muted'> = {
  draft: 'muted', sent: 'info', approved: 'success', rejected: 'danger', expired: 'muted',
};

export default function AdminQuoteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: quote, isLoading, error } = useQuote(id);

  if (isLoading) return <SectionLoader />;
  if (error || !quote) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <AlertCircle className="h-10 w-10 text-destructive" />
        <h2 className="text-lg font-semibold">Quote not found</h2>
        <Link href="/admin/quotes">
          <Button variant="outline" className="gap-2"><ArrowLeft className="h-4 w-4" /> Back</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link href="/admin/quotes">
        <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to Quotes
        </Button>
      </Link>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-xs text-muted-foreground">{quote.quote_number}</p>
          <h1 className="mt-1 text-xl font-bold">Quote Detail</h1>
        </div>
        <StatusBadge
          label={quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
          variant={STATUS_VARIANT[quote.status]}
        />
      </div>
      <Card>
        <CardHeader><CardTitle className="text-base">Summary</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{pesewasToGHS(quote.subtotal_pesewas)}</span></div>
          {quote.tax_pesewas > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Tax</span><span>{pesewasToGHS(quote.tax_pesewas)}</span></div>}
          {quote.discount_pesewas > 0 && <div className="flex justify-between text-green-500"><span>Discount</span><span>- {pesewasToGHS(quote.discount_pesewas)}</span></div>}
          <div className="flex justify-between border-t border-border pt-2 font-bold"><span>Total</span><span className="text-primary">{pesewasToGHS(quote.total_pesewas)}</span></div>
          <div className="flex justify-between border-t border-border pt-2 text-xs text-muted-foreground"><span>Valid until</span><span>{formatDate(quote.valid_until)}</span></div>
          <div className="flex justify-between text-xs text-muted-foreground"><span>Created</span><span>{formatDate(quote.created_at)}</span></div>
        </CardContent>
      </Card>
      {quote.notes && (
        <Card>
          <CardContent className="p-4">
            <p className="mb-1 text-sm font-medium">Notes</p>
            <p className="text-sm text-muted-foreground">{quote.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}