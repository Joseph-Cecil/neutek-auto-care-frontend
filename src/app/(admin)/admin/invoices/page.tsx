'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Receipt, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { PageHeader }    from '@/components/admin/shared/PageHeader';
import { StatusBadge }   from '@/components/shared/StatusBadge';
import { SectionLoader } from '@/components/shared/LoadingSpinner';
import { EmptyState }    from '@/components/shared/EmptyState';
import { ErrorAlert }    from '@/components/shared/ErrorAlert';
import { Pagination }    from '@/components/shared/Pagination';
import { useInvoices }   from '@/hooks/useInvoices';
import { pesewasToGHS }  from '@/lib/utils/format';
import { formatDate }    from '@/lib/utils/date';
import { cn }            from '@/lib/utils/cn';
import type { InvoiceStatus } from '@/lib/dto';

const STATUS_TABS: { label: string; value: InvoiceStatus | undefined }[] = [
  { label: 'All',           value: undefined },
  { label: 'Draft',         value: 'draft' },
  { label: 'Sent',          value: 'sent' },
  { label: 'Paid',          value: 'paid' },
  { label: 'Partial',       value: 'partially_paid' },
  { label: 'Overdue',       value: 'overdue' },
  { label: 'Cancelled',     value: 'cancelled' },
];

const STATUS_VARIANT: Record<InvoiceStatus, 'default' | 'success' | 'warning' | 'danger' | 'info' | 'muted'> = {
  draft:         'muted',
  sent:          'info',
  paid:          'success',
  partially_paid:'warning',
  overdue:       'danger',
  cancelled:     'muted',
};

export default function AdminInvoicesPage() {
  const [status, setStatus] = useState<InvoiceStatus | undefined>(undefined);
  const [page,   setPage]   = useState(1);

  const { data, isLoading, error } = useInvoices({ status, page, limit: 20 });

  const invoices   = data?.data       ?? [];
  const totalPages = data?.totalPages ?? 1;
  const total      = data?.total      ?? 0;

  return (
    <div className="space-y-6">
      <PageHeader title="Invoices" description={total + " total invoices"} />

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
      ) : error ? (
        <ErrorAlert message="Failed to load invoices. Please refresh the page." />
      ) : invoices.length === 0 ? (
        <EmptyState icon={<Receipt className="h-6 w-6" />} title="No invoices found" />
      ) : (
        <div className="space-y-2">
          {invoices.map((invoice) => (
            <Link key={invoice.id} href={"/admin/invoices/" + invoice.id}>
              <Card className="cursor-pointer transition-all hover:border-primary/40">
                <CardContent className="flex items-center justify-between gap-4 p-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-sm font-medium">{invoice.invoice_number}</span>
                      <StatusBadge
                        label={invoice.status.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                        variant={STATUS_VARIANT[invoice.status]}
                      />
                    </div>
                    <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <span>Total: {pesewasToGHS(invoice.total_pesewas)}</span>
                      <span>Paid: {pesewasToGHS(invoice.amount_paid_pesewas)}</span>
                      <span>Due: {formatDate(invoice.due_date)}</span>
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