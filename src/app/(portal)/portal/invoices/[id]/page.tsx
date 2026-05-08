'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, CreditCard, Download,
  AlertCircle, CheckCircle, Receipt,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge }   from '@/components/shared/StatusBadge';
import { SectionLoader, LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useInvoice, useInitializePayment } from '@/hooks/useInvoices';
import { pesewasToGHS } from '@/lib/utils/format';
import { formatDate }   from '@/lib/utils/date';
import type { InvoiceStatus } from '@/lib/dto';

const STATUS_MAP: Record<InvoiceStatus, 'default' | 'success' | 'warning' | 'danger' | 'info' | 'muted'> = {
  draft:         'muted',
  sent:          'info',
  paid:          'success',
  partially_paid:'warning',
  overdue:       'danger',
  cancelled:     'muted',
};

export default function PortalInvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: invoice, isLoading, error } = useInvoice(id);
  const { mutate: initPayment, isPending: paying } = useInitializePayment();

  if (isLoading) return <SectionLoader />;

  if (error || !invoice) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <AlertCircle className="h-10 w-10 text-destructive" />
        <h2 className="text-lg font-semibold">Invoice not found</h2>
        <Link href="/portal/invoices">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Invoices
          </Button>
        </Link>
      </div>
    );
  }

  const remaining  = invoice.total_pesewas - invoice.amount_paid_pesewas;
  const canPay     = invoice.status === 'sent' || invoice.status === 'partially_paid' || invoice.status === 'overdue';
  const callbackUrl = (process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3001') +
    '/portal/invoices?paid=true';

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link href="/portal/invoices">
        <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to Invoices
        </Button>
      </Link>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-xs text-muted-foreground">{invoice.invoice_number}</p>
          <h1 className="mt-1 text-xl font-bold">Invoice</h1>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge
            label={invoice.status.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
            variant={STATUS_MAP[invoice.status]}
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

      {/* Paid success banner */}
      {invoice.status === 'paid' && (
        <div className="flex items-center gap-2 rounded-lg bg-green-500/10 p-4 text-green-500">
          <CheckCircle className="h-5 w-5 shrink-0" />
          <p className="text-sm font-medium">This invoice has been paid in full. Thank you!</p>
        </div>
      )}

      {/* Invoice summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Receipt className="h-4 w-4 text-primary" /> Invoice Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{pesewasToGHS(invoice.subtotal_pesewas)}</span>
          </div>
          {invoice.tax_pesewas > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tax</span>
              <span>{pesewasToGHS(invoice.tax_pesewas)}</span>
            </div>
          )}
          {invoice.discount_pesewas > 0 && (
            <div className="flex justify-between text-sm text-green-500">
              <span>Discount</span>
              <span>- {pesewasToGHS(invoice.discount_pesewas)}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-border pt-2 font-bold">
            <span>Total</span>
            <span>{pesewasToGHS(invoice.total_pesewas)}</span>
          </div>
          {invoice.amount_paid_pesewas > 0 && (
            <>
              <div className="flex justify-between text-sm text-green-500">
                <span>Amount Paid</span>
                <span>- {pesewasToGHS(invoice.amount_paid_pesewas)}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-2 font-bold text-primary">
                <span>Amount Due</span>
                <span>{pesewasToGHS(remaining)}</span>
              </div>
            </>
          )}
          <div className="border-t border-border pt-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Due Date</span>
              <span>{formatDate(invoice.due_date)}</span>
            </div>
          </div>
          {invoice.notes && (
            <div className="mt-3 rounded-lg bg-muted/50 p-3 text-sm">
              <p className="mb-1 font-medium">Notes</p>
              <p className="text-muted-foreground">{invoice.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pay online */}
      {canPay && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-5">
            <div className="flex items-start gap-3">
              <CreditCard className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div className="flex-1">
                <p className="font-semibold">Pay Online with Paystack</p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  Secure payment via card, mobile money, or bank transfer.
                  Amount due: <strong className="text-foreground">{pesewasToGHS(remaining)}</strong>
                </p>
                <Button
                  className="mt-3 gap-2"
                  onClick={() => initPayment({ invoiceId: id, callbackUrl })}
                  disabled={paying}
                >
                  {paying
                    ? <><LoadingSpinner size="sm" className="mr-1" />Redirecting...</>
                    : <><CreditCard className="h-4 w-4" />Pay {pesewasToGHS(remaining)}</>}
                </Button>
                <p className="mt-2 text-xs text-muted-foreground">
                  You will be redirected to Paystack&apos;s secure checkout.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}