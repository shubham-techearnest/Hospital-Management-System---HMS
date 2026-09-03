import { isAxiosError } from 'axios';
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

export interface StaffScope {
  hospitalId: string;
  branchId: string;
  hospitalName: string;
  branchName: string;
  roles: string[];
  hospitalWide: boolean;
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

export async function listStaff(hospitalId: string): Promise<StaffMember[]> {
  const { data } = await apiClient.get<ApiEnvelope<StaffMember[]>>('/hospital/staff', {
    params: { hospitalId },
  });
  return data.data ?? [];
}

export async function getMyStaffScope(): Promise<StaffScope[]> {
  try {
    const { data } = await apiClient.get<ApiEnvelope<StaffScope[]>>('/hospital/staff/me/scope');
    if (!data.success) {
      throw new Error(data.message ?? 'Failed to load staff scope');
    }
    return data.data ?? [];
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 404) {
      return [];
    }
    throw error;
  }
}

export async function inviteStaff(payload: InviteStaffPayload): Promise<StaffMember> {
  const { data } = await apiClient.post<ApiEnvelope<StaffMember>>('/hospital/staff/invite', payload);
  if (!data.success || !data.data) {
    throw new Error(data.message ?? 'Invite failed');
  }
  return data.data;
}

export async function deactivateStaff(staffId: string): Promise<StaffMember> {
  const { data } = await apiClient.post<ApiEnvelope<StaffMember>>(`/hospital/staff/${staffId}/deactivate`);
  if (!data.success || !data.data) {
    throw new Error(data.message ?? 'Deactivate failed');
  }
  return data.data;
}
