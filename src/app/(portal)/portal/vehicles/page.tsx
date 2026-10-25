'use client';

import { useEffect, useState } from 'react';
import { useForm, Controller, type FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PageSkeleton } from '@/components/ui/page-skeleton';
import { TopProgress } from '@/components/ui/top-progress';
import {
  useCustomerVehicles, useCreateVehicle,
  useUpdateVehicle, useDeleteVehicle,
} from '@/hooks/useVehicles';
import { useMyCustomer } from '@/hooks/useCustomers';
import { vehicleSchema, type VehicleFormData } from '@/lib/validations/vehicle.schema';
import { APP_CONSTANTS } from '@/config/constants';
import type { Vehicle } from '@/lib/dto';

function errorMessages(errors: FieldErrors): string[] {
  return Object.values(errors).flatMap((error) => {
    if (!error || typeof error !== 'object' || !('message' in error)) return [];
    return typeof error.message === 'string' ? [error.message] : [];
  });
}

function VehicleForm({
  prefix,
  defaultValues,
  onSubmit,
  onClose,
  isPending,
}: {
  prefix: string;
  defaultValues?: Partial<VehicleFormData>;
  onSubmit: (data: VehicleFormData) => void;
  onClose: () => void;
  isPending: boolean;
}) {
  const currentYear = new Date().getFullYear();
  const form = useForm<VehicleFormData>({
    resolver:      zodResolver(vehicleSchema),
    defaultValues: {
      make: '', model: '', year: currentYear,
      licensePlate: '', vin: '', color: '', notes: '',
      ...defaultValues,
    },
  });
  const id = (name: string) => prefix + '-' + name;
  const messages = errorMessages(form.formState.errors);

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="stack s">
      {form.formState.isSubmitted && messages.length > 0 ? (
        <div className="errsum" role="alert">
          <b>Fix these fields</b>
          <ul>{messages.map((message) => <li key={message}>{message}</li>)}</ul>
        </div>
      ) : null}
      <div className="grid g2">
        <Controller control={form.control} name="make" render={({ field, fieldState }) => (
          <div className="field">
            <label htmlFor={id('make')}>Make</label>
            <input id={id('make')} className="input" {...field} placeholder="Toyota" list={id('brands')} autoFocus />
            <datalist id={id('brands')}>
              {APP_CONSTANTS.VEHICLE_BRANDS.map((brand) => (
                <option key={brand} value={brand} />
              ))}
            </datalist>
            {fieldState.error ? <span className="hint err">{fieldState.error.message}</span> : null}
          </div>
        )} />
        <Controller control={form.control} name="model" render={({ field, fieldState }) => (
          <div className="field">
            <label htmlFor={id('model')}>Model</label>
            <input id={id('model')} className="input" {...field} placeholder="Camry" />
            {fieldState.error ? <span className="hint err">{fieldState.error.message}</span> : null}
          </div>
        )} />
        <Controller control={form.control} name="year" render={({ field, fieldState }) => (
          <div className="field">
            <label htmlFor={id('year')}>Year</label>
            <input
              id={id('year')}
              className="input"
              type="number"
              min={1900}
              max={currentYear + 1}
              value={Number.isFinite(field.value) ? field.value : ''}
              onChange={(event) => field.onChange(event.target.value === '' ? currentYear : parseInt(event.target.value, 10))}
              onBlur={field.onBlur}
              name={field.name}
              ref={field.ref}
            />
            {fieldState.error ? <span className="hint err">{fieldState.error.message}</span> : null}
          </div>
        )} />
        <Controller control={form.control} name="licensePlate" render={({ field, fieldState }) => (
          <div className="field">
            <label htmlFor={id('plate')}>License plate</label>
            <input
              id={id('plate')}
              className="input"
              placeholder="GR-1234-23"
              value={field.value}
              onChange={(event) => field.onChange(event.target.value.toUpperCase())}
              onBlur={field.onBlur}
              name={field.name}
              ref={field.ref}
            />
            {fieldState.error ? <span className="hint err">{fieldState.error.message}</span> : null}
          </div>
        )} />
        <Controller control={form.control} name="color" render={({ field, fieldState }) => (
          <div className="field">
            <label htmlFor={id('color')}>Colour <span className="muted">(optional)</span></label>
            <input id={id('color')} className="input" {...field} value={field.value ?? ''} placeholder="Silver" />
            {fieldState.error ? <span className="hint err">{fieldState.error.message}</span> : null}
          </div>
        )} />
        <Controller control={form.control} name="mileage" render={({ field, fieldState }) => (
          <div className="field">
            <label htmlFor={id('mileage')}>Mileage <span className="muted">(optional)</span></label>
            <input
              id={id('mileage')}
              className="input"
              type="number"
              min={0}
              placeholder="50000"
              value={field.value ?? ''}
              onChange={(event) => field.onChange(event.target.value ? parseInt(event.target.value, 10) : undefined)}
              onBlur={field.onBlur}
              name={field.name}
              ref={field.ref}
            />
            {fieldState.error ? <span className="hint err">{fieldState.error.message}</span> : null}
          </div>
        )} />
      </div>
      <Controller control={form.control} name="vin" render={({ field, fieldState }) => (
        <div className="field">
          <label htmlFor={id('vin')}>VIN <span className="muted">(optional, 17 characters)</span></label>
          <input
            id={id('vin')}
            className="input"
            maxLength={17}
            placeholder="1HGBH41JXMN109186"
            value={field.value ?? ''}
            onChange={(event) => field.onChange(event.target.value.toUpperCase())}
            onBlur={field.onBlur}
            name={field.name}
            ref={field.ref}
          />
          {fieldState.error ? <span className="hint err">{fieldState.error.message}</span> : null}
        </div>
      )} />
      <Controller control={form.control} name="notes" render={({ field, fieldState }) => (
        <div className="field">
          <label htmlFor={id('notes')}>Notes <span className="muted">(optional)</span></label>
          <input id={id('notes')} className="input" {...field} value={field.value ?? ''} placeholder="Any additional info" />
          {fieldState.error ? <span className="hint err">{fieldState.error.message}</span> : null}
        </div>
      )} />
      <div className="row end">
        <button type="button" className="btn" onClick={onClose}>Cancel</button>
        <button
          type="submit"
          className={isPending ? 'btn primary nt-loading' : 'btn primary'}
          data-variant="primary"
          disabled={isPending}
        >
          Save vehicle
        </button>
      </div>
    </form>
  );
}

