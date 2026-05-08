'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FileText, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { PageHeader }    from '@/components/admin/shared/PageHeader';
import { StatusBadge }   from '@/components/shared/StatusBadge';
import { SectionLoader } from '@/components/shared/LoadingSpinner';
import { EmptyState }    from '@/components/shared/EmptyState';
import { Pagination }    from '@/components/shared/Pagination';
import { useQuotes }     from '@/hooks/useQuotes';
import { pesewasToGHS }  from '@/lib/utils/format';
import { formatDate }    from '@/lib/utils/date';
import { cn }            from '@/lib/utils/cn';
import type { QuoteStatus } from '@/lib/dto';

const STATUS_TABS: { label: string; value: QuoteStatus | undefined }[] = [
  { label: 'All',      value: undefined },
  { label: 'Draft',    value: 'draft' },
  { label: 'Sent',     value: 'sent' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'Expired',  value: 'expired' },
];

const STATUS_VARIANT: Record<QuoteStatus, 'default' | 'success' | 'warning' | 'danger' | 'info' | 'muted'> = {
  draft:    'muted',
  sent:     'info',
  approved: 'success',
  rejected: 'danger',
  expired:  'muted',
};

export default function AdminQuotesPage() {
  const [status, setStatus] = useState<QuoteStatus | undefined>(undefined);
  const [page,   setPage]   = useState(1);

  const { data, isLoading } = useQuotes({ status, page, limit: 20 });

  const quotes     = data?.data       ?? [];
  const totalPages = data?.totalPages ?? 1;
  const total      = data?.total      ?? 0;

  return (
    <div className="space-y-6">
      <PageHeader title="Quotes" description={total + " total quotes"} />

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
      ) : quotes.length === 0 ? (
        <EmptyState
          icon={<FileText className="h-6 w-6" />}
          title="No quotes found"
        />
      ) : (
        <div className="space-y-2">
          {quotes.map((quote) => (
            <Link key={quote.id} href={"/admin/quotes/" + quote.id}>
              <Card className="cursor-pointer transition-all hover:border-primary/40">
                <CardContent className="flex items-center justify-between gap-4 p-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-sm font-medium">{quote.quote_number}</span>
                      <StatusBadge
                        label={quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                        variant={STATUS_VARIANT[quote.status]}
                      />
                    </div>
                    <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <span>Total: {pesewasToGHS(quote.total_pesewas)}</span>
                      <span>Valid until: {formatDate(quote.valid_until)}</span>
                      <span>Created: {formatDate(quote.created_at)}</span>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}