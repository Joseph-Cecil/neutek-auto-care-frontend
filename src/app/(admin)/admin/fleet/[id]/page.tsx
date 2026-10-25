'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { TopProgress } from '@/components/ui/top-progress';
import { PageSkeleton } from '@/components/ui/page-skeleton';
import { useFleetAccount, useFleetVehicles, useAddFleetVehicle } from '@/hooks/useFleet';
import { vehicleDal } from '@/lib/dal/vehicle.dal';
import { queryKeys } from '@/lib/api/queryKeys';
import { ghsAmount, formatPhone } from '@/lib/utils/format';
import type { Vehicle } from '@/lib/dto';

const addVehicleSchema = z.object({
  vehicleId: z.string().min(1, 'Choose a vehicle.'),
  driverName: z.string().optional(),
  driverPhone: z.string().min(9).max(20).optional().or(z.literal('')),
  notes: z.string().optional(),
});
type AddVehicleFormData = z.infer<typeof addVehicleSchema>;

function vehicleLabel(vehicle: Vehicle) {
  return `${vehicle.license_plate} · ${vehicle.year} ${vehicle.make} ${vehicle.model}`;
}

export default function AdminFleetDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState('');
  const [picked, setPicked] = useState<Vehicle | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const { data: account, isLoading: accountLoading, isError: accountError } = useFleetAccount(id);
  const {
    data: vehicles,
    isLoading: vehiclesLoading,
    isError: vehiclesError,
  } = useFleetVehicles(id);
  const { mutate: addVehicle, isPending: adding } = useAddFleetVehicle(id);

  const matches = useQuery({
    queryKey: queryKeys.vehicles.list({ search }),
    queryFn: async () => {
      const res = await vehicleDal.list({ search, limit: 8 });
      return res.data.data;
    },
    enabled: showAdd,
  });

  const form = useForm<AddVehicleFormData>({
    resolver: zodResolver(addVehicleSchema),
    defaultValues: { vehicleId: '', driverName: '', driverPhone: '', notes: '' },
  });
  const vehicleId = form.watch('vehicleId');

  useEffect(() => {
    if (!showAdd) return;
    dialogRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setShowAdd(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [showAdd]);

  const closeAdd = () => {
    setShowAdd(false);
    setSearch('');
    setPicked(null);
    form.reset();
  };

  const onSubmit = (values: AddVehicleFormData) => {
    addVehicle(
      {
        vehicleId: values.vehicleId,
        driverName: values.driverName || undefined,
        driverPhone: values.driverPhone || undefined,
        notes: values.notes || undefined,
      },
      { onSuccess: closeAdd },
    );
  };

  if (accountLoading && !account) {
    return (
      <>
        <TopProgress active />
        <PageSkeleton kind="detail" />
      </>
    );
  }

  if ((accountError && !account) || !account) {
    return (
      <>
        <div className="pagehead">
          <div className="ttl">
            <div className="row">
              <Link href="/admin/fleet" className="btn sm">
                Back to fleet
              </Link>
            </div>
            <h1 style={{ marginTop: 8 }}>Fleet account</h1>
          </div>
        </div>
        <div className="banner" role="alert">
          Could not load this fleet account.
        </div>
      </>
    );
  }

  const creditLeft = account.credit_limit_pesewas - account.outstanding_balance_pesewas;
  const messages = Object.values(form.formState.errors)
    .map((issue) => issue?.message)
    .filter((message): message is string => Boolean(message));

  return (
    <>
      <TopProgress active={accountLoading || vehiclesLoading || adding || matches.isFetching} />
      <div className="pagehead">
        <div className="ttl">
          <div className="row">
            <Link href="/admin/fleet" className="btn sm">
              Back to fleet
            </Link>
          </div>
          <h1 style={{ marginTop: 8 }}>{account.company_name}</h1>
          <p className="muted">
            Contact {account.contact_name}, {formatPhone(account.phone)}
          </p>
        </div>
      </div>

      <div className="stack">
        <div className="card">
          <div className="grid g4">
            <div className="fig">
              <span className="l">Credit limit</span>
              <span className="v">GHS {ghsAmount(account.credit_limit_pesewas)}</span>
            </div>
            <div className="fig">
              <span className="l">Outstanding</span>
              <span className="v">GHS {ghsAmount(account.outstanding_balance_pesewas)}</span>
            </div>
            <div className="fig">
              <span className="l">Credit left</span>
              <span className="v">GHS {ghsAmount(creditLeft)}</span>
            </div>
            <div className="fig">
              <span className="l">Email</span>
              <span className="v" style={{ fontSize: 16 }}>
                {account.email ?? '—'}
              </span>
            </div>
          </div>
          {account.address ? (
            <p className="muted" style={{ marginTop: 16 }}>
              {account.address}
            </p>
          ) : null}
        </div>

        <div className="card flush">
          <div className="row sb" style={{ padding: '20px 24px 8px' }}>
            <h2>Vehicles</h2>
            <button type="button" className="btn sm" onClick={() => setShowAdd(true)}>
              Add vehicle
            </button>
          </div>
          {vehiclesLoading && !vehicles ? (
            <p className="muted" style={{ padding: '8px 24px 20px' }}>
              Loading vehicles.
            </p>
          ) : vehiclesError && !vehicles ? (
            <div className="banner" role="alert" style={{ margin: '8px 24px 20px' }}>
              Failed to load fleet vehicles.
            </div>
          ) : !vehicles || vehicles.length === 0 ? (
            <div className="empty">
              <h2>No vehicles yet</h2>
              <p className="muted">Add an existing vehicle to this fleet account.</p>
              <button type="button" className="btn sm" onClick={() => setShowAdd(true)}>
                Add vehicle
              </button>
            </div>
          ) : (
            <div className="tw">
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Vehicle</th>
                    <th>Driver</th>
                    <th>Driver phone</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {vehicles.map((vehicle) => (
                    <tr key={vehicle.id}>
                      <td className="b">{vehicle.vehicle_id}</td>
                      <td>{vehicle.driver_name || '—'}</td>
                      <td>{vehicle.driver_phone ? formatPhone(vehicle.driver_phone) : '—'}</td>
                      <td>{vehicle.notes || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showAdd ? (
        <div
          className="scrim"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeAdd();
          }}
        >
          <div
            ref={dialogRef}
            className="dlg"
            role="dialog"
            aria-modal="true"
            aria-labelledby="fleet-vehicle-title"
            tabIndex={-1}
          >
            <h2 id="fleet-vehicle-title">Add vehicle to fleet</h2>
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
                <label htmlFor="fleet-vehicle-search">Vehicle</label>
                <input type="hidden" {...form.register('vehicleId')} />
                <input
                  id="fleet-vehicle-search"
                  className={form.formState.errors.vehicleId ? 'input err' : 'input'}
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Plate, make, or model"
                  autoComplete="off"
                />
                {picked ? <span className="hint">Selected: {vehicleLabel(picked)}</span> : (
                  <span className="hint">Search, then choose a vehicle.</span>
                )}
                {form.formState.errors.vehicleId ? (
                  <span className="hint err">{form.formState.errors.vehicleId.message}</span>
                ) : null}
                {matches.isError && !matches.data ? (
                  <span className="hint err">Could not search vehicles.</span>
                ) : null}
                <div className="pick">
                  {(matches.data ?? []).map((vehicle) => (
                    <button
                      key={vehicle.id}
                      type="button"
                      aria-pressed={vehicleId === vehicle.id}
                      onClick={() => {
                        form.setValue('vehicleId', vehicle.id, { shouldValidate: true });
                        setPicked(vehicle);
                      }}
                    >
                      <span className="b">{vehicle.license_plate}</span>
                      <span className="faint sm">
                        {vehicle.year} {vehicle.make} {vehicle.model}
                      </span>
                    </button>
                  ))}
                  {!matches.isLoading && (matches.data ?? []).length === 0 ? (
                    <p className="muted sm" style={{ padding: 12 }}>
                      No vehicles match.
                    </p>
                  ) : null}
                </div>
              </div>
              <div className="field">
                <label htmlFor="fleet-driver">
                  Driver name <span className="faint">(optional)</span>
                </label>
                <input id="fleet-driver" className="input" placeholder="John Driver" {...form.register('driverName')} />
              </div>
              <div className="field">
                <label htmlFor="fleet-driver-phone">
                  Driver phone <span className="faint">(optional)</span>
                </label>
                <input
                  id="fleet-driver-phone"
                  type="tel"
                  className={form.formState.errors.driverPhone ? 'input err' : 'input'}
                  placeholder="0XX XXX XXXX"
                  {...form.register('driverPhone')}
                />
                {form.formState.errors.driverPhone ? (
                  <span className="hint err">{form.formState.errors.driverPhone.message}</span>
                ) : null}
              </div>
              <div className="field">
                <label htmlFor="fleet-notes">
                  Notes <span className="faint">(optional)</span>
                </label>
                <input id="fleet-notes" className="input" {...form.register('notes')} />
              </div>
              <div className="row end">
                <button type="button" className="btn" onClick={closeAdd}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className={adding ? 'btn primary nt-loading' : 'btn primary'}
                  data-variant="primary"
                  disabled={adding}
                >
                  Add vehicle
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
