'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, AlertCircle, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge }   from '@/components/shared/StatusBadge';
import { SectionLoader } from '@/components/shared/LoadingSpinner';
import { useInvoice }    from '@/hooks/useInvoices';
import { pesewasToGHS }  from '@/lib/utils/format';
import { formatDate }    from '@/lib/utils/date';
import type { InvoiceStatus } from '@/lib/dto';

const STATUS_VARIANT: Record<InvoiceStatus, 'default' | 'success' | 'warning' | 'danger' | 'info' | 'muted'> = {
  draft: 'muted', sent: 'info', paid: 'success', partially_paid: 'warning', overdue: 'danger', cancelled: 'muted',
};

export default function AdminInvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: invoice, isLoading, error } = useInvoice(id);

  if (isLoading) return <SectionLoader />;
  if (error || !invoice) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <AlertCircle className="h-10 w-10 text-destructive" />
        <h2 className="text-lg font-semibold">Invoice not found</h2>
        <Link href="/admin/invoices">
          <Button variant="outline" className="gap-2"><ArrowLeft className="h-4 w-4" /> Back</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link href="/admin/invoices">
        <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to Invoices
        </Button>
      </Link>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-xs text-muted-foreground">{invoice.invoice_number}</p>
          <h1 className="mt-1 text-xl font-bold">Invoice Detail</h1>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge
            label={invoice.status.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
            variant={STATUS_VARIANT[invoice.status]}
          />
          {invoice.pdf_url && (
            <a href={invoice.pdf_url} target="_blank" rel="noopener noreferrer">
              <Button size="sm" variant="outline" className="gap-1.5">
                <Download className="h-3.5 w-3.5" /> PDF
              </Button>
            </a>
          )}
        </div>
      </div>
      <Card>
        <CardHeader><CardTitle className="text-base">Summary</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{pesewasToGHS(invoice.subtotal_pesewas)}</span></div>
          {invoice.tax_pesewas > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Tax</span><span>{pesewasToGHS(invoice.tax_pesewas)}</span></div>}
          {invoice.discount_pesewas > 0 && <div className="flex justify-between text-green-500"><span>Discount</span><span>- {pesewasToGHS(invoice.discount_pesewas)}</span></div>}
          <div className="flex justify-between border-t border-border pt-2 font-bold"><span>Total</span><span>{pesewasToGHS(invoice.total_pesewas)}</span></div>
          <div className="flex justify-between text-green-500"><span>Amount Paid</span><span>{pesewasToGHS(invoice.amount_paid_pesewas)}</span></div>
          {invoice.amount_paid_pesewas < invoice.total_pesewas && (
            <div className="flex justify-between border-t border-border pt-2 font-bold text-primary"><span>Balance Due</span><span>{pesewasToGHS(invoice.total_pesewas - invoice.amount_paid_pesewas)}</span></div>
          )}
          <div className="flex justify-between border-t border-border pt-2 text-xs text-muted-foreground"><span>Due Date</span><span>{formatDate(invoice.due_date)}</span></div>
        </CardContent>
      </Card>
    </div>
  );
}