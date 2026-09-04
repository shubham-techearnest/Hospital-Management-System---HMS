import { z } from 'zod';
import {
  localeSchema,
  nameRequiredSchema,
  passwordRequiredSchema,
  phoneRequiredSchema,
  timezoneSchema,
} from '@/shared/validation/inputSchemas';

export const profileSchema = z.object({
  firstName: nameRequiredSchema,
  lastName: nameRequiredSchema,
  phone: phoneRequiredSchema,
  timezone: timezoneSchema,
  locale: localeSchema,
});

export type ProfileForm = z.infer<typeof profileSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordRequiredSchema,
    confirmPassword: z.string().min(1, 'Confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type ChangePasswordForm = z.infer<typeof changePasswordSchema>;
