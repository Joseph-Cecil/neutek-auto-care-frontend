'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Receipt, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge }   from '@/components/shared/StatusBadge';
import { SectionLoader } from '@/components/shared/LoadingSpinner';
import { EmptyState }    from '@/components/shared/EmptyState';
import { Pagination }    from '@/components/shared/Pagination';
import { useInvoices }   from '@/hooks/useInvoices';
import { useAuthStore }  from '@/stores/auth.store';
import { pesewasToGHS }  from '@/lib/utils/format';
import { formatDate }    from '@/lib/utils/date';
import type { InvoiceStatus } from '@/lib/dto';

const STATUS_MAP: Record<InvoiceStatus, 'default' | 'success' | 'warning' | 'danger' | 'info' | 'muted'> = {
  draft:         'muted',
  sent:          'info',
  paid:          'success',
  partially_paid:'warning',
  overdue:       'danger',
  cancelled:     'muted',
};

export default function PortalInvoicesPage() {
  const user = useAuthStore((s) => s.user);
  const [page, setPage] = useState(1);

  const { data, isLoading } = useInvoices({
    customerId: user?.id,
    page,
    limit: 10,
  });

  const invoices   = data?.data       ?? [];
  const totalPages = data?.totalPages ?? 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold lg:text-3xl">My Invoices</h1>
        <p className="mt-1 text-muted-foreground">View and pay your repair invoices</p>
      </div>

      {isLoading ? (
        <SectionLoader />
      ) : invoices.length === 0 ? (
        <EmptyState
          icon={<Receipt className="h-6 w-6" />}
          title="No invoices yet"
          description="Invoices will appear here once your repair is complete."
        />
      ) : (
        <div className="space-y-3">
          {invoices.map((invoice) => {
            const remaining = invoice.total_pesewas - invoice.amount_paid_pesewas;
            const isPending = invoice.status === 'sent' || invoice.status === 'partially_paid' || invoice.status === 'overdue';
            return (
              <Link key={invoice.id} href={"/portal/invoices/" + invoice.id}>
                <Card className="cursor-pointer transition-all hover:border-primary/40">
                  <CardContent className="flex items-center justify-between gap-4 p-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-sm font-medium">
                          {invoice.invoice_number}
                        </span>
                        <StatusBadge
                          label={invoice.status.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                          variant={STATUS_MAP[invoice.status]}
                        />
                        {isPending && (
                          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                            Pay Now
                          </span>
                        )}
                      </div>
                      <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground">
                        <span>Total: {pesewasToGHS(invoice.total_pesewas)}</span>
                        {invoice.amount_paid_pesewas > 0 && invoice.amount_paid_pesewas < invoice.total_pesewas && (
                          <span>Remaining: {pesewasToGHS(remaining)}</span>
                        )}
                        <span>Due: {formatDate(invoice.due_date)}</span>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}