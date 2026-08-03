import { apiClient } from '@/shared/api/client';
import type { ApiEnvelope } from '@/features/auth/api/authApi';

export interface Address {
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
}

export interface PatientProfile {
  id: string;
  consentAccepted: boolean;
  consentAcceptedAt?: string;
  completionScore: number;
  basicInfo?: {
    dateOfBirth?: string;
    gender?: string;
    bloodGroup?: string;
    maritalStatus?: string;
    nationality?: string;
    profilePhotoUrl?: string;
  };
  contactInfo?: {
    primaryPhone?: string;
    secondaryPhone?: string;
    permanentAddress?: Address;
    currentAddress?: Address;
  };
  physicalMeasurements?: {
    heightCm?: number;
    weightKg?: number;
    waistCm?: number;
    hipCm?: number;
    neckCm?: number;
    bodyFatPercent?: number;
    measuredAt?: string;
  };
  lifestyle?: {
    smokingStatus?: string;
    smokingFrequency?: string;
    alcoholConsumption?: string;
    exerciseFrequency?: string;
    exerciseType?: string;
    exerciseDurationMinutes?: number;
    occupationType?: string;
    averageSleepHours?: number;
    dietaryPreference?: string;
    stressLevel?: number;
  };
  healthGoals?: {
    targetWeightKg?: number;
    dailyStepsGoal?: number;
    sleepHoursGoal?: number;
    waterIntakeMlGoal?: number;
    weeklyExerciseMinutesGoal?: number;
  };
  allergies: Allergy[];
  medications: Medication[];
  surgeries: Surgery[];
  chronicConditions: ChronicCondition[];
  emergencyContacts: EmergencyContact[];
}

export interface Allergy {
  id: string;
  name: string;
  severity: string;
  reaction?: string;
  diagnosedDate?: string;
}

export interface Medication {
  id: string;
  name: string;
  dosage?: string;
  frequency?: string;
  route?: string;
  startDate?: string;
  endDate?: string;
  prescribingDoctor?: string;
}

export interface Surgery {
  id: string;
  procedureName: string;
  surgeryDate?: string;
  hospitalName?: string;
  notes?: string;
}

export interface ChronicCondition {
  id: string;
  conditionName: string;
  diagnosedDate?: string;
  status?: string;
  notes?: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  primary: boolean;
}

export interface ProfileCompletion {
  completionScore: number;
  sections: {
    name: string;
    weight: number;
    completed: boolean;
    missingFields: string[];
  }[];
}

export async function getPatientProfile() {
  const { data } = await apiClient.get<ApiEnvelope<PatientProfile>>('/patients/me/profile');
  return data.data;
}

export async function acceptConsent() {
  const { data } = await apiClient.post<ApiEnvelope<PatientProfile>>('/patients/me/profile/consent', {
    accepted: true,
  });
  return data.data;
}

export async function updateBasicInfo(payload: PatientProfile['basicInfo']) {
  const { data } = await apiClient.put<ApiEnvelope<PatientProfile>>(
    '/patients/me/profile/basic-info',
    payload,
  );
  return data.data;
}

export async function updateContactInfo(payload: {
  primaryPhone?: string;
  secondaryPhone?: string;
  permanentAddress?: Address;
  currentAddress?: Address;
  sameAsPermanentAddress?: boolean;
}) {
  const { data } = await apiClient.put<ApiEnvelope<PatientProfile>>(
    '/patients/me/profile/contact-info',
    payload,
  );
  return data.data;
}

export async function updatePhysicalMeasurements(payload: {
  heightCm?: number;
  weightKg?: number;
  waistCm?: number;
  hipCm?: number;
  neckCm?: number;
  bodyFatPercent?: number;
  measuredAt: string;
}) {
  const { data } = await apiClient.put<ApiEnvelope<PatientProfile>>(
    '/patients/me/profile/physical-measurements',
    payload,
  );
  return data.data;
}

export async function updateLifestyle(payload: PatientProfile['lifestyle']) {
  const { data } = await apiClient.put<ApiEnvelope<PatientProfile>>(
    '/patients/me/profile/lifestyle',
    payload,
  );
  return data.data;
}

export async function getProfileCompletion() {
  const { data } = await apiClient.get<ApiEnvelope<ProfileCompletion>>(
    '/patients/me/profile/completion',
  );
  return data.data;
}

