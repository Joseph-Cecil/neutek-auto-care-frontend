'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { TopProgress } from '@/components/ui/top-progress';
import { PageSkeleton } from '@/components/ui/page-skeleton';
import { useAdminPayments, useRecordPayment } from '@/hooks/useAdminPayments';
import { useInvoices } from '@/hooks/useInvoices';
import { ghsAmount, ghsToPesewas } from '@/lib/utils/format';
import { formatDateTime } from '@/lib/utils/date';
import type { PaymentMethod, PaymentStatus } from '@/lib/dto';

const recordSchema = z.object({
  invoiceId: z.string().min(1, 'Choose an invoice.'),
  amountGHS: z.number().positive('Amount must be positive'),
  method: z.enum(['cash', 'card', 'bank_transfer', 'mobile_money', 'online']),
  gatewayReference: z.string().optional(),
});
type RecordFormData = z.infer<typeof recordSchema>;

const METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'cash', label: 'Cash' },
  { value: 'card', label: 'Card' },
  { value: 'bank_transfer', label: 'Bank transfer' },
  { value: 'mobile_money', label: 'Mobile money' },
  { value: 'online', label: 'Online' },
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

function paymentPill(status: PaymentStatus): string {
  if (status === 'completed') return 'pill ok';
  if (status === 'pending') return 'pill warn';
  if (status === 'failed') return 'pill bad';
  return 'pill';
}

