'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FileText, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { SectionLoader } from '@/components/shared/LoadingSpinner';
import { EmptyState }    from '@/components/shared/EmptyState';
import { ErrorAlert }    from '@/components/shared/ErrorAlert';
import { Pagination }    from '@/components/shared/Pagination';
import { useQuotes }     from '@/hooks/useQuotes';
import { useAuthStore }  from '@/stores/auth.store';
import { pesewasToGHS }  from '@/lib/utils/format';
import { formatDate }    from '@/lib/utils/date';
import { cn }            from '@/lib/utils/cn';
import type { QuoteStatus } from '@/lib/dto';

const STATUS_MAP: Record<QuoteStatus, 'default' | 'success' | 'warning' | 'danger' | 'info' | 'muted'> = {
  draft:    'muted',
  sent:     'info',
  approved: 'success',
  rejected: 'danger',
  expired:  'muted',
};

export default function PortalQuotesPage() {
  const user = useAuthStore((s) => s.user);
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useQuotes({
    customerId: user?.id,
    page,
    limit: 10,
  });

  const quotes     = data?.data       ?? [];
  const totalPages = data?.totalPages ?? 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold lg:text-3xl">My Quotes</h1>
        <p className="mt-1 text-muted-foreground">
          Review and approve repair quotes from our technicians
        </p>
      </div>

      {isLoading ? (
        <SectionLoader />
      ) : error ? (
        <ErrorAlert message="Failed to load your quotes. Please refresh the page." />
      ) : quotes.length === 0 ? (
        <EmptyState
          icon={<FileText className="h-6 w-6" />}
          title="No quotes yet"
          description="Quotes will appear here after your vehicle has been diagnosed."
        />
      ) : (
        <div className="space-y-3">
          {quotes.map((quote) => (
            <Link key={quote.id} href={"/portal/quotes/" + quote.id}>
              <Card className="cursor-pointer transition-all hover:border-primary/40">
                <CardContent className="flex items-center justify-between gap-4 p-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-sm font-medium">
                        {quote.quote_number}
                      </span>
                      <StatusBadge
                        label={quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                        variant={STATUS_MAP[quote.status]}
                      />
                      {quote.status === 'sent' && (
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                          Action Required
                        </span>
                      )}
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