// ─────────────────────────────────────────────────────────────
// Neutek Auto Care — TanStack Query Key Factory
// Structured keys enable precise cache invalidation
// ─────────────────────────────────────────────────────────────
import type {
  UserRole, BookingStatus, JobStatus, JobPriority,
  QuoteStatus, InvoiceStatus, PaymentStatus, BlogStatus,
  RevenueGranularity,
} from '@/lib/dto';

export const queryKeys = {
  // ── Auth ────────────────────────────────────────────────────
  auth: {
    all:  ['auth']         as const,
    me:   ['auth', 'me']   as const,
  },

  // ── Users ───────────────────────────────────────────────────
  users: {
    all:    ['users']                              as const,
    list:   (params?: { role?: UserRole; search?: string; page?: number }) =>
              ['users', 'list', params]            as const,
    detail: (id: string) => ['users', id]          as const,
  },

  // ── Customers ───────────────────────────────────────────────
  customers: {
    all:    ['customers']                          as const,
    list:   (params?: { search?: string; page?: number }) =>
              ['customers', 'list', params]        as const,
    detail: (id: string) => ['customers', id]      as const,
  },

  // ── Vehicles ────────────────────────────────────────────────
  vehicles: {
    all:          ['vehicles']                                    as const,
    byCustomer:   (customerId: string) =>
                    ['vehicles', 'customer', customerId]          as const,
    detail:       (id: string) => ['vehicles', id]                as const,
    jobHistory:   (vehicleId: string) =>
                    ['vehicles', vehicleId, 'jobs']               as const,
  },

  // ── Services ────────────────────────────────────────────────
  services: {
    all:        ['services']                              as const,
    categories: ['services', 'categories']                as const,
    list:       (params?: { categoryId?: string; active?: boolean; page?: number }) =>
                  ['services', 'list', params]            as const,
    detail:     (id: string) => ['services', id]          as const,
  },

  // ── Bookings ────────────────────────────────────────────────
  bookings: {
    all:    ['bookings']                                         as const,
    list:   (params?: { status?: BookingStatus; customerId?: string; page?: number }) =>
              ['bookings', 'list', params]                       as const,
    detail: (id: string) => ['bookings', id]                     as const,
  },

  // ── Jobs ────────────────────────────────────────────────────
  jobs: {
    all:     ['jobs']                                            as const,
    list:    (params?: {
               status?: JobStatus;
               customerId?: string;
               vehicleId?: string;
               technicianId?: string;
               priority?: JobPriority;
               page?: number;
             }) => ['jobs', 'list', params]                      as const,
    detail:  (id: string) => ['jobs', id]                        as const,
    history: (id: string) => ['jobs', id, 'history']             as const,
    byNumber:(jobNumber: string) => ['jobs', 'number', jobNumber] as const,
  },

  // ── Quotes ──────────────────────────────────────────────────
  quotes: {
    all:    ['quotes']                                           as const,
    list:   (params?: { status?: QuoteStatus; jobId?: string; customerId?: string; page?: number }) =>
              ['quotes', 'list', params]                         as const,
    detail: (id: string) => ['quotes', id]                       as const,
  },

  // ── Invoices ────────────────────────────────────────────────
  invoices: {
    all:    ['invoices']                                         as const,
    list:   (params?: { status?: InvoiceStatus; customerId?: string; jobId?: string; page?: number }) =>
              ['invoices', 'list', params]                       as const,
    detail: (id: string) => ['invoices', id]                     as const,
  },

  // ── Payments ────────────────────────────────────────────────
  payments: {
    all:    ['payments']                                         as const,
    list:   (params?: { invoiceId?: string; customerId?: string; status?: PaymentStatus; page?: number }) =>
              ['payments', 'list', params]                       as const,
    detail: (id: string) => ['payments', id]                     as const,
  },

  // ── Tracking (public) ───────────────────────────────────────
  tracking: {
    byNumber: (jobNumber: string) => ['tracking', jobNumber]     as const,
  },

  // ── Diagnostics ─────────────────────────────────────────────
  diagnostics: {
    byJob: (jobId: string) => ['diagnostics', 'job', jobId]      as const,
  },

  // ── Notifications ───────────────────────────────────────────
  notifications: {
    all:  ['notifications']                                      as const,
    list: (params?: { isRead?: boolean; page?: number }) =>
            ['notifications', 'list', params]                    as const,
  },

  // ── Blog ────────────────────────────────────────────────────
  blog: {
    all:        ['blog']                                         as const,
    categories: ['blog', 'categories']                           as const,
    list:       (params?: { status?: BlogStatus; categoryId?: string; search?: string; page?: number }) =>
                  ['blog', 'list', params]                       as const,
    bySlug:     (slug: string) => ['blog', 'slug', slug]         as const,
    detail:     (id: string)   => ['blog', id]                   as const,
  },

  // ── Fleet ───────────────────────────────────────────────────
  fleet: {
    all:      ['fleet']                                          as const,
    list:     (params?: { page?: number }) =>
                ['fleet', 'list', params]                        as const,
    detail:   (id: string) => ['fleet', id]                      as const,
    vehicles: (id: string) => ['fleet', id, 'vehicles']          as const,
  },

  // ── Analytics ───────────────────────────────────────────────
  analytics: {
    dashboard:    ['analytics', 'dashboard']                                  as const,
    revenue:      (params?: { granularity?: RevenueGranularity; from?: string; to?: string }) =>
                    ['analytics', 'revenue', params]                          as const,
    jobs:         ['analytics', 'jobs']                                       as const,
    services:     (limit?: number) => ['analytics', 'services', limit]        as const,
    technicians:  ['analytics', 'technicians']                                as const,
  },
} as const;