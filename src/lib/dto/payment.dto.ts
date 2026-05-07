// ─────────────────────────────────────────────────────────────
// Neutek Auto Care — Payment DTOs
// ─────────────────────────────────────────────────────────────
import type { PaymentStatus, PaymentMethod } from './enums.dto';

export interface Payment {
  id: string;
  payment_reference: string;            // e.g. 'PAY-20240115-000001'
  invoice_id: string;
  customer_id: string;
  amount_pesewas: number;
  method: PaymentMethod;
  status: PaymentStatus;
  gateway_reference: string | null;
  gateway_response: Record<string, unknown> | null;
  recorded_by_id: string | null;
  created_at: string;
  updated_at: string;
}

/** Returned inside data.data by POST /payments/initialize */
export interface PaystackInitResult {
  authorization_url: string;   // redirect user here — NOT in an iframe
  access_code: string;
  reference: string;
}

export interface InitializePaymentRequest {
  invoiceId: string;
  callbackUrl?: string;
}

export interface RecordPaymentRequest {
  invoiceId: string;
  amountPesewas: number;    // integer, min 1
  method: PaymentMethod;
  gatewayReference?: string;
}

export interface ListPaymentsParams {
  page?: number;
  limit?: number;
  invoiceId?: string;
  customerId?: string;
  status?: PaymentStatus;
}