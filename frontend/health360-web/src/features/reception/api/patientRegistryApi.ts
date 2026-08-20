import { apiClient } from '@/shared/api/client';
import type { ApiEnvelope } from '@/features/auth/api/authApi';
import type { SpringPage } from '@/features/patient/api/patientExtendedApi';

export interface HospitalPatientSummary {
  patientId: string;
  uhid?: string;
  legalName: string;
  primaryPhone?: string;
  dateOfBirth?: string;
  gender?: string;
  bloodGroup?: string;
  permanentCity?: string;
  permanentState?: string;
}

export interface RegisterHospitalPatientPayload {
  legalFirstName: string;
  legalLastName: string;
  dateOfBirth: string;
  gender: string;
  primaryPhone: string;
  secondaryPhone?: string;
  bloodGroup?: string;
  permanentAddressLine1?: string;
  permanentAddressLine2?: string;
  permanentCity?: string;
  permanentState?: string;
  permanentPincode?: string;
  permanentCountry?: string;
  duplicateOverride?: boolean;
  duplicateOverrideReason?: string;
}

export interface RegisterHospitalPatientResult {
  patientId: string;
  uhid: string;
  hospitalRegistrationId: string;
  receiptPath: string;
}

export interface DuplicateCandidate {
  patientId: string;
  uhid?: string;
  legalName: string;
  primaryPhone?: string;
  dateOfBirth?: string;
  matchScore: number;
  matchReason: string;
}

export interface RegistrationReceipt {
  patientId: string;
  uhid: string;
  legalName: string;
  primaryPhone?: string;
  hospitalName: string;
  hospitalId: string;
  branchId?: string;
  registeredAt: string;
  hospitalRegistrationId: string;
}

function unwrap<T>(envelope: ApiEnvelope<T>): T {
  if (!envelope.success || envelope.data === undefined) {
    throw new Error(envelope.message ?? 'Unexpected API response');
  }
  return envelope.data;
}

export async function searchHospitalPatients(params: {
  uhid?: string;
  mobile?: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  page?: number;
  size?: number;
}): Promise<SpringPage<HospitalPatientSummary>> {
  const { data } = await apiClient.get<ApiEnvelope<SpringPage<HospitalPatientSummary>>>(
    '/hospital/patients/search',
    { params },
  );
  return unwrap(data);
}

export async function registerHospitalPatient(
  payload: RegisterHospitalPatientPayload,
): Promise<RegisterHospitalPatientResult> {
  const { data } = await apiClient.post<ApiEnvelope<RegisterHospitalPatientResult>>(
    '/hospital/patients/register',
    payload,
  );
  return unwrap(data);
}

export async function linkExistingHospitalPatient(patientId: string): Promise<RegisterHospitalPatientResult> {
  const { data } = await apiClient.post<ApiEnvelope<RegisterHospitalPatientResult>>(
    `/hospital/patients/${patientId}/link`,
  );
  return unwrap(data);
}

export async function getHospitalPatient(patientId: string): Promise<HospitalPatientSummary> {
  const { data } = await apiClient.get<ApiEnvelope<HospitalPatientSummary>>(
    `/hospital/patients/${patientId}`,
  );
  return unwrap(data);
}

export async function getRegistrationReceipt(patientId: string): Promise<RegistrationReceipt> {
  const { data } = await apiClient.get<ApiEnvelope<RegistrationReceipt>>(
    `/hospital/patients/${patientId}/registration-receipt`,
  );
  return unwrap(data);
}

export function extractDuplicateCandidates(error: unknown): DuplicateCandidate[] | null {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (error as { response?: { data?: { data?: { candidates?: DuplicateCandidate[] } } } }).response;
    const candidates = response?.data?.data?.candidates;
    if (Array.isArray(candidates) && candidates.length > 0) {
      return candidates;
    }
  }
  return null;
}
