import { apiClient } from '@/shared/api/client';
import type { ApiEnvelope } from '@/features/auth/api/authApi';

export interface ImagingReport {
  reportId: string;
  imagingOrderId: string;
  encounterId: string;
  modalityName: string;
  modalityCode: string;
  modalityType: string;
  findingsText?: string;
  impressionText?: string;
  status: string;
  verifiedAt?: string;
  releasedAt?: string;
}

function unwrap<T>(envelope: ApiEnvelope<T>): T {
  if (!envelope.success || envelope.data === undefined) {
    throw new Error(envelope.message ?? 'Request failed');
  }
  return envelope.data;
}

export async function listEncounterImagingReports(encounterId: string): Promise<ImagingReport[]> {
  const { data } = await apiClient.get<ApiEnvelope<ImagingReport[]>>(
    `/radiology/encounters/${encounterId}/reports`,
  );
  return unwrap(data) ?? [];
}
