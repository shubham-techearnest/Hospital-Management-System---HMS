import { z } from 'zod';
import { phoneValidationMessage } from '@/shared/phone/phoneUtils';
import { isValidLocale, isValidTimezone } from '@/shared/timezone/timezones';

export const phoneRequiredSchema = z.string().superRefine((value, ctx) => {
  const message = phoneValidationMessage(value?.trim() ?? '');
  if (message) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message });
  }
});

export const phoneOptionalSchema = z.string().superRefine((value, ctx) => {
  const trimmed = value?.trim() ?? '';
  if (!trimmed) {
    return;
  }
  const message = phoneValidationMessage(trimmed);
  if (message && message !== 'Phone is required') {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message });
  }
});

export const timezoneSchema = z
  .string()
  .min(1, 'Timezone is required')
  .refine((value) => isValidTimezone(value), {
    message: 'Select a valid timezone from the list',
  });

export const localeSchema = z
  .string()
  .min(1, 'Locale is required')
  .refine((value) => isValidLocale(value), {
    message: 'Select a valid locale from the list',
  });
