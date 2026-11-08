'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PageSkeleton } from '@/components/ui/page-skeleton';
import { TopProgress } from '@/components/ui/top-progress';
import {
  useCustomers, useCreateCustomer, useUpdateCustomer, useDeleteCustomer,
} from '@/hooks/useCustomers';
import { useCustomerVehicles } from '@/hooks/useVehicles';
import { useAdminJobs } from '@/hooks/useAdminJobs';
import { customerSchema, type CustomerFormData } from '@/lib/validations/customer.schema';
import { fullName, formatPhone } from '@/lib/utils/format';
import { formatDate } from '@/lib/utils/date';
import { getStatusMeta } from '@/lib/utils/jobStatus';
import type { Customer, JobStatus } from '@/lib/dto';

function jobPill(status: JobStatus) {
  if (status === 'cancelled' || status === 'quote_rejected') return 'pill bad';
  if (status === 'completed' || status === 'ready_for_pickup' || status === 'quote_approved') return 'pill ok';
  if (status === 'diagnosing' || status === 'quality_check' || status === 'quote_sent') return 'pill warn';
  if (status === 'in_progress') return 'pill brand';
  return 'pill';
}

function Pager({ page, pages, onPage }: { page: number; pages: number; onPage: (page: number) => void }) {
  if (pages <= 1) return null;
  return (
    <div className="row end">
      <button type="button" className="btn sm" disabled={page <= 1} onClick={() => onPage(page - 1)}>Previous</button>
      <span className="muted sm">Page {page} of {pages}</span>
      <button type="button" className="btn sm" disabled={page >= pages} onClick={() => onPage(page + 1)}>Next</button>
    </div>
  );
}

