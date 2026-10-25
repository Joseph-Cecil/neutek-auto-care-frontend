'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { PageSkeleton } from '@/components/ui/page-skeleton';
import { TopProgress } from '@/components/ui/top-progress';
import { useQuote, useApproveQuote, useRejectQuote } from '@/hooks/useQuotes';
import { ghsAmount } from '@/lib/utils/format';
import { formatDate, daysUntil } from '@/lib/utils/date';
import type { Quote, QuoteLineItem, QuoteStatus } from '@/lib/dto';

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

function lineItemsOf(quote: Quote): QuoteLineItem[] {
  const extra = quote as Quote & { lineItems?: QuoteLineItem[] };
  return Array.isArray(extra.lineItems) ? extra.lineItems : [];
}

export default function PortalQuoteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: quote, isLoading, isError } = useQuote(id);
  const { mutate: approveQuote, isPending: approving } = useApproveQuote();
  const { mutate: rejectQuote, isPending: rejecting } = useRejectQuote();

  const [ask, setAsk] = useState<'' | 'approve' | 'reject'>('');
  const [rejectReason, setRejectReason] = useState('');
  const pending = approving || rejecting;

  return (
    <>
      <TopProgress active={isLoading} />
      {isLoading ? <PageSkeleton kind="detail" /> : isError && !quote ? (
        <div className="stack">
          <div className="banner" role="alert">Could not load this quote.</div>
          <Link href="/portal/quotes" className="btn sm">Back to quotes</Link>
        </div>
      ) : !quote ? (
        <div className="stack">
          <div className="banner info" role="status">This quote could not be found.</div>
          <Link href="/portal/quotes" className="btn sm">Back to quotes</Link>
        </div>
      ) : (
        <QuoteBody
          quote={quote}
          ask={ask}
          setAsk={setAsk}
          rejectReason={rejectReason}
          setRejectReason={setRejectReason}
          pending={pending}
          approving={approving}
          rejecting={rejecting}
          onApprove={() => approveQuote(id, { onSuccess: () => setAsk('') })}
          onReject={() => {
            const reason = rejectReason.trim();
            rejectQuote(
              { id, body: reason ? { reason } : undefined },
              { onSuccess: () => setAsk('') },
            );
          }}
        />
      )}
    </>
  );
}

function QuoteBody({
  quote,
  ask,
  setAsk,
  rejectReason,
  setRejectReason,
  pending,
  approving,
  rejecting,
  onApprove,
  onReject,
}: {
  quote: Quote;
  ask: '' | 'approve' | 'reject';
  setAsk: (ask: '' | 'approve' | 'reject') => void;
  rejectReason: string;
  setRejectReason: (value: string) => void;
  pending: boolean;
  approving: boolean;
  rejecting: boolean;
  onApprove: () => void;
  onReject: () => void;
}) {
  const canAct = quote.status === 'sent';
  const daysLeft = daysUntil(quote.valid_until);
  const lines = lineItemsOf(quote);
  const total = ghsAmount(quote.total_pesewas);

  return (
    <>
      <div className="pagehead">
        <div className="ttl">
          <div className="row">
            <Link href="/portal/quotes" className="btn sm">Back to quotes</Link>
          </div>
          <div className="row">
            <h1>{quote.quote_number}</h1>
            <span className={quotePill(quote.status)}>{quoteLabel(quote.status)}</span>
          </div>
          <p className="muted">Quote for this repair</p>
        </div>
      </div>
      <div className="stack">
        {quote.status === 'approved' ? (
          <div className="banner ok" role="status">You approved this quote. We will start the work.</div>
        ) : null}
        {quote.status === 'rejected' ? (
          <div className="banner info" role="status">
            You rejected this quote.{rejectReason.trim() ? ' Your reason: ' + rejectReason.trim() + '.' : ''}
          </div>
        ) : null}
        {quote.status === 'expired' ? (
          <div className="banner" role="status">This quote has expired. Call us for a new one.</div>
        ) : null}
        {canAct ? (
          <div className={daysLeft <= 1 ? 'banner' : 'banner info'} role="status">
            {daysLeft <= 0
              ? 'This quote expires today.'
              : daysLeft === 1
                ? 'This quote expires tomorrow.'
                : 'Valid for ' + daysLeft + ' more days.'}
          </div>
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
                  <td className="num">GHS {ghsAmount(quote.subtotal_pesewas)}</td>
                </tr>
                <tr>
                  <td colSpan={3} className="num muted">Tax and levies</td>
                  <td className="num">GHS {ghsAmount(quote.tax_pesewas)}</td>
                </tr>
                {quote.discount_pesewas > 0 ? (
                  <tr>
                    <td colSpan={3} className="num muted">Discount</td>
                    <td className="num">- GHS {ghsAmount(quote.discount_pesewas)}</td>
                  </tr>
                ) : null}
                <tr>
                  <td colSpan={3} className="num b">Total</td>
                  <td className="num b">GHS {total}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div className="card row sb">
          <span className="muted">Valid until <b>{formatDate(quote.valid_until)}</b></span>
          <Link href={'/portal/jobs/' + quote.job_id} className="btn sm">See the job</Link>
        </div>
        {quote.notes ? (
          <div className="card stack s">
            <h2>Notes from the workshop</h2>
            <p>{quote.notes}</p>
          </div>
        ) : null}
        {canAct && !ask ? (
          <div className="card row end">
            <button type="button" className="btn" disabled={pending} onClick={() => setAsk('reject')}>Reject</button>
            <button type="button" className="btn primary" disabled={pending} onClick={() => setAsk('approve')}>Approve</button>
          </div>
        ) : null}
        {canAct && ask === 'approve' ? (
          <div className="card stack s">
            <b>Approve {quote.quote_number} for GHS {total}?</b>
            <p className="muted sm">We will start the work and invoice this amount.</p>
            <div className="row end">
              <button type="button" className="btn" disabled={pending} onClick={() => setAsk('')}>Keep deciding</button>
              <button
                type="button"
                className={approving ? 'btn primary nt-loading' : 'btn primary'}
                data-variant="primary"
                disabled={pending}
                onClick={onApprove}
              >
                Approve quote
              </button>
            </div>
          </div>
        ) : null}
        {canAct && ask === 'reject' ? (
          <form
            className="card stack s"
            onSubmit={(event) => {
              event.preventDefault();
              onReject();
            }}
          >
            <b>Reject {quote.quote_number} (GHS {total})?</b>
            <div className="field">
              <label htmlFor="quote-reject-reason">Reason</label>
              <input
                id="quote-reject-reason"
                className="input"
                name="reason"
                placeholder="Why are you turning it down?"
                value={rejectReason}
                onChange={(event) => setRejectReason(event.target.value)}
              />
              <span className="hint">Optional. The workshop still sees that you turned it down.</span>
            </div>
            <div className="row end">
              <button type="button" className="btn" disabled={pending} onClick={() => setAsk('')}>Keep deciding</button>
              <button
                type="submit"
                className={rejecting ? 'btn danger nt-loading' : 'btn danger'}
                data-variant="danger"
                disabled={pending}
              >
                Reject quote
              </button>
            </div>
          </form>
        ) : null}
      </div>
    </>
  );
}
