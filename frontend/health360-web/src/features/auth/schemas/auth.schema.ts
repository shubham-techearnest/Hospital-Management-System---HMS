import { z } from 'zod';

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
    phone: z.string().regex(/^(\+?[1-9]\d{9,14}|[6-9]\d{9})$/, 'Invalid phone number'),
    role: z.enum(['PATIENT', 'INDIVIDUAL_PRACTICE']),
    clinicName: z.string().max(300).optional(),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: 'You must accept the terms',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
  .refine(
    (data) =>
      data.role !== 'INDIVIDUAL_PRACTICE' ||
      (data.clinicName != null && data.clinicName.trim().length > 0),
    {
      message: 'Clinic name is required for individual practice',
      path: ['clinicName'],
    },
  );

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type RegisterForm = z.infer<typeof registerSchema>;
export type LoginForm = z.infer<typeof loginSchema>;
