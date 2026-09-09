import { z } from 'zod';
import {
  localeSchema,
  phoneRequiredSchema,
  timezoneSchema,
} from '@/shared/validation/inputSchemas';

export const profileSchema = z.object({
  email: z
    .string()
    .trim()
    .optional()
    .or(z.literal(''))
    .refine((value) => !value || z.string().email().safeParse(value).success, {
      message: 'Enter a valid email address',
    }),
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  phone: phoneRequiredSchema,
  timezone: timezoneSchema,
  locale: localeSchema,
});

export type ProfileForm = z.infer<typeof profileSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'At least 8 characters')
      .regex(/[A-Z]/, 'Include an uppercase letter')
      .regex(/[a-z]/, 'Include a lowercase letter')
      .regex(/\d/, 'Include a digit')
      .regex(/[^A-Za-z0-9]/, 'Include a special character'),
    confirmPassword: z.string().min(1, 'Confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type ChangePasswordForm = z.infer<typeof changePasswordSchema>;