export async function listAllergies() {
  const { data } = await apiClient.get<ApiEnvelope<Allergy[]>>('/patients/me/profile/allergies');
  return data.data;
}

export async function createAllergy(payload: Omit<Allergy, 'id'>) {
  const { data } = await apiClient.post<ApiEnvelope<Allergy>>('/patients/me/profile/allergies', payload);
  return data.data;
}

export async function deleteAllergy(id: string) {
  await apiClient.delete(`/patients/me/profile/allergies/${id}`);
}

export async function listMedications() {
  const { data } = await apiClient.get<ApiEnvelope<Medication[]>>('/patients/me/profile/medications');
  return data.data;
}

export async function createMedication(payload: Omit<Medication, 'id'>) {
  const { data } = await apiClient.post<ApiEnvelope<Medication>>(
    '/patients/me/profile/medications',
    payload,
  );
  return data.data;
}

export async function deleteMedication(id: string) {
  await apiClient.delete(`/patients/me/profile/medications/${id}`);
}

export async function listSurgeries() {
  const { data } = await apiClient.get<ApiEnvelope<Surgery[]>>('/patients/me/profile/surgeries');
  return data.data;
}

export async function createSurgery(payload: Omit<Surgery, 'id'>) {
  const { data } = await apiClient.post<ApiEnvelope<Surgery>>('/patients/me/profile/surgeries', payload);
  return data.data;
}

export async function deleteSurgery(id: string) {
  await apiClient.delete(`/patients/me/profile/surgeries/${id}`);
}

export async function listChronicConditions() {
  const { data } = await apiClient.get<ApiEnvelope<ChronicCondition[]>>(
    '/patients/me/profile/chronic-conditions',
  );
  return data.data;
}

export async function createChronicCondition(payload: Omit<ChronicCondition, 'id'>) {
  const { data } = await apiClient.post<ApiEnvelope<ChronicCondition>>(
    '/patients/me/profile/chronic-conditions',
    payload,
  );
  return data.data;
}

export async function deleteChronicCondition(id: string) {
  await apiClient.delete(`/patients/me/profile/chronic-conditions/${id}`);
}

export async function listEmergencyContacts() {
  const { data } = await apiClient.get<ApiEnvelope<EmergencyContact[]>>(
    '/patients/me/profile/emergency-contacts',
  );
  return data.data;
}

export async function createEmergencyContact(payload: Omit<EmergencyContact, 'id'>) {
  const { data } = await apiClient.post<ApiEnvelope<EmergencyContact>>(
    '/patients/me/profile/emergency-contacts',
    payload,
  );
  return data.data;
}

export async function deleteEmergencyContact(id: string) {
  await apiClient.delete(`/patients/me/profile/emergency-contacts/${id}`);
}

export interface VitalSignRecord {
  id: string;
  systolicBp?: number;
  diastolicBp?: number;
  heartRate?: number;
  temperature?: number;
  respiratoryRate?: number;
  spo2?: number;
  bloodGlucose?: number;
  glucoseReadingType?: string;
  recordedAt: string;
  bpClassification?: string;
  bpInterpretation?: string;
}

export interface RecordVitalsPayload {
  systolicBp?: number;
  diastolicBp?: number;
  heartRate?: number;
  temperature?: number;
  respiratoryRate?: number;
  spo2?: number;
  bloodGlucose?: number;
  glucoseReadingType?: string;
  recordedAt: string;
}

export interface PagedVitals {
  content: VitalSignRecord[];
  totalElements: number;
}

export async function recordVitals(payload: RecordVitalsPayload) {
  const { data } = await apiClient.post<ApiEnvelope<VitalSignRecord>>(
    '/patients/me/profile/vitals',
    payload,
  );
  return data.data;
}

export async function getVitalsHistory(page = 0, size = 20) {
  const { data } = await apiClient.get<ApiEnvelope<PagedVitals>>(
    '/patients/me/profile/vitals',
    { params: { page, size } },
  );
  return data.data;
}

export async function getLatestVitals(): Promise<VitalSignRecord | null> {
  const { data } = await apiClient.get<ApiEnvelope<VitalSignRecord | null>>(
    '/patients/me/profile/vitals/latest',
  );
  // Backend omits null data fields; React Query requires a non-undefined return value.
  return data.data ?? null;
}
