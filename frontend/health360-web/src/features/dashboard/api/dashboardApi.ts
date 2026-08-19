import { apiClient } from '@/shared/api/client';
import type { ApiEnvelope } from '@/features/auth/api/authApi';

export interface HospitalDashboard {
  hospitalId: string;
  branchId: string;
  hospitalName: string;
  branchName: string;
  branchCount: number;
  departmentCount: number;
  doctorCount: number;
  activeStaffCount: number;
  totalEncounters: number;
  opdWaitingToday: number;
  opdInProgressToday: number;
  activeIpdAdmissions: number;
  activeIcuStays: number;
  pendingLabOrders: number;
  pendingRadiologyOrders: number;
  pendingPharmacyOrders: number;
  pendingOtProcedures: number;
}

export interface OpdDashboard {
  hospitalId: string;
  branchId: string;
  hospitalName: string;
  branchName: string;
  queueDate: string;
  deskCount: number;
  waitingCount: number;
  calledCount: number;
  inServiceCount: number;
  completedTodayCount: number;
  totalTodayCount: number;
}

export interface IpdDashboard {
  hospitalId: string;
  branchId: string;
  hospitalName: string;
  branchName: string;
  activeAdmissions: number;
  availableBeds: number;
  occupiedBeds: number;
  totalBeds: number;
}

export interface IcuDashboard {
  hospitalId: string;
  branchId: string;
  hospitalName: string;
  branchName: string;
  activeStays: number;
  availableBeds: number;
  occupiedBeds: number;
  totalBeds: number;
}

export interface ModuleWorklistDashboard {
  hospitalId: string;
  branchId: string;
  hospitalName: string;
  branchName: string;
  pendingWorklistCount: number;
  receivedCount: number;
  inProgressCount: number;
  completedCount: number;
}

export interface DoctorDashboard {
  doctorId: string;
  inProgressEncounters: number;
  waitingEncounters: number;
  upcomingAppointments: number;
  recentEncounters: {
    encounterId: string;
    encounterNumber: string;
    patientId: string;
    status: string;
    encounterType: string;
    createdAt: string;
  }[];
}

export interface PatientClinicalDashboard {
  patientId: string;
  totalEncounters: number;
  activeEncounters: number;
  completedEncounters: number;
  recentEncounters: {
    encounterId: string;
    encounterNumber: string;
    hospitalId: string;
    status: string;
    encounterType: string;
    createdAt: string;
  }[];
}

export interface DashboardScopeParams {
  hospitalId?: string;
  branchId?: string;
}

export async function getHospitalDashboard(params?: DashboardScopeParams) {
  const { data } = await apiClient.get<ApiEnvelope<HospitalDashboard>>('/hospital/dashboard', { params });
  return data.data!;
}

export async function getOpdDashboard(params?: DashboardScopeParams) {
  const { data } = await apiClient.get<ApiEnvelope<OpdDashboard>>('/opd/dashboard', { params });
  return data.data!;
}

export async function getIpdDashboard(params?: DashboardScopeParams) {
  const { data } = await apiClient.get<ApiEnvelope<IpdDashboard>>('/ipd/dashboard', { params });
  return data.data!;
}

export async function getIcuDashboard(params?: DashboardScopeParams) {
  const { data } = await apiClient.get<ApiEnvelope<IcuDashboard>>('/icu/dashboard', { params });
  return data.data!;
}

export async function getLabDashboard(params?: DashboardScopeParams) {
  const { data } = await apiClient.get<ApiEnvelope<ModuleWorklistDashboard>>('/lab/dashboard', { params });
  return data.data!;
}

export async function getRadiologyDashboard(params?: DashboardScopeParams) {
  const { data } = await apiClient.get<ApiEnvelope<ModuleWorklistDashboard>>('/radiology/dashboard', { params });
  return data.data!;
}

export async function getPharmacyDashboardStats(params?: DashboardScopeParams) {
  const { data } = await apiClient.get<ApiEnvelope<ModuleWorklistDashboard>>('/pharmacy/dashboard', { params });
  return data.data!;
}

export async function getOtDashboardStats(params?: DashboardScopeParams) {
  const { data } = await apiClient.get<ApiEnvelope<ModuleWorklistDashboard>>('/ot/dashboard', { params });
  return data.data!;
}

export async function getDoctorDashboard() {
  const { data } = await apiClient.get<ApiEnvelope<DoctorDashboard>>('/doctor/dashboard');
  return data.data!;
}

export async function getPatientClinicalDashboard() {
  const { data } = await apiClient.get<ApiEnvelope<PatientClinicalDashboard>>('/patient/dashboard/clinical');
  return data.data!;
}
