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

export function formatEnumLabel(value: string): string {
  return value.replace(/_/g, ' ');
}

export function computeBmi(heightCm?: number, weightKg?: number): number | null {
  if (!heightCm || !weightKg || heightCm <= 0) return null;
  const m = heightCm / 100;
  return Math.round((weightKg / (m * m)) * 10) / 10;
}

export function formatVitalDate(iso?: string): string {
  if (!iso) return 'Not recorded';
  return new Date(iso).toLocaleString();
}

export type BpStatus = 'normal' | 'warning' | 'critical';

export function mapBpClassification(classification?: string): BpStatus | undefined {
  if (classification === 'NORMAL') return 'normal';
  if (classification === 'WARNING') return 'warning';
  if (classification === 'CRITICAL') return 'critical';
  return undefined;
}
