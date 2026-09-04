import { z } from 'zod';
import {
  phoneValidationMessage,
} from '@/shared/phone/phoneUtils';
import { isValidLocale, isValidTimezone } from '@/shared/timezone/timezones';

export const nameRequiredSchema = z
  .string()
  .trim()
  .min(1, 'This field is required')
  .max(100, 'Must be 100 characters or fewer')
  .regex(/^[\p{L} .'-]+$/u, 'Only letters, spaces, apostrophes, and hyphens');

export const emailRequiredSchema = z
  .string()
  .trim()
  .min(1, 'Email is required')
  .email('Enter a valid email address');

/** Matches backend ValidPassword (upper, lower, digit, special). */
export const passwordRequiredSchema = z
  .string()
  .min(8, 'At least 8 characters')
  .regex(/[A-Z]/, 'Include an uppercase letter')
  .regex(/[a-z]/, 'Include a lowercase letter')
  .regex(/\d/, 'Include a digit')
  .regex(/[!@#$%^&*()_+=-]/, 'Include a special character (!@#$%^&*()_+=-)');

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
    message: 'Select a timezone from the list',
  });

export const localeSchema = z
  .string()
  .min(1, 'Locale is required')
  .refine((value) => isValidLocale(value), {
    message: 'Select a locale from the list',
  });

/** Empty / NaN → undefined so optional numeric fields are not blocked while typing. */
export function optionalNumber(opts?: {
  min?: number;
  max?: number;
  minMessage?: string;
  maxMessage?: string;
}) {
  let numberSchema = z.number({ invalid_type_error: 'Enter a valid number' });
  if (opts?.min != null) {
    numberSchema = numberSchema.min(opts.min, opts.minMessage);
  }
  if (opts?.max != null) {
    numberSchema = numberSchema.max(opts.max, opts.maxMessage);
  }

  return z.preprocess((raw) => {
    if (raw === '' || raw === null || raw === undefined) {
      return undefined;
    }
    if (typeof raw === 'number' && Number.isNaN(raw)) {
      return undefined;
    }
    const num = typeof raw === 'number' ? raw : Number(raw);
    return Number.isFinite(num) ? num : undefined;
  }, numberSchema.optional());
}

export const optionalIsoCountrySchema = z
  .string()
  .trim()
  .max(2, 'Use a 2-letter country code')
  .refine((value) => !value || value.length === 2, {
    message: 'Use a 2-letter country code (e.g. IN)',
  });

export const optionalPincodeSchema = z
  .string()
  .trim()
  .refine((value) => !value || /^\d*$/.test(value), {
    message: 'Pincode must contain digits only',
  })
  .refine((value) => !value || value.length === 6, {
    message: 'Pincode must be 6 digits',
  });
