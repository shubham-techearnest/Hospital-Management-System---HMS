import { apiClient } from '@/shared/api/client';
import type { ApiEnvelope } from '@/features/auth/api/authApi';
import type { SpringPage } from '@/features/patient/api/patientExtendedApi';

function unwrap<T>(envelope: ApiEnvelope<T>): T {
  if (!envelope.success || envelope.data === undefined) {
    throw new Error(envelope.message ?? 'Request failed');
  }
  return envelope.data;
}

export type StaffWorklistRow = {
  id: string;
  title: string;
  subtitle: string;
  meta?: string;
};

export async function listLabPendingWorklist(hospitalId: string, branchId: string): Promise<StaffWorklistRow[]> {
  const { data } = await apiClient.get<ApiEnvelope<Array<{
    clinicalOrderItemId: string;
    itemName: string;
    itemCode?: string;
    patientName?: string;
    uhid?: string;
    orderedAt: string;
  }>>>('/lab/worklist/pending', { params: { hospitalId, branchId } });
  return (unwrap(data) ?? []).map((item) => ({
    id: item.clinicalOrderItemId,
    title: item.itemName + (item.itemCode ? ` (${item.itemCode})` : ''),
    subtitle: [item.patientName, item.uhid].filter(Boolean).join(' · ') || 'Patient',
    meta: new Date(item.orderedAt).toLocaleString(),
  }));
}

export async function listRadiologyPendingWorklist(hospitalId: string, branchId: string): Promise<StaffWorklistRow[]> {
  const { data } = await apiClient.get<ApiEnvelope<Array<{
    clinicalOrderItemId: string;
    itemName: string;
    itemCode?: string;
    patientName?: string;
    uhid?: string;
    orderedAt: string;
  }>>>('/radiology/worklist/pending', { params: { hospitalId, branchId } });
  return (unwrap(data) ?? []).map((item) => ({
    id: item.clinicalOrderItemId,
    title: item.itemName + (item.itemCode ? ` (${item.itemCode})` : ''),
    subtitle: [item.patientName, item.uhid].filter(Boolean).join(' · ') || 'Patient',
    meta: new Date(item.orderedAt).toLocaleString(),
  }));
}

export async function listPharmacyPendingWorklist(hospitalId: string, branchId: string): Promise<StaffWorklistRow[]> {
  const { data } = await apiClient.get<ApiEnvelope<Array<{
    clinicalOrderId: string;
    orderNumber?: string;
    patientName?: string;
    uhid?: string;
    itemCount: number;
    orderedAt: string;
  }>>>('/pharmacy/worklist/pending', { params: { hospitalId, branchId } });
  return (unwrap(data) ?? []).map((item) => ({
    id: item.clinicalOrderId,
    title: item.orderNumber ?? 'Medication order',
    subtitle: [item.patientName, item.uhid].filter(Boolean).join(' · ') || 'Patient',
    meta: `${item.itemCount} item(s) · ${new Date(item.orderedAt).toLocaleString()}`,
  }));
}

export async function listOtPendingWorklist(hospitalId: string, branchId: string): Promise<StaffWorklistRow[]> {
  const { data } = await apiClient.get<ApiEnvelope<Array<{
    clinicalOrderItemId: string;
    itemName: string;
    itemCode?: string;
    patientName?: string;
    uhid?: string;
    orderedAt: string;
  }>>>('/ot/worklist/pending', { params: { hospitalId, branchId } });
  return (unwrap(data) ?? []).map((item) => ({
    id: item.clinicalOrderItemId,
    title: item.itemName + (item.itemCode ? ` (${item.itemCode})` : ''),
    subtitle: [item.patientName, item.uhid].filter(Boolean).join(' · ') || 'Patient',
    meta: new Date(item.orderedAt).toLocaleString(),
  }));
}

export async function listNursingAdmissions(hospitalId: string, branchId: string): Promise<StaffWorklistRow[]> {
  const { data } = await apiClient.get<ApiEnvelope<SpringPage<{
    admissionId: string;
    admissionNumber: string;
    patientName?: string;
    uhid?: string;
    wardCode?: string;
    roomCode?: string;
    bedNumber?: string;
    admittedAt: string;
  }>>>('/ipd/admissions', {
    params: { hospitalId, branchId, status: 'ADMITTED', page: 0, size: 50 },
  });
  return (unwrap(data)?.content ?? []).map((row) => ({
    id: row.admissionId,
    title: row.admissionNumber,
    subtitle: [row.patientName, row.uhid].filter(Boolean).join(' · ') || 'Patient',
    meta: [row.wardCode, row.roomCode, row.bedNumber].filter(Boolean).join('-')
      || new Date(row.admittedAt).toLocaleString(),
  }));
}

export async function listIcuActiveStays(hospitalId: string, branchId: string): Promise<StaffWorklistRow[]> {
  const { data } = await apiClient.get<ApiEnvelope<SpringPage<{
    stayId: string;
    stayNumber: string;
    patientName?: string;
    uhid?: string;
    unitCode?: string;
    bedNumber?: string;
    admittedAt: string;
  }>>>('/icu/stays', {
    params: { hospitalId, branchId, status: 'ACTIVE', page: 0, size: 50 },
  });
  return (unwrap(data)?.content ?? []).map((row) => ({
    id: row.stayId,
    title: row.stayNumber,
    subtitle: [row.patientName, row.uhid].filter(Boolean).join(' · ') || 'Patient',
    meta: [row.unitCode, row.bedNumber].filter(Boolean).join('-')
      || new Date(row.admittedAt).toLocaleString(),
  }));
}
