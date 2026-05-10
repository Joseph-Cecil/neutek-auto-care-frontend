'use client';

import { useState } from 'react';
import { Calendar, ChevronRight, XCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageHeader }    from '@/components/admin/shared/PageHeader';
import { SearchInput }   from '@/components/admin/shared/SearchInput';
import { StatusBadge }   from '@/components/shared/StatusBadge';
import { SectionLoader } from '@/components/shared/LoadingSpinner';
import { EmptyState }    from '@/components/shared/EmptyState';
import { Pagination }    from '@/components/shared/Pagination';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { ErrorAlert }    from '@/components/shared/ErrorAlert';
import { useAdminBookings, useCancelBooking } from '@/hooks/useAdminBookings';
import { formatDateTime } from '@/lib/utils/date';
import { fullName }       from '@/lib/utils/format';
import { cn }             from '@/lib/utils/cn';
import type { BookingStatus } from '@/lib/dto';

const STATUS_TABS: { label: string; value: BookingStatus | undefined }[] = [
  { label: 'All',       value: undefined },
  { label: 'Pending',   value: 'pending' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
];

const STATUS_VARIANT: Record<BookingStatus, 'default' | 'success' | 'warning' | 'danger' | 'info' | 'muted'> = {
  pending:   'warning',
  confirmed: 'info',
  completed: 'success',
  cancelled: 'muted',
  no_show:   'danger',
};

export default function AdminBookingsPage() {
  const [status,   setStatus]   = useState<BookingStatus | undefined>(undefined);
  const [page,     setPage]     = useState(1);
  const [cancelId, setCancelId] = useState<string | null>(null);

  const { data, isLoading, error } = useAdminBookings({ status, page, limit: 20 });
  const { mutate: cancelBooking, isPending: cancelling } = useCancelBooking();

  const bookings   = data?.data       ?? [];
  const totalPages = data?.totalPages ?? 1;
  const total      = data?.total      ?? 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bookings"
        description={total + " total bookings"}
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {STATUS_TABS.map(({ label, value }) => (
          <button key={label}
            onClick={() => { setStatus(value); setPage(1); }}
            className={cn(
              'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
              status === value
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border text-muted-foreground hover:border-primary/50 hover:text-foreground',
            )}>
            {label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <SectionLoader />
      ) : error ? (
        <ErrorAlert message="Failed to load bookings. Please refresh the page." />
      ) : bookings.length === 0 ? (
        <EmptyState
          icon={<Calendar className="h-6 w-6" />}
          title="No bookings found"
          description="No bookings match the current filter."
        />
      ) : (
        <div className="space-y-2">
          {bookings.map((booking) => (
            <Card key={booking.id}>
              <CardContent className="flex items-center justify-between gap-4 p-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-sm font-medium">
                      {booking.booking_number}
                    </span>
                    <StatusBadge
                      label={booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      variant={STATUS_VARIANT[booking.status]}
                    />
                  </div>
                  <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span>
                      {booking.guest_name
                        ? booking.guest_name
                        : 'Registered customer'}
                    </span>
                    <span>{booking.guest_phone ?? ''}</span>
                    <span>{formatDateTime(booking.scheduled_at)}</span>
                    <span>{booking.service_ids.length} service(s)</span>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {booking.status === 'pending' && (
                    <Button size="sm" variant="outline"
                      className="gap-1 text-destructive hover:bg-destructive/10"
                      onClick={() => setCancelId(booking.id)}>
                      <XCircle className="h-3.5 w-3.5" /> Cancel
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <ConfirmDialog
        open={!!cancelId}
        onOpenChange={(o) => !o && setCancelId(null)}
        title="Cancel Booking"
        description="Are you sure you want to cancel this booking? This cannot be undone."
        confirmLabel="Cancel Booking"
        variant="destructive"
        onConfirm={() => {
          if (cancelId) {
            cancelBooking(cancelId, { onSuccess: () => setCancelId(null) });
          }
        }}
        isPending={cancelling}
      />
    </div>
  );
}