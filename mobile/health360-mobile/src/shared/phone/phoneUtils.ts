import {
  COUNTRY_DIALS,
  TIMEZONE_COUNTRY_HINTS,
  getCountryByDialCode,
  getCountryByIso,
  type CountryDial,
} from './countries';

export type ParsedPhone = {
  iso: string;
  dialCode: string;
  nationalNumber: string;
};

export function digitsOnly(value: string): string {
  return value.replace(/\D/g, '');
}

export function detectCountryIso(): string {
  try {
    const locale =
      (typeof navigator !== 'undefined' && (navigator.language || navigator.languages?.[0]))
      || Intl.DateTimeFormat().resolvedOptions().locale
      || 'en-IN';
    const region = locale.split(/[-_]/)[1]?.toUpperCase();
    if (region && getCountryByIso(region)) {
      return region;
    }
  } catch {
    // ignore
  }

  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz && TIMEZONE_COUNTRY_HINTS[tz]) {
      return TIMEZONE_COUNTRY_HINTS[tz];
    }
  } catch {
    // ignore
  }

  return 'IN';
}

export function detectDialCountry(): CountryDial {
  return getCountryByIso(detectCountryIso()) ?? COUNTRY_DIALS[0];
}

/** Split stored/API phone into country + national parts. */
export function parsePhone(value: string | undefined | null, fallbackIso?: string): ParsedPhone {
  const fallback = getCountryByIso(fallbackIso ?? detectCountryIso()) ?? COUNTRY_DIALS[0];
  const raw = (value ?? '').trim();
  if (!raw) {
    return { iso: fallback.iso, dialCode: fallback.dialCode, nationalNumber: '' };
  }

  const digits = digitsOnly(raw);
  if (raw.startsWith('+') || digits.length > 10) {
    const sorted = [...COUNTRY_DIALS].sort((a, b) => b.dialCode.length - a.dialCode.length);
    for (const country of sorted) {
      if (digits.startsWith(country.dialCode) && digits.length > country.dialCode.length) {
        return {
          iso: country.iso,
          dialCode: country.dialCode,
          nationalNumber: digits.slice(country.dialCode.length),
        };
      }
    }
  }

  return {
    iso: fallback.iso,
    dialCode: fallback.dialCode,
    nationalNumber: digits.length > fallback.nationalLength
      ? digits.slice(-fallback.nationalLength)
      : digits,
  };
}

export function toE164(dialCode: string, nationalNumber: string): string {
  const national = digitsOnly(nationalNumber);
  const code = dialCode.replace(/^\+/, '');
  if (!national) return '';
  return `+${code}${national}`;
}

export function isValidNationalNumber(iso: string, nationalNumber: string): boolean {
  const country = getCountryByIso(iso);
  const digits = digitsOnly(nationalNumber);
  if (!country) {
    return digits.length >= 6 && digits.length <= 14;
  }
  // Allow slight variance (±1) for some regions
  return digits.length >= Math.max(6, country.nationalLength - 1)
    && digits.length <= country.nationalLength + 1;
}

export function isValidE164(value: string): boolean {
  if (!value) return false;
  if (!/^\+[1-9]\d{6,14}$/.test(value)) return false;
  const parsed = parsePhone(value);
  return isValidNationalNumber(parsed.iso, parsed.nationalNumber);
}

export function formatDialLabel(country: CountryDial): string {
  return `${country.iso} +${country.dialCode}`;
}

export { getCountryByDialCode, getCountryByIso, COUNTRY_DIALS };
