/** IANA timezone + locale helpers with auto-detect. */

const FALLBACK_TIMEZONES = [
  'Asia/Kolkata',
  'Asia/Dubai',
  'Asia/Singapore',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Asia/Hong_Kong',
  'Asia/Karachi',
  'Asia/Dhaka',
  'Asia/Colombo',
  'Asia/Kathmandu',
  'Asia/Bangkok',
  'Asia/Jakarta',
  'Asia/Riyadh',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Europe/Dublin',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Toronto',
  'America/Sao_Paulo',
  'Australia/Sydney',
  'Australia/Melbourne',
  'Pacific/Auckland',
  'Africa/Johannesburg',
  'UTC',
] as const;

export const APP_LOCALES = [
  { code: 'en-IN', label: 'English (India)' },
  { code: 'en-US', label: 'English (United States)' },
  { code: 'en-GB', label: 'English (United Kingdom)' },
  { code: 'hi-IN', label: 'Hindi (India)' },
  { code: 'en-AE', label: 'English (UAE)' },
  { code: 'ar-AE', label: 'Arabic (UAE)' },
  { code: 'en-SG', label: 'English (Singapore)' },
  { code: 'en-AU', label: 'English (Australia)' },
] as const;

let cachedTimezones: string[] | null = null;

export function listTimezones(): string[] {
  if (cachedTimezones) return cachedTimezones;
  try {
    const intlWithZones = Intl as typeof Intl & {
      supportedValuesOf?: (key: string) => string[];
    };
    if (typeof intlWithZones.supportedValuesOf === 'function') {
      cachedTimezones = intlWithZones.supportedValuesOf('timeZone');
      return cachedTimezones;
    }
  } catch {
    // ignore
  }
  cachedTimezones = [...FALLBACK_TIMEZONES];
  return cachedTimezones;
}

export function detectTimezone(): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz && listTimezones().includes(tz)) return tz;
    if (tz) return tz;
  } catch {
    // ignore
  }
  return 'Asia/Kolkata';
}

export function isValidTimezone(value: string): boolean {
  if (!value) return false;
  if (listTimezones().includes(value)) return true;
  // Accept IANA-style ids even if the runtime list is a fallback subset
  return value === 'UTC' || /^[A-Za-z_]+\/[A-Za-z0-9_+\-]+(?:\/[A-Za-z0-9_+\-]+)?$/.test(value);
}

export function detectLocale(): string {
  try {
    const locale =
      (typeof navigator !== 'undefined' && (navigator.language || navigator.languages?.[0]))
      || Intl.DateTimeFormat().resolvedOptions().locale
      || 'en-IN';
    const normalized = locale.replace('_', '-');
    const exact = APP_LOCALES.find((l) => l.code.toLowerCase() === normalized.toLowerCase());
    if (exact) return exact.code;
    const lang = normalized.split('-')[0]?.toLowerCase();
    const byLang = APP_LOCALES.find((l) => l.code.toLowerCase().startsWith(`${lang}-`));
    if (byLang) return byLang.code;
  } catch {
    // ignore
  }
  return 'en-IN';
}

export function isValidLocale(value: string): boolean {
  return APP_LOCALES.some((l) => l.code === value);
}
