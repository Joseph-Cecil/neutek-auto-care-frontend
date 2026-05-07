// ─────────────────────────────────────────────────────────────
// Neutek Auto Care — Enum Types
// Source: backend Zod schemas & DB row types (ground truth)
// ─────────────────────────────────────────────────────────────

export type UserRole = 'customer' | 'technician' | 'admin' | 'super_admin';

export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'cancelled'
  | 'completed'
  | 'no_show';

export type JobStatus =
  | 'intake'
  | 'diagnosing'
  | 'quote_sent'
  | 'quote_approved'
  | 'quote_rejected'
  | 'in_progress'
  | 'quality_check'
  | 'ready_for_pickup'
  | 'completed'
  | 'cancelled';

export type JobPriority = 'low' | 'normal' | 'high' | 'urgent';

export type QuoteStatus = 'draft' | 'sent' | 'approved' | 'rejected' | 'expired';

export type InvoiceStatus =
  | 'draft'
  | 'sent'
  | 'paid'
  | 'partially_paid'
  | 'overdue'
  | 'cancelled';

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export type PaymentMethod =
  | 'cash'
  | 'card'
  | 'bank_transfer'
  | 'mobile_money'
  | 'online';

export type NotificationChannel = 'email' | 'sms' | 'whatsapp' | 'push';

export type BlogStatus = 'draft' | 'published' | 'archived';

export type UploadFolder =
  | 'general'
  | 'avatars'
  | 'diagnostics'
  | 'blog'
  | 'services';

export type RevenueGranularity = 'day' | 'week' | 'month';