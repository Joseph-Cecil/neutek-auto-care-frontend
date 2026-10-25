'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { PageSkeleton } from '@/components/ui/page-skeleton';
import { TopProgress } from '@/components/ui/top-progress';
import { useInvoice, useInitializePayment } from '@/hooks/useInvoices';
import { ghsAmount } from '@/lib/utils/format';
import { daysUntil, formatDate } from '@/lib/utils/date';
import type { Invoice, InvoiceLineItem, InvoiceStatus } from '@/lib/dto';

function invoicePill(status: InvoiceStatus): string {
  if (status === 'paid') return 'pill ok';
  if (status === 'overdue') return 'pill bad';
  if (status === 'partially_paid') return 'pill warn';
  if (status === 'sent') return 'pill brand';
  return 'pill';
}

function invoiceLabel(status: string): string {
  return status.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

function lineItemsOf(invoice: Invoice): InvoiceLineItem[] {
  const extra = invoice as Invoice & { lineItems?: InvoiceLineItem[] };
  return Array.isArray(extra.lineItems) ? extra.lineItems : [];
}

export default function PortalInvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: invoice, isLoading, isError } = useInvoice(id);
  const { mutate: initPayment, isPending: paying } = useInitializePayment();

  const callbackUrl = (process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3001') +
    '/portal/invoices?paid=true';

  return (
    <>
      <TopProgress active={isLoading} />
      {isLoading ? <PageSkeleton kind="detail" /> : isError && !invoice ? (
        <div className="stack">
          <div className="banner" role="alert">Could not load this invoice.</div>
          <Link href="/portal/invoices" className="btn sm">Back to invoices</Link>
        </div>
      ) : !invoice ? (
        <div className="stack">
          <div className="banner info" role="status">This invoice could not be found.</div>
          <Link href="/portal/invoices" className="btn sm">Back to invoices</Link>
        </div>
      ) : (
        <InvoiceBody
          invoice={invoice}
          paying={paying}
          onPay={() => initPayment({ invoiceId: id, callbackUrl })}
        />
      )}
    </>
  );
}

function InvoiceBody({
  invoice,
  paying,
  onPay,
}: {
  invoice: Invoice;
  paying: boolean;
  onPay: () => void;
}) {
  const remaining = invoice.total_pesewas - invoice.amount_paid_pesewas;
  const canPay = invoice.status === 'sent' || invoice.status === 'partially_paid' || invoice.status === 'overdue';
  const lines = lineItemsOf(invoice);
  const overdueDays = Math.max(0, -daysUntil(invoice.due_date));

  return (
    <>
      <div className="pagehead">
        <div className="ttl">
          <div className="row">
            <Link href="/portal/invoices" className="btn sm">Back to invoices</Link>
          </div>
          <div className="row">
            <h1>{invoice.invoice_number}</h1>
            <span className={invoicePill(invoice.status)}>{invoiceLabel(invoice.status)}</span>
          </div>
          <p className="muted">Due {formatDate(invoice.due_date)}</p>
        </div>
        <div className="row">
          {invoice.pdf_url ? (
            <a href={invoice.pdf_url} className="btn sm" target="_blank" rel="noopener noreferrer">PDF</a>
          ) : null}
          {canPay ? (
            <button
              type="button"
              className={paying ? 'btn primary nt-loading' : 'btn primary'}
              data-variant="primary"
              disabled={paying}
              onClick={onPay}
            >
              Pay GHS {ghsAmount(remaining)}
            </button>
          ) : null}
        </div>
      </div>
      <div className="stack">
        {invoice.status === 'paid' ? (
          <div className="banner ok" role="status">This invoice has been paid in full. Thank you.</div>
        ) : null}
        {invoice.status === 'overdue' ? (
          <div className="banner" role="status">
            {overdueDays > 0
              ? 'This invoice is ' + overdueDays + (overdueDays === 1 ? ' day' : ' days') + ' overdue.'
              : 'This invoice is overdue.'}
          </div>
        ) : null}
        {canPay ? (
          <p className="muted sm">You will be redirected to Paystack&apos;s secure checkout.</p>
        ) : null}
        <div className="card flush">
          <div className="tw">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Description</th>
                  <th className="num">Qty</th>
                  <th className="num">Unit price</th>
                  <th className="num">Line total</th>
                </tr>
              </thead>
              <tbody>
                {lines.map((line) => (
                  <tr key={line.id}>
                    <td>{line.description}</td>
                    <td className="num">{line.quantity}</td>
                    <td className="num">GHS {ghsAmount(line.unit_price_pesewas)}</td>
                    <td className="num">GHS {ghsAmount(line.total_pesewas)}</td>
                  </tr>
                ))}
                <tr>
                  <td colSpan={3} className="num muted">Subtotal</td>
                  <td className="num">GHS {ghsAmount(invoice.subtotal_pesewas)}</td>
                </tr>
                {invoice.tax_pesewas > 0 ? (
                  <tr>
                    <td colSpan={3} className="num muted">Tax</td>
                    <td className="num">GHS {ghsAmount(invoice.tax_pesewas)}</td>
                  </tr>
                ) : null}
                {invoice.discount_pesewas > 0 ? (
                  <tr>
                    <td colSpan={3} className="num muted">Discount</td>
                    <td className="num">- GHS {ghsAmount(invoice.discount_pesewas)}</td>
                  </tr>
                ) : null}
                <tr>
                  <td colSpan={3} className="num b">Total</td>
                  <td className="num b">GHS {ghsAmount(invoice.total_pesewas)}</td>
                </tr>
                <tr>
                  <td colSpan={3} className="num muted">Paid</td>
                  <td className="num">GHS {ghsAmount(invoice.amount_paid_pesewas)}</td>
                </tr>
                <tr>
                  <td colSpan={3} className="num b">Balance</td>
                  <td className="num b">GHS {ghsAmount(remaining)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        {invoice.notes ? (
          <div className="card stack s">
            <h2>Notes</h2>
            <p>{invoice.notes}</p>
          </div>
        ) : null}
      </div>
    </>
  );
}
