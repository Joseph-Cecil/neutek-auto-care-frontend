import { z } from 'zod';

export const bookingSchema = z
  .object({
    serviceIds:  z.array(z.string().uuid()).min(1, 'Select at least one service'),
    scheduledAt: z.string().refine(
      (val) => new Date(val) > new Date(),
      'Scheduled time must be in the future',
    ),
    notes:      z.string().max(1000).optional(),
    customerId: z.string().uuid().optional(),
    guestName:  z.string().min(1).max(200).optional(),
    guestEmail: z.string().email().optional().or(z.literal('')),
    guestPhone: z.string().min(9).max(20).optional(),
    vehicleId:  z.string().uuid().optional(),
  })
  .refine(
    (d) => d.customerId || (d.guestName && d.guestPhone),
    { message: 'Please provide your name and phone number', path: ['guestName'] },
  );

export type BookingFormData = z.infer<typeof bookingSchema>;