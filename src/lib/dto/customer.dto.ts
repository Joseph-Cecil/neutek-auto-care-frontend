export interface Customer {
  id: string;
  user_id: string | null;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string;
  address: string | null;
  notes: string | null;
  is_fleet_customer: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface CreateCustomerRequest {
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  address?: string;
  notes?: string;
}

export type UpdateCustomerRequest = Partial<CreateCustomerRequest>;

export interface ListCustomersParams {
  page?: number;
  limit?: number;
  search?: string;
}