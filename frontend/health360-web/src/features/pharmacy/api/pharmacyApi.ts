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
  patientName?: string;
  uhid?: string;
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
  outcome?: string;
  reasonCode?: string;
  reasonText?: string;
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
  encounterNumber?: string;
  patientId: string;
  patientName?: string;
  uhid?: string;
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
  payload: {
    doseGiven?: string;
    outcome?: string;
    reasonCode?: string;
    reasonText?: string;
    route?: string;
    notes?: string;
  },
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

export interface PharmacyRequestItem {
  itemId: string;
  prescriptionItemId: string;
  medicineId?: string;
  medicineName: string;
  quantityRequested: number;
  quantityDispensed: number;
  availabilityStatus: string;
  notes?: string;
}

export interface PharmacyRequest {
  pharmacyRequestId: string;
  requestNumber: string;
  prescriptionId: string;
  prescriptionNumber?: string;
  encounterId: string;
  patientId: string;
  patientName?: string;
  uhid?: string;
  hospitalId: string;
  branchId: string;
  status: string;
  requestedAt: string;
  receivedAt?: string;
  underReviewAt?: string;
  readyAt?: string;
  dispensedAt?: string;
  dispensedBy?: string;
  pharmacistNotes?: string;
  canSendHospital: boolean;
  fulfillPartnerOrgId?: string | null;
  fulfillLocationId?: string | null;
  items: PharmacyRequestItem[];
}

export async function listMyPharmacyRequests(): Promise<PharmacyRequest[]> {
  const { data } = await apiClient.get<ApiEnvelope<PharmacyRequest[]>>('/pharmacy/me/requests');
  return unwrap(data) ?? [];
}

export async function sendPrescriptionToHospitalPharmacy(prescriptionId: string): Promise<PharmacyRequest> {
  const { data } = await apiClient.post<ApiEnvelope<PharmacyRequest>>(
    `/pharmacy/me/prescriptions/${prescriptionId}/send-hospital`,
    {},
  );
  return unwrap(data);
}

export async function sendPrescriptionToPartnerPharmacy(
  prescriptionId: string,
  partnerOrgId: string,
  locationId: string,
): Promise<PharmacyRequest> {
  const { data } = await apiClient.post<ApiEnvelope<PharmacyRequest>>(
    `/pharmacy/me/prescriptions/${prescriptionId}/send`,
    { partnerOrgId, locationId },
  );
  return unwrap(data);
}

export async function listPharmacyRequests(
  hospitalId: string,
  branchId: string,
  status?: string,
): Promise<PharmacyRequest[]> {
  const { data } = await apiClient.get<ApiEnvelope<PharmacyRequest[]>>('/pharmacy/requests', {
    params: { hospitalId, branchId, status },
  });
  return unwrap(data) ?? [];
}

export async function receivePharmacyRequest(requestId: string): Promise<PharmacyRequest> {
  const { data } = await apiClient.post<ApiEnvelope<PharmacyRequest>>(`/pharmacy/requests/${requestId}/receive`, {});
  return unwrap(data);
}

export async function reviewPharmacyRequest(requestId: string, notes?: string): Promise<PharmacyRequest> {
  const { data } = await apiClient.post<ApiEnvelope<PharmacyRequest>>(`/pharmacy/requests/${requestId}/review`, {
    notes,
  });
  return unwrap(data);
}

export async function markPharmacyRequestReady(requestId: string, notes?: string): Promise<PharmacyRequest> {
  const { data } = await apiClient.post<ApiEnvelope<PharmacyRequest>>(`/pharmacy/requests/${requestId}/ready`, {
    notes,
  });
  return unwrap(data);
}

export async function dispensePharmacyRequest(requestId: string): Promise<PharmacyRequest> {
  const { data } = await apiClient.post<ApiEnvelope<PharmacyRequest>>(`/pharmacy/requests/${requestId}/dispense`, {});
  return unwrap(data);
}

export interface MedicineBatch {
  batchId: string;
  medicineId: string;
  medicineName?: string;
  batchNumber: string;
  expiryDate?: string;
  quantityOnHand: number;
  unitCost?: number;
  receivedAt: string;
}

export interface MedicineStockSummary {
  medicineId: string;
  medicineName: string;
  quantityOnHand: number;
  batches: MedicineBatch[];
}

export async function receiveMedicineStock(payload: {
  medicineId: string;
  batchNumber: string;
  quantity: number;
  expiryDate?: string;
  unitCost?: number;
  notes?: string;
}): Promise<MedicineBatch> {
  const { data } = await apiClient.post<ApiEnvelope<MedicineBatch>>('/pharmacy/stock/receive', payload);
  return unwrap(data);
}

export async function getMedicineStock(medicineId: string): Promise<MedicineStockSummary> {
  const { data } = await apiClient.get<ApiEnvelope<MedicineStockSummary>>(
    `/pharmacy/stock/medicines/${medicineId}`,
  );
  return unwrap(data);
}
