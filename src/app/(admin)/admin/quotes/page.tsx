'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { TopProgress } from '@/components/ui/top-progress';
import { PageSkeleton } from '@/components/ui/page-skeleton';
import { useQuotes } from '@/hooks/useQuotes';
import { ghsAmount } from '@/lib/utils/format';
import { formatDate } from '@/lib/utils/date';
import type { QuoteStatus } from '@/lib/dto';

const STATUS_TABS: { label: string; value: QuoteStatus | undefined }[] = [
  { label: 'All', value: undefined },
  { label: 'Draft', value: 'draft' },
  { label: 'Sent', value: 'sent' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'Expired', value: 'expired' },
];

function money(pesewas: number): string {
  return `GHS ${ghsAmount(pesewas)}`;
}

function statusLabel(status: string): string {
  return status
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function quotePill(status: QuoteStatus): string {
  if (status === 'approved') return 'pill ok';
  if (status === 'rejected') return 'pill bad';
  if (status === 'sent') return 'pill brand';
  if (status === 'expired') return 'pill warn';
  return 'pill';
}

function emptyTitle(status: QuoteStatus | undefined): string {
  if (!status) return 'No quotes';
  return `No ${status} quotes`;
}

export default function AdminQuotesPage() {
  const router = useRouter();
  const [status, setStatus] = useState<QuoteStatus | undefined>(undefined);
  const [page, setPage] = useState(1);
  const { data, isPending, isFetching, isError } = useQuotes({ status, page, limit: 20 });

  const quotes = data?.data ?? [];
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
              <h1>Quotes</h1>
              <p className="muted">
                {total > 0 ? `${total} total. ` : ''}
                What we have offered, and what customers have answered.
              </p>
            </div>
            <Link href="/admin/quotes/create" className="btn primary">New quote</Link>
          </div>

          <div className="tabs" role="tablist" aria-label="Quote status">
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
              Could not load quotes. Refresh the page to try again.
            </div>
          ) : (
            <div className="card flush">
              {quotes.length === 0 ? (
                <div className="empty">
                  <div className="ic" aria-hidden="true">
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    >
                      <path d="M6 3h9l4 4v14H6z" />
                    </svg>
                  </div>
                  <h2>{emptyTitle(status)}</h2>
                  <p className="muted">Quotes will show here as they move through.</p>
                </div>
              ) : (
                <div className="tw">
                  <table className="tbl">
                    <thead>
                      <tr>
                        <th>Number</th>
                        <th className="num">Total (GHS)</th>
                        <th>Valid until</th>
                        <th>Created</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {quotes.map((quote) => (
                        <tr
                          key={quote.id}
                          className="click"
                          onClick={() => router.push(`/admin/quotes/${quote.id}`)}
                        >
                          <td>
                            <Link className="lnk" href={`/admin/quotes/${quote.id}`}>
                              {quote.quote_number}
                            </Link>
                          </td>
                          <td className="num">{money(quote.total_pesewas)}</td>
                          <td>{formatDate(quote.valid_until)}</td>
                          <td>{formatDate(quote.created_at)}</td>
                          <td>
                            <span className={quotePill(quote.status)}>
                              {statusLabel(quote.status)}
                            </span>
                          </td>
                        </tr>
                      ))}
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
