import { apiClient } from '@/shared/api/client';
import type { ApiEnvelope } from '@/features/auth/api/authApi';
import type { SpringPage } from '@/features/patient/api/patientExtendedApi';

export interface StaffShift {
  shiftId: string;
  hospitalId: string;
  branchId: string;
  code: string;
  name: string;
  startTime: string;
  endTime: string;
  active: boolean;
}

export interface RosterEntry {
  rosterEntryId: string;
  staffId: string;
  shiftId: string;
  shiftCode?: string;
  shiftName?: string;
  dutyDate: string;
  status: string;
}

export interface AttendanceRecord {
  attendanceId: string;
  staffId: string;
  rosterEntryId?: string;
  dutyDate: string;
  status: string;
  clockIn?: string;
  clockOut?: string;
}

export interface LeaveRequest {
  leaveRequestId: string;
  staffId: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  status: string;
  reason?: string;
}

function unwrap<T>(envelope: ApiEnvelope<T>): T {
  if (!envelope.success || envelope.data === undefined) {
    throw new Error(envelope.message ?? 'Request failed');
  }
  return envelope.data;
}

export async function listStaffShifts(hospitalId: string, branchId: string): Promise<StaffShift[]> {
  const { data } = await apiClient.get<ApiEnvelope<StaffShift[]>>('/api/v1/staff-ops/shifts', {
    params: { hospitalId, branchId },
  });
  return unwrap(data);
}

export async function createStaffShift(payload: {
  hospitalId: string;
  branchId: string;
  code: string;
  name: string;
  startTime: string;
  endTime: string;
}): Promise<StaffShift> {
  const { data } = await apiClient.post<ApiEnvelope<StaffShift>>('/api/v1/staff-ops/shifts', payload);
  return unwrap(data);
}

export async function listRoster(
  hospitalId: string,
  branchId: string,
): Promise<SpringPage<RosterEntry>> {
  const { data } = await apiClient.get<ApiEnvelope<SpringPage<RosterEntry>>>('/api/v1/staff-ops/roster', {
    params: { hospitalId, branchId, size: 50 },
  });
  return unwrap(data);
}

export async function createRosterEntry(payload: {
  hospitalId: string;
  branchId: string;
  staffId: string;
  shiftId: string;
  dutyDate: string;
  status?: string;
}): Promise<RosterEntry> {
  const { data } = await apiClient.post<ApiEnvelope<RosterEntry>>('/api/v1/staff-ops/roster', payload);
  return unwrap(data);
}

export async function listAttendance(
  hospitalId: string,
  branchId: string,
): Promise<SpringPage<AttendanceRecord>> {
  const { data } = await apiClient.get<ApiEnvelope<SpringPage<AttendanceRecord>>>('/api/v1/staff-ops/attendance', {
    params: { hospitalId, branchId, size: 50 },
  });
  return unwrap(data);
}

export async function recordAttendance(payload: {
  hospitalId: string;
  branchId: string;
  staffId: string;
  rosterEntryId?: string;
  dutyDate: string;
  status?: string;
  clockInNow?: boolean;
  clockOutNow?: boolean;
}): Promise<AttendanceRecord> {
  const { data } = await apiClient.post<ApiEnvelope<AttendanceRecord>>('/api/v1/staff-ops/attendance', payload);
  return unwrap(data);
}

export async function listLeave(
  hospitalId: string,
  branchId: string,
  status?: string,
): Promise<SpringPage<LeaveRequest>> {
  const { data } = await apiClient.get<ApiEnvelope<SpringPage<LeaveRequest>>>('/api/v1/staff-ops/leave', {
    params: { hospitalId, branchId, status, size: 50 },
  });
  return unwrap(data);
}

export async function createLeaveRequest(payload: {
  hospitalId: string;
  branchId: string;
  staffId: string;
  leaveType?: string;
  startDate: string;
  endDate: string;
  reason?: string;
}): Promise<LeaveRequest> {
  const { data } = await apiClient.post<ApiEnvelope<LeaveRequest>>('/api/v1/staff-ops/leave', payload);
  return unwrap(data);
}

export async function decideLeaveRequest(
  leaveRequestId: string,
  payload: { decision: string; decisionNotes?: string },
): Promise<LeaveRequest> {
  const { data } = await apiClient.post<ApiEnvelope<LeaveRequest>>(
    `/api/v1/staff-ops/leave/${leaveRequestId}/decide`,
    payload,
  );
  return unwrap(data);
}
