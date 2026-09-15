import { apiClient } from '@/shared/api/client';
import type { ApiEnvelope } from '@/features/auth/api/authApi';

export interface LetterheadSnapshot {
  hospitalId: string;
  hospitalName: string;
  registrationNumber?: string;
  accreditation?: string;
  tagline?: string;
  footerText?: string;
  hasLogo: boolean;
  logoUrl?: string;
  branchName?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  phone?: string;
  email?: string;
}

export interface DocumentPatientBlock {
  patientId: string;
  patientName: string;
  uhid?: string;
  ageSex?: string;
  encounterNumber?: string;
  visitDate?: string;
}

export interface ClinicianBlock {
  name?: string;
  roleLabel?: string;
  registrationNumber?: string;
  specialization?: string;
  signedAt?: string;
}

export interface MedicationLine {
  sequence: number;
  medicineName: string;
  doseText?: string;
  route?: string;
  frequency?: string;
  durationText?: string;
  quantity?: string;
  instructions?: string;
  howToTake?: string;
}

export interface ConsultationSections {
  chiefComplaint?: string;
  hpi?: string;
  examination?: string;
  assessment?: string;
  plan?: string;
  content?: string;
}

export interface LabResultLine {
  testName: string;
  valueText?: string;
  unit?: string;
  referenceRange?: string;
  flag?: string;
}

export interface LabSections {
  orderNumber?: string;
  orderedAt?: string;
  sampleCollectedAt?: string;
  reportedAt?: string;
  summaryText?: string;
  critical: boolean;
  results: LabResultLine[];
}

export interface PharmacyLine {
  medicineName: string;
  quantity?: string;
  howToTake?: string;
  amountText?: string;
}

export interface PharmacyBillSections {
  requestNumber?: string;
  dispensedAt?: string;
  lines: PharmacyLine[];
  totalAmountText?: string;
}

export interface ClinicalDocument {
  documentType: string;
  documentTitle: string;
  documentNumber?: string;
  issuedAt?: string;
  letterhead: LetterheadSnapshot;
  patient: DocumentPatientBlock;
  clinician?: ClinicianBlock;
  medications?: MedicationLine[];
  consultation?: ConsultationSections;
  lab?: LabSections;
  pharmacy?: PharmacyBillSections;
  notes?: string;
}

export async function fetchPrescriptionDocument(encounterId: string, prescriptionId: string) {
  const { data } = await apiClient.get<ApiEnvelope<ClinicalDocument>>(
    `/clinical/encounters/${encounterId}/documents/prescription/${prescriptionId}`,
  );
  return data.data;
}

export async function fetchConsultationDocument(encounterId: string, noteId: string) {
  const { data } = await apiClient.get<ApiEnvelope<ClinicalDocument>>(
    `/clinical/encounters/${encounterId}/documents/consultation/${noteId}`,
  );
  return data.data;
}

export async function fetchLabReportDocument(labOrderId: string) {
  const { data } = await apiClient.get<ApiEnvelope<ClinicalDocument>>(
    `/lab/orders/${labOrderId}/documents/report`,
  );
  return data.data;
}

export async function fetchPharmacyDispenseSlip(requestId: string) {
  const { data } = await apiClient.get<ApiEnvelope<ClinicalDocument>>(
    `/pharmacy/requests/${requestId}/documents/dispense-slip`,
  );
  return data.data;
}
