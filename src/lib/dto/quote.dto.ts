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
  quote_number: string;
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
  description: string;
  quantity?: number;
  unitPricePesewas: number;
}

export interface CreateQuoteRequest {
  jobId: string;
  lineItems: CreateQuoteLineItemRequest[];
  taxPercent?: number;
  discountPercent?: number;
  validDays?: number;
  notes?: string;
}

export interface RejectQuoteRequest { reason?: string; }

export interface ListQuotesParams {
  page?: number;
  limit?: number;
  status?: QuoteStatus;
  jobId?: string;
  customerId?: string;
}