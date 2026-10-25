'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { TopProgress } from '@/components/ui/top-progress';
import { PageSkeleton } from '@/components/ui/page-skeleton';
import { useInvoices } from '@/hooks/useInvoices';
import { ghsAmount } from '@/lib/utils/format';
import { formatDate } from '@/lib/utils/date';
import type { InvoiceStatus } from '@/lib/dto';

const STATUS_TABS: { label: string; value: InvoiceStatus | undefined }[] = [
  { label: 'All', value: undefined },
  { label: 'Draft', value: 'draft' },
  { label: 'Sent', value: 'sent' },
  { label: 'Paid', value: 'paid' },
  { label: 'Partial', value: 'partially_paid' },
  { label: 'Overdue', value: 'overdue' },
  { label: 'Cancelled', value: 'cancelled' },
];

const EMPTY_NAME: Record<InvoiceStatus, string> = {
  draft: 'draft',
  sent: 'sent',
  paid: 'paid',
  partially_paid: 'partially paid',
  overdue: 'overdue',
  cancelled: 'cancelled',
};

function money(pesewas: number): string {
  return `GHS ${ghsAmount(pesewas)}`;
}

function statusLabel(status: string): string {
  return status
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function invoicePill(status: InvoiceStatus): string {
  if (status === 'paid') return 'pill ok';
  if (status === 'partially_paid') return 'pill warn';
  if (status === 'overdue') return 'pill bad';
  if (status === 'sent') return 'pill brand';
  return 'pill';
}

function emptyTitle(status: InvoiceStatus | undefined): string {
  if (!status) return 'No invoices here';
  return `No ${EMPTY_NAME[status]} invoices`;
}

export default function AdminInvoicesPage() {
  const router = useRouter();
  const [status, setStatus] = useState<InvoiceStatus | undefined>(undefined);
  const [page, setPage] = useState(1);
  const { data, isPending, isFetching, isError } = useInvoices({ status, page, limit: 20 });

  const invoices = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;
  const total = data?.total ?? 0;
  const waiting = !data && !isError && isPending;
  const failed = isError && !data;

  return (
    <>
      <TopProgress active={isFetching} />
      {waiting ? (
        <PageSkeleton kind="list" />
      ) : (
        <>
          <div className="pagehead">
            <div className="ttl">
              <h1>Invoices</h1>
              <p className="muted">
                {total > 0 ? `${total} total. ` : ''}
                What is owed, what is paid and what is late.
              </p>
            </div>
            <Link href="/admin/invoices/create" className="btn primary">New invoice</Link>
          </div>
          <div className="tabs" role="tablist" aria-label="Invoice status">
            {STATUS_TABS.map(({ label, value }) => (
              <button
                key={label}
                type="button"
                role="tab"
                className="tab"
                aria-selected={status === value}
                onClick={() => {
                  setStatus(value);
                  setPage(1);
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {failed ? (
            <div className="banner" role="alert">
              Could not load invoices. Refresh the page to try again.
            </div>
          ) : (
            <div className="card flush">
              {invoices.length === 0 ? (
                <div className="empty">
                  <h2>{emptyTitle(status)}</h2>
                  <p className="muted">Nothing matches this tab.</p>
                </div>
              ) : (
                <div className="tw">
                  <table className="tbl">
                    <thead>
                      <tr>
                        <th>Number</th>
                        <th>Due</th>
                        <th className="num">Total (GHS)</th>
                        <th className="num">Paid (GHS)</th>
                        <th className="num">Balance (GHS)</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.map((invoice) => {
                        const balance = Math.max(
                          0,
                          invoice.total_pesewas - invoice.amount_paid_pesewas,
                        );
                        return (
                          <tr
                            key={invoice.id}
                            className="click"
                            onClick={() => router.push(`/admin/invoices/${invoice.id}`)}
                          >
                            <td>
                              <Link className="lnk" href={`/admin/invoices/${invoice.id}`}>
                                {invoice.invoice_number}
                              </Link>
                            </td>
                            <td>{formatDate(invoice.due_date)}</td>
                            <td className="num">{money(invoice.total_pesewas)}</td>
                            <td className="num">{money(invoice.amount_paid_pesewas)}</td>
                            <td className="num b">{money(balance)}</td>
                            <td>
                              <span className={invoicePill(invoice.status)}>
                                {statusLabel(invoice.status)}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {totalPages > 1 && !failed ? (
            <div className="row sb" style={{ marginTop: 16 }}>
              <p className="muted sm">
                Page {page} of {totalPages}
              </p>
              <div className="row">
                <button
                  type="button"
                  className="btn sm"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                >
                  Prev
                </button>
                <button
                  type="button"
                  className="btn sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          ) : null}
        </>
      )}
    </>
  );
}