function Dialog({
  titleId,
  title,
  onClose,
  children,
}: {
  titleId: string;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <>
      <button type="button" className="scrim" aria-label="Close" tabIndex={-1} onClick={onClose} />
      <div
        className="dlg"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        style={{ position: 'fixed', zIndex: 81, top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
      >
        <h2 id={titleId}>{title}</h2>
        {children}
      </div>
    </>
  );
}

export default function PortalVehiclesPage() {
  const { data: customer, isLoading: customerLoading, isError: customerError } = useMyCustomer();
  const customerId = customer?.id ?? '';

  const { data: vehicles, isLoading: vehiclesLoading, isError: vehiclesError } = useCustomerVehicles(customerId);
  const isLoading = customerLoading || (!!customerId && vehiclesLoading);
  const { mutate: createVehicle, isPending: creating } = useCreateVehicle(customerId);
  const { mutate: updateVehicle, isPending: updating } = useUpdateVehicle(customerId);
  const { mutate: deleteVehicle, isPending: deleting } = useDeleteVehicle(customerId);

  const [showAdd, setShowAdd] = useState(false);
  const [editVehicle, setEditVehicle] = useState<Vehicle | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const dialogOpen = showAdd || !!editVehicle || !!deleteId;

  useEffect(() => {
    if (!dialogOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setShowAdd(false);
      setEditVehicle(null);
      setDeleteId(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [dialogOpen]);

  const handleCreate = (data: VehicleFormData) => {
    createVehicle(
      { ...data, customerId, vin: data.vin || undefined },
      { onSuccess: () => setShowAdd(false) },
    );
  };

  const handleUpdate = (data: VehicleFormData) => {
    if (!editVehicle) return;
    updateVehicle(
      { id: editVehicle.id, body: { ...data, vin: data.vin || undefined } },
      { onSuccess: () => setEditVehicle(null) },
    );
  };

  return (
    <>
      <TopProgress active={isLoading} />
      {isLoading ? <PageSkeleton kind="cards" /> : (
        <>
          <div className="pagehead">
            <div className="ttl">
              <h1>My vehicles</h1>
              <p className="muted">Cars you can book in.</p>
            </div>
            <div className="row">
              <button type="button" className="btn primary" onClick={() => setShowAdd(true)} disabled={!customer}>
                Add vehicle
              </button>
            </div>
          </div>
          {customerError && !customer ? (
            <div className="banner" role="alert">Could not load your customer profile.</div>
          ) : !customer ? (
            <div className="banner" role="alert">Your account doesn&apos;t have a customer profile yet. Please contact support or complete a booking to set up your profile.</div>
          ) : vehiclesError && !vehicles ? (
            <div className="banner" role="alert">Failed to load your vehicles. Please refresh the page.</div>
          ) : !vehicles || vehicles.length === 0 ? (
            <div className="card">
              <div className="empty">
                <h2>No vehicles yet</h2>
                <p className="muted">Add your vehicle to start tracking repairs and booking services.</p>
                <button type="button" className="btn primary" onClick={() => setShowAdd(true)}>Add vehicle</button>
              </div>
            </div>
          ) : (
            <div className="grid g3">
              {vehicles.map((vehicle) => (
                <div key={vehicle.id} className="card stack s">
                  <h2>{vehicle.year} {vehicle.make} {vehicle.model}</h2>
                  <dl className="kv">
                    <dt>Plate</dt>
                    <dd className="b">{vehicle.license_plate}</dd>
                    <dt>Colour</dt>
                    <dd>{vehicle.color || '—'}</dd>
                    <dt>Mileage</dt>
                    <dd>{vehicle.mileage ? vehicle.mileage.toLocaleString() + ' km' : '—'}</dd>
                    {vehicle.vin ? (
                      <>
                        <dt>VIN</dt>
                        <dd>{vehicle.vin}</dd>
                      </>
                    ) : null}
                  </dl>
                  <div className="row">
                    <button type="button" className="btn sm" onClick={() => setEditVehicle(vehicle)}>Edit</button>
                    <button type="button" className="btn sm danger" onClick={() => setDeleteId(vehicle.id)}>Remove</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {showAdd ? (
        <Dialog titleId="veh-add-title" title="Add vehicle" onClose={() => setShowAdd(false)}>
          <VehicleForm prefix="veh-add" onSubmit={handleCreate} onClose={() => setShowAdd(false)} isPending={creating} />
        </Dialog>
      ) : null}

      {editVehicle ? (
        <Dialog titleId="veh-edit-title" title="Edit vehicle" onClose={() => setEditVehicle(null)}>
          <VehicleForm
            prefix="veh-edit"
            defaultValues={{
              make:         editVehicle.make,
              model:        editVehicle.model,
              year:         editVehicle.year,
              licensePlate: editVehicle.license_plate,
              vin:          editVehicle.vin ?? '',
              color:        editVehicle.color ?? '',
              mileage:      editVehicle.mileage ?? undefined,
              notes:        editVehicle.notes ?? '',
            }}
            onSubmit={handleUpdate}
            onClose={() => setEditVehicle(null)}
            isPending={updating}
          />
        </Dialog>
      ) : null}

      {deleteId ? (
        <Dialog titleId="veh-del-title" title="Remove vehicle" onClose={() => setDeleteId(null)}>
          <p>Are you sure you want to remove this vehicle? This cannot be undone.</p>
          <div className="row end">
            <button type="button" className="btn" onClick={() => setDeleteId(null)}>Cancel</button>
            <button
              type="button"
              className={deleting ? 'btn danger nt-loading' : 'btn danger'}
              data-variant="danger"
              disabled={deleting}
              onClick={() => {
                deleteVehicle(deleteId, { onSuccess: () => setDeleteId(null) });
              }}
            >
              Remove
            </button>
          </div>
        </Dialog>
      ) : null}
    </>
  );
}
