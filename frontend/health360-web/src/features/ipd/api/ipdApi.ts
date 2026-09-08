import { apiClient } from '@/shared/api/client';
import type { ApiEnvelope } from '@/features/auth/api/authApi';
import type { SpringPage } from '@/features/patient/api/patientExtendedApi';

export interface IpdWard {
  wardId: string;
  hospitalId: string;
  branchId: string;
  departmentId?: string;
  name: string;
  code: string;
  wardType: string;
  active: boolean;
}

export interface IpdRoom {
  roomId: string;
  wardId: string;
  name: string;
  code: string;
  active: boolean;
}

export interface IpdBed {
  bedId: string;
  roomId: string;
  wardId: string;
  wardCode: string;
  roomCode: string;
  bedNumber: string;
  status: string;
}

export interface IpdAdmission {
  admissionId: string;
  encounterId: string;
  encounterNumber: string;
  patientId: string;
  patientName?: string;
  uhid?: string;
  hospitalId: string;
  branchId: string;
  primaryDoctorId?: string;
  bedId?: string;
  wardCode?: string;
  roomCode?: string;
  bedNumber?: string;
  admissionNumber: string;
  admissionReason?: string;
  admissionSource?: string;
  admissionType?: string;
  isolationRequired?: boolean;
  careLevel?: string;
  activeIcuStayId?: string;
  status: string;
  encounterStatus: string;
  admittedAt: string;
  dischargedAt?: string;
  followUpAppointmentId?: string;
  closedAt?: string;
  closedBy?: string;
  readmittedFromAdmissionId?: string;
}

function unwrap<T>(envelope: ApiEnvelope<T>): T {
  if (!envelope.success || envelope.data === undefined) {
    throw new Error(envelope.message ?? 'Request failed');
  }
  return envelope.data;
}

export async function listIpdWards(hospitalId: string, branchId: string): Promise<IpdWard[]> {
  const { data } = await apiClient.get<ApiEnvelope<IpdWard[]>>('/ipd/wards', { params: { hospitalId, branchId } });
  return unwrap(data);
}

export async function createIpdWard(payload: {
  hospitalId: string;
  branchId: string;
  name: string;
  code: string;
  wardType?: string;
}): Promise<IpdWard> {
  const { data } = await apiClient.post<ApiEnvelope<IpdWard>>('/ipd/wards', payload);
  return unwrap(data);
}

export async function listIpdRooms(wardId: string): Promise<IpdRoom[]> {
  const { data } = await apiClient.get<ApiEnvelope<IpdRoom[]>>('/ipd/rooms', { params: { wardId } });
  return unwrap(data);
}

export async function createIpdRoom(payload: { wardId: string; name: string; code: string }): Promise<IpdRoom> {
  const { data } = await apiClient.post<ApiEnvelope<IpdRoom>>('/ipd/rooms', payload);
  return unwrap(data);
}

export async function listIpdBeds(hospitalId: string, branchId: string, status?: string): Promise<IpdBed[]> {
  const { data } = await apiClient.get<ApiEnvelope<IpdBed[]>>('/ipd/beds', {
    params: { hospitalId, branchId, status },
  });
  return unwrap(data);
}

export async function createIpdBed(payload: { roomId: string; bedNumber: string }): Promise<IpdBed> {
  const { data } = await apiClient.post<ApiEnvelope<IpdBed>>('/ipd/beds', payload);
  return unwrap(data);
}

export async function updateIpdBedStatus(
  bedId: string,
  payload: { status: string; reason?: string },
): Promise<IpdBed> {
  const { data } = await apiClient.post<ApiEnvelope<IpdBed>>(`/ipd/beds/${bedId}/status`, payload);
  return unwrap(data);
}

export async function listIpdAdmissions(
  hospitalId: string,
  branchId: string,
  page = 0,
  size = 20,
  status?: string,
): Promise<SpringPage<IpdAdmission>> {
  const { data } = await apiClient.get<ApiEnvelope<SpringPage<IpdAdmission>>>('/ipd/admissions', {
    params: { hospitalId, branchId, page, size, status },
  });
  return unwrap(data) ?? { content: [], totalElements: 0, totalPages: 0, number: 0, size };
}

export async function admitPatient(payload: {
  patientId: string;
  hospitalId: string;
  branchId: string;
  bedId: string;
  primaryDoctorId?: string;
  admissionReason?: string;
  admissionRequestId?: string;
  admissionSource?: string;
  admissionType?: string;
}): Promise<IpdAdmission> {
  const { data } = await apiClient.post<ApiEnvelope<IpdAdmission>>('/ipd/admissions', payload);
  return unwrap(data);
}

