// ─────────────────────────────────────────────────────────────
// Neutek Auto Care — Service & Category DTOs
// Money fields: integer pesewas (divide by 100 for GHS display)
// ─────────────────────────────────────────────────────────────

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
  base_price_pesewas: number;           // integer pesewas
  estimated_duration_minutes: number;   // REQUIRED on create (Swagger omits this — wrong)
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateServiceRequest {
  categoryId: string;
  name: string;
  slug?: string;                        // auto-generated if omitted
  description?: string;
  basePricePesewas: number;             // integer, min 0
  estimatedDurationMinutes: number;     // required
}

export type UpdateServiceRequest = Partial<CreateServiceRequest>;

export interface ListServicesParams {
  page?: number;
  limit?: number;
  categoryId?: string;
  active?: boolean;
}