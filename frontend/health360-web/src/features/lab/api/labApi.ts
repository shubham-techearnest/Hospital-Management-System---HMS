import { apiClient } from '@/shared/api/client';
import type { ApiEnvelope } from '@/features/auth/api/authApi';
import type { SpringPage } from '@/features/patient/api/patientExtendedApi';

export interface Laboratory {
  laboratoryId: string;
  hospitalId: string;
  branchId: string;
  name: string;
  code: string;
  active: boolean;
}

export interface LabTest {
  labTestId: string;
  laboratoryId: string;
  code: string;
  name: string;
  specimenType: string;
  active: boolean;
}

export interface LabTestParameter {
  parameterId: string;
  labTestId: string;
  code: string;
  name: string;
  unit?: string;
  referenceRange?: string;
}

export interface LabWorklistItem {
  clinicalOrderItemId: string;
  clinicalOrderId: string;
  encounterId: string;
  patientId: string;
  orderNumber?: string;
  itemName: string;
  itemCode?: string;
  labTestId?: string;
  orderedAt: string;
}

export interface LabSample {
  sampleId: string;
  labOrderId: string;
  specimenId?: string;
  collectedAt: string;
  collectedBy?: string;
  notes?: string;
}

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

export interface LabOrder {
  labOrderId: string;
  clinicalOrderItemId: string;
  clinicalOrderId: string;
  encounterId: string;
  patientId: string;
  hospitalId: string;
  branchId: string;
  labTestId: string;
  testCode: string;
  testName: string;
  status: string;
  receivedAt: string;
  sample?: LabSample;
  results: LabResult[];
  report?: LabReport;
}

function unwrap<T>(envelope: ApiEnvelope<T>): T {
  if (!envelope.success || envelope.data === undefined) {
    throw new Error(envelope.message ?? 'Request failed');
  }
  return envelope.data;
}

export async function listLaboratories(hospitalId: string, branchId: string): Promise<Laboratory[]> {
  const { data } = await apiClient.get<ApiEnvelope<Laboratory[]>>('/lab/laboratories', {
    params: { hospitalId, branchId },
  });
  return unwrap(data);
}

export async function createLaboratory(payload: {
  hospitalId: string;
  branchId: string;
  name: string;
  code: string;
}): Promise<Laboratory> {
  const { data } = await apiClient.post<ApiEnvelope<Laboratory>>('/lab/laboratories', payload);
  return unwrap(data);
}

export async function listBranchLabTests(hospitalId: string, branchId: string): Promise<LabTest[]> {
  const { data } = await apiClient.get<ApiEnvelope<LabTest[]>>('/lab/tests', {
    params: { hospitalId, branchId },
  });
  return unwrap(data);
}

export async function createLabTest(payload: {
  laboratoryId: string;
  code: string;
  name: string;
  specimenType?: string;
}): Promise<LabTest> {
  const { data } = await apiClient.post<ApiEnvelope<LabTest>>('/lab/tests', payload);
  return unwrap(data);
}

export async function listLabTestParameters(labTestId: string): Promise<LabTestParameter[]> {
  const { data } = await apiClient.get<ApiEnvelope<LabTestParameter[]>>(`/lab/tests/${labTestId}/parameters`);
  return unwrap(data);
}

export async function createLabTestParameter(
  labTestId: string,
  payload: { code: string; name: string; unit?: string; referenceRange?: string },
): Promise<LabTestParameter> {
  const { data } = await apiClient.post<ApiEnvelope<LabTestParameter>>(
    `/lab/tests/${labTestId}/parameters`,
    payload,
  );
  return unwrap(data);
}

export async function listPendingLabWorklist(hospitalId: string, branchId: string): Promise<LabWorklistItem[]> {
  const { data } = await apiClient.get<ApiEnvelope<LabWorklistItem[]>>('/lab/worklist/pending', {
    params: { hospitalId, branchId },
  });
  return unwrap(data);
}

export async function createLabOrder(clinicalOrderItemId: string): Promise<LabOrder> {
  const { data } = await apiClient.post<ApiEnvelope<LabOrder>>('/lab/orders', { clinicalOrderItemId });
  return unwrap(data);
}

export async function listLabOrders(
  hospitalId: string,
  branchId: string,
  page = 0,
  size = 20,
  status?: string,
): Promise<SpringPage<LabOrder>> {
  const { data } = await apiClient.get<ApiEnvelope<SpringPage<LabOrder>>>('/lab/orders', {
    params: { hospitalId, branchId, page, size, status },
  });
  return unwrap(data) ?? { content: [], totalElements: 0, totalPages: 0, number: 0, size };
}

export async function getLabOrder(labOrderId: string): Promise<LabOrder> {
  const { data } = await apiClient.get<ApiEnvelope<LabOrder>>(`/lab/orders/${labOrderId}`);
  return unwrap(data);
}

export async function collectLabSample(
  labOrderId: string,
  payload: { specimenId?: string; notes?: string },
): Promise<LabOrder> {
  const { data } = await apiClient.post<ApiEnvelope<LabOrder>>(
    `/lab/orders/${labOrderId}/collect-sample`,
    payload,
  );
  return unwrap(data);
}

export async function enterLabResults(
  labOrderId: string,
  results: Array<{ parameterId: string; valueText: string; valueNumeric?: number }>,
): Promise<LabOrder> {
  const { data } = await apiClient.post<ApiEnvelope<LabOrder>>(`/lab/orders/${labOrderId}/results`, { results });
  return unwrap(data);
}

export async function verifyLabResults(labOrderId: string): Promise<LabOrder> {
  const { data } = await apiClient.post<ApiEnvelope<LabOrder>>(`/lab/orders/${labOrderId}/verify`, {});
  return unwrap(data);
}

export async function releaseLabReport(labOrderId: string, summaryText?: string): Promise<LabReport> {
  const { data } = await apiClient.post<ApiEnvelope<LabReport>>(`/lab/orders/${labOrderId}/release`, {
    summaryText,
  });
  return unwrap(data);
}

export async function listEncounterLabReports(encounterId: string): Promise<LabReport[]> {
  const { data } = await apiClient.get<ApiEnvelope<LabReport[]>>(`/lab/encounters/${encounterId}/reports`);
  return unwrap(data) ?? [];
}