export default function AdminPaymentsPage() {
  const [page, setPage] = useState(1);
  const [showRecord, setShowRecord] = useState(false);
  const { data, isPending, isFetching, isError } = useAdminPayments({ page, limit: 20 });
  const invoicesQuery = useInvoices({ limit: 100 });
  const { mutate: recordPayment, isPending: recording } = useRecordPayment();
  const openInvoices = (invoicesQuery.data?.data ?? []).filter((invoice) =>
    invoice.status === 'sent' || invoice.status === 'partially_paid' || invoice.status === 'overdue',
  );

  const payments = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;
  const total = data?.total ?? 0;
  const waiting = !data && !isError && isPending;
  const failed = isError && !data;

  const form = useForm<RecordFormData>({
    resolver: zodResolver(recordSchema),
    defaultValues: {
      invoiceId: '',
      amountGHS: undefined as unknown as number,
      method: 'cash',
      gatewayReference: '',
    },
  });

  useEffect(() => {
    if (!showRecord) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setShowRecord(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [showRecord]);

  const onSubmit = (values: RecordFormData) => {
    recordPayment(
      {
        invoiceId: values.invoiceId,
        amountPesewas: ghsToPesewas(values.amountGHS),
        method: values.method,
        gatewayReference: values.gatewayReference || undefined,
      },
      {
        onSuccess: () => {
          setShowRecord(false);
          form.reset();
        },
      },
    );
  };

  const chosenId = form.watch('invoiceId');
  const chosen = openInvoices.find((invoice) => invoice.id === chosenId);
  const errors = form.formState.errors;
  const errorMessages = [
    errors.invoiceId?.message,
    errors.amountGHS?.message,
    errors.method?.message,
    errors.gatewayReference?.message,
  ].filter((message): message is string => Boolean(message));

  return (
    <>
      <TopProgress active={isFetching || recording || invoicesQuery.isFetching} />
      {waiting ? (
        <PageSkeleton kind="list" />
      ) : (
        <>
          <div className="pagehead">
            <div className="ttl">
              <h1>Payments</h1>
              <p className="muted">
                {total > 0 ? `${total} total. ` : ''}
                Money in, including the ones that failed or were refunded.
              </p>
            </div>
            <div className="row">
              <button type="button" className="btn primary" onClick={() => setShowRecord(true)}>
                Record payment
              </button>
            </div>
          </div>

          {failed ? (
            <div className="banner" role="alert">
              Could not load payments. Refresh the page to try again.
            </div>
          ) : (
            <div className="card flush">
              {payments.length === 0 ? (
                <div className="empty">
                  <h2>No payments yet</h2>
                  <p className="muted">Money in will show here.</p>
                </div>
              ) : (
                <div className="tw">
                  <table className="tbl">
                    <thead>
                      <tr>
                        <th>Reference</th>
                        <th>Invoice</th>
                        <th className="num">Amount (GHS)</th>
                        <th>Method</th>
                        <th>Status</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((payment) => (
                        <tr key={payment.id}>
                          <td className="b">
                            {payment.payment_reference}
                            {payment.gateway_reference ? (
                              <div className="faint sm">{payment.gateway_reference}</div>
                            ) : null}
                          </td>
                          <td>
                            <Link className="lnk" href={`/admin/invoices/${payment.invoice_id}`}>
                              {payment.invoice_id}
                            </Link>
                          </td>
                          <td className="num">{money(payment.amount_pesewas)}</td>
                          <td>{statusLabel(payment.method)}</td>
                          <td>
                            <span className={paymentPill(payment.status)}>
                              {statusLabel(payment.status)}
                            </span>
                          </td>
                          <td>{formatDateTime(payment.created_at)}</td>
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

      {showRecord ? (
        <div className="scrim" onClick={() => setShowRecord(false)}>
          <div
            className="dlg"
            role="dialog"
            aria-modal="true"
            aria-labelledby="record-payment-title"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="record-payment-title">Record payment</h2>
            <div className="banner info" role="status">
              This records money the workshop has received. It does not start an online charge.
            </div>
            <form className="stack s" onSubmit={form.handleSubmit(onSubmit)}>
              {errorMessages.length > 0 ? (
                <div className="errsum" role="alert">
                  <b>Fix these fields</b>
                  <ul>
                    {errorMessages.map((message) => (
                      <li key={message}>{message}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              <div className="field">
                <label htmlFor="pay-invoice">Invoice</label>
                <select
                  id="pay-invoice"
                  className={errors.invoiceId ? 'input err' : 'input'}
                  autoFocus
                  aria-invalid={Boolean(errors.invoiceId)}
                  {...form.register('invoiceId')}
                >
                  <option value="">Choose an open invoice</option>
                  {openInvoices.map((invoice) => (
                    <option key={invoice.id} value={invoice.id}>
                      {invoice.invoice_number} · GHS {ghsAmount(invoice.total_pesewas - invoice.amount_paid_pesewas)}
                    </option>
                  ))}
                </select>
                {invoicesQuery.isError && !invoicesQuery.data ? (
                  <span className="hint err">Could not load invoices.</span>
                ) : null}
                {!invoicesQuery.isError && invoicesQuery.data && openInvoices.length === 0 ? (
                  <span className="hint">No open invoices.</span>
                ) : null}
                {errors.invoiceId?.message ? (
                  <span className="hint err">{errors.invoiceId.message}</span>
                ) : null}
              </div>
              {chosen ? (
                <div className="banner info" role="status">
                  Balance on {chosen.invoice_number} is GHS {ghsAmount(chosen.total_pesewas - chosen.amount_paid_pesewas)}.
                </div>
              ) : null}
              <div className="g2 grid">
                <div className="field">
                  <label htmlFor="pay-method">Method</label>
                  <select id="pay-method" className="input" {...form.register('method')}>
                    {METHODS.map((method) => (
                      <option key={method.value} value={method.value}>
                        {method.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="pay-amount">Amount (GHS)</label>
                  <input
                    id="pay-amount"
                    className={errors.amountGHS ? 'input err' : 'input'}
                    type="number"
                    step="0.01"
                    min="0.01"
                    inputMode="decimal"
                    placeholder="0.00"
                    aria-invalid={Boolean(errors.amountGHS)}
                    {...form.register('amountGHS', {
                      setValueAs: (value) => {
                        const parsed =
                          typeof value === 'number' ? value : parseFloat(String(value));
                        return Number.isFinite(parsed) ? parsed : 0;
                      },
                    })}
                  />
                  {errors.amountGHS?.message ? (
                    <span className="hint err">{errors.amountGHS.message}</span>
                  ) : (
                    <span className="hint">A partial amount is allowed.</span>
                  )}
                </div>
              </div>
              <div className="field">
                <label htmlFor="pay-reference">
                  Reference <span className="muted">(optional)</span>
                </label>
                <input
                  id="pay-reference"
                  className="input"
                  placeholder="Transaction reference"
                  {...form.register('gatewayReference')}
                />
              </div>
              <div className="row end">
                <button type="button" className="btn" onClick={() => setShowRecord(false)}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className={recording ? 'btn primary nt-loading' : 'btn primary'}
                  data-variant="primary"
                  disabled={recording}
                >
                  Record payment
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
