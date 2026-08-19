import { apiClient } from '@/shared/api/client';
import type { ApiEnvelope } from '@/features/auth/api/authApi';
import type { SpringPage } from '@/features/patient/api/patientExtendedApi';

export interface Medicine {
  medicineId: string;
  hospitalId: string;
  branchId: string;
  code: string;
  name: string;
  form: string;
  strength?: string;
  defaultRoute: string;
  active: boolean;
}

export interface MedicationWorklistItem {
  clinicalOrderId: string;
  encounterId: string;
  patientId: string;
  orderNumber?: string;
  orderedAt: string;
  itemCount: number;
}

export interface MedicationAdministration {
  administrationId: string;
  medicationOrderItemId: string;
  medicationOrderId: string;
  encounterId: string;
  patientId: string;
  medicineName: string;
  doseGiven: string;
  route?: string;
  administeredAt: string;
  administeredBy: string;
  notes?: string;
}

export interface MedicationOrderItem {
  orderItemId: string;
  clinicalOrderItemId: string;
  medicineId?: string;
  medicineName: string;
  status: string;
  doseText?: string;
  route?: string;
  frequency?: string;
  durationDays?: number;
  instructions?: string;
  plannedAt?: string;
  completedAt?: string;
  administrations: MedicationAdministration[];
}

export interface MedicationOrder {
  medicationOrderId: string;
  clinicalOrderId: string;
  encounterId: string;
  patientId: string;
  hospitalId: string;
  branchId: string;
  status: string;
  receivedAt: string;
  verifiedAt?: string;
  verifiedBy?: string;
  completedAt?: string;
  items: MedicationOrderItem[];
}

function unwrap<T>(envelope: ApiEnvelope<T>): T {
  if (!envelope.success || envelope.data === undefined) {
    throw new Error(envelope.message ?? 'Request failed');
  }
  return envelope.data;
}

export async function listMedicines(hospitalId: string, branchId: string): Promise<Medicine[]> {
  const { data } = await apiClient.get<ApiEnvelope<Medicine[]>>('/pharmacy/medicines', {
    params: { hospitalId, branchId },
  });
  return unwrap(data);
}

export async function createMedicine(payload: {
  hospitalId: string;
  branchId: string;
  code: string;
  name: string;
  form?: string;
  strength?: string;
  defaultRoute?: string;
}): Promise<Medicine> {
  const { data } = await apiClient.post<ApiEnvelope<Medicine>>('/pharmacy/medicines', payload);
  return unwrap(data);
}

export async function listPendingMedicationWorklist(
  hospitalId: string,
  branchId: string,
): Promise<MedicationWorklistItem[]> {
  const { data } = await apiClient.get<ApiEnvelope<MedicationWorklistItem[]>>('/pharmacy/worklist/pending', {
    params: { hospitalId, branchId },
  });
  return unwrap(data);
}

export async function createMedicationOrder(clinicalOrderId: string): Promise<MedicationOrder> {
  const { data } = await apiClient.post<ApiEnvelope<MedicationOrder>>('/pharmacy/orders', { clinicalOrderId });
  return unwrap(data);
}

export async function listMedicationOrders(
  hospitalId: string,
  branchId: string,
  page = 0,
  size = 20,
  status?: string,
): Promise<SpringPage<MedicationOrder>> {
  const { data } = await apiClient.get<ApiEnvelope<SpringPage<MedicationOrder>>>('/pharmacy/orders', {
    params: { hospitalId, branchId, page, size, status },
  });
  return unwrap(data) ?? { content: [], totalElements: 0, totalPages: 0, number: 0, size };
}

export async function getMedicationOrder(medicationOrderId: string): Promise<MedicationOrder> {
  const { data } = await apiClient.get<ApiEnvelope<MedicationOrder>>(`/pharmacy/orders/${medicationOrderId}`);
  return unwrap(data);
}

export async function verifyMedicationOrder(medicationOrderId: string): Promise<MedicationOrder> {
  const { data } = await apiClient.post<ApiEnvelope<MedicationOrder>>(
    `/pharmacy/orders/${medicationOrderId}/verify`,
    {},
  );
  return unwrap(data);
}

export async function planMedicationOrderItem(
  orderItemId: string,
  payload: { doseText?: string; route?: string; frequency?: string; durationDays?: number; instructions?: string },
): Promise<MedicationOrder> {
  const { data } = await apiClient.post<ApiEnvelope<MedicationOrder>>(
    `/pharmacy/order-items/${orderItemId}/plan`,
    payload,
  );
  return unwrap(data);
}

export async function administerMedication(
  orderItemId: string,
  payload: { doseGiven: string; route?: string; notes?: string },
): Promise<MedicationAdministration> {
  const { data } = await apiClient.post<ApiEnvelope<MedicationAdministration>>(
    `/pharmacy/order-items/${orderItemId}/administer`,
    payload,
  );
  return unwrap(data);
}

export async function completeMedicationOrderItem(orderItemId: string): Promise<MedicationOrder> {
  const { data } = await apiClient.post<ApiEnvelope<MedicationOrder>>(
    `/pharmacy/order-items/${orderItemId}/complete`,
    {},
  );
  return unwrap(data);
}

export async function listEncounterAdministrations(encounterId: string): Promise<MedicationAdministration[]> {
  const { data } = await apiClient.get<ApiEnvelope<MedicationAdministration[]>>(
    `/pharmacy/encounters/${encounterId}/administrations`,
  );
  return unwrap(data) ?? [];
}
