import { z } from 'zod';
import {
  emailRequiredSchema,
  nameRequiredSchema,
  passwordRequiredSchema,
  phoneRequiredSchema,
} from '@/shared/validation/inputSchemas';

export const registerSchema = z
  .object({
    email: emailRequiredSchema,
    password: passwordRequiredSchema,
    confirmPassword: z.string().min(1, 'Confirm your password'),
    firstName: nameRequiredSchema,
    lastName: nameRequiredSchema,
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
  email: emailRequiredSchema,
  password: z.string().min(1, 'Password is required'),
});

export type RegisterForm = z.infer<typeof registerSchema>;
export type LoginForm = z.infer<typeof loginSchema>;
