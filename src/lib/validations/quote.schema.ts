import { z } from 'zod';

export const lineItemSchema = z.object({
  serviceId:        z.string().uuid().optional(),
  description:      z.string().min(1, 'Description is required').max(500),
  quantity:         z.number().int().min(1).default(1),
  unitPricePesewas: z.number().int().min(0, 'Price must be 0 or more'),
});

export const createQuoteSchema = z.object({
  jobId:           z.string().uuid('Invalid job'),
  lineItems:       z.array(lineItemSchema).min(1, 'Add at least one line item'),
  taxPercent:      z.number().min(0).max(100).default(0),
  discountPercent: z.number().min(0).max(100).default(0),
  validDays:       z.number().int().min(1).default(7),
  notes:           z.string().max(1000).optional(),
});

export type LineItemFormData    = z.infer<typeof lineItemSchema>;
export type CreateQuoteFormData = z.infer<typeof createQuoteSchema>;