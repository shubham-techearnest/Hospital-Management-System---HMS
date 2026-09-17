import { apiClient } from '@/shared/api/client';
import type { ApiEnvelope } from '@/features/auth/api/authApi';
import type { SpringPage } from '@/features/patient/api/patientExtendedApi';

export interface InsurancePayer {
  payerId: string;
  hospitalId: string;
  code: string;
  name: string;
  payerType: string;
  contactPhone?: string;
  contactEmail?: string;
  active: boolean;
}

export interface InsurancePolicy {
  policyId: string;
  hospitalId: string;
  branchId: string;
  patientId: string;
  payerId: string;
  payerName?: string;
  policyNumber: string;
  memberId?: string;
  holderName?: string;
  claimMode: string;
  status: string;
  coverageLimit?: number;
}

export interface PreAuthorization {
  preAuthorizationId: string;
  policyId: string;
  patientId: string;
  authNumber: string;
  authType: string;
  status: string;
  requestedAmount?: number;
  approvedAmount?: number;
  requestedAt: string;
}

export interface InsuranceClaim {
  claimId: string;
  policyId: string;
  preAuthorizationId?: string;
  invoiceId?: string;
  claimNumber: string;
  status: string;
  claimedAmount: number;
  approvedAmount?: number;
  settledAmount?: number;
  submittedAt?: string;
}

function unwrap<T>(envelope: ApiEnvelope<T>): T {
  if (!envelope.success || envelope.data === undefined) {
    throw new Error(envelope.message ?? 'Request failed');
  }
  return envelope.data;
}

export async function listInsurancePayers(hospitalId: string): Promise<InsurancePayer[]> {
  const { data } = await apiClient.get<ApiEnvelope<InsurancePayer[]>>('/api/v1/insurance/payers', {
    params: { hospitalId },
  });
  return unwrap(data);
}

export async function createInsurancePayer(payload: {
  hospitalId: string;
  code: string;
  name: string;
  payerType?: string;
}): Promise<InsurancePayer> {
  const { data } = await apiClient.post<ApiEnvelope<InsurancePayer>>('/api/v1/insurance/payers', payload);
  return unwrap(data);
}

export async function listInsurancePolicies(params: {
  hospitalId: string;
  branchId: string;
  patientId?: string;
}): Promise<SpringPage<InsurancePolicy>> {
  const { data } = await apiClient.get<ApiEnvelope<SpringPage<InsurancePolicy>>>('/api/v1/insurance/policies', {
    params,
  });
  return unwrap(data);
}

export async function createInsurancePolicy(payload: {
  hospitalId: string;
  branchId: string;
  patientId: string;
  payerId: string;
  policyNumber: string;
  memberId?: string;
  holderName?: string;
  claimMode?: string;
  coverageLimit?: number;
}): Promise<InsurancePolicy> {
  const { data } = await apiClient.post<ApiEnvelope<InsurancePolicy>>('/api/v1/insurance/policies', payload);
  return unwrap(data);
}

export async function listPreAuthorizations(params: {
  hospitalId: string;
  branchId: string;
  status?: string;
}): Promise<SpringPage<PreAuthorization>> {
  const { data } = await apiClient.get<ApiEnvelope<SpringPage<PreAuthorization>>>(
    '/api/v1/insurance/pre-authorizations',
    { params },
  );
  return unwrap(data);
}

export async function requestPreAuthorization(payload: {
  policyId: string;
  authType?: string;
  requestedAmount?: number;
  notes?: string;
}): Promise<PreAuthorization> {
  const { data } = await apiClient.post<ApiEnvelope<PreAuthorization>>(
    '/api/v1/insurance/pre-authorizations',
    payload,
  );
  return unwrap(data);
}

export async function decidePreAuthorization(
  authId: string,
  payload: { decision: string; approvedAmount?: number; decisionNotes?: string },
): Promise<PreAuthorization> {
  const { data } = await apiClient.post<ApiEnvelope<PreAuthorization>>(
    `/api/v1/insurance/pre-authorizations/${authId}/decide`,
    payload,
  );
  return unwrap(data);
}

export async function listInsuranceClaims(params: {
  hospitalId: string;
  branchId: string;
  status?: string;
}): Promise<SpringPage<InsuranceClaim>> {
  const { data } = await apiClient.get<ApiEnvelope<SpringPage<InsuranceClaim>>>('/api/v1/insurance/claims', {
    params,
  });
  return unwrap(data);
}

export async function createInsuranceClaim(payload: {
  policyId: string;
  preAuthorizationId?: string;
  invoiceId?: string;
  claimedAmount: number;
  notes?: string;
}): Promise<InsuranceClaim> {
  const { data } = await apiClient.post<ApiEnvelope<InsuranceClaim>>('/api/v1/insurance/claims', payload);
  return unwrap(data);
}

export async function submitInsuranceClaim(claimId: string): Promise<InsuranceClaim> {
  const { data } = await apiClient.post<ApiEnvelope<InsuranceClaim>>(
    `/api/v1/insurance/claims/${claimId}/submit`,
  );
  return unwrap(data);
}

export async function decideInsuranceClaim(
  claimId: string,
  payload: { decision: string; approvedAmount?: number; settledAmount?: number; notes?: string },
): Promise<InsuranceClaim> {
  const { data } = await apiClient.post<ApiEnvelope<InsuranceClaim>>(
    `/api/v1/insurance/claims/${claimId}/decide`,
    payload,
  );
  return unwrap(data);
}
