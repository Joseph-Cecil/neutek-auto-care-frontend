'use client';

import { Suspense, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { TopProgress } from '@/components/ui/top-progress';
import { useServices } from '@/hooks/useServices';
import { useCreateBooking } from '@/hooks/useBooking';
import { useMyCustomer } from '@/hooks/useCustomers';
import { useCustomerVehicles } from '@/hooks/useVehicles';
import { useAuthStore } from '@/stores/auth.store';
import { formatDuration, ghsAmount } from '@/lib/utils/format';
import type { Booking } from '@/lib/dto';

const STEPS = ['Services', 'Date and time', 'Your details', 'Confirm'];
const SLOTS = Array.from({ length: 20 }, (_, index) => {
  const minutes = 8 * 60 + index * 30;
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
});

function todayStamp() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

function BookingContent() {
  const preselected = useSearchParams().get('service');
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const customer = useMyCustomer();
  const vehicles = useCustomerVehicles(customer.data?.id ?? '');
  const services = useServices({ active: true, limit: 100 });
  const create = useCreateBooking();

  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<string[]>(preselected ? [preselected] : []);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [car, setCar] = useState('');
  const [vehicleId, setVehicleId] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [booking, setBooking] = useState<Booking | null>(null);

  const rows = services.data?.data ?? [];
  const chosen = rows.filter((service) => selected.includes(service.id));
  const total = chosen.reduce((sum, service) => sum + service.base_price_pesewas, 0);
  const signedIn = Boolean(isAuthenticated && customer.data);
  const slots = useMemo(() => {
    if (date !== todayStamp()) return SLOTS;
    const earliest = Date.now() + 2 * 60 * 60 * 1000;
    return SLOTS.filter((slot) => new Date(`${date}T${slot}`).getTime() >= earliest);
  }, [date]);

  const toggle = (id: string) => {
    setSelected((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  };

  const next = () => {
    const nextErrors: string[] = [];
    if (step === 0 && selected.length === 0) nextErrors.push('Choose at least one service.');
    if (step === 1) {
      if (!date) nextErrors.push('Choose a date.');
      if (!time) nextErrors.push('Choose a time.');
      if (date && time && new Date(`${date}T${time}`).getTime() < Date.now() + 2 * 60 * 60 * 1000) {
        nextErrors.push('The earliest time is two hours from now.');
      }
    }
    if (step === 2 && !signedIn) {
      if (!name.trim()) nextErrors.push('Enter your name.');
      if (phone.trim().length < 9) nextErrors.push('Enter a phone number.');
    }
    setErrors(nextErrors);
    if (nextErrors.length === 0) setStep((value) => value + 1);
  };

  const confirm = () => {
    const scheduledAt = `${date}T${time}`;
    const payload = signedIn && customer.data
      ? {
          customerId: customer.data.id,
          vehicleId: vehicleId || undefined,
          serviceIds: selected,
          scheduledAt,
        }
      : {
          walkInName: name.trim(),
          walkInPhone: phone.trim(),
          walkInVehicleInfo: car.trim() ? { description: car.trim() } : undefined,
          serviceIds: selected,
          scheduledAt,
        };
    create.mutate(payload, {
      onSuccess: (res) => setBooking(res.data.data),
    });
  };

  if (booking) {
    return (
      <div className="card">
        <div className="empty">
          <div className="ic" style={{ background: 'var(--bg-success)', color: 'var(--text-success)' }}>✓</div>
          <h2>You are booked in</h2>
          <p className="muted">Your booking number is <b>{booking.booking_number}</b>. We will call to confirm.</p>
          <div className="row" style={{ justifyContent: 'center', marginTop: 8 }}>
            <button type="button" className="btn" onClick={() => { setBooking(null); setStep(0); setSelected([]); }}>Book another</button>
            <Link href="/tracking" className="btn primary">Track your car</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card stack s">
      <TopProgress active={services.isLoading || create.isPending} />
      <div className="row" role="list" aria-label="Steps">
        {STEPS.map((label, index) => (
          <span key={label} role="listitem" className={index === step ? 'pill brand' : 'pill'}>
            {index + 1}. {label}
          </span>
        ))}
      </div>
      {errors.length > 0 ? (
        <div className="errsum" role="alert">
          <b>Fix these fields</b>
          <ul>{errors.map((error) => <li key={error}>{error}</li>)}</ul>
        </div>
      ) : null}
      {create.isError ? <div className="banner" role="alert">The booking was not saved. Check the details and try again.</div> : null}
      {step === 0 ? (
        <>
          <h2>Choose services</h2>
          {services.isError && !services.data ? <div className="banner" role="alert">Could not load services.</div> : null}
          {services.isLoading ? <p className="muted">Loading services.</p> : null}
          {!services.isLoading && rows.length === 0 && !services.isError ? <p className="muted">No services are available to book.</p> : null}
          <div className="stack s">
            {rows.map((service) => {
              const on = selected.includes(service.id);
              return (
                <button key={service.id} type="button" className={on ? 'chk on' : 'chk'} aria-pressed={on} onClick={() => toggle(service.id)}>
                  <span>
                    <span className="b" style={{ display: 'block' }}>{service.name}</span>
                    <span className="faint sm">{formatDuration(service.estimated_duration_minutes)}</span>
                  </span>
                  <span className="b" style={{ marginLeft: 'auto', fontVariantNumeric: 'tabular-nums' }}>GHS {ghsAmount(service.base_price_pesewas)}</span>
                </button>
              );
            })}
          </div>
          <div className="row sb">
            <span className="muted">Running total</span>
            <span className="b" style={{ fontSize: 18, fontVariantNumeric: 'tabular-nums' }}>GHS {ghsAmount(total)}</span>
          </div>
        </>
      ) : null}
      {step === 1 ? (
        <>
          <h2>Date and time</h2>
          <p className="muted sm">The earliest time is two hours from now.</p>
          <div className="grid g2">
            <div className="field">
              <label htmlFor="bk-date">Date</label>
              <input id="bk-date" className="input" type="date" min={todayStamp()} value={date} onChange={(event) => { setDate(event.target.value); setTime(''); }} />
            </div>
            <div className="field">
              <label htmlFor="bk-time">Time</label>
              <select id="bk-time" className="input" value={time} onChange={(event) => setTime(event.target.value)}>
                <option value="">Choose a time</option>
                {slots.map((slot) => <option key={slot} value={slot}>{slot}</option>)}
              </select>
            </div>
          </div>
          {date === todayStamp() && slots.length === 0 ? <p className="hint">No slots are left today. Choose a later date.</p> : null}
        </>
      ) : null}
      {step === 2 ? (
        <>
          <h2>Your details</h2>
          {signedIn && user ? (
            <>
              <div className="banner info">Signed in as {user.firstName} {user.lastName}, so we already have your name and phone.</div>
              <div className="field">
                <label htmlFor="bk-veh">Vehicle</label>
                <select id="bk-veh" className="input" value={vehicleId} onChange={(event) => setVehicleId(event.target.value)}>
                  <option value="">No vehicle on file</option>
                  {(vehicles.data ?? []).map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>{vehicle.year} {vehicle.make} {vehicle.model} · {vehicle.license_plate}</option>
                  ))}
                </select>
              </div>
            </>
          ) : (
            <>
              <div className="grid g2">
                <div className="field">
                  <label htmlFor="bk-name">Full name</label>
                  <input id="bk-name" className="input" value={name} onChange={(event) => setName(event.target.value)} placeholder="Yaw Boateng" />
                </div>
                <div className="field">
                  <label htmlFor="bk-phone">Phone</label>
                  <input id="bk-phone" className="input" type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="055 200 1190" />
                </div>
              </div>
              <div className="field">
                <label htmlFor="bk-car">Car</label>
                <input id="bk-car" className="input" value={car} onChange={(event) => setCar(event.target.value)} placeholder="2014 Nissan Sentra" />
                <span className="hint">Optional, but it helps us prepare.</span>
              </div>
            </>
          )}
        </>
      ) : null}
      {step === 3 ? (
        <>
          <h2>Confirm</h2>
          <dl className="kv">
            <dt>Services</dt>
            <dd>
              {chosen.map((service) => (
                <div key={service.id} className="row sb"><span>{service.name}</span><span className="num">GHS {ghsAmount(service.base_price_pesewas)}</span></div>
              ))}
            </dd>
            <dt>Total (GHS)</dt>
            <dd className="b">{ghsAmount(total)}</dd>
            <dt>When</dt>
            <dd>{date} {time}</dd>
            <dt>Who</dt>
            <dd>{signedIn && user ? `${user.firstName} ${user.lastName}` : name}</dd>
          </dl>
        </>
      ) : null}
      <div className="row end" style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 16 }}>
        {step > 0 ? <button type="button" className="btn" onClick={() => setStep((value) => value - 1)}>Back</button> : null}
        {step < 3 ? <button type="button" className="btn primary" onClick={next}>Continue</button> : null}
        {step === 3 ? (
          <button type="button" className={create.isPending ? 'btn primary nt-loading' : 'btn primary'} data-variant="primary" disabled={create.isPending} onClick={confirm}>
            Confirm booking
          </button>
        ) : null}
      </div>
    </div>
  );
}

export default function BookingPage() {
  return (
    <div className="pubwrap">
      <section className="sec" style={{ maxWidth: 760, margin: '0 auto' }}>
        <h1 style={{ fontSize: 32 }}>Book service</h1>
        <p className="muted" style={{ margin: '8px 0 24px' }}>Four quick steps. We will confirm by phone.</p>
        <Suspense fallback={<p className="muted">Loading the form.</p>}>
          <BookingContent />
        </Suspense>
      </section>
    </div>
  );
}
