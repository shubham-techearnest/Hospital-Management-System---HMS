import { useQuery } from '@tanstack/react-query';
import {
  getDoctorDashboard,
  getHospitalDashboard,
  getIcuDashboard,
  getIpdDashboard,
  getLabDashboard,
  getOpdDashboard,
  getOtDashboardStats,
  getPatientClinicalDashboard,
  getPharmacyDashboardStats,
  getRadiologyDashboard,
  type DashboardScopeParams,
} from '../api/dashboardApi';

export const dashboardKeys = {
  hospital: (params?: DashboardScopeParams) => ['dashboard', 'hospital', params ?? {}] as const,
  opd: (params?: DashboardScopeParams) => ['dashboard', 'opd', params ?? {}] as const,
  ipd: (params?: DashboardScopeParams) => ['dashboard', 'ipd', params ?? {}] as const,
  icu: (params?: DashboardScopeParams) => ['dashboard', 'icu', params ?? {}] as const,
  lab: (params?: DashboardScopeParams) => ['dashboard', 'lab', params ?? {}] as const,
  radiology: (params?: DashboardScopeParams) => ['dashboard', 'radiology', params ?? {}] as const,
  pharmacy: (params?: DashboardScopeParams) => ['dashboard', 'pharmacy', params ?? {}] as const,
  ot: (params?: DashboardScopeParams) => ['dashboard', 'ot', params ?? {}] as const,
  doctor: ['dashboard', 'doctor'] as const,
  patientClinical: ['dashboard', 'patientClinical'] as const,
};

export function useHospitalDashboard(params?: DashboardScopeParams) {
  return useQuery({
    queryKey: dashboardKeys.hospital(params),
    queryFn: () => getHospitalDashboard(params),
  });
}

export function useOpdDashboard(params?: DashboardScopeParams, enabled = true) {
  return useQuery({
    queryKey: dashboardKeys.opd(params),
    queryFn: () => getOpdDashboard(params),
    enabled,
  });
}

export function useIpdDashboard(params?: DashboardScopeParams, enabled = true) {
  return useQuery({
    queryKey: dashboardKeys.ipd(params),
    queryFn: () => getIpdDashboard(params),
    enabled,
  });
}

export function useIcuDashboard(params?: DashboardScopeParams, enabled = true) {
  return useQuery({
    queryKey: dashboardKeys.icu(params),
    queryFn: () => getIcuDashboard(params),
    enabled,
  });
}

export function useLabDashboardStats(params?: DashboardScopeParams, enabled = true) {
  return useQuery({
    queryKey: dashboardKeys.lab(params),
    queryFn: () => getLabDashboard(params),
    enabled,
  });
}

export function useRadiologyDashboardStats(params?: DashboardScopeParams, enabled = true) {
  return useQuery({
    queryKey: dashboardKeys.radiology(params),
    queryFn: () => getRadiologyDashboard(params),
    enabled,
  });
}

export function usePharmacyDashboardStats(params?: DashboardScopeParams, enabled = true) {
  return useQuery({
    queryKey: dashboardKeys.pharmacy(params),
    queryFn: () => getPharmacyDashboardStats(params),
    enabled,
  });
}

export function useOtDashboardStats(params?: DashboardScopeParams, enabled = true) {
  return useQuery({
    queryKey: dashboardKeys.ot(params),
    queryFn: () => getOtDashboardStats(params),
    enabled,
  });
}

export function useDoctorDashboardStats() {
  return useQuery({
    queryKey: dashboardKeys.doctor,
    queryFn: getDoctorDashboard,
  });
}

export function usePatientClinicalDashboard() {
  return useQuery({
    queryKey: dashboardKeys.patientClinical,
    queryFn: getPatientClinicalDashboard,
  });
}
