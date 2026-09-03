/** ISO country dialing metadata for phone country-code pickers. */

export type CountryDial = {
  iso: string;
  name: string;
  dialCode: string;
  /** Typical national significant number length (digits only). */
  nationalLength: number;
};

export const COUNTRY_DIALS: CountryDial[] = [
  { iso: 'IN', name: 'India', dialCode: '91', nationalLength: 10 },
  { iso: 'US', name: 'United States', dialCode: '1', nationalLength: 10 },
  { iso: 'CA', name: 'Canada', dialCode: '1', nationalLength: 10 },
  { iso: 'GB', name: 'United Kingdom', dialCode: '44', nationalLength: 10 },
  { iso: 'AE', name: 'United Arab Emirates', dialCode: '971', nationalLength: 9 },
  { iso: 'AU', name: 'Australia', dialCode: '61', nationalLength: 9 },
  { iso: 'BD', name: 'Bangladesh', dialCode: '880', nationalLength: 10 },
  { iso: 'BH', name: 'Bahrain', dialCode: '973', nationalLength: 8 },
  { iso: 'BR', name: 'Brazil', dialCode: '55', nationalLength: 11 },
  { iso: 'CN', name: 'China', dialCode: '86', nationalLength: 11 },
  { iso: 'DE', name: 'Germany', dialCode: '49', nationalLength: 11 },
  { iso: 'FR', name: 'France', dialCode: '33', nationalLength: 9 },
  { iso: 'HK', name: 'Hong Kong', dialCode: '852', nationalLength: 8 },
  { iso: 'ID', name: 'Indonesia', dialCode: '62', nationalLength: 11 },
  { iso: 'IE', name: 'Ireland', dialCode: '353', nationalLength: 9 },
  { iso: 'JP', name: 'Japan', dialCode: '81', nationalLength: 10 },
  { iso: 'KW', name: 'Kuwait', dialCode: '965', nationalLength: 8 },
  { iso: 'LK', name: 'Sri Lanka', dialCode: '94', nationalLength: 9 },
  { iso: 'MY', name: 'Malaysia', dialCode: '60', nationalLength: 10 },
  { iso: 'NP', name: 'Nepal', dialCode: '977', nationalLength: 10 },
  { iso: 'NZ', name: 'New Zealand', dialCode: '64', nationalLength: 9 },
  { iso: 'OM', name: 'Oman', dialCode: '968', nationalLength: 8 },
  { iso: 'PH', name: 'Philippines', dialCode: '63', nationalLength: 10 },
  { iso: 'PK', name: 'Pakistan', dialCode: '92', nationalLength: 10 },
  { iso: 'QA', name: 'Qatar', dialCode: '974', nationalLength: 8 },
  { iso: 'SA', name: 'Saudi Arabia', dialCode: '966', nationalLength: 9 },
  { iso: 'SG', name: 'Singapore', dialCode: '65', nationalLength: 8 },
  { iso: 'TH', name: 'Thailand', dialCode: '66', nationalLength: 9 },
  { iso: 'ZA', name: 'South Africa', dialCode: '27', nationalLength: 9 },
];

/** Common timezone → ISO country hints for auto country-code detection. */
export const TIMEZONE_COUNTRY_HINTS: Record<string, string> = {
  'Asia/Kolkata': 'IN',
  'Asia/Calcutta': 'IN',
  'Asia/Dubai': 'AE',
  'Asia/Karachi': 'PK',
  'Asia/Dhaka': 'BD',
  'Asia/Colombo': 'LK',
  'Asia/Kathmandu': 'NP',
  'Asia/Singapore': 'SG',
  'Asia/Hong_Kong': 'HK',
  'Asia/Tokyo': 'JP',
  'Asia/Shanghai': 'CN',
  'Asia/Bangkok': 'TH',
  'Asia/Jakarta': 'ID',
  'Asia/Kuala_Lumpur': 'MY',
  'Asia/Manila': 'PH',
  'Asia/Riyadh': 'SA',
  'Asia/Qatar': 'QA',
  'Asia/Kuwait': 'KW',
  'Asia/Bahrain': 'BH',
  'Asia/Muscat': 'OM',
  'America/New_York': 'US',
  'America/Chicago': 'US',
  'America/Denver': 'US',
  'America/Los_Angeles': 'US',
  'America/Toronto': 'CA',
  'America/Vancouver': 'CA',
  'America/Sao_Paulo': 'BR',
  'Europe/London': 'GB',
  'Europe/Dublin': 'IE',
  'Europe/Paris': 'FR',
  'Europe/Berlin': 'DE',
  'Australia/Sydney': 'AU',
  'Australia/Melbourne': 'AU',
  'Pacific/Auckland': 'NZ',
  'Africa/Johannesburg': 'ZA',
};

export function getCountryByIso(iso: string): CountryDial | undefined {
  return COUNTRY_DIALS.find((c) => c.iso === iso.toUpperCase());
}

export function getCountryByDialCode(dialCode: string): CountryDial | undefined {
  const code = dialCode.replace(/^\+/, '');
  // Prefer longer dial codes first (971 before 91 before 1)
  return [...COUNTRY_DIALS]
    .sort((a, b) => b.dialCode.length - a.dialCode.length)
    .find((c) => c.dialCode === code);
}
