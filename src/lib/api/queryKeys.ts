import type {
  UserRole, BookingStatus, JobStatus, JobPriority,
  QuoteStatus, InvoiceStatus, PaymentStatus, BlogStatus,
  RevenueGranularity,
} from '@/lib/dto';

export const queryKeys = {
  auth: {
    all: ['auth']       as const,
    me:  ['auth', 'me'] as const,
  },
  users: {
    all:    ['users'] as const,
    list:   (p?: { role?: UserRole; search?: string; page?: number }) =>
              ['users', 'list', p] as const,
    detail: (id: string) => ['users', id] as const,
  },
  customers: {
    all:    ['customers'] as const,
    list:   (p?: { search?: string; page?: number }) =>
              ['customers', 'list', p] as const,
    detail: (id: string) => ['customers', id] as const,
  },
  vehicles: {
    all:        ['vehicles'] as const,
    byCustomer: (customerId: string) =>
                  ['vehicles', 'customer', customerId] as const,
    detail:     (id: string) => ['vehicles', id] as const,
    jobHistory: (vehicleId: string) =>
                  ['vehicles', vehicleId, 'jobs'] as const,
  },
  services: {
    all:        ['services'] as const,
    categories: ['services', 'categories'] as const,
    list:       (p?: { categoryId?: string; active?: boolean; page?: number }) =>
                  ['services', 'list', p] as const,
    detail:     (id: string) => ['services', id] as const,
  },
  bookings: {
    all:    ['bookings'] as const,
    list:   (p?: { status?: BookingStatus; customerId?: string; page?: number }) =>
              ['bookings', 'list', p] as const,
    detail: (id: string) => ['bookings', id] as const,
  },
  jobs: {
    all:     ['jobs'] as const,
    list:    (p?: {
               status?: JobStatus; customerId?: string; vehicleId?: string;
               technicianId?: string; priority?: JobPriority; page?: number;
             }) => ['jobs', 'list', p] as const,
    detail:  (id: string) => ['jobs', id] as const,
    history: (id: string) => ['jobs', id, 'history'] as const,
    byNumber:(jobNumber: string) => ['jobs', 'number', jobNumber] as const,
  },
  quotes: {
    all:    ['quotes'] as const,
    list:   (p?: { status?: QuoteStatus; jobId?: string; customerId?: string; page?: number }) =>
              ['quotes', 'list', p] as const,
    detail: (id: string) => ['quotes', id] as const,
  },
  invoices: {
    all:    ['invoices'] as const,
    list:   (p?: { status?: InvoiceStatus; customerId?: string; jobId?: string; page?: number }) =>
              ['invoices', 'list', p] as const,
    detail: (id: string) => ['invoices', id] as const,
  },
  payments: {
    all:    ['payments'] as const,
    list:   (p?: { invoiceId?: string; customerId?: string; status?: PaymentStatus; page?: number }) =>
              ['payments', 'list', p] as const,
    detail: (id: string) => ['payments', id] as const,
  },
  tracking: {
    byNumber: (jobNumber: string) => ['tracking', jobNumber] as const,
  },
  diagnostics: {
    byJob: (jobId: string) => ['diagnostics', 'job', jobId] as const,
  },
  notifications: {
    all:  ['notifications'] as const,
    list: (p?: { isRead?: boolean; page?: number }) =>
            ['notifications', 'list', p] as const,
  },
  blog: {
    all:        ['blog'] as const,
    categories: ['blog', 'categories'] as const,
    list:       (p?: { status?: BlogStatus; categoryId?: string; search?: string; page?: number }) =>
                  ['blog', 'list', p] as const,
    bySlug:     (slug: string) => ['blog', 'slug', slug] as const,
    detail:     (id: string) => ['blog', id] as const,
  },
  fleet: {
    all:      ['fleet'] as const,
    list:     (p?: { page?: number }) => ['fleet', 'list', p] as const,
    detail:   (id: string) => ['fleet', id] as const,
    vehicles: (id: string) => ['fleet', id, 'vehicles'] as const,
  },
  analytics: {
    dashboard:   ['analytics', 'dashboard'] as const,
    revenue:     (p?: { granularity?: RevenueGranularity; from?: string; to?: string }) =>
                   ['analytics', 'revenue', p] as const,
    jobs:        ['analytics', 'jobs'] as const,
    services:    (limit?: number) => ['analytics', 'services', limit] as const,
    technicians: ['analytics', 'technicians'] as const,
  },
} as const;