export async function getIpdAdmission(admissionId: string): Promise<IpdAdmission> {
  const { data } = await apiClient.get<ApiEnvelope<IpdAdmission>>(`/ipd/admissions/${admissionId}`);
  return unwrap(data);
}

export interface IpdRound {
  roundId: string;
  admissionId: string;
  encounterId: string;
  roundType: string;
  notes: string;
  recordedAt: string;
  recordedBy?: string;
}

export async function listIpdRounds(admissionId: string): Promise<IpdRound[]> {
  const { data } = await apiClient.get<ApiEnvelope<IpdRound[]>>(`/ipd/admissions/${admissionId}/rounds`);
  return unwrap(data) ?? [];
}

export async function addIpdRound(
  admissionId: string,
  payload: { roundType: string; notes: string },
): Promise<IpdRound> {
  const { data } = await apiClient.post<ApiEnvelope<IpdRound>>(
    `/ipd/admissions/${admissionId}/rounds`,
    payload,
  );
  return unwrap(data);
}

export async function dischargePatient(
  admissionId: string,
  payload: { summaryText: string; followUpPlan?: string },
): Promise<{
  dischargeSummaryId: string;
  admissionId: string;
  encounterId: string;
  summaryText: string;
  followUpPlan?: string;
  dischargedAt: string;
  admissionStatus: string;
  encounterStatus: string;
}> {
  const { data } = await apiClient.post<ApiEnvelope<{
    dischargeSummaryId: string;
    admissionId: string;
    encounterId: string;
    summaryText: string;
    followUpPlan?: string;
    dischargedAt: string;
    admissionStatus: string;
    encounterStatus: string;
  }>>(
    `/ipd/admissions/${admissionId}/discharge`,
    payload,
  );
  return unwrap(data);
}

export async function transferIpdBed(
  admissionId: string,
  payload: { bedId: string; reason?: string },
): Promise<IpdAdmission> {
  const { data } = await apiClient.post<ApiEnvelope<IpdAdmission>>(
    `/ipd/admissions/${admissionId}/transfer-bed`,
    payload,
  );
  return unwrap(data);
}

export interface IpdAdmissionRequest {
  admissionRequestId: string;
  requestNumber: string;
  hospitalId: string;
  branchId: string;
  patientId: string;
  patientName?: string;
  uhid?: string;
  sourceEncounterId?: string;
  sourceEncounterNumber?: string;
  referringDoctorId?: string;
  attendingDoctorId?: string;
  admissionSource: string;
  admissionType: string;
  status: string;
  priority: string;
  reasonForAdmission?: string;
  provisionalDiagnosis?: string;
  requestedCareLevel?: string;
  expectedLosDays?: number;
  plannedProcedure?: string;
  isolationRequired: boolean;
  specialRequirements?: string;
  notes?: string;
  requestedAdmitAt?: string;
  scheduledAdmitAt?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  rejectionReason?: string;
  resultingAdmissionId?: string;
  reservedBedId?: string;
  createdAt: string;
}

export interface IpdAdmissionRequestCatalogs {
  sources: string[];
  types: string[];
  priorities: string[];
}

export async function getAdmissionRequestCatalogs(): Promise<IpdAdmissionRequestCatalogs> {
  const { data } = await apiClient.get<ApiEnvelope<IpdAdmissionRequestCatalogs>>('/ipd/admission-request-catalogs');
  return unwrap(data);
}

export async function listAdmissionRequests(
  hospitalId: string,
  branchId: string,
  page = 0,
  size = 20,
  status?: string,
): Promise<SpringPage<IpdAdmissionRequest>> {
  const { data } = await apiClient.get<ApiEnvelope<SpringPage<IpdAdmissionRequest>>>('/ipd/admission-requests', {
    params: { hospitalId, branchId, page, size, status },
  });
  return unwrap(data) ?? { content: [], totalElements: 0, totalPages: 0, number: 0, size };
}

