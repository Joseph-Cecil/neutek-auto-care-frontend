// ─────────────────────────────────────────────────────────────
// Neutek Auto Care — Invoice DTOs
// Money fields: integer pesewas
// ─────────────────────────────────────────────────────────────
import type { InvoiceStatus } from './enums.dto';

export interface InvoiceLineItem {
  id: string;
  invoice_id: string;
  service_id: string | null;
  description: string;
  quantity: number;
  unit_price_pesewas: number;
  total_pesewas: number;
}

export interface Invoice {
  id: string;
  invoice_number: string;     // e.g. 'INV-20240115-000007'
  job_id: string;
  customer_id: string;
  quote_id: string | null;
  subtotal_pesewas: number;
  tax_pesewas: number;
  discount_pesewas: number;
  total_pesewas: number;
  amount_paid_pesewas: number;
  status: InvoiceStatus;
  due_date: string;
  notes: string | null;
  pdf_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateInvoiceLineItemRequest {
  serviceId?: string;
  description: string;
  quantity?: number;
  unitPricePesewas: number;
}

export interface CreateInvoiceRequest {
  jobId: string;
  quoteId?: string;
  lineItems: CreateInvoiceLineItemRequest[];
  taxPercent?: number;
  discountPercent?: number;
  dueDays?: number;           // default 0
  notes?: string;
}

export interface ListInvoicesParams {
  page?: number;
  limit?: number;
  status?: InvoiceStatus;
  customerId?: string;
  jobId?: string;
}