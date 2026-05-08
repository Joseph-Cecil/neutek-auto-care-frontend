export interface FleetAccount {
  id: string;
  company_name: string;
  contact_name: string;
  email: string | null;
  phone: string;
  address: string | null;
  credit_limit_pesewas: number;
  outstanding_balance_pesewas: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FleetVehicle {
  id: string;
  fleet_account_id: string;
  vehicle_id: string;
  driver_name: string | null;
  driver_phone: string | null;
  notes: string | null;
  created_at: string;
}

export interface MaintenanceSchedule {
  id: string;
  fleet_vehicle_id: string;
  service_type: string;
  interval_km: number | null;
  interval_days: number | null;
  last_done_at: string | null;
  next_due_at: string | null;
  created_at: string;
}

export interface CreateFleetAccountRequest {
  companyName: string;
  contactName: string;
  phone: string;
  email?: string;
  address?: string;
  creditLimitPesewas?: number;
}

export interface AddFleetVehicleRequest {
  vehicleId: string;
  driverName?: string;
  driverPhone?: string;
  notes?: string;
}