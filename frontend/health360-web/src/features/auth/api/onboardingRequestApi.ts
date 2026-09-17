import { apiClient } from '@/shared/api/client';
import type { ApiEnvelope } from '@/features/auth/api/authApi';
import type { SpringPage } from '@/features/patient/api/patientExtendedApi';

export type OnboardingRequestType = 'HOSPITAL' | 'DOCTOR';
export type OnboardingRequestStatus = 'PENDING' | 'CONTACTED' | 'APPROVED' | 'REJECTED';

export interface OnboardingRequest {
  id: string;
  requestType: OnboardingRequestType;
  status: OnboardingRequestStatus;
  organizationName?: string;
  contactName: string;
  email: string;
  phone: string;
  city?: string;
  specialty?: string;
  message?: string;
  adminNotes?: string;
  createdAt: string;
  reviewedAt?: string;
}

export interface CreateOnboardingRequestPayload {
  requestType: OnboardingRequestType;
  organizationName?: string;
  contactName: string;
  email: string;
  phone: string;
  city?: string;
  specialty?: string;
  message?: string;
}

export async function submitOnboardingRequest(
  payload: CreateOnboardingRequestPayload,
): Promise<OnboardingRequest> {
  const { data } = await apiClient.post<ApiEnvelope<OnboardingRequest>>(
    '/public/onboarding-requests',
    payload,
  );
  return data.data!;
}

export async function listOnboardingRequests(params: {
  status?: string;
  requestType?: string;
  page?: number;
  size?: number;
}): Promise<SpringPage<OnboardingRequest>> {
  const { data } = await apiClient.get<ApiEnvelope<SpringPage<OnboardingRequest>>>(
    '/admin/onboarding-requests',
    { params },
  );
  return data.data!;
}

export async function updateOnboardingRequestStatus(
  id: string,
  payload: { status: OnboardingRequestStatus; adminNotes?: string },
): Promise<OnboardingRequest> {
  const { data } = await apiClient.patch<ApiEnvelope<OnboardingRequest>>(
    `/admin/onboarding-requests/${id}/status`,
    payload,
  );
  return data.data!;
}
