'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PageSkeleton } from '@/components/ui/page-skeleton';
import { TopProgress } from '@/components/ui/top-progress';
import { useInvoices } from '@/hooks/useInvoices';
import { useAuthStore } from '@/stores/auth.store';
import { ghsAmount } from '@/lib/utils/format';
import { formatDate } from '@/lib/utils/date';
import type { InvoiceStatus } from '@/lib/dto';

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

export default function PortalInvoicesPage() {
  const user = useAuthStore((s) => s.user);
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useInvoices({
    customerId: user?.id,
    page,
    limit: 10,
  });

  const invoices   = data?.data       ?? [];
  const totalPages = data?.totalPages ?? 1;

  return (
    <>
      <TopProgress active={isLoading} />
      {isLoading ? <PageSkeleton kind="list" /> : (
        <>
          <div className="pagehead">
            <div className="ttl">
              <h1>Invoices</h1>
              <p className="muted">What you owe and what you have paid.</p>
            </div>
          </div>
          {isError && !data ? (
            <div className="banner" role="alert">Failed to load your invoices. Please refresh the page.</div>
          ) : invoices.length === 0 ? (
            <div className="card">
              <div className="empty">
                <h2>No invoices yet</h2>
                <p className="muted">Invoices will appear here once your repair is complete.</p>
              </div>
            </div>
          ) : (
            <div className="stack">
              <div className="card flush">
                <div className="tw">
                  <table className="tbl">
                    <thead>
                      <tr>
                        <th>Number</th>
                        <th>Due</th>
                        <th className="num">Total</th>
                        <th className="num">Balance</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.map((invoice) => {
                        const remaining = invoice.total_pesewas - invoice.amount_paid_pesewas;
                        const canPay = invoice.status === 'sent' || invoice.status === 'partially_paid' || invoice.status === 'overdue';
                        return (
                          <tr key={invoice.id}>
                            <td>
                              <Link href={'/portal/invoices/' + invoice.id} className="b">{invoice.invoice_number}</Link>
                            </td>
                            <td>{formatDate(invoice.due_date)}</td>
                            <td className="num">GHS {ghsAmount(invoice.total_pesewas)}</td>
                            <td className="num b">GHS {ghsAmount(remaining)}</td>
                            <td>
                              <span className="row">
                                <span className={invoicePill(invoice.status)}>{invoiceLabel(invoice.status)}</span>
                                {canPay ? <span className="pill brand">Pay now</span> : null}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
              {totalPages > 1 ? (
                <div className="row sb">
                  <span className="muted sm">Page {page} of {totalPages}</span>
                  <div className="row">
                    <button type="button" className="btn sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
                    <button type="button" className="btn sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</button>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </>
      )}
    </>
  );
}