export async function createAdmissionRequest(payload: {
  patientId: string;
  hospitalId: string;
  branchId: string;
  sourceEncounterId?: string;
  referringDoctorId?: string;
  attendingDoctorId?: string;
  admissionSource: string;
  admissionType: string;
  priority?: string;
  reasonForAdmission?: string;
  provisionalDiagnosis?: string;
  requestedCareLevel?: string;
  expectedLosDays?: number;
  plannedProcedure?: string;
  isolationRequired?: boolean;
  notes?: string;
}): Promise<IpdAdmissionRequest> {
  const { data } = await apiClient.post<ApiEnvelope<IpdAdmissionRequest>>('/ipd/admission-requests', payload);
  return unwrap(data);
}

export async function approveAdmissionRequest(
  requestId: string,
  payload?: { reviewNotes?: string },
): Promise<IpdAdmissionRequest> {
  const { data } = await apiClient.post<ApiEnvelope<IpdAdmissionRequest>>(
    `/ipd/admission-requests/${requestId}/approve`,
    payload ?? {},
  );
  return unwrap(data);
}

export async function rejectAdmissionRequest(
  requestId: string,
  payload: { rejectionReason: string; reviewNotes?: string },
): Promise<IpdAdmissionRequest> {
  const { data } = await apiClient.post<ApiEnvelope<IpdAdmissionRequest>>(
    `/ipd/admission-requests/${requestId}/reject`,
    payload,
  );
  return unwrap(data);
}

export async function scheduleAdmissionRequest(
  requestId: string,
  payload: { scheduledAdmitAt: string; reviewNotes?: string },
): Promise<IpdAdmissionRequest> {
  const { data } = await apiClient.post<ApiEnvelope<IpdAdmissionRequest>>(
    `/ipd/admission-requests/${requestId}/schedule`,
    payload,
  );
  return unwrap(data);
}

export async function cancelAdmissionRequest(requestId: string): Promise<IpdAdmissionRequest> {
  const { data } = await apiClient.post<ApiEnvelope<IpdAdmissionRequest>>(
    `/ipd/admission-requests/${requestId}/cancel`,
    {},
  );
  return unwrap(data);
}

export async function reserveAdmissionBed(
  requestId: string,
  payload: { bedId: string },
): Promise<IpdAdmissionRequest> {
  const { data } = await apiClient.post<ApiEnvelope<IpdAdmissionRequest>>(
    `/ipd/admission-requests/${requestId}/reserve-bed`,
    payload,
  );
  return unwrap(data);
}

export async function startReviewAdmissionRequest(requestId: string): Promise<IpdAdmissionRequest> {
  const { data } = await apiClient.post<ApiEnvelope<IpdAdmissionRequest>>(
    `/ipd/admission-requests/${requestId}/start-review`,
    {},
  );
  return unwrap(data);
}

export interface MedicationReconciliation {
  reconciliationId: string;
  admissionId: string;
  encounterId: string;
  reconType: string;
  status: string;
  summaryText?: string;
  decisions: Array<{
    medicationName: string;
    action: string;
    notes?: string;
    dose?: string;
    frequency?: string;
  }>;
  completedAt: string;
  completedBy?: string;
}

export async function listMedicationReconciliations(admissionId: string): Promise<MedicationReconciliation[]> {
  const { data } = await apiClient.get<ApiEnvelope<MedicationReconciliation[]>>(
    `/ipd/admissions/${admissionId}/med-reconciliations`,
  );
  return unwrap(data) ?? [];
}

export async function createMedicationReconciliation(
  admissionId: string,
  payload: {
    reconType: string;
    summaryText?: string;
    decisions: Array<{
      medicationName: string;
      action: string;
      notes?: string;
      dose?: string;
      frequency?: string;
    }>;
  },
): Promise<MedicationReconciliation> {
  const { data } = await apiClient.post<ApiEnvelope<MedicationReconciliation>>(
    `/ipd/admissions/${admissionId}/med-reconciliations`,
    payload,
  );
  return unwrap(data);
}

export async function escalateAdmissionToIcu(
  admissionId: string,
  payload: { icuBedId: string; primaryDoctorId?: string; reason?: string },
): Promise<IpdAdmission> {
  const { data } = await apiClient.post<ApiEnvelope<IpdAdmission>>(
    `/ipd/admissions/${admissionId}/escalate-to-icu`,
    payload,
  );
  return unwrap(data);
}

export async function stepDownAdmissionFromIcu(
  admissionId: string,
  payload: { wardBedId: string; reason?: string },
): Promise<IpdAdmission> {
  const { data } = await apiClient.post<ApiEnvelope<IpdAdmission>>(
    `/ipd/admissions/${admissionId}/step-down-from-icu`,
    payload,
  );
  return unwrap(data);
}

