import { z } from 'zod';
import { isValidE164 } from '@/shared/phone/phoneUtils';
import { isValidLocale, isValidTimezone } from '@/shared/timezone/timezones';

export const phoneRequiredSchema = z
  .string()
  .min(1, 'Phone is required')
  .refine((value) => isValidE164(value), {
    message: 'Enter a valid phone number with country code',
  });

export const phoneOptionalSchema = z
  .string()
  .refine((value) => !value?.trim() || isValidE164(value), {
    message: 'Enter a valid phone number with country code',
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
