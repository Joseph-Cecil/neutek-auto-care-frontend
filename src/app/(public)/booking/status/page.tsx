'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { WorkshopPhoto } from '@/components/media/WorkshopPhoto';
import { useBookingStatus } from '@/hooks/useBookingStatus';
import { formatDateTime } from '@/lib/utils/date';
import type { BookingStatus } from '@/lib/dto';

function statusPill(status: BookingStatus): string {
  if (status === 'confirmed' || status === 'completed') return 'pill ok';
  if (status === 'cancelled' || status === 'no_show') return 'pill bad';
  if (status === 'pending') return 'pill warn';
  return 'pill';
}

function statusLabel(status: BookingStatus): string {
  if (status === 'pending') return 'Waiting for workshop confirmation';
  if (status === 'confirmed') return 'Confirmed';
  if (status === 'cancelled') return 'Cancelled';
  if (status === 'completed') return 'Completed';
  if (status === 'no_show') return 'Marked as no-show';
  return status;
}

function BookingStatusForm() {
  const params = useSearchParams();
  const initialNumber = (params.get('number') ?? '').toUpperCase();
  const initialPhone = params.get('phone') ?? '';

  const [bookingNumber, setBookingNumber] = useState(initialNumber);
  const [phone, setPhone] = useState(initialPhone);
  const [submitted, setSubmitted] = useState(
    () => Boolean(initialNumber && initialPhone.replace(/\D/g, '').slice(-4).length === 4),
  );
  const [formError, setFormError] = useState('');

  const last4 = phone.replace(/\D/g, '').slice(-4);
  const lookupNumber = submitted ? bookingNumber.trim().toUpperCase() : '';
  const lookupPhone = submitted ? last4 : '';
  const status = useBookingStatus(lookupNumber, lookupPhone);

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const number = bookingNumber.trim().toUpperCase();
    const digits = phone.replace(/\D/g, '').slice(-4);
    if (!number) {
      setFormError('Enter your booking number.');
      setSubmitted(false);
      return;
    }
    if (digits.length !== 4) {
      setFormError('Enter the last 4 digits of the phone on the booking.');
      setSubmitted(false);
      return;
    }
    setFormError('');
    setBookingNumber(number);
    setSubmitted(true);
  };

  return (
    <>
      <form className="card stack s" onSubmit={onSubmit}>
        {formError ? <div className="errsum" role="alert"><b>{formError}</b></div> : null}
        <div className="field">
          <label htmlFor="bk-status-number">Booking number</label>
          <input
            id="bk-status-number"
            className="input"
            value={bookingNumber}
            onChange={(event) => setBookingNumber(event.target.value.toUpperCase())}
            placeholder="BK-2026-000001"
          />
        </div>
        <div className="field">
          <label htmlFor="bk-status-phone">Last 4 digits of the phone</label>
          <input
            id="bk-status-phone"
            className="input"
            inputMode="numeric"
            autoComplete="off"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="4410"
          />
          <span className="hint">Use the phone number you gave when you booked.</span>
        </div>
        <div className="row end">
          <button type="submit" className="btn primary">Check status</button>
        </div>
      </form>

      {submitted ? (
        <div className="card stack s" style={{ marginTop: 16 }}>
          {status.isLoading ? <p className="muted">Looking up your booking.</p> : null}
          {status.isError ? (
            <div className="banner" role="alert">
              No booking matched that number and phone. Check the details and try again.
            </div>
          ) : null}
          {status.data ? (
            <>
              <div className="stack s">
                <div>
                  <div className="faint sm">Booking</div>
                  <div className="b" style={{ fontSize: 20 }}>{status.data.bookingNumber}</div>
                </div>
                <span className={statusPill(status.data.status)} style={{ alignSelf: 'flex-start', whiteSpace: 'normal' }}>
                  {statusLabel(status.data.status)}
                </span>
              </div>
              <dl className="kv">
                <dt>Scheduled</dt>
                <dd>{formatDateTime(status.data.scheduledAt)}</dd>
                <dt>Services</dt>
                <dd>{status.data.serviceCount} selected</dd>
                {status.data.jobNumber ? (
                  <>
                    <dt>Job number</dt>
                    <dd className="b">{status.data.jobNumber}</dd>
                  </>
                ) : null}
              </dl>
              {status.data.jobNumber ? (
                <div className="banner ok">
                  Your car is in the workshop. Track live progress with the job number.
                  <div className="row" style={{ marginTop: 8 }}>
                    <Link
                      href={`/tracking/${encodeURIComponent(status.data.jobNumber)}?phone=${lookupPhone}`}
                      className="btn primary"
                    >
                      Track your car
                    </Link>
                  </div>
                </div>
              ) : status.data.status === 'pending' ? (
                <p className="muted">
                  We have your request. The workshop will call to confirm the slot. Live tracking starts after the job is opened.
                </p>
              ) : status.data.status === 'confirmed' ? (
                <p className="muted">
                  Your visit is confirmed. Live tracking becomes available once the workshop opens the job on arrival.
                </p>
              ) : null}
            </>
          ) : null}
        </div>
      ) : null}
    </>
  );
}

export default function BookingStatusPage() {
  return (
    <div className="pubwrap">
      <section className="sec" style={{ maxWidth: 640, margin: '0 auto' }}>
        <WorkshopPhoto
          image="focusedTech"
          style={{ minHeight: 200, marginBottom: 24 }}
          caption="Check a booking before you arrive"
        />
        <h1 style={{ fontSize: 32 }}>Check booking</h1>
        <p className="muted" style={{ margin: '8px 0 24px' }}>
          Enter the booking number from your confirmation, and the last 4 digits of the phone on the booking.
        </p>
        <Suspense fallback={<p className="muted">Loading the form.</p>}>
          <BookingStatusForm />
        </Suspense>
      </section>
    </div>
  );
}
