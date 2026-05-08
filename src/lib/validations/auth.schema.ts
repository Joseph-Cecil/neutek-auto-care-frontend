import { z } from 'zod';

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Must contain at least one number')
  .regex(/[@$!%*?&]/, 'Must contain at least one special character (@$!%*?&)');

export const loginSchema = z.object({
  email:    z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z
  .object({
    firstName:       z.string().min(1, 'First name is required').max(100),
    lastName:        z.string().min(1, 'Last name is required').max(100),
    email:           z.string().email('Please enter a valid email address'),
    password:        passwordSchema,
    confirmPassword: z.string(),
    phone:           z.string().min(9).max(20).optional().or(z.literal('')),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path:    ['confirmPassword'],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export const resetPasswordSchema = z
  .object({
    password:        passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path:    ['confirmPassword'],
  });

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword:     passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords don't match",
    path:    ['confirmPassword'],
  });

export type LoginFormData          = z.infer<typeof loginSchema>;
export type RegisterFormData       = z.infer<typeof registerSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData  = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;