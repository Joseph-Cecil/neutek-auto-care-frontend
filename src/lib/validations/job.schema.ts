import { z } from 'zod';

export const createJobSchema = z.object({
  customerId:             z.string().uuid('Invalid customer'),
  vehicleId:              z.string().uuid('Invalid vehicle'),
  title:                  z.string().min(1, 'Title is required').max(300),
  description:            z.string().max(2000).optional(),
  priority:               z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
  assignedTechnicianId:   z.string().uuid().optional(),
  bookingId:              z.string().uuid().optional(),
  intakeNotes:            z.string().max(2000).optional(),
  estimatedCompletionAt:  z.string().optional(),
  serviceIds:             z.array(z.string().uuid()).optional(),
});

export const transitionJobSchema = z.object({
  status: z.enum([
    'intake', 'diagnosing', 'quote_sent', 'quote_approved',
    'quote_rejected', 'in_progress', 'quality_check',
    'ready_for_pickup', 'completed', 'cancelled',
  ]),
  notes: z.string().max(1000).optional(),
});

export type CreateJobFormData     = z.infer<typeof createJobSchema>;
export type TransitionJobFormData = z.infer<typeof transitionJobSchema>;