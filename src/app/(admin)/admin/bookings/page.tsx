'use client';

import { useState } from 'react';
import { PageSkeleton } from '@/components/ui/page-skeleton';
import { TopProgress } from '@/components/ui/top-progress';
import { useAdminBookings, useCancelBooking, useUpdateBooking } from '@/hooks/useAdminBookings';
import { formatDateTime } from '@/lib/utils/date';
import { formatPhone } from '@/lib/utils/format';
import type { BookingStatus } from '@/lib/dto';

const STATUS_TABS: { label: string; value: BookingStatus | undefined }[] = [
  { label: 'All', value: undefined },
  { label: 'Pending', value: 'pending' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
];

const STATUS_LABEL: Record<BookingStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  completed: 'Completed',
  cancelled: 'Cancelled',
  no_show: 'No show',
};

const STATUS_PILL: Record<BookingStatus, string> = {
  pending: 'pill warn',
  confirmed: 'pill brand',
  completed: 'pill ok',
  cancelled: 'pill bad',
  no_show: 'pill bad',
};

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

export default function AdminBookingsPage() {
  const [status, setStatus] = useState<BookingStatus | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [reasonError, setReasonError] = useState('');

  const { data, isLoading, isError, isFetching } = useAdminBookings({ status, page, limit: 20 });
  const { mutate: updateBooking, isPending: confirming } = useUpdateBooking();
  const { mutate: cancelBooking, isPending: cancelling } = useCancelBooking();

  const bookings = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;
  const total = data?.total ?? 0;
  const cancellingRow = bookings.find((booking) => booking.id === cancelId);

  const closeCancel = () => {
    setCancelId(null);
    setReason('');
    setReasonError('');
  };

  const submitCancel = () => {
    const trimmed = reason.trim();
    if (!cancelId) return;
    if (!trimmed) {
      setReasonError('Give a reason for cancelling.');
      return;
    }
    cancelBooking({ id: cancelId, reason: trimmed }, { onSuccess: closeCancel });
  };

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
      <TopProgress active={isFetching || confirming || cancelling} />
      <div className="pagehead">
        <div className="ttl">
          <h1>Bookings</h1>
          <p className="muted">
            Confirm what customers have asked for and keep the diary honest.
            {data ? ` ${total} ${total === 1 ? 'booking' : 'bookings'}.` : ''}
          </p>
        </div>
      </div>
      <div className="tabs" role="tablist">
        {STATUS_TABS.map(({ label, value }) => (
          <button
            key={label}
            type="button"
            role="tab"
            className="tab"
            aria-selected={status === value}
            onClick={() => {
              setStatus(value);
              setPage(1);
            }}
          >
            {label}
          </button>
        ))}
      </div>
      {isError && !data ? (
        <div className="banner" role="alert">Failed to load bookings. Please refresh the page.</div>
      ) : null}
      {!isError && bookings.length === 0 ? (
        <div className="card">
          <div className="empty">
            <h2>No bookings match</h2>
            <p className="muted">Try another status to see more of the diary.</p>
          </div>
        </div>
      ) : null}
      {bookings.length > 0 ? (
        <div className="card flush">
          <div className="tw">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Number</th>
                  <th>Customer</th>
                  <th>Services</th>
                  <th>Scheduled</th>
                  <th>Status</th>
                  <th><span className="sr">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.id}>
                    <td className="b">{booking.booking_number}</td>
                    <td>
                      <div className="two">
                        <b>{booking.walk_in_name || 'Registered customer'}</b>
                        <span>{booking.walk_in_phone ? formatPhone(booking.walk_in_phone) : '—'}</span>
                      </div>
                    </td>
                    <td>{booking.service_ids.length} service(s)</td>
                    <td>{formatDateTime(booking.scheduled_at)}</td>
                    <td><span className={STATUS_PILL[booking.status]}>{STATUS_LABEL[booking.status]}</span></td>
                    <td>
                      {booking.status === 'pending' ? (
                        <div className="row">
                          <button
                            type="button"
                            className="btn sm"
                            disabled={confirming}
                            onClick={() => updateBooking({ id: booking.id, body: { status: 'confirmed' } })}
                          >
                            Confirm
                          </button>
                          <button
                            type="button"
                            className="btn sm danger"
                            onClick={() => {
                              setCancelId(booking.id);
                              setReason('');
                              setReasonError('');
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
      {data ? <Pager page={page} pages={totalPages} onPage={setPage} /> : null}
      {cancelId ? (
        <div className="scrim" onMouseDown={closeCancel}>
          <div
            className="dlg"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cancel-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <h2 id="cancel-title">Cancel {cancellingRow?.booking_number ?? 'booking'}?</h2>
            <p className="muted">This cannot be undone. A reason is required.</p>
            <div className="field">
              <label htmlFor="bk-reason">Reason</label>
              <input
                id="bk-reason"
                className={reasonError ? 'input err' : 'input'}
                value={reason}
                placeholder="Reason for cancelling"
                onChange={(event) => {
                  setReason(event.target.value);
                  if (reasonError) setReasonError('');
                }}
              />
              {reasonError ? <span className="hint err">{reasonError}</span> : null}
            </div>
            <div className="row end">
              <button type="button" className="btn" onClick={closeCancel}>Keep booking</button>
              <button
                type="button"
                className={cancelling ? 'btn danger nt-loading' : 'btn danger'}
                data-variant="danger"
                disabled={cancelling}
                onClick={submitCancel}
              >
                Cancel booking
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
