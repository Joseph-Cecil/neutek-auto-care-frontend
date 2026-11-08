'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PageSkeleton } from '@/components/ui/page-skeleton';
import { TopProgress } from '@/components/ui/top-progress';
import { useQuotes } from '@/hooks/useQuotes';
import { ghsAmount } from '@/lib/utils/format';
import { formatDate } from '@/lib/utils/date';
import type { QuoteStatus } from '@/lib/dto';

function quotePill(status: QuoteStatus): string {
  if (status === 'approved') return 'pill ok';
  if (status === 'rejected') return 'pill bad';
  if (status === 'expired') return 'pill warn';
  if (status === 'sent') return 'pill brand';
  return 'pill';
}

function quoteLabel(status: QuoteStatus): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export default function PortalQuotesPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useQuotes({
    page,
    limit: 10,
  });

  const quotes     = data?.data       ?? [];
  const totalPages = data?.totalPages ?? 1;

  return (
    <>
      <TopProgress active={isLoading} />
      {isLoading ? <PageSkeleton kind="list" /> : (
        <>
          <div className="pagehead">
            <div className="ttl">
              <h1>Quotes</h1>
              <p className="muted">Approve or turn down the work we recommend.</p>
            </div>
          </div>
          {isError && !data ? (
            <div className="banner" role="alert">Failed to load your quotes. Please refresh the page.</div>
          ) : quotes.length === 0 ? (
            <div className="card">
              <div className="empty">
                <h2>No quotes yet</h2>
                <p className="muted">Quotes will appear here after your vehicle has been diagnosed.</p>
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
                        <th>Job</th>
                        <th className="num">Total</th>
                        <th>Valid until</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {quotes.map((quote) => {
                        const href = `/portal/quotes/${quote.id}`;
                        return (
                          <tr
                            key={quote.id}
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
                                {quote.quote_number}
                              </Link>
                            </td>
                            <td>
                              <Link
                                href={`/portal/jobs/${quote.job_id}`}
                                className="b"
                                onClick={(event) => event.stopPropagation()}
                              >
                                View job
                              </Link>
                            </td>
                            <td className="num">GHS {ghsAmount(quote.total_pesewas)}</td>
                            <td>{formatDate(quote.valid_until)}</td>
                            <td>
                              <span className="row">
                                <span className={quotePill(quote.status)}>{quoteLabel(quote.status)}</span>
                                {quote.status === 'sent' ? <span className="pill brand">Action required</span> : null}
                              </span>
                            </td>
                            <td>
                              <Link
                                href={href}
                                className="btn sm"
                                onClick={(event) => event.stopPropagation()}
                              >
                                {quote.status === 'sent' ? 'Review' : 'Open'}
                              </Link>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="mlist" role="list">
                  {quotes.map((quote) => {
                    const href = `/portal/quotes/${quote.id}`;
                    return (
                      <div key={quote.id} className="mrow" role="listitem">
                        <div className="mrow-top">
                          <div className="mrow-body">
                            <span className="b">{quote.quote_number}</span>
                            <span className="muted sm">GHS {ghsAmount(quote.total_pesewas)} · Valid {formatDate(quote.valid_until)}</span>
                            <span className="row" style={{ marginTop: 4 }}>
                              <span className={quotePill(quote.status)}>{quoteLabel(quote.status)}</span>
                              {quote.status === 'sent' ? <span className="pill brand">Action required</span> : null}
                            </span>
                          </div>
                        </div>
                        <div className="mrow-act">
                          <Link href={href} className="btn sm primary">
                            {quote.status === 'sent' ? 'Review' : 'Open'}
                          </Link>
                          <Link href={`/portal/jobs/${quote.job_id}`} className="btn sm ghost">View job</Link>
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