export async function updateIpdIsolation(
  admissionId: string,
  payload: { isolationRequired?: boolean; careLevel?: string },
): Promise<IpdAdmission> {
  const { data } = await apiClient.patch<ApiEnvelope<IpdAdmission>>(
    `/ipd/admissions/${admissionId}/isolation`,
    payload,
  );
  return unwrap(data);
}

export interface IpdBloodRequest {
  bloodRequestId: string;
  admissionId: string;
  encounterId: string;
  productType: string;
  units: number;
  urgency: string;
  indication?: string;
  status: string;
  notes?: string;
  requestedAt: string;
  requestedBy?: string;
}

export async function listIpdBloodRequests(admissionId: string): Promise<IpdBloodRequest[]> {
  const { data } = await apiClient.get<ApiEnvelope<IpdBloodRequest[]>>(
    `/ipd/admissions/${admissionId}/blood-requests`,
  );
  return unwrap(data) ?? [];
}

export async function createIpdBloodRequest(
  admissionId: string,
  payload: {
    productType: string;
    units?: number;
    urgency?: string;
    indication?: string;
    notes?: string;
  },
): Promise<IpdBloodRequest> {
  const { data } = await apiClient.post<ApiEnvelope<IpdBloodRequest>>(
    `/ipd/admissions/${admissionId}/blood-requests`,
    payload,
  );
  return unwrap(data);
}

export interface IpdChargeEvent {
  chargeEventId: string;
  admissionId: string;
  encounterId: string;
  chargeType: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  serviceDate: string;
  status: string;
  invoiceId?: string;
  invoiceLineId?: string;
  notes?: string;
  createdAt?: string;
}

export async function listIpdChargeEvents(admissionId: string): Promise<IpdChargeEvent[]> {
  const { data } = await apiClient.get<ApiEnvelope<IpdChargeEvent[]>>(
    `/ipd/admissions/${admissionId}/charge-events`,
  );
  return unwrap(data) ?? [];
}

export async function createIpdChargeEvent(
  admissionId: string,
  payload: {
    chargeType: string;
    description: string;
    quantity: number;
    unitPrice: number;
    serviceDate?: string;
    notes?: string;
  },
): Promise<IpdChargeEvent> {
  const { data } = await apiClient.post<ApiEnvelope<IpdChargeEvent>>(
    `/ipd/admissions/${admissionId}/charge-events`,
    payload,
  );
  return unwrap(data);
}

export async function postIpdInterimInvoice(admissionId: string): Promise<import('@/features/billing/api/billingApi').Invoice> {
  const { data } = await apiClient.post<ApiEnvelope<import('@/features/billing/api/billingApi').Invoice>>(
    `/ipd/admissions/${admissionId}/interim-invoice`,
    {},
  );
  return unwrap(data);
}

export async function createIpdDeposit(
  admissionId: string,
  payload: { amount: number; paymentMethod?: string; notes?: string },
): Promise<import('@/features/billing/api/billingApi').Invoice> {
  const { data } = await apiClient.post<ApiEnvelope<import('@/features/billing/api/billingApi').Invoice>>(
    `/ipd/admissions/${admissionId}/deposit`,
    payload,
  );
  return unwrap(data);
}

export interface IpdAdmissionPayer {
  payerId: string;
  admissionId: string;
  payerMode: string;
  payerName?: string;
  policyNumber?: string;
  memberId?: string;
  claimMode?: string;
  primaryPayer: boolean;
  notes?: string;
  createdAt?: string;
}

export async function listIpdPayers(admissionId: string): Promise<IpdAdmissionPayer[]> {
  const { data } = await apiClient.get<ApiEnvelope<IpdAdmissionPayer[]>>(
    `/ipd/admissions/${admissionId}/payers`,
  );
  return unwrap(data) ?? [];
}

export async function assignIpdPayer(
  admissionId: string,
  payload: {
    payerMode: string;
    payerName?: string;
    policyNumber?: string;
    memberId?: string;
    claimMode?: string;
    primaryPayer?: boolean;
    notes?: string;
  },
): Promise<IpdAdmissionPayer> {
  const { data } = await apiClient.post<ApiEnvelope<IpdAdmissionPayer>>(
    `/ipd/admissions/${admissionId}/payers`,
    payload,
  );
  return unwrap(data);
}

