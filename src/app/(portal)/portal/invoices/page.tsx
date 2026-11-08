'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PageSkeleton } from '@/components/ui/page-skeleton';
import { TopProgress } from '@/components/ui/top-progress';
import { useInvoices } from '@/hooks/useInvoices';
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
  const router = useRouter();
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useInvoices({
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
                <div className="tw desk-only">
                  <table className="tbl">
                    <thead>
                      <tr>
                        <th>Number</th>
                        <th>Due</th>
                        <th className="num">Total</th>
                        <th className="num">Balance</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.map((invoice) => {
                        const href = `/portal/invoices/${invoice.id}`;
                        const remaining = invoice.total_pesewas - invoice.amount_paid_pesewas;
                        const canPay = invoice.status === 'sent' || invoice.status === 'partially_paid' || invoice.status === 'overdue';
                        return (
                          <tr
                            key={invoice.id}
                            className="click"
                            tabIndex={0}
                            role="link"
                            onClick={() => router.push(href)}
                            onKeyDown={(event) => {
                              if (event.key === 'Enter' || event.key === ' ') {
                                event.preventDefault();
                                router.push(href);
                              }
                            }}
                          >
                            <td>
                              <Link href={href} className="b" onClick={(event) => event.stopPropagation()}>
                                {invoice.invoice_number}
                              </Link>
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
                            <td>
                              <Link
                                href={href}
                                className="btn sm"
                                onClick={(event) => event.stopPropagation()}
                              >
                                {canPay ? 'Pay / open' : 'Open'}
                              </Link>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="mlist" role="list">
                  {invoices.map((invoice) => {
                    const href = `/portal/invoices/${invoice.id}`;
                    const remaining = invoice.total_pesewas - invoice.amount_paid_pesewas;
                    const canPay = invoice.status === 'sent' || invoice.status === 'partially_paid' || invoice.status === 'overdue';
                    return (
                      <div key={invoice.id} className="mrow" role="listitem">
                        <div className="mrow-top">
                          <div className="mrow-body">
                            <span className="b">{invoice.invoice_number}</span>
                            <span className="muted sm">
                              Balance GHS {ghsAmount(remaining)} · Due {formatDate(invoice.due_date)}
                            </span>
                            <span className="row" style={{ marginTop: 4 }}>
                              <span className={invoicePill(invoice.status)}>{invoiceLabel(invoice.status)}</span>
                              {canPay ? <span className="pill brand">Pay now</span> : null}
                            </span>
                          </div>
                        </div>
                        <div className="mrow-act">
                          <Link href={href} className="btn sm primary">
                            {canPay ? 'Pay / open' : 'Open'}
                          </Link>
                        </div>
                      </div>
                    );
                  })}
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
