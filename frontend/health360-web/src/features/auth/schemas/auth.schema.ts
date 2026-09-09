import { z } from 'zod';
import { phoneRequiredSchema } from '@/shared/validation/inputSchemas';

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+=-]).+$/,
    'Password must include upper, lower, digit, and special character',
  );

export const registerSchema = z
  .object({
    email: z.string().email('Invalid email address'),
    password: passwordSchema,
    confirmPassword: z.string(),
    firstName: z.string().min(1).max(100),
    lastName: z.string().min(1).max(100),
    phone: phoneRequiredSchema,
    role: z.literal('PATIENT'),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: 'You must accept the terms',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email or mobile number is required')
    .refine(
      (value) => {
        const trimmed = value.trim();
        if (trimmed.includes('@')) {
          return z.string().email().safeParse(trimmed).success;
        }
        const digits = trimmed.replace(/\D/g, '');
        return digits.length >= 10;
      },
      { message: 'Enter a valid email or 10-digit mobile number' },
    ),
  password: z.string().min(1, 'Password is required'),
});

export type RegisterForm = z.infer<typeof registerSchema>;
export type LoginForm = z.infer<typeof loginSchema>;
