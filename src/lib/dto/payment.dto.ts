import type { PaymentStatus, PaymentMethod } from './enums.dto';

export interface Payment {
  id: string;
  payment_reference: string;
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

export interface PaystackInitResult {
  authorization_url: string;
  access_code: string;
  reference: string;
}

export interface InitializePaymentRequest {
  invoiceId: string;
  callbackUrl?: string;
}

export interface RecordPaymentRequest {
  invoiceId: string;
  amountPesewas: number;
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