export type ProfileSectionId =
  | 'basic-info'
  | 'contact-info'
  | 'measurements'
  | 'medical'
  | 'lifestyle'
  | 'emergency-contacts'
  | 'family-members'
  | 'health-goals';

export const PROFILE_SECTIONS: { id: ProfileSectionId; label: string; apiKey: string }[] = [
  { id: 'basic-info', label: 'Basic Information', apiKey: 'BASIC_INFO' },
  { id: 'contact-info', label: 'Contact Information', apiKey: 'CONTACT_INFO' },
  { id: 'measurements', label: 'Physical Measurements', apiKey: 'PHYSICAL_MEASUREMENTS' },
  { id: 'medical', label: 'Medical Information', apiKey: 'MEDICAL_INFO' },
  { id: 'lifestyle', label: 'Lifestyle', apiKey: 'LIFESTYLE' },
  { id: 'emergency-contacts', label: 'Emergency Contacts', apiKey: 'EMERGENCY_CONTACTS' },
  { id: 'family-members', label: 'Family Members', apiKey: 'FAMILY_MEMBERS' },
  { id: 'health-goals', label: 'Health Goals', apiKey: 'HEALTH_GOALS' },
];

/** Hash anchor links for accordion sections on the single profile page. */
export const SECTION_HASHES: Record<string, string> = {
  BASIC_INFO: 'basic-info',
  CONTACT_INFO: 'contact-info',
  PHYSICAL_MEASUREMENTS: 'measurements',
  LIFESTYLE: 'lifestyle',
  MEDICAL_INFO: 'medical',
  EMERGENCY_CONTACTS: 'emergency-contacts',
  FAMILY_MEMBERS: 'family-members',
  HEALTH_GOALS: 'health-goals',
  VITALS: 'vitals',
};

export function profileSectionLink(sectionKey: string): string {
  const hash = SECTION_HASHES[sectionKey];
  if (!hash) return '/patient/profile';
  if (hash === 'vitals') return '/patient/vitals';
  return `/patient/profile#${hash}`;
}

/** @deprecated Use profileSectionLink instead */
export const SECTION_ROUTES: Record<string, string> = Object.fromEntries(
  Object.entries(SECTION_HASHES).map(([key, hash]) => [
    key,
    hash === 'vitals' ? '/patient/vitals' : `/patient/profile#${hash}`,
  ]),
);

export const SECTION_LABELS: Record<string, string> = {
  BASIC_INFO: 'Basic Information',
  CONTACT_INFO: 'Contact Information',
  PHYSICAL_MEASUREMENTS: 'Physical Measurements',
  LIFESTYLE: 'Lifestyle',
  MEDICAL_INFO: 'Medical Information',
  EMERGENCY_CONTACTS: 'Emergency Contacts',
  FAMILY_MEMBERS: 'Family Members',
  HEALTH_GOALS: 'Health Goals',
  VITALS: 'Vital Signs',
};

export function completionLabel(score: number): string {
  if (score >= 80) return 'Nearly Complete';
  if (score >= 60) return 'Good Progress';
  if (score >= 40) return 'Needs Attention';
  return 'Just Started';
}

export function computeBmi(heightCm?: number, weightKg?: number): number | null {
  if (!heightCm || !weightKg || heightCm <= 0) return null;
  const m = heightCm / 100;
  return Math.round((weightKg / (m * m)) * 10) / 10;
}
