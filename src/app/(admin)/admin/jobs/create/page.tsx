'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { TopProgress } from '@/components/ui/top-progress';
import { useCreateJob } from '@/hooks/useAdminJobs';
import { useCustomers } from '@/hooks/useCustomers';
import { useCustomerVehicles } from '@/hooks/useVehicles';
import { formatPhone, fullName } from '@/lib/utils/format';
import { createJobSchema, type CreateJobFormData } from '@/lib/validations/job.schema';
import type { JobPriority } from '@/lib/dto';

const PRIORITIES: { label: string; value: JobPriority }[] = [
  { label: 'Low', value: 'low' },
  { label: 'Normal', value: 'normal' },
  { label: 'High', value: 'high' },
  { label: 'Urgent', value: 'urgent' },
];

export default function AdminCreateJobPage() {
  const router = useRouter();
  const { mutate: createJob, isPending, isError } = useCreateJob();
  const [draft, setDraft] = useState('');
  const [search, setSearch] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [customerLabel, setCustomerLabel] = useState('');
  const [vehicleId, setVehicleId] = useState('');
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<JobPriority>('normal');
  const [description, setDescription] = useState('');
  const [intakeNotes, setIntakeNotes] = useState('');
  const [estimatedCompletionAt, setEstimatedCompletionAt] = useState('');
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    const timer = window.setTimeout(() => setSearch(draft.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [draft]);

  const customers = useCustomers({ search: search || undefined, limit: 8 });
  const vehicles = useCustomerVehicles(customerId);
  const matches = customers.data?.data ?? [];
  const vehicleRows = vehicles.data ?? [];

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const nextErrors: string[] = [];
    if (!customerId) nextErrors.push('Choose a customer.');
    if (customerId && !vehicleId) nextErrors.push('Choose a vehicle.');
    if (!title.trim()) nextErrors.push('Give the job a title.');
    const payload: CreateJobFormData = {
      customerId,
      vehicleId,
      title: title.trim(),
      priority,
      description: description.trim() || undefined,
      intakeNotes: intakeNotes.trim() || undefined,
      estimatedCompletionAt: estimatedCompletionAt || undefined,
    };
    const parsed = createJobSchema.safeParse(payload);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        if (!nextErrors.includes(issue.message)) nextErrors.push(issue.message);
      }
    }
    setErrors(nextErrors);
    if (nextErrors.length > 0 || !parsed.success) return;
    createJob(parsed.data, {
      onSuccess: (res) => {
        router.push(`/admin/jobs/${res.data.data.id}`);
      },
    });
  };

  return (
    <div className="stack">
      <TopProgress active={isPending || customers.isFetching || vehicles.isFetching} />
      <div className="pagehead">
        <div className="ttl">
          <div className="row">
            <Link href="/admin/jobs" className="btn sm">Back to jobs</Link>
          </div>
          <h1>New job</h1>
          <p className="muted">Receive a car and open its job card.</p>
        </div>
      </div>
      <form className="card stack" onSubmit={onSubmit} noValidate>
        {errors.length > 0 ? (
          <div className="errsum" role="alert">
            <b>Fix these fields</b>
            <ul>{errors.map((error) => <li key={error}>{error}</li>)}</ul>
          </div>
        ) : null}
        {isError ? <div className="banner" role="alert">The job was not created. Check the details and try again.</div> : null}
        <section className="stack s">
          <h2>Customer</h2>
          {customerId ? <p>Selected <span className="b">{customerLabel}</span></p> : null}
          <div className="field">
            <label htmlFor="nj-q">Search customers</label>
            <input
              id="nj-q"
              className="input"
              type="search"
              placeholder="Name or phone"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
            />
          </div>
          {customers.isError && !customers.data ? (
            <div className="banner" role="alert">Could not load customers.</div>
          ) : null}
          {draft.trim() ? (
            draft.trim() !== search || customers.isFetching ? (
              <p className="hint">Searching customers.</p>
            ) : matches.length === 0 ? (
              customers.isError ? null : <p className="hint">No customers match</p>
            ) : (
              <div className="pick" aria-label="Matching customers">
                {matches.map((customer) => {
                  const name = fullName(customer.first_name, customer.last_name);
                  return (
                    <button
                      key={customer.id}
                      type="button"
                      aria-pressed={customerId === customer.id}
                      onClick={() => {
                        setCustomerId(customer.id);
                        setCustomerLabel(name);
                        setVehicleId('');
                      }}
                    >
                      <span className="b">{name}</span>
                      <span className="faint sm">{formatPhone(customer.phone)}</span>
                    </button>
                  );
                })}
              </div>
            )
          ) : null}
        </section>
        <section className="stack s">
          <h2>Vehicle</h2>
          <div className="field" style={{ maxWidth: 420 }}>
            <label htmlFor="nj-v">Vehicle</label>
            <select
              id="nj-v"
              className="input"
              disabled={!customerId || vehicles.isLoading}
              value={vehicleId}
              onChange={(event) => setVehicleId(event.target.value)}
            >
              <option value="">Choose a vehicle</option>
              {vehicleRows.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.year} {vehicle.make} {vehicle.model} · {vehicle.license_plate}
                </option>
              ))}
            </select>
            {!customerId ? <span className="hint">Choose a customer first.</span> : null}
            {customerId && vehicles.isError && !vehicles.data ? (
              <div className="banner" role="alert">Could not load vehicles for this customer.</div>
            ) : null}
            {customerId && !vehicles.isLoading && !vehicles.isError && vehicleRows.length === 0 ? (
              <span className="hint">This customer has no vehicles.</span>
            ) : null}
          </div>
        </section>
        <section className="stack s">
          <h2>Details</h2>
          <div className="grid g2">
            <div className="field">
              <label htmlFor="nj-t">Title</label>
              <input
                id="nj-t"
                className="input"
                value={title}
                placeholder="Short summary of the job"
                onChange={(event) => setTitle(event.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="nj-p">Priority</label>
              <select id="nj-p" className="input" value={priority} onChange={(event) => setPriority(event.target.value as JobPriority)}>
                {PRIORITIES.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="nj-e">Estimated completion</label>
              <input
                id="nj-e"
                className="input"
                type="datetime-local"
                value={estimatedCompletionAt}
                onChange={(event) => setEstimatedCompletionAt(event.target.value)}
              />
            </div>
          </div>
          <div className="field">
            <label htmlFor="nj-d">Description <span className="faint">(optional)</span></label>
            <textarea
              id="nj-d"
              className="input"
              value={description}
              placeholder="Additional details"
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="nj-n">Intake notes <span className="faint">(optional)</span></label>
            <textarea
              id="nj-n"
              className="input"
              value={intakeNotes}
              placeholder="What the customer told us"
              onChange={(event) => setIntakeNotes(event.target.value)}
            />
          </div>
        </section>
        <div className="row end">
          <Link href="/admin/jobs" className="btn">Cancel</Link>
          <button
            type="submit"
            className={isPending ? 'btn primary nt-loading' : 'btn primary'}
            data-variant="primary"
            disabled={isPending}
          >
            Create job
          </button>
        </div>
      </form>
    </div>
  );
}
