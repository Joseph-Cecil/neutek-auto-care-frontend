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
  year: number;
  licensePlate: string;
  vin?: string;
  color?: string;
  mileage?: number;
  notes?: string;
}

export type UpdateVehicleRequest = Partial<Omit<CreateVehicleRequest, 'customerId'>>;