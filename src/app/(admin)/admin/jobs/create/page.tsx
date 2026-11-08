'use client';

import { Suspense, useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { TopProgress } from '@/components/ui/top-progress';
import { useCreateJob } from '@/hooks/useAdminJobs';
import { useAdminBooking, useAdminBookings } from '@/hooks/useAdminBookings';
import { useCreateVehicle, useCustomerVehicles } from '@/hooks/useVehicles';
import { useCustomer, useCustomers } from '@/hooks/useCustomers';
import { formatDateTime } from '@/lib/utils/date';
import { formatPhone, fullName } from '@/lib/utils/format';
import { createJobSchema, type CreateJobFormData } from '@/lib/validations/job.schema';
import type { Booking, JobPriority } from '@/lib/dto';

const PRIORITIES: { label: string; value: JobPriority }[] = [
  { label: 'Low', value: 'low' },
  { label: 'Normal', value: 'normal' },
  { label: 'High', value: 'high' },
  { label: 'Urgent', value: 'urgent' },
];

function applyBookingDefaults(booking: Booking) {
  return {
    customerId: booking.customer_id ?? '',
    vehicleId: booking.vehicle_id ?? '',
    serviceIds: booking.service_ids ?? [],
    title: `Booking ${booking.booking_number}`,
    intakeNotes: booking.notes ?? '',
  };
}

function AdminCreateJobContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingFromUrl = searchParams.get('bookingId') ?? '';

  const { mutate: createJob, isPending, isError } = useCreateJob();
  const [draft, setDraft] = useState('');
  const [search, setSearch] = useState('');
  // null = follow URL; string = user override (including '')
  const [bookingOverride, setBookingOverride] = useState<string | null>(null);
  const bookingId = bookingOverride ?? bookingFromUrl;

  const [customerId, setCustomerId] = useState('');
  const [customerLabel, setCustomerLabel] = useState('');
  const [vehicleId, setVehicleId] = useState('');
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<JobPriority>('normal');
  const [description, setDescription] = useState('');
  const [intakeNotes, setIntakeNotes] = useState('');
  const [estimatedCompletionAt, setEstimatedCompletionAt] = useState('');
  const [serviceIds, setServiceIds] = useState<string[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [vehMake, setVehMake] = useState('');
  const [vehModel, setVehModel] = useState('');
  const [vehYear, setVehYear] = useState(String(new Date().getFullYear()));
  const [vehPlate, setVehPlate] = useState('');
  const [appliedBookingId, setAppliedBookingId] = useState('');

  useEffect(() => {
    const timer = window.setTimeout(() => setSearch(draft.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [draft]);

  const customers = useCustomers({ search: search || undefined, limit: 8 });
  const vehicles = useCustomerVehicles(customerId);
  const createVehicle = useCreateVehicle(customerId);
  const linkedBooking = useAdminBooking(bookingId);
  const customerFromBooking = useCustomer(linkedBooking.data?.customer_id ?? '');
  const confirmedBookings = useAdminBookings({ status: 'confirmed', page: 1, limit: 20 });

  const matches = customers.data?.data ?? [];
  const vehicleRows = vehicles.data ?? [];
  const openBookings = (confirmedBookings.data?.data ?? []).filter((row) => !row.job_id);

  const booking = linkedBooking.data && linkedBooking.data.id === bookingId
    ? linkedBooking.data
    : undefined;

  // Adjust local form defaults when a new booking is selected / loaded (React-supported pattern).
  if (booking && booking.id !== appliedBookingId) {
    const defaults = applyBookingDefaults(booking);
    setAppliedBookingId(booking.id);
    setCustomerId(defaults.customerId);
    setVehicleId(defaults.vehicleId);
    setServiceIds(defaults.serviceIds);
    setTitle(defaults.title);
    setIntakeNotes(defaults.intakeNotes);
    setCustomerLabel('');
  } else if (!bookingId && appliedBookingId) {
    setAppliedBookingId('');
  }

  const resolvedCustomerLabel = customerLabel
    || (customerFromBooking.data && customerFromBooking.data.id === customerId
      ? fullName(customerFromBooking.data.first_name, customerFromBooking.data.last_name)
      : '');

  const chooseBooking = (next: string) => {
    setBookingOverride(next);
    if (!next) {
      setAppliedBookingId('');
      return;
    }
    setVehicleId('');
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const nextErrors: string[] = [];
    if (!customerId) nextErrors.push('Choose a customer.');
    if (customerId && !vehicleId) nextErrors.push('Choose a vehicle (add one if the customer has none).');
    if (!title.trim()) nextErrors.push('Give the job a title.');
    const payload: CreateJobFormData = {
      customerId,
      vehicleId,
      title: title.trim(),
      priority,
      description: description.trim() || undefined,
      intakeNotes: intakeNotes.trim() || undefined,
      estimatedCompletionAt: estimatedCompletionAt || undefined,
      bookingId: bookingId || undefined,
      serviceIds: serviceIds.length ? serviceIds : undefined,
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

  const addVehicle = () => {
    const year = Number(vehYear);
    const nextErrors: string[] = [];
    if (!customerId) nextErrors.push('Choose a customer first.');
    if (!vehMake.trim()) nextErrors.push('Vehicle make is required.');
    if (!vehModel.trim()) nextErrors.push('Vehicle model is required.');
    if (!vehPlate.trim()) nextErrors.push('License plate is required.');
    if (!Number.isFinite(year) || year < 1900) nextErrors.push('Enter a valid year.');
    setErrors(nextErrors);
    if (nextErrors.length > 0) return;
    createVehicle.mutate(
      {
        customerId,
        make: vehMake.trim(),
        model: vehModel.trim(),
        year,
        licensePlate: vehPlate.trim().toUpperCase(),
      },
      {
        onSuccess: (res) => {
          setVehicleId(res.data.data.id);
          setShowAddVehicle(false);
          setVehMake('');
          setVehModel('');
          setVehPlate('');
        },
      },
    );
  };

  return (
    <div className="stack">
      <TopProgress
        active={
          isPending
          || customers.isFetching
          || vehicles.isFetching
          || linkedBooking.isFetching
          || createVehicle.isPending
        }
      />
      <div className="pagehead">
        <div className="ttl">
          <div className="row">
            <Link href="/admin/jobs" className="btn sm">Back to jobs</Link>
            <Link href="/admin/bookings" className="btn sm">Bookings</Link>
          </div>
          <h1>New job</h1>
          <p className="muted">
            Open a job when the car arrives. Link the confirmed booking if there is one, then assign a technician on the job card.
          </p>
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
          <h2>Booking (optional)</h2>
          <p className="muted sm">
            Confirm the slot under Bookings first. Then open the job from there, or pick a confirmed booking here.
          </p>
          {booking ? (
            <div className="banner" role="status">
              Linked to <b>{booking.booking_number}</b>
              {' · '}
              {formatDateTime(booking.scheduled_at)}
              {' · '}
              {booking.service_ids.length} service(s)
            </div>
          ) : null}
          <div className="field" style={{ maxWidth: 480 }}>
            <label htmlFor="nj-bk">Confirmed booking</label>
            <select
              id="nj-bk"
              className="input"
              value={bookingId}
              onChange={(event) => chooseBooking(event.target.value)}
            >
              <option value="">No booking link</option>
              {bookingId && !openBookings.some((row) => row.id === bookingId) && booking ? (
                <option value={booking.id}>
                  {booking.booking_number} · {formatDateTime(booking.scheduled_at)}
                </option>
              ) : null}
              {openBookings.map((row) => {
                const name = row.walk_in_name
                  || fullName(row.customer_first_name ?? '', row.customer_last_name ?? '')
                  || 'Customer';
                return (
                  <option key={row.id} value={row.id} disabled={!row.customer_id}>
                    {row.booking_number} · {name} · {formatDateTime(row.scheduled_at)}
                    {!row.customer_id ? ' (needs customer)' : ''}
                  </option>
                );
              })}
            </select>
            {confirmedBookings.isError ? (
              <span className="hint err">Could not load confirmed bookings.</span>
            ) : (
              <span className="hint">Only confirmed bookings without a job are listed.</span>
            )}
          </div>
        </section>

        <section className="stack s">
          <h2>Customer</h2>
          {customerId ? <p>Selected <span className="b">{resolvedCustomerLabel || 'Customer'}</span></p> : null}
          <div className="field">
            <label htmlFor="nj-q">Search customers</label>
            <input
              id="nj-q"
              className="input"
              type="search"
              placeholder="Name or phone"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              disabled={Boolean(bookingId && booking?.customer_id)}
            />
          </div>
          {customers.isError && !customers.data ? (
            <div className="banner" role="alert">Could not load customers.</div>
          ) : null}
          {draft.trim() && !(bookingId && booking?.customer_id) ? (
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
                        setBookingOverride('');
                        setAppliedBookingId('');
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
              <span className="hint">This customer has no vehicles yet — add one below.</span>
            ) : null}
          </div>
          {customerId ? (
            <div className="row">
              <button type="button" className="btn sm" onClick={() => setShowAddVehicle((value) => !value)}>
                {showAddVehicle ? 'Hide add vehicle' : 'Add vehicle'}
              </button>
            </div>
          ) : null}
          {showAddVehicle && customerId ? (
            <div className="grid g2">
              <div className="field">
                <label htmlFor="nv-make">Make</label>
                <input id="nv-make" className="input" value={vehMake} onChange={(event) => setVehMake(event.target.value)} />
              </div>
              <div className="field">
                <label htmlFor="nv-model">Model</label>
                <input id="nv-model" className="input" value={vehModel} onChange={(event) => setVehModel(event.target.value)} />
              </div>
              <div className="field">
                <label htmlFor="nv-year">Year</label>
                <input id="nv-year" className="input" value={vehYear} onChange={(event) => setVehYear(event.target.value)} />
              </div>
              <div className="field">
                <label htmlFor="nv-plate">Plate</label>
                <input id="nv-plate" className="input" value={vehPlate} onChange={(event) => setVehPlate(event.target.value)} />
              </div>
              <div className="row end" style={{ gridColumn: '1 / -1' }}>
                <button
                  type="button"
                  className={createVehicle.isPending ? 'btn primary nt-loading' : 'btn primary'}
                  data-variant="primary"
                  disabled={createVehicle.isPending}
                  onClick={addVehicle}
                >
                  Save vehicle
                </button>
              </div>
            </div>
          ) : null}
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

export default function AdminCreateJobPage() {
  return (
    <Suspense fallback={<div className="stack"><TopProgress active /><p className="muted">Loading…</p></div>}>
      <AdminCreateJobContent />
    </Suspense>
  );
}
