import { apiClient } from '@/shared/api/client';
import type { ApiEnvelope } from '@/features/auth/api/authApi';
import type { SpringPage } from '@/features/patient/api/patientExtendedApi';

export interface ImagingModality {
  modalityId: string;
  hospitalId: string;
  branchId: string;
  code: string;
  name: string;
  modalityType: string;
  active: boolean;
}

export interface ImagingWorklistItem {
  clinicalOrderItemId: string;
  clinicalOrderId: string;
  encounterId: string;
  patientId: string;
  orderNumber?: string;
  itemName: string;
  itemCode?: string;
  modalityId?: string;
  orderedAt: string;
}

export interface ImagingStudy {
  studyId: string;
  imagingOrderId: string;
  scheduledAt?: string;
  performedAt?: string;
  performedBy?: string;
  notes?: string;
}

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

export interface ImagingOrder {
  imagingOrderId: string;
  clinicalOrderItemId: string;
  clinicalOrderId: string;
  encounterId: string;
  patientId: string;
  hospitalId: string;
  branchId: string;
  modalityId: string;
  modalityCode: string;
  modalityName: string;
  modalityType: string;
  status: string;
  receivedAt: string;
  study?: ImagingStudy;
  report?: ImagingReport;
}

function unwrap<T>(envelope: ApiEnvelope<T>): T {
  if (!envelope.success || envelope.data === undefined) {
    throw new Error(envelope.message ?? 'Request failed');
  }
  return envelope.data;
}

export async function listModalities(hospitalId: string, branchId: string): Promise<ImagingModality[]> {
  const { data } = await apiClient.get<ApiEnvelope<ImagingModality[]>>('/radiology/modalities', {
    params: { hospitalId, branchId },
  });
  return unwrap(data);
}

export async function createModality(payload: {
  hospitalId: string;
  branchId: string;
  code: string;
  name: string;
  modalityType?: string;
}): Promise<ImagingModality> {
  const { data } = await apiClient.post<ApiEnvelope<ImagingModality>>('/radiology/modalities', payload);
  return unwrap(data);
}

export async function listPendingImagingWorklist(
  hospitalId: string,
  branchId: string,
): Promise<ImagingWorklistItem[]> {
  const { data } = await apiClient.get<ApiEnvelope<ImagingWorklistItem[]>>('/radiology/worklist/pending', {
    params: { hospitalId, branchId },
  });
  return unwrap(data);
}

export async function createImagingOrder(clinicalOrderItemId: string): Promise<ImagingOrder> {
  const { data } = await apiClient.post<ApiEnvelope<ImagingOrder>>('/radiology/orders', { clinicalOrderItemId });
  return unwrap(data);
}

export async function listImagingOrders(
  hospitalId: string,
  branchId: string,
  page = 0,
  size = 20,
  status?: string,
): Promise<SpringPage<ImagingOrder>> {
  const { data } = await apiClient.get<ApiEnvelope<SpringPage<ImagingOrder>>>('/radiology/orders', {
    params: { hospitalId, branchId, page, size, status },
  });
  return unwrap(data) ?? { content: [], totalElements: 0, totalPages: 0, number: 0, size };
}

export async function getImagingOrder(imagingOrderId: string): Promise<ImagingOrder> {
  const { data } = await apiClient.get<ApiEnvelope<ImagingOrder>>(`/radiology/orders/${imagingOrderId}`);
  return unwrap(data);
}

export async function scheduleImagingStudy(
  imagingOrderId: string,
  payload: { scheduledAt?: string; notes?: string },
): Promise<ImagingOrder> {
  const { data } = await apiClient.post<ApiEnvelope<ImagingOrder>>(
    `/radiology/orders/${imagingOrderId}/schedule`,
    payload,
  );
  return unwrap(data);
}

export async function performImagingStudy(
  imagingOrderId: string,
  payload: { notes?: string },
): Promise<ImagingOrder> {
  const { data } = await apiClient.post<ApiEnvelope<ImagingOrder>>(
    `/radiology/orders/${imagingOrderId}/perform`,
    payload,
  );
  return unwrap(data);
}

export async function enterImagingReport(
  imagingOrderId: string,
  payload: { findingsText?: string; impressionText?: string },
): Promise<ImagingOrder> {
  const { data } = await apiClient.post<ApiEnvelope<ImagingOrder>>(
    `/radiology/orders/${imagingOrderId}/report`,
    payload,
  );
  return unwrap(data);
}

export async function verifyImagingReport(imagingOrderId: string): Promise<ImagingOrder> {
  const { data } = await apiClient.post<ApiEnvelope<ImagingOrder>>(
    `/radiology/orders/${imagingOrderId}/verify`,
    {},
  );
  return unwrap(data);
}

export async function releaseImagingReport(
  imagingOrderId: string,
  summaryText?: string,
): Promise<ImagingReport> {
  const { data } = await apiClient.post<ApiEnvelope<ImagingReport>>(
    `/radiology/orders/${imagingOrderId}/release`,
    { summaryText },
  );
  return unwrap(data);
}

export async function listEncounterImagingReports(encounterId: string): Promise<ImagingReport[]> {
  const { data } = await apiClient.get<ApiEnvelope<ImagingReport[]>>(
    `/radiology/encounters/${encounterId}/reports`,
  );
  return unwrap(data) ?? [];
}
