import { z } from 'zod';

const currentYear = new Date().getFullYear();

export const vehicleSchema = z.object({
  make:         z.string().min(1, 'Make is required').max(100),
  model:        z.string().min(1, 'Model is required').max(100),
  year:         z.number().int().min(1900).max(currentYear + 1),
  licensePlate: z.string().min(1, 'License plate is required').max(20),
  vin:          z.string().length(17, 'VIN must be exactly 17 characters').optional().or(z.literal('')),
  color:        z.string().max(50).optional(),
  mileage:      z.number().int().min(0).optional(),
  notes:        z.string().max(1000).optional(),
});

export type VehicleFormData = z.infer<typeof vehicleSchema>;