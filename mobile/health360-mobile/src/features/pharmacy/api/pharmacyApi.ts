import { apiClient } from '@/shared/api/client';
import type { ApiEnvelope } from '@/features/auth/api/authApi';

export interface PharmacyRequestItem {
  pharmacyRequestItemId: string;
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

function unwrap<T>(envelope: ApiEnvelope<T>): T {
  if (!envelope.success || envelope.data === undefined) {
    throw new Error(envelope.message ?? 'Request failed');
  }
  return envelope.data;
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
