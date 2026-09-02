import { apiClient } from '@/shared/api/client';
import type { ApiEnvelope } from '@/features/auth/api/authApi';

export interface LabResult {
  resultId: string;
  labOrderId: string;
  parameterId: string;
  parameterCode: string;
  parameterName: string;
  valueText: string;
  valueNumeric?: number;
  unit?: string;
  referenceRange?: string;
  status: string;
  recordedAt: string;
}

export interface LabReport {
  reportId: string;
  labOrderId: string;
  encounterId: string;
  testName: string;
  testCode: string;
  summaryText?: string;
  releasedAt: string;
  results: LabResult[];
}

export interface PatientLabOrder {
  clinicalOrderItemId: string;
  clinicalOrderId: string;
  encounterId: string;
  encounterNumber?: string;
  hospitalId: string;
  hospitalName?: string;
  branchId: string;
  labTestId?: string;
  testName: string;
  testCode?: string;
  itemStatus: string;
  labOrderId?: string;
  labOrderStatus?: string;
  orderedAt: string;
  canBookHospital: boolean;
  canBookPartner?: boolean;
  fulfillPartnerOrgId?: string | null;
  fulfillLocationId?: string | null;
  specimenId?: string;
  report?: LabReport;
}

function unwrap<T>(envelope: ApiEnvelope<T>): T {
  if (!envelope.success || envelope.data === undefined) {
    throw new Error(envelope.message ?? 'Request failed');
  }
  return envelope.data;
}

export async function listMyLabOrders(): Promise<PatientLabOrder[]> {
  const { data } = await apiClient.get<ApiEnvelope<PatientLabOrder[]>>('/lab/me/orders');
  return unwrap(data) ?? [];
}

export async function bookHospitalLab(clinicalOrderItemId: string): Promise<PatientLabOrder> {
  const { data } = await apiClient.post<ApiEnvelope<PatientLabOrder>>(
    `/lab/me/orders/${clinicalOrderItemId}/book-hospital`,
    {},
  );
  return unwrap(data);
}

export async function bookPartnerLab(
  clinicalOrderItemId: string,
  partnerOrgId: string,
  locationId: string,
): Promise<PatientLabOrder> {
  const { data } = await apiClient.post<ApiEnvelope<PatientLabOrder>>(
    `/lab/me/orders/${clinicalOrderItemId}/book`,
    { partnerOrgId, locationId },
  );
  return unwrap(data);
}

export async function listEncounterLabReports(encounterId: string): Promise<LabReport[]> {
  const { data } = await apiClient.get<ApiEnvelope<LabReport[]>>(
    `/lab/encounters/${encounterId}/reports`,
  );
  return unwrap(data) ?? [];
}
