'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { TopProgress } from '@/components/ui/top-progress';
import { PageSkeleton } from '@/components/ui/page-skeleton';
import { useFleetAccounts, useCreateFleetAccount } from '@/hooks/useFleet';
import { ghsAmount, ghsToPesewas, formatPhone } from '@/lib/utils/format';

const fleetSchema = z.object({
  companyName: z.string().min(1, 'Company name required'),
  contactName: z.string().min(1, 'Contact name required'),
  phone: z.string().min(9).max(20),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().max(500).optional(),
  creditLimitGHS: z.number().min(0),
});
type FleetFormData = z.infer<typeof fleetSchema>;

function Pager({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <div className="row">
      <button type="button" className="btn sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
        Previous
      </button>
      <span className="muted sm">
        Page {page} of {totalPages}
      </span>
      <button
        type="button"
        className="btn sm"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Next
      </button>
    </div>
  );
}

export default function AdminFleetPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [showAdd, setShowAdd] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, isError } = useFleetAccounts({ page, limit: 20 });
  const { mutate: createAccount, isPending: creating } = useCreateFleetAccount();

  const accounts = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;
  const total = data?.total ?? 0;
  const failed = isError && !data;

  const form = useForm<FleetFormData>({
    resolver: zodResolver(fleetSchema),
    defaultValues: {
      companyName: '',
      contactName: '',
      phone: '',
      email: '',
      address: '',
      creditLimitGHS: 0,
    },
  });

  useEffect(() => {
    if (!showAdd) return;
    dialogRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setShowAdd(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [showAdd]);

  const onSubmit = (values: FleetFormData) => {
    createAccount(
      {
        companyName: values.companyName,
        contactName: values.contactName,
        phone: values.phone,
        email: values.email || undefined,
        address: values.address || undefined,
        creditLimitPesewas: ghsToPesewas(values.creditLimitGHS),
      },
      {
        onSuccess: () => {
          setShowAdd(false);
          form.reset();
        },
      },
    );
  };

  if (isLoading && !data) {
    return (
      <>
        <TopProgress active />
        <PageSkeleton kind="list" />
      </>
    );
  }

  const messages = Object.values(form.formState.errors)
    .map((issue) => issue?.message)
    .filter((message): message is string => Boolean(message));

  return (
    <>
      <TopProgress active={isLoading || creating} />
      <div className="pagehead">
        <div className="ttl">
          <h1>Fleet</h1>
          <p className="muted">
            Companies that bring several vehicles on account. {total} accounts.
          </p>
        </div>
        <div className="row">
          <button type="button" className="btn primary" onClick={() => setShowAdd(true)}>
            Add fleet account
          </button>
        </div>
      </div>

      {failed ? (
        <div className="banner" role="alert">
          Failed to load fleet accounts.
        </div>
      ) : accounts.length === 0 ? (
        <div className="card">
          <div className="empty">
            <h2>No fleet accounts yet</h2>
            <p className="muted">Add a company to bill several vehicles on one account.</p>
            <button type="button" className="btn primary" onClick={() => setShowAdd(true)}>
              Add fleet account
            </button>
          </div>
        </div>
      ) : (
        <div className="stack">
          <div className="card flush">
            <div className="tw">
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Company</th>
                    <th>Contact</th>
                    <th>Phone</th>
                    <th className="num">Credit limit</th>
                    <th className="num">Outstanding</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {accounts.map((account) => (
                    <tr
                      key={account.id}
                      className="click"
                      onClick={() => router.push('/admin/fleet/' + account.id)}
                    >
                      <td>
                        <button
                          type="button"
                          className="lnk"
                          onClick={(event) => {
                            event.stopPropagation();
                            router.push('/admin/fleet/' + account.id);
                          }}
                        >
                          {account.company_name}
                        </button>
                      </td>
                      <td>{account.contact_name}</td>
                      <td>{formatPhone(account.phone)}</td>
                      <td className="num">GHS {ghsAmount(account.credit_limit_pesewas)}</td>
                      <td className="num">GHS {ghsAmount(account.outstanding_balance_pesewas)}</td>
                      <td>
                        <span className={account.is_active ? 'pill ok' : 'pill'}>
                          {account.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <Pager page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}

      {showAdd ? (
        <div
          className="scrim"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowAdd(false);
          }}
        >
          <div
            ref={dialogRef}
            className="dlg"
            role="dialog"
            aria-modal="true"
            aria-labelledby="fleet-add-title"
            tabIndex={-1}
          >
            <h2 id="fleet-add-title">Add fleet account</h2>
            <form className="stack s" noValidate onSubmit={form.handleSubmit(onSubmit)}>
              {messages.length > 0 ? (
                <div className="errsum" role="alert">
                  <b>Fix these fields</b>
                  <ul>
                    {messages.map((message) => (
                      <li key={message}>{message}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              <div className="field">
                <label htmlFor="fleet-company">Company name</label>
                <input
                  id="fleet-company"
                  className={form.formState.errors.companyName ? 'input err' : 'input'}
                  {...form.register('companyName')}
                />
                {form.formState.errors.companyName ? (
                  <span className="hint err">{form.formState.errors.companyName.message}</span>
                ) : null}
              </div>
              <div className="grid g2">
                <div className="field">
                  <label htmlFor="fleet-contact">Contact person</label>
                  <input
                    id="fleet-contact"
                    className={form.formState.errors.contactName ? 'input err' : 'input'}
                    {...form.register('contactName')}
                  />
                  {form.formState.errors.contactName ? (
                    <span className="hint err">{form.formState.errors.contactName.message}</span>
                  ) : null}
                </div>
                <div className="field">
                  <label htmlFor="fleet-phone">Phone</label>
                  <input
                    id="fleet-phone"
                    type="tel"
                    className={form.formState.errors.phone ? 'input err' : 'input'}
                    placeholder="0XX XXX XXXX"
                    {...form.register('phone')}
                  />
                  {form.formState.errors.phone ? (
                    <span className="hint err">{form.formState.errors.phone.message}</span>
                  ) : null}
                </div>
              </div>
              <div className="field">
                <label htmlFor="fleet-email">
                  Email <span className="faint">(optional)</span>
                </label>
                <input
                  id="fleet-email"
                  type="email"
                  className={form.formState.errors.email ? 'input err' : 'input'}
                  {...form.register('email')}
                />
                {form.formState.errors.email ? (
                  <span className="hint err">{form.formState.errors.email.message}</span>
                ) : null}
              </div>
              <div className="field">
                <label htmlFor="fleet-address">
                  Address <span className="faint">(optional)</span>
                </label>
                <input id="fleet-address" className="input" {...form.register('address')} />
              </div>
              <div className="field">
                <label htmlFor="fleet-limit">Credit limit (GHS)</label>
                <input
                  id="fleet-limit"
                  type="number"
                  min="0"
                  step="0.01"
                  className={form.formState.errors.creditLimitGHS ? 'input err' : 'input'}
                  {...form.register('creditLimitGHS', { valueAsNumber: true })}
                />
                {form.formState.errors.creditLimitGHS ? (
                  <span className="hint err">{form.formState.errors.creditLimitGHS.message}</span>
                ) : null}
              </div>
              <div className="row end">
                <button type="button" className="btn" onClick={() => setShowAdd(false)}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className={creating ? 'btn primary nt-loading' : 'btn primary'}
                  data-variant="primary"
                  disabled={creating}
                >
                  Create account
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
