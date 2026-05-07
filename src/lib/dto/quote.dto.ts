// ─────────────────────────────────────────────────────────────
// Neutek Auto Care — Quote DTOs
// Money fields: integer pesewas
// ─────────────────────────────────────────────────────────────
import type { QuoteStatus } from './enums.dto';

export interface QuoteLineItem {
  id: string;
  quote_id: string;
  service_id: string | null;
  description: string;
  quantity: number;
  unit_price_pesewas: number;
  total_pesewas: number;
}

export interface Quote {
  id: string;
  quote_number: string;         // e.g. 'QT-20240115-000007'
  job_id: string;
  customer_id: string;
  subtotal_pesewas: number;
  tax_pesewas: number;
  discount_pesewas: number;
  total_pesewas: number;
  status: QuoteStatus;
  valid_until: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateQuoteLineItemRequest {
  serviceId?: string;
  description: string;          // max 500 chars
  quantity?: number;            // default 1
  unitPricePesewas: number;     // integer, min 0
}

export interface CreateQuoteRequest {
  jobId: string;
  lineItems: CreateQuoteLineItemRequest[];
  taxPercent?: number;          // 0–100, default 0
  discountPercent?: number;     // 0–100, default 0
  validDays?: number;           // default 7
  notes?: string;
}

export interface RejectQuoteRequest {
  reason?: string;
}

export interface ListQuotesParams {
  page?: number;
  limit?: number;
  status?: QuoteStatus;
  jobId?: string;
  customerId?: string;
}