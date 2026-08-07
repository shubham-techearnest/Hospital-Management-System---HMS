import type { LifestyleForm } from '../schemas/patient.schema';
import type { PatientProfile } from '../api/patientApi';

/** Maps legacy DB/seed display values to UI enum codes. */
export function normalizeBloodGroup(value?: string | null): string {
  if (!value) return '';
  const map: Record<string, string> = {
    'A+': 'A_POSITIVE',
    'A-': 'A_NEGATIVE',
    'B+': 'B_POSITIVE',
    'B-': 'B_NEGATIVE',
    'AB+': 'AB_POSITIVE',
    'AB-': 'AB_NEGATIVE',
    'O+': 'O_POSITIVE',
    'O-': 'O_NEGATIVE',
  };
  return map[value] ?? value;
}

export function normalizeSmokingFrequency(value?: string | null): string {
  if (!value) return '';
  return value === 'NONE' ? 'NEVER' : value;
}

export function normalizeAlcoholConsumption(value?: string | null): string {
  if (!value) return '';
  return value === 'OCCASIONALLY' ? 'OCCASIONAL' : value;
}

export function normalizeOccupationType(value?: string | null): string {
  if (!value) return '';
  return value === 'OFFICE' ? 'SEDENTARY' : value;
}

export function normalizeLifestyleForm(lifestyle?: PatientProfile['lifestyle']): LifestyleForm {
  if (!lifestyle) {
    return {
      smokingStatus: '',
      smokingFrequency: '',
      alcoholConsumption: '',
      exerciseFrequency: '',
      exerciseType: '',
      occupationType: '',
      dietaryPreference: '',
    };
  }
  return {
    smokingStatus: lifestyle.smokingStatus ?? '',
    smokingFrequency: normalizeSmokingFrequency(lifestyle.smokingFrequency),
    alcoholConsumption: normalizeAlcoholConsumption(lifestyle.alcoholConsumption),
    exerciseFrequency: lifestyle.exerciseFrequency ?? '',
    exerciseType: lifestyle.exerciseType ?? '',
    exerciseDurationMinutes: lifestyle.exerciseDurationMinutes,
    occupationType: normalizeOccupationType(lifestyle.occupationType),
    averageSleepHours: lifestyle.averageSleepHours,
    dietaryPreference: lifestyle.dietaryPreference ?? '',
    stressLevel: lifestyle.stressLevel,
  };
}

export function sanitizeContactPayload<T extends {
  permanentAddress?: { pincode?: string; country?: string; line1?: string; line2?: string; city?: string; state?: string };
  currentAddress?: { pincode?: string; country?: string; line1?: string; line2?: string; city?: string; state?: string };
}>(payload: T): T {
  const cleanAddress = (addr?: T['permanentAddress']) => {
    if (!addr) return undefined;
    const pincode = addr.pincode?.trim();
    const country = addr.country?.trim();
    return {
      ...addr,
      pincode: pincode && /^\d{6}$/.test(pincode) ? pincode : undefined,
      country: country && country.length === 2 ? country : undefined,
    };
  };
  return {
    ...payload,
    permanentAddress: cleanAddress(payload.permanentAddress),
    currentAddress: cleanAddress(payload.currentAddress),
  };
}

export function isValidEmail(value?: string): boolean {
  if (!value?.trim()) return false;
  return /^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(value.trim());
}

export function sanitizeOptionalEmail(value?: string): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;
  return isValidEmail(trimmed) ? trimmed : undefined;
}

export type BasicInfoPayload = {
  dateOfBirth?: string;
  gender?: string;
  bloodGroup?: string;
  maritalStatus?: string;
  nationality?: string;
  profilePhotoUrl?: string;
};

/** Omits blank optional fields so backend validation does not reject empty strings. */
export function sanitizeBasicInfoPayload(payload: BasicInfoPayload): BasicInfoPayload {
  const result: BasicInfoPayload = {};
  if (payload.dateOfBirth?.trim()) result.dateOfBirth = payload.dateOfBirth.trim();
  if (payload.gender?.trim()) result.gender = payload.gender.trim();
  if (payload.bloodGroup?.trim()) result.bloodGroup = payload.bloodGroup.trim();
  if (payload.maritalStatus?.trim()) result.maritalStatus = payload.maritalStatus.trim();
  const nationality = payload.nationality?.trim();
  if (nationality && nationality.length === 2) result.nationality = nationality.toUpperCase();
  if (payload.profilePhotoUrl?.trim()) result.profilePhotoUrl = payload.profilePhotoUrl.trim();
  return result;
}