export interface IpdPayerAuthorization {
  authorizationId: string;
  admissionId: string;
  payerId?: string;
  authType: string;
  status: string;
  authNumber?: string;
  approvedAmount?: number;
  notes?: string;
  requestedAt?: string;
  decidedAt?: string;
}

export async function listIpdPayerAuthorizations(admissionId: string): Promise<IpdPayerAuthorization[]> {
  const { data } = await apiClient.get<ApiEnvelope<IpdPayerAuthorization[]>>(
    `/ipd/admissions/${admissionId}/payer-authorizations`,
  );
  return unwrap(data) ?? [];
}

export async function createIpdPayerAuthorization(
  admissionId: string,
  payload: {
    payerId?: string;
    authType: string;
    authNumber?: string;
    approvedAmount?: number;
    notes?: string;
  },
): Promise<IpdPayerAuthorization> {
  const { data } = await apiClient.post<ApiEnvelope<IpdPayerAuthorization>>(
    `/ipd/admissions/${admissionId}/payer-authorizations`,
    payload,
  );
  return unwrap(data);
}

export async function decideIpdPayerAuthorization(
  admissionId: string,
  authorizationId: string,
  payload: { status: string; authNumber?: string; approvedAmount?: number; notes?: string },
): Promise<IpdPayerAuthorization> {
  const { data } = await apiClient.post<ApiEnvelope<IpdPayerAuthorization>>(
    `/ipd/admissions/${admissionId}/payer-authorizations/${authorizationId}/decide`,
    payload,
  );
  return unwrap(data);
}

export interface IpdFinancialClearance {
  clearanceId?: string;
  admissionId: string;
  status: string;
  clearedAt?: string;
  clearedBy?: string;
  notes?: string;
}

export async function getIpdFinancialClearance(admissionId: string): Promise<IpdFinancialClearance> {
  const { data } = await apiClient.get<ApiEnvelope<IpdFinancialClearance>>(
    `/ipd/admissions/${admissionId}/financial-clearance`,
  );
  return unwrap(data);
}

export async function clearIpdFinancial(
  admissionId: string,
  payload?: { notes?: string },
): Promise<IpdFinancialClearance> {
  const { data } = await apiClient.post<ApiEnvelope<IpdFinancialClearance>>(
    `/ipd/admissions/${admissionId}/financial-clearance`,
    payload ?? {},
  );
  return unwrap(data);
}

export interface IpdDischargePlan {
  planId?: string;
  admissionId: string;
  expectedDischargeAt?: string;
  readiness: string;
  pendingResultsJson?: string;
  barriers?: string;
  notes?: string;
}

export async function getIpdDischargePlan(admissionId: string): Promise<IpdDischargePlan> {
  const { data } = await apiClient.get<ApiEnvelope<IpdDischargePlan>>(
    `/ipd/admissions/${admissionId}/discharge-plan`,
  );
  return unwrap(data);
}

export async function upsertIpdDischargePlan(
  admissionId: string,
  payload: {
    expectedDischargeAt?: string;
    readiness?: string;
    pendingResultsJson?: string;
    barriers?: string;
    notes?: string;
  },
): Promise<IpdDischargePlan> {
  const { data } = await apiClient.put<ApiEnvelope<IpdDischargePlan>>(
    `/ipd/admissions/${admissionId}/discharge-plan`,
    payload,
  );
  return unwrap(data);
}

export interface IpdDischargeOrder {
  orderId: string;
  admissionId: string;
  orderedAt: string;
  orderedBy?: string;
  notes?: string;
  status: string;
}

export async function listIpdDischargeOrders(admissionId: string): Promise<IpdDischargeOrder[]> {
  const { data } = await apiClient.get<ApiEnvelope<IpdDischargeOrder[]>>(
    `/ipd/admissions/${admissionId}/discharge-orders`,
  );
  return unwrap(data) ?? [];
}

export async function placeIpdDischargeOrder(
  admissionId: string,
  payload?: { notes?: string },
): Promise<IpdDischargeOrder> {
  const { data } = await apiClient.post<ApiEnvelope<IpdDischargeOrder>>(
    `/ipd/admissions/${admissionId}/discharge-order`,
    payload ?? {},
  );
  return unwrap(data);
}

export interface IpdDischargeClearance {
  clearanceId: string;
  admissionId: string;
  clearanceType: string;
  status: string;
  clearedAt?: string;
  clearedBy?: string;
  notes?: string;
}

