'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { TopProgress } from '@/components/ui/top-progress';
import { PageSkeleton } from '@/components/ui/page-skeleton';
import { useCustomer } from '@/hooks/useCustomers';
import { useInvoice, useSendInvoice } from '@/hooks/useInvoices';
import { useJob } from '@/hooks/useJobs';
import { useVehicle } from '@/hooks/useVehicles';
import { fullName, ghsAmount } from '@/lib/utils/format';
import { daysUntil, formatDate } from '@/lib/utils/date';
import type { Invoice, InvoiceStatus } from '@/lib/dto';

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

type LineItem = {
  id: string;
  description: string;
  quantity: number;
  unit_price_pesewas: number;
  total_pesewas: number;
};

function lineItems(invoice: Invoice): LineItem[] {
  const value = (invoice as Invoice & { lineItems?: unknown }).lineItems;
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

export default function AdminInvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: invoice, isPending, isFetching, isError } = useInvoice(id);
  const { mutate: sendInvoice, isPending: sending } = useSendInvoice();
  const job = useJob(invoice?.job_id ?? '');
  const customer = useCustomer(invoice?.customer_id ?? '');
  const vehicle = useVehicle(job.data?.vehicle_id ?? '');

  const waiting = Boolean(id) && !invoice && !isError && isPending;

  if (waiting) {
    return (
      <>
        <TopProgress active />
        <PageSkeleton kind="detail" />
      </>
    );
  }

  if (!invoice) {
    return (
      <div className="stack s">
        <Link href="/admin/invoices" className="btn sm">
          Back to invoices
        </Link>
        <div className="banner" role="alert">
          {isError ? 'Could not load this invoice.' : 'Invoice not found.'}
        </div>
      </div>
    );
  }

  const lines = lineItems(invoice);
  const balance = Math.max(0, invoice.total_pesewas - invoice.amount_paid_pesewas);
  const who = customer.data ? fullName(customer.data.first_name, customer.data.last_name) : '';
  const car = vehicle.data ? `${vehicle.data.year} ${vehicle.data.make} ${vehicle.data.model}` : '';
  const due = formatDate(invoice.due_date);
  const subtitle =
    who && car
      ? `For ${who}, ${car}, due ${due}`
      : who
        ? `For ${who}, due ${due}`
        : car
          ? `For ${car}, due ${due}`
          : `Due ${due}`;
  const overdueDays = Math.max(0, -daysUntil(invoice.due_date));

  return (
    <>
      <TopProgress active={isFetching || sending} />
      <div className="pagehead">
        <div className="ttl">
          <div className="row">
            <Link href="/admin/invoices" className="btn sm">
              Back to invoices
            </Link>
          </div>
          <div className="row">
            <h1>{invoice.invoice_number}</h1>
            <span className={invoicePill(invoice.status)}>{statusLabel(invoice.status)}</span>
          </div>
          <p className="muted">{subtitle}</p>
        </div>
        <div className="row">
          {invoice.status === 'draft' ? (
            <button
              type="button"
              className={sending ? 'btn primary nt-loading' : 'btn primary'}
              data-variant="primary"
              disabled={sending}
              onClick={() => sendInvoice(id)}
            >
              Send to customer
            </button>
          ) : null}
          {invoice.pdf_url?.startsWith('http') ? (
            <a className="btn sm" href={invoice.pdf_url} target="_blank" rel="noopener noreferrer">
              Download PDF
            </a>
          ) : null}
        </div>
      </div>

      <div className="stack">
        {invoice.status === 'overdue' ? (
          <div className="banner" role="status">
            This invoice is {overdueDays} days overdue. Balance {money(balance)}.
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
                  <td className="num">{money(invoice.subtotal_pesewas)}</td>
                </tr>
                <tr>
                  <td colSpan={3} className="num muted">
                    Tax and levies
                  </td>
                  <td className="num">{money(invoice.tax_pesewas)}</td>
                </tr>
                {invoice.discount_pesewas > 0 ? (
                  <tr>
                    <td colSpan={3} className="num muted">
                      Discount
                    </td>
                    <td className="num">{money(invoice.discount_pesewas)}</td>
                  </tr>
                ) : null}
                <tr>
                  <td colSpan={3} className="num b">
                    Total
                  </td>
                  <td className="num b">{money(invoice.total_pesewas)}</td>
                </tr>
                <tr>
                  <td colSpan={3} className="num muted">
                    Amount paid
                  </td>
                  <td className="num">{money(invoice.amount_paid_pesewas)}</td>
                </tr>
                <tr>
                  <td colSpan={3} className="num b">
                    Balance
                  </td>
                  <td className="num b">{money(balance)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {invoice.job_id ? (
          <div className="card row sb">
            <span className="muted">Job</span>
            <Link className="btn" href={`/admin/jobs/${invoice.job_id}`}>
              {job.data?.job_number ? `Open ${job.data.job_number}` : 'Open job'}
            </Link>
          </div>
        ) : null}
      </div>
    </>
  );
}
