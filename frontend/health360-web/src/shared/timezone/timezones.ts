/** Curated major IANA timezones for account / hospital settings. */

export const MAJOR_TIMEZONES = [
  'Asia/Kolkata',
  'Asia/Dubai',
  'Asia/Riyadh',
  'Asia/Karachi',
  'Asia/Dhaka',
  'Asia/Colombo',
  'Asia/Kathmandu',
  'Asia/Bangkok',
  'Asia/Singapore',
  'Asia/Jakarta',
  'Asia/Hong_Kong',
  'Asia/Shanghai',
  'Asia/Tokyo',
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
  'Africa/Cairo',
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

export function listTimezones(): string[] {
  return [...MAJOR_TIMEZONES];
}

/** Options for pickers — includes current value if it is a legacy non-major zone. */
export function listTimezoneOptions(currentValue?: string | null): string[] {
  const majors = listTimezones();
  const current = currentValue?.trim();
  if (current && !majors.includes(current)) {
    return [current, ...majors];
  }
  return majors;
}

export function detectTimezone(): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz && MAJOR_TIMEZONES.includes(tz as (typeof MAJOR_TIMEZONES)[number])) {
      return tz;
    }
  } catch {
    // ignore
  }
  return 'Asia/Kolkata';
}

export function isValidTimezone(value: string): boolean {
  if (!value) return false;
  if (MAJOR_TIMEZONES.includes(value as (typeof MAJOR_TIMEZONES)[number])) return true;
  // Accept legacy / device IANA ids so existing profiles still validate
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
