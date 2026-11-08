'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { TopProgress } from '@/components/ui/top-progress';
import { PageSkeleton } from '@/components/ui/page-skeleton';
import { useCustomer } from '@/hooks/useCustomers';
import { useJob } from '@/hooks/useJobs';
import { useQuote, useSendQuote } from '@/hooks/useQuotes';
import { useVehicle } from '@/hooks/useVehicles';
import { fullName, ghsAmount } from '@/lib/utils/format';
import { formatDate } from '@/lib/utils/date';
import type { Quote, QuoteStatus } from '@/lib/dto';

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

type LineItem = {
  id: string;
  description: string;
  quantity: number;
  unit_price_pesewas: number;
  total_pesewas: number;
};

function lineItems(quote: Quote): LineItem[] {
  const value = (quote as Quote & { lineItems?: unknown }).lineItems;
  if (!Array.isArray(value)) return [];
  return value.flatMap((item, index) => {
    if (!item || typeof item !== 'object') return [];
    const row = item as Partial<LineItem>;
    if (typeof row.description !== 'string') return [];
    return [
      {
        id: typeof row.id === 'string' ? row.id : `${index}`,
        description: row.description,
        quantity: Number(row.quantity ?? 0),
        unit_price_pesewas: Number(row.unit_price_pesewas ?? 0),
        total_pesewas: Number(row.total_pesewas ?? 0),
      },
    ];
  });
}

export default function AdminQuoteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: quote, isPending, isFetching, isError } = useQuote(id);
  const { mutate: sendQuote, isPending: sending } = useSendQuote();
  const job = useJob(quote?.job_id ?? '');
  const customer = useCustomer(quote?.customer_id ?? '');
  const vehicle = useVehicle(job.data?.vehicle_id ?? '');

  const waiting = Boolean(id) && !quote && !isError && isPending;
  const who = customer.data ? fullName(customer.data.first_name, customer.data.last_name) : '';
  const car = vehicle.data ? `${vehicle.data.year} ${vehicle.data.make} ${vehicle.data.model}` : '';
  const subtitle =
    who && car ? `For ${who}, ${car}` : who ? `For ${who}` : car ? `For ${car}` : null;

  if (waiting) {
    return (
      <>
        <TopProgress active />
        <PageSkeleton kind="detail" />
      </>
    );
  }

  if (!quote) {
    return (
      <div className="stack s">
        <Link href="/admin/quotes" className="btn sm">
          Back to quotes
        </Link>
        <div className="banner" role="alert">
          {isError ? 'Could not load this quote.' : 'Quote not found.'}
        </div>
      </div>
    );
  }

  const lines = lineItems(quote);

  return (
    <>
      <TopProgress active={isFetching || sending} />
      <div className="pagehead">
        <div className="ttl">
          <div className="row">
            <Link href="/admin/quotes" className="btn sm">
              Back to quotes
            </Link>
          </div>
          <div className="row">
            <h1>{quote.quote_number}</h1>
            <span className={quotePill(quote.status)}>{statusLabel(quote.status)}</span>
          </div>
          {subtitle ? <p className="muted">{subtitle}</p> : null}
        </div>
        {quote.status === 'draft' ? (
          <div className="row">
            <button
              type="button"
              className={sending ? 'btn primary nt-loading' : 'btn primary'}
              data-variant="primary"
              disabled={sending}
              onClick={() => sendQuote(id)}
            >
              Send to customer
            </button>
          </div>
        ) : null}
      </div>

      <div className="stack">
        {quote.status === 'sent' ? (
          <div className="banner info" role="status">
            Waiting on the customer. They can approve or reject from their account.
          </div>
        ) : null}
        {quote.status === 'rejected' ? (
          <div className="banner" role="status">
            The customer rejected this quote.
          </div>
        ) : null}
        {quote.status === 'approved' ? (
          <div className="banner ok" role="status">
            The customer approved this quote.
          </div>
        ) : null}

        <div className="card flush">
          <div className="tw">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Description</th>
                  <th className="num">Qty</th>
                  <th className="num">Unit price (GHS)</th>
                  <th className="num">Line total (GHS)</th>
                </tr>
              </thead>
              <tbody>
                {lines.map((line) => (
                  <tr key={line.id}>
                    <td>{line.description}</td>
                    <td className="num">{line.quantity}</td>
                    <td className="num">{money(line.unit_price_pesewas)}</td>
                    <td className="num">{money(line.total_pesewas)}</td>
                  </tr>
                ))}
                <tr>
                  <td colSpan={3} className="num muted">
                    Subtotal
                  </td>
                  <td className="num">{money(quote.subtotal_pesewas)}</td>
                </tr>
                <tr>
                  <td colSpan={3} className="num muted">
                    Tax and levies
                  </td>
                  <td className="num">{money(quote.tax_pesewas)}</td>
                </tr>
                <tr>
                  <td colSpan={3} className="num muted">
                    Discount
                  </td>
                  <td className="num">{money(quote.discount_pesewas)}</td>
                </tr>
                <tr>
                  <td colSpan={3} className="num b">
                    Total
                  </td>
                  <td className="num b">{money(quote.total_pesewas)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="g2 grid">
          <div className="card stack s">
            <h2>Valid until</h2>
            <p>{formatDate(quote.valid_until)}</p>
            <p className="muted sm">Created {formatDate(quote.created_at)}</p>
          </div>
          <div className="card stack s">
            <h2>Notes</h2>
            <p>{quote.notes || '—'}</p>
          </div>
        </div>

        <div className="card row sb">
          <span className="muted">Job</span>
          <Link className="btn" href={`/admin/jobs/${quote.job_id}`}>
            {job.data?.job_number ? `Open ${job.data.job_number}` : 'Open job'}
          </Link>
        </div>
      </div>
    </>
  );
}