function Dialog({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="scrim" style={{ zIndex: 90 }} onMouseDown={onClose}>
      <div
        className="dlg"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dlg-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="row sb">
          <h2 id="dlg-title">{title}</h2>
          <button type="button" className="btn ghost sm" onClick={onClose}>Close</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function CustomerForm({
  defaultValues,
  onSubmit,
  isPending,
  submitLabel,
}: {
  defaultValues?: Partial<CustomerFormData>;
  onSubmit: (data: CustomerFormData) => void;
  isPending: boolean;
  submitLabel: string;
}) {
  const form = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: { firstName: '', lastName: '', phone: '', email: '', address: '', notes: '', ...defaultValues },
  });
  const messages = Object.values(form.formState.errors).map((error) => error?.message).filter(Boolean) as string[];

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="stack s" noValidate>
      {messages.length > 0 ? (
        <div className="errsum" role="alert">
          <b>Fix these fields</b>
          <ul>{messages.map((message) => <li key={message}>{message}</li>)}</ul>
        </div>
      ) : null}
      <div className="grid g2">
        <div className="field">
          <label htmlFor="cu-first">First name</label>
          <input id="cu-first" className={form.formState.errors.firstName ? 'input err' : 'input'} {...form.register('firstName')} />
          {form.formState.errors.firstName ? <span className="hint err">{form.formState.errors.firstName.message}</span> : null}
        </div>
        <div className="field">
          <label htmlFor="cu-last">Last name</label>
          <input id="cu-last" className={form.formState.errors.lastName ? 'input err' : 'input'} {...form.register('lastName')} />
          {form.formState.errors.lastName ? <span className="hint err">{form.formState.errors.lastName.message}</span> : null}
        </div>
      </div>
      <div className="field">
        <label htmlFor="cu-phone">Phone</label>
        <input id="cu-phone" className={form.formState.errors.phone ? 'input err' : 'input'} type="tel" placeholder="0XX XXX XXXX" {...form.register('phone')} />
        {form.formState.errors.phone ? <span className="hint err">{form.formState.errors.phone.message}</span> : null}
      </div>
      <div className="field">
        <label htmlFor="cu-email">Email <span className="faint">(optional)</span></label>
        <input id="cu-email" className={form.formState.errors.email ? 'input err' : 'input'} type="email" {...form.register('email')} />
        {form.formState.errors.email ? <span className="hint err">{form.formState.errors.email.message}</span> : null}
      </div>
      <div className="field">
        <label htmlFor="cu-address">Address <span className="faint">(optional)</span></label>
        <input id="cu-address" className="input" {...form.register('address')} />
      </div>
      <div className="field">
        <label htmlFor="cu-notes">Notes <span className="faint">(optional)</span></label>
        <textarea id="cu-notes" className="input" {...form.register('notes')} />
      </div>
      <div className="row end">
        <button
          type="submit"
          className={isPending ? 'btn primary nt-loading' : 'btn primary'}
          data-variant="primary"
          disabled={isPending}
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

function CustomerDrawer({
  customer,
  onClose,
  onEdit,
  onDelete,
}: {
  customer: Customer;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const vehicles = useCustomerVehicles(customer.id);
  const jobs = useAdminJobs({ customerId: customer.id, limit: 8 });
  const vehicleRows = vehicles.data ?? [];
  const jobRows = jobs.data?.data ?? [];

  return (
    <>
      <div className="scrim" onClick={onClose} />
      <aside className="drawer" role="dialog" aria-modal="true" aria-label="Customer details">
        <div className="row sb">
          <h2>{fullName(customer.first_name, customer.last_name)}</h2>
          <button type="button" className="btn ghost sm" aria-label="Close" onClick={onClose} autoFocus>Close</button>
        </div>
        <section className="stack s">
          <h3>Contact</h3>
          <dl className="kv">
            <dt>Phone</dt>
            <dd>{formatPhone(customer.phone)}</dd>
            <dt>Email</dt>
            <dd>{customer.email || '—'}</dd>
            <dt>Address</dt>
            <dd>{customer.address || '—'}</dd>
            <dt>Joined</dt>
            <dd>{formatDate(customer.created_at)}</dd>
          </dl>
          {customer.is_fleet_customer ? <span className="pill brand">Fleet</span> : null}
          {customer.notes ? <p>{customer.notes}</p> : null}
        </section>
        <section className="stack s">
          <h3>Vehicles</h3>
          {vehicles.isLoading ? <p className="muted">Loading vehicles.</p> : null}
          {vehicles.isError && !vehicles.data ? <div className="banner" role="alert">Could not load vehicles.</div> : null}
          {!vehicles.isLoading && !vehicles.isError && vehicleRows.length === 0 ? <p className="muted">No vehicles yet.</p> : null}
          {vehicleRows.map((vehicle) => (
            <div key={vehicle.id} className="row sb">
              <span>
                <span className="b" style={{ display: 'block' }}>{vehicle.year} {vehicle.make} {vehicle.model}</span>
                <span className="faint sm">{vehicle.license_plate}</span>
              </span>
              <span className="muted sm">{vehicle.mileage != null ? `${vehicle.mileage.toLocaleString()} km` : ''}</span>
            </div>
          ))}
        </section>
        <section className="stack s">
          <h3>Jobs</h3>
          {jobs.isLoading ? <p className="muted">Loading jobs.</p> : null}
          {jobs.isError && !jobs.data ? <div className="banner" role="alert">Could not load jobs.</div> : null}
          {!jobs.isLoading && !jobs.isError && jobRows.length === 0 ? <p className="muted">No jobs yet.</p> : null}
          {jobRows.map((job) => (
            <Link key={job.id} href={`/admin/jobs/${job.id}`} className="row sb" onClick={onClose}>
              <span>
                <span className="b" style={{ display: 'block' }}>{job.job_number}</span>
                <span className="faint sm">{job.title}</span>
              </span>
              <span className={jobPill(job.status)}>{getStatusMeta(job.status).label}</span>
            </Link>
          ))}
        </section>
        <div className="row">
          <button type="button" className="btn" onClick={onEdit}>Edit</button>
          <button type="button" className="btn danger" onClick={onDelete}>Delete</button>
        </div>
      </aside>
    </>
  );
}

export default function AdminCustomersPage() {
  const [draft, setDraft] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showAdd, setShowAdd] = useState(false);
  const [selected, setSelected] = useState<Customer | null>(null);
  const [editCust, setEditCust] = useState<Customer | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setSearch(draft.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [draft]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (editCust) setEditCust(null);
      else if (deleteId) setDeleteId(null);
      else if (showAdd) setShowAdd(false);
      else setSelected(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [editCust, deleteId, showAdd]);

  const { data, isLoading, isError, isFetching } = useCustomers({ search: search || undefined, page, limit: 20 });
  const { mutate: createCustomer, isPending: creating } = useCreateCustomer();
  const { mutate: updateCustomer, isPending: updating } = useUpdateCustomer();
  const { mutate: deleteCustomer, isPending: deleting } = useDeleteCustomer();

  const customers = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;

  if (isLoading) {
    return (
      <>
        <TopProgress active />
        <PageSkeleton kind="list" />
      </>
    );
  }

  return (
    <div className="stack">
      <TopProgress active={isFetching || creating || updating || deleting} />
      <div className="pagehead">
        <div className="ttl">
          <h1>Customers</h1>
          <p className="muted">Everyone we look after, with their cars.{data ? ` ${data.total} customers.` : ''}</p>
        </div>
        <div className="row">
          <button type="button" className="btn primary" onClick={() => setShowAdd(true)}>Add customer</button>
        </div>
      </div>
      <div className="card">
        <div className="field" style={{ maxWidth: 360 }}>
          <label htmlFor="cu-q">Search</label>
          <input
            id="cu-q"
            className="input"
            type="search"
            placeholder="Name, phone or email"
            value={draft}
            onChange={(event) => {
              setDraft(event.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>
      {isError && !data ? (
        <div className="banner" role="alert">Failed to load customers. Please refresh the page.</div>
      ) : null}
      {!isError && customers.length === 0 ? (
        <div className="card">
          <div className="empty">
            <h2>No customers match</h2>
            <p className="muted">{search ? 'Check the spelling, or search by phone number.' : 'No customers yet.'}</p>
            {!search ? <button type="button" className="btn" onClick={() => setShowAdd(true)}>Add customer</button> : null}
          </div>
        </div>
      ) : null}
      {customers.length > 0 ? (
        <div className="card flush">
          <div className="tw">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Fleet</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id} className="click" onClick={() => setSelected(customer)}>
                    <td>
                      <button type="button" className="lnk" onClick={() => setSelected(customer)}>
                        {fullName(customer.first_name, customer.last_name)}
                      </button>
                    </td>
                    <td>{formatPhone(customer.phone)}</td>
                    <td>{customer.email || '—'}</td>
                    <td>{customer.is_fleet_customer ? <span className="pill brand">Fleet</span> : null}</td>
                    <td>{formatDate(customer.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
      {data ? <Pager page={page} pages={totalPages} onPage={setPage} /> : null}
      {selected ? (
        <CustomerDrawer
          customer={selected}
          onClose={() => setSelected(null)}
          onEdit={() => setEditCust(selected)}
          onDelete={() => setDeleteId(selected.id)}
        />
      ) : null}
      {showAdd ? (
        <Dialog title="Add customer" onClose={() => setShowAdd(false)}>
          <CustomerForm
            submitLabel="Save customer"
            onSubmit={(formData) => createCustomer(formData, { onSuccess: () => setShowAdd(false) })}
            isPending={creating}
          />
        </Dialog>
      ) : null}
      {editCust ? (
        <Dialog title="Edit customer" onClose={() => setEditCust(null)}>
          <CustomerForm
            key={editCust.id}
            submitLabel="Save customer"
            defaultValues={{
              firstName: editCust.first_name,
              lastName: editCust.last_name,
              phone: editCust.phone,
              email: editCust.email ?? '',
              address: editCust.address ?? '',
              notes: editCust.notes ?? '',
            }}
            onSubmit={(formData) => updateCustomer(
              { id: editCust.id, body: formData },
              { onSuccess: () => { setEditCust(null); setSelected((current) => current && current.id === editCust.id ? { ...current, first_name: formData.firstName, last_name: formData.lastName, phone: formData.phone, email: formData.email || null, address: formData.address || null, notes: formData.notes || null } : current); } },
            )}
            isPending={updating}
          />
        </Dialog>
      ) : null}
      {deleteId ? (
        <Dialog title="Delete customer" onClose={() => setDeleteId(null)}>
          <p>This will permanently delete the customer. This cannot be undone.</p>
          <div className="row end">
            <button type="button" className="btn" onClick={() => setDeleteId(null)}>Keep customer</button>
            <button
              type="button"
              className={deleting ? 'btn danger nt-loading' : 'btn danger'}
              data-variant="danger"
              disabled={deleting}
              onClick={() => {
                deleteCustomer(deleteId, {
                  onSuccess: () => {
                    setSelected((current) => current?.id === deleteId ? null : current);
                    setDeleteId(null);
                  },
                });
              }}
            >
              Delete
            </button>
          </div>
        </Dialog>
      ) : null}
    </div>
  );
}
