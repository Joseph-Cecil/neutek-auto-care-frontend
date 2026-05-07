import { z } from 'zod';

export const customerSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName:  z.string().min(1, 'Last name is required').max(100),
  phone:     z.string().min(9, 'Phone must be at least 9 digits').max(20),
  email:     z.string().email().optional().or(z.literal('')),
  address:   z.string().max(500).optional(),
  notes:     z.string().max(1000).optional(),
});

export type CustomerFormData = z.infer<typeof customerSchema>;