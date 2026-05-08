import type { BookingStatus } from './enums.dto';

export interface Booking {
  id: string;
  booking_number: string;
  customer_id: string | null;
  vehicle_id: string | null;
  guest_name: string | null;
  guest_email: string | null;
  guest_phone: string | null;
  service_ids: string[];
  scheduled_at: string;
  notes: string | null;
  status: BookingStatus;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface CreateBookingRequest {
  customerId?: string;
  vehicleId?: string;
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  serviceIds: string[];
  scheduledAt: string;
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
  from?: string;
  to?: string;
}