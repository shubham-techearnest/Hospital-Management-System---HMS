import { apiClient } from '@/shared/api/client';
import type { ApiEnvelope } from '@/features/auth/api/authApi';
import type { SpringPage } from '@/features/patient/api/patientExtendedApi';

export interface OperationTheatre {
  theatreId: string;
  hospitalId: string;
  branchId: string;
  name: string;
  code: string;
  status: string;
  active: boolean;
}

export interface OtWorklistItem {
  clinicalOrderItemId: string;
  clinicalOrderId: string;
  encounterId: string;
  patientId: string;
  orderNumber?: string;
  itemName: string;
  itemCode?: string;
  orderedAt: string;
}

export interface OtSchedule {
  scheduleId: string;
  theatreId: string;
  scheduledStart: string;
  scheduledEnd: string;
  status: string;
}

export interface OtTeamMember {
  teamMemberId: string;
  procedureId: string;
  memberRole: string;
  userId: string;
  memberName?: string;
}

export interface OtNote {
  noteId: string;
  procedureId: string;
  noteType: string;
  content: string;
  recordedAt: string;
  recordedBy?: string;
}

export interface OtProcedure {
  procedureId: string;
  clinicalOrderItemId: string;
  clinicalOrderId: string;
  encounterId: string;
  patientId: string;
  hospitalId: string;
  branchId: string;
  theatreId?: string;
  theatreCode?: string;
  theatreName?: string;
  procedureName: string;
  status: string;
  receivedAt: string;
  startedAt?: string;
  completedAt?: string;
  schedule?: OtSchedule;
  teamMembers: OtTeamMember[];
  notes: OtNote[];
}

function unwrap<T>(envelope: ApiEnvelope<T>): T {
  if (!envelope.success || envelope.data === undefined) {
    throw new Error(envelope.message ?? 'Request failed');
  }
  return envelope.data;
}

export async function listTheatres(hospitalId: string, branchId: string): Promise<OperationTheatre[]> {
  const { data } = await apiClient.get<ApiEnvelope<OperationTheatre[]>>('/ot/theatres', {
    params: { hospitalId, branchId },
  });
  return unwrap(data);
}

export async function createTheatre(payload: {
  hospitalId: string;
  branchId: string;
  name: string;
  code: string;
}): Promise<OperationTheatre> {
  const { data } = await apiClient.post<ApiEnvelope<OperationTheatre>>('/ot/theatres', payload);
  return unwrap(data);
}

export async function listPendingOtWorklist(
  hospitalId: string,
  branchId: string,
): Promise<OtWorklistItem[]> {
  const { data } = await apiClient.get<ApiEnvelope<OtWorklistItem[]>>('/ot/worklist/pending', {
    params: { hospitalId, branchId },
  });
  return unwrap(data);
}

export async function createOtProcedure(clinicalOrderItemId: string): Promise<OtProcedure> {
  const { data } = await apiClient.post<ApiEnvelope<OtProcedure>>('/ot/procedures', { clinicalOrderItemId });
  return unwrap(data);
}

export async function listOtProcedures(
  hospitalId: string,
  branchId: string,
  page = 0,
  size = 20,
  status?: string,
): Promise<SpringPage<OtProcedure>> {
  const { data } = await apiClient.get<ApiEnvelope<SpringPage<OtProcedure>>>('/ot/procedures', {
    params: { hospitalId, branchId, page, size, status },
  });
  return unwrap(data) ?? { content: [], totalElements: 0, totalPages: 0, number: 0, size };
}

export async function getOtProcedure(procedureId: string): Promise<OtProcedure> {
  const { data } = await apiClient.get<ApiEnvelope<OtProcedure>>(`/ot/procedures/${procedureId}`);
  return unwrap(data);
}

export async function scheduleOtProcedure(
  procedureId: string,
  payload: { theatreId: string; scheduledStart: string; scheduledEnd: string; notes?: string },
): Promise<OtProcedure> {
  const { data } = await apiClient.post<ApiEnvelope<OtProcedure>>(
    `/ot/procedures/${procedureId}/schedule`,
    payload,
  );
  return unwrap(data);
}

export async function addOtTeamMember(
  procedureId: string,
  payload: { memberRole: string; userId: string; memberName?: string },
): Promise<OtTeamMember> {
  const { data } = await apiClient.post<ApiEnvelope<OtTeamMember>>(
    `/ot/procedures/${procedureId}/team`,
    payload,
  );
  return unwrap(data);
}

export async function addOtNote(
  procedureId: string,
  payload: { noteType: string; content: string },
): Promise<OtNote> {
  const { data } = await apiClient.post<ApiEnvelope<OtNote>>(
    `/ot/procedures/${procedureId}/notes`,
    payload,
  );
  return unwrap(data);
}

export async function startOtProcedure(procedureId: string): Promise<OtProcedure> {
  const { data } = await apiClient.post<ApiEnvelope<OtProcedure>>(`/ot/procedures/${procedureId}/start`, {});
  return unwrap(data);
}

export async function completeOtProcedure(
  procedureId: string,
  payload: { completionSummary?: string },
): Promise<OtProcedure> {
  const { data } = await apiClient.post<ApiEnvelope<OtProcedure>>(
    `/ot/procedures/${procedureId}/complete`,
    payload,
  );
  return unwrap(data);
}

export async function listEncounterProcedures(encounterId: string): Promise<OtProcedure[]> {
  const { data } = await apiClient.get<ApiEnvelope<OtProcedure[]>>(
    `/ot/encounters/${encounterId}/procedures`,
  );
  return unwrap(data) ?? [];
}
