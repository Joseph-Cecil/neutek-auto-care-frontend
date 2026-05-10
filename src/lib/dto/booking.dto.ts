import type { BookingStatus } from './enums.dto';

export interface Booking {
  id: string;
  booking_number: string;
  customer_id: string | null;
  vehicle_id: string | null;
  walk_in_name: string | null;        // ✅ was guest_name
  walk_in_phone: string | null;       // ✅ was guest_phone
  walk_in_vehicle_info: Record<string, unknown> | null; // ✅ new
  service_ids: string[];
  scheduled_at: string;
  estimated_duration_minutes: number | null; // ✅ new
  notes: string | null;
  status: BookingStatus;
  confirmed_at: string | null;        // ✅ new
  cancelled_at: string | null;        // ✅ new
  cancellation_reason: string | null; // ✅ new
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface CreateBookingRequest {
  customerId?: string;
  vehicleId?: string;
  walkInName?: string;        // ✅ was guestName
  walkInPhone?: string;       // ✅ was guestPhone
  walkInVehicleInfo?: Record<string, unknown>; // ✅ new
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