import { apiClient } from '@/shared/api/client';
import type { ApiEnvelope } from '@/features/auth/api/authApi';

export const STAFF_ROLES = [
  'RECEPTIONIST',
  'NURSE',
  'ICU_NURSE',
  'LAB_TECHNICIAN',
  'RADIOLOGY_TECHNICIAN',
  'PHARMACIST',
  'OT_COORDINATOR',
] as const;

export type StaffRole = (typeof STAFF_ROLES)[number];

export interface StaffMember {
  staffId: string;
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  hospitalId: string;
  branchId?: string;
  departmentId?: string;
  jobTitle?: string;
  employmentStatus: string;
  hiredAt: string;
  roles: string[];
}

export interface InviteStaffPayload {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  temporaryPassword: string;
  hospitalId: string;
  branchId?: string;
  departmentId?: string;
  roleName: StaffRole;
  jobTitle?: string;
}

export async function listStaff(hospitalId: string) {
  const { data } = await apiClient.get<ApiEnvelope<StaffMember[]>>('/hospital/staff', {
    params: { hospitalId },
  });
  return data.data ?? [];
}

export async function inviteStaff(payload: InviteStaffPayload) {
  const { data } = await apiClient.post<ApiEnvelope<StaffMember>>('/hospital/staff/invite', payload);
  return data.data!;
}

export async function deactivateStaff(staffId: string) {
  const { data } = await apiClient.post<ApiEnvelope<StaffMember>>(`/hospital/staff/${staffId}/deactivate`);
  return data.data!;
}
