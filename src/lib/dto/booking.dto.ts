// ─────────────────────────────────────────────────────────────
// Neutek Auto Care — Booking DTOs
// ─────────────────────────────────────────────────────────────
import type { BookingStatus } from './enums.dto';

export interface Booking {
  id: string;
  booking_number: string;   // e.g. 'BK-20240115-000001'
  customer_id: string | null;
  vehicle_id: string | null;
  guest_name: string | null;
  guest_email: string | null;
  guest_phone: string | null;
  service_ids: string[];
  scheduled_at: string;     // ISO 8601
  notes: string | null;
  status: BookingStatus;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface CreateBookingRequest {
  customerId?: string;      // UUID — if logged-in customer
  vehicleId?: string;       // UUID — optional
  guestName?: string;       // required if no customerId
  guestEmail?: string;
  guestPhone?: string;      // required if no customerId (9–20 chars)
  serviceIds: string[];     // min 1 UUID
  scheduledAt: string;      // ISO 8601, must be future
  notes?: string;
}

export interface UpdateBookingRequest {
  status?: BookingStatus;
  scheduledAt?: string;
  notes?: string;
}

export interface ListBookingsParams {
  page?: number;
  limit?: number;
  status?: BookingStatus;
  customerId?: string;
  from?: string;            // YYYY-MM-DD
  to?: string;              // YYYY-MM-DD
}