export async function listIpdDischargeClearances(admissionId: string): Promise<IpdDischargeClearance[]> {
  const { data } = await apiClient.get<ApiEnvelope<IpdDischargeClearance[]>>(
    `/ipd/admissions/${admissionId}/discharge-clearances`,
  );
  return unwrap(data) ?? [];
}

export async function updateIpdDischargeClearance(
  admissionId: string,
  payload: { clearanceType: string; status: string; notes?: string },
): Promise<IpdDischargeClearance> {
  const { data } = await apiClient.post<ApiEnvelope<IpdDischargeClearance>>(
    `/ipd/admissions/${admissionId}/discharge-clearances`,
    payload,
  );
  return unwrap(data);
}

export interface IpdDischargeSummary {
  dischargeSummaryId: string;
  admissionId: string;
  encounterId: string;
  summaryText: string;
  followUpPlan?: string;
  dischargedAt: string;
  admissionStatus: string;
  encounterStatus: string;
  dischargeType?: string;
  versionNo?: number;
  diagnosisText?: string;
  medicationsText?: string;
  adviceText?: string;
}

export async function getIpdDischargeSummary(admissionId: string): Promise<IpdDischargeSummary> {
  const { data } = await apiClient.get<ApiEnvelope<IpdDischargeSummary>>(
    `/ipd/admissions/${admissionId}/discharge-summary`,
  );
  return unwrap(data);
}

export async function completeIpdDischarge(
  admissionId: string,
  payload: {
    summaryText: string;
    followUpPlan?: string;
    dischargeType?: string;
    diagnosisText?: string;
    medicationsText?: string;
    adviceText?: string;
    pronouncedAt?: string;
    causeOfDeath?: string;
    certifiedByName?: string;
    destinationName?: string;
    transferReason?: string;
    acceptingPhysician?: string;
    transportMode?: string;
    leaveAgainstAdviceNotes?: string;
  },
): Promise<IpdDischargeSummary> {
  const { data } = await apiClient.post<ApiEnvelope<IpdDischargeSummary>>(
    `/ipd/admissions/${admissionId}/discharge`,
    payload,
  );
  return unwrap(data);
}

export async function scheduleIpdFollowUp(
  admissionId: string,
  payload: { doctorId: string; slotId: string; reasonForVisit?: string },
): Promise<IpdAdmission> {
  const { data } = await apiClient.post<ApiEnvelope<IpdAdmission>>(
    `/ipd/admissions/${admissionId}/follow-up`,
    payload,
  );
  return unwrap(data);
}

export async function closeIpdEpisode(admissionId: string): Promise<IpdAdmission> {
  const { data } = await apiClient.post<ApiEnvelope<IpdAdmission>>(
    `/ipd/admissions/${admissionId}/close-episode`,
  );
  return unwrap(data);
}

export interface IpdReadmissionAnalytics {
  windowDays: number;
  readmissionCount: number;
  items: Array<{
    admissionId: string;
    priorAdmissionId: string;
    patientId: string;
    admissionNumber: string;
    admittedAt: string;
    priorDischargedAt?: string;
  }>;
}

export async function getIpdReadmissionAnalytics(
  hospitalId: string,
  from?: string,
  to?: string,
): Promise<IpdReadmissionAnalytics> {
  const { data } = await apiClient.get<ApiEnvelope<IpdReadmissionAnalytics>>('/ipd/readmission-analytics', {
    params: { hospitalId, from, to },
  });
  return unwrap(data);
}

export interface PatientIpdStay {
  admissionId: string;
  encounterId: string;
  encounterNumber?: string;
  admissionNumber: string;
  hospitalId: string;
  branchId: string;
  status: string;
  admittedAt: string;
  dischargedAt?: string;
  closedAt?: string;
  followUpAppointmentId?: string;
  dischargeType?: string;
  summaryText?: string;
  followUpPlan?: string;
  diagnosisText?: string;
  medicationsText?: string;
  adviceText?: string;
}

export async function listMyIpdStays(): Promise<PatientIpdStay[]> {
  const { data } = await apiClient.get<ApiEnvelope<PatientIpdStay[]>>('/patients/me/ipd-stays');
  return unwrap(data);
}

export async function getMyIpdStay(admissionId: string): Promise<PatientIpdStay> {
  const { data } = await apiClient.get<ApiEnvelope<PatientIpdStay>>(`/patients/me/ipd-stays/${admissionId}`);
  return unwrap(data);
}

