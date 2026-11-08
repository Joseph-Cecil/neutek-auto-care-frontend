'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PageSkeleton } from '@/components/ui/page-skeleton';
import { TopProgress } from '@/components/ui/top-progress';
import { useAdminBookings } from '@/hooks/useAdminBookings';
import { useMyCustomer } from '@/hooks/useCustomers';
import { formatDateTime } from '@/lib/utils/date';
import type { BookingStatus } from '@/lib/dto';

const FILTERS: { label: string; value: BookingStatus | undefined }[] = [
  { label: 'All', value: undefined },
  { label: 'Pending', value: 'pending' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
];

function pill(status: BookingStatus): string {
  if (status === 'confirmed' || status === 'completed') return 'pill ok';
  if (status === 'cancelled' || status === 'no_show') return 'pill bad';
  if (status === 'pending') return 'pill warn';
  return 'pill';
}

export default function PortalBookingsPage() {
  const [status, setStatus] = useState<BookingStatus | undefined>(undefined);
  const [page, setPage] = useState(1);
  const customer = useMyCustomer();
  const { data, isLoading, isError } = useAdminBookings({ page, limit: 10, status });
  const phoneLast4 = (customer.data?.phone ?? '').replace(/\D/g, '').slice(-4);

  const bookings = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;
  const total = data?.total ?? 0;

  return (
    <>
      <TopProgress active={isLoading} />
      {isLoading ? <PageSkeleton kind="list" /> : (
        <>
          <div className="pagehead">
            <div className="ttl">
              <h1>My bookings</h1>
              <p className="muted">Appointments you have requested or confirmed.</p>
              {!isError && data ? <p className="faint sm">{total} {total === 1 ? 'booking' : 'bookings'}</p> : null}
            </div>
            <div className="row">
              <Link href="/booking" className="btn primary">Book service</Link>
              <Link href="/booking/status" className="btn">Check a booking</Link>
            </div>
          </div>

          <div className="tabs" role="tablist" aria-label="Booking status">
            {FILTERS.map(({ label, value }) => (
              <button
                key={label}
                type="button"
                className="tab"
                role="tab"
                aria-selected={status === value}
                onClick={() => { setStatus(value); setPage(1); }}
              >
                {label}
              </button>
            ))}
          </div>

          {isError ? (
            <div className="banner" role="alert">Could not load your bookings.</div>
          ) : bookings.length === 0 ? (
            <div className="card">
              <div className="empty">
                <h2>No bookings yet</h2>
                <p className="muted">Book a service and it will show up here.</p>
                <Link href="/booking" className="btn primary">Book service</Link>
              </div>
            </div>
          ) : (
            <div className="stack s">
              {bookings.map((booking) => (
                <div key={booking.id} className="card row sb m-stack" style={{ alignItems: 'center' }}>
                  <div>
                    <div className="b">{booking.booking_number}</div>
                    <div className="muted sm">{formatDateTime(booking.scheduled_at)}</div>
                    <div className="faint sm">{booking.service_ids.length} service{booking.service_ids.length === 1 ? '' : 's'}</div>
                  </div>
                  <div className="row action-stack" style={{ gap: 8 }}>
                    <span className={pill(booking.status)}>{booking.status.replace('_', ' ')}</span>
                    <Link
                      href={
                        phoneLast4.length === 4
                          ? `/booking/status?number=${encodeURIComponent(booking.booking_number)}&phone=${phoneLast4}`
                          : `/booking/status?number=${encodeURIComponent(booking.booking_number)}`
                      }
                      className="btn sm"
                    >
                      Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {totalPages > 1 ? (
            <div className="row end" style={{ marginTop: 16 }}>
              <button type="button" className="btn sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</button>
              <span className="muted sm">Page {page} of {totalPages}</span>
              <button type="button" className="btn sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</button>
            </div>
          ) : null}
        </>
      )}
    </>
  );
}
