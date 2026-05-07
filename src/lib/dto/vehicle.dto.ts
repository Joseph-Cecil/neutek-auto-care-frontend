// ─────────────────────────────────────────────────────────────
// Neutek Auto Care — Vehicle DTOs
// ─────────────────────────────────────────────────────────────

export interface Vehicle {
  id: string;
  customer_id: string;
  make: string;
  model: string;
  year: number;
  license_plate: string;
  vin: string | null;
  color: string | null;
  mileage: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface CreateVehicleRequest {
  customerId: string;
  make: string;
  model: string;
  year: number;             // integer 1900–(current year + 1)
  licensePlate: string;
  vin?: string;             // exactly 17 chars if provided
  color?: string;
  mileage?: number;
  notes?: string;
}

export type UpdateVehicleRequest = Partial<Omit<CreateVehicleRequest, 'customerId'>>;