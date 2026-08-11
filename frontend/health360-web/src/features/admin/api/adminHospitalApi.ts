import { apiClient } from '@/shared/api/client';
import type { ApiEnvelope } from '@/features/auth/api/authApi';
import type { SpringPage } from '@/features/patient/api/patientExtendedApi';
import type { HospitalSubscription } from '@/features/subscription/api/subscriptionApi';

export interface AdminHospital {
  id: string;
  name: string;
  registrationNumber: string;
  hospitalType: string;
  status: string;
  adminUserId: string;
  adminEmail?: string;
  adminName?: string;
  doctorCount: number;
  subscription?: {
    subscriptionId: string;
    planCode: string;
    planName: string;
    status: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateAdminHospitalPayload {
  name: string;
  registrationNumber: string;
  hospitalType: string;
  establishedYear?: number;
  totalBedCount?: number;
  accreditation?: string;
  description?: string;
  adminEmail: string;
  adminFirstName: string;
  adminLastName: string;
  adminPhone: string;
  adminPassword?: string;
  planCode?: string;
}

export async function createAdminHospital(payload: CreateAdminHospitalPayload): Promise<AdminHospital> {
  const { data } = await apiClient.post<ApiEnvelope<AdminHospital>>('/admin/hospitals', payload);
  return data.data!;
}

export interface InviteDoctorPayload {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  password?: string;
  branchId?: string;
  departmentId?: string;
}

export interface InviteDoctorResult {
  userId: string;
  doctorId: string;
  associationId: string;
  email: string;
  status: string;
  invitationEmailSent: boolean;
  message: string;
}

export interface SubscriptionHistoryEntry {
  id: string;
  subscriptionId?: string;
  planCode?: string;
  planName?: string;
  previousPlanCode?: string;
  previousPlanName?: string;
  eventType: string;
  status: string;
  notes?: string;
  effectiveAt: string;
  createdBy?: string;
}

export async function searchAdminHospitals(params: {
  name?: string;
  status?: string;
  page?: number;
  size?: number;
}): Promise<SpringPage<AdminHospital>> {
  const { data } = await apiClient.get<ApiEnvelope<SpringPage<AdminHospital>>>('/admin/hospitals', { params });
  return data.data ?? { content: [], totalElements: 0, totalPages: 0, number: 0, size: 20 };
}

export async function getAdminHospital(hospitalId: string): Promise<AdminHospital> {
  const { data } = await apiClient.get<ApiEnvelope<AdminHospital>>(`/admin/hospitals/${hospitalId}`);
  return data.data!;
}

export async function updateAdminHospitalStatus(hospitalId: string, status: string): Promise<AdminHospital> {
  const { data } = await apiClient.patch<ApiEnvelope<AdminHospital>>(
    `/admin/hospitals/${hospitalId}/status`,
    { status },
  );
  return data.data!;
}

export async function inviteDoctorAsAdmin(
  hospitalId: string,
  payload: InviteDoctorPayload,
): Promise<InviteDoctorResult> {
  const { data } = await apiClient.post<ApiEnvelope<InviteDoctorResult>>(
    `/admin/hospitals/${hospitalId}/doctors/invite`,
    payload,
  );
  return data.data!;
}

export async function getAdminHospitalSubscription(hospitalId: string): Promise<HospitalSubscription> {
  const { data } = await apiClient.get<ApiEnvelope<HospitalSubscription>>(
    `/admin/hospitals/${hospitalId}/subscription`,
  );
  return data.data!;
}

export async function changeAdminHospitalPlan(
  hospitalId: string,
  planCode: string,
  notes?: string,
): Promise<HospitalSubscription> {
  const { data } = await apiClient.put<ApiEnvelope<HospitalSubscription>>(
    `/admin/hospitals/${hospitalId}/subscription/plan`,
    { planCode, notes },
  );
  return data.data!;
}

export async function getAdminHospitalSubscriptionHistory(
  hospitalId: string,
): Promise<SubscriptionHistoryEntry[]> {
  const { data } = await apiClient.get<ApiEnvelope<SubscriptionHistoryEntry[]>>(
    `/admin/hospitals/${hospitalId}/subscription/history`,
  );
  return data.data ?? [];
}
