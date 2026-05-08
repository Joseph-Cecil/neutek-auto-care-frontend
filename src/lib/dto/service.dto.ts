export interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  display_order: number;
  is_active: boolean;
}

export interface Service {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string | null;
  base_price_pesewas: number;
  estimated_duration_minutes: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateServiceRequest {
  categoryId: string;
  name: string;
  slug?: string;
  description?: string;
  basePricePesewas: number;
  estimatedDurationMinutes: number;
}

export type UpdateServiceRequest = Partial<CreateServiceRequest>;

export interface ListServicesParams {
  page?: number;
  limit?: number;
  categoryId?: string;
  active?: boolean;
}