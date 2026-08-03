import { apiClient } from '@/shared/api/client';
import type { ApiEnvelope } from '@/features/auth/api/authApi';

export interface DoctorSearchResult {
  doctorId: string;
  name: string;
  specialization?: string;
  hospitalName?: string;
  branchName?: string;
  city?: string;
  yearsExperience?: number;
  availableToday: boolean;
  averageRating?: number;
  reviewCount?: number;
  distanceKm?: number;
  minConsultationFee?: number;
  feeCurrency?: string;
}

export interface HospitalSearchResult {
  hospitalId: string;
  name: string;
  hospitalType?: string;
  city?: string;
  branchName?: string;
  addressLine1?: string;
  averageRating?: number;
  reviewCount: number;
  emergencyAvailable24x7: boolean;
  icuAvailable: boolean;
  ambulanceAvailable: boolean;
  distanceKm?: number;
}

export interface PagedDoctorSearch {
  content: DoctorSearchResult[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface PagedHospitalSearch {
  content: HospitalSearchResult[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface UnifiedSearchResult {
  doctors: DoctorSearchResult[];
  hospitals: HospitalSearchResult[];
  doctorCount: number;
  hospitalCount: number;
}

export interface DoctorSearchParams {
  q?: string;
  specialization?: string;
  city?: string;
  language?: string;
  minRating?: number;
  maxFee?: number;
  availableToday?: boolean;
  latitude?: number;
  longitude?: number;
  maxDistance?: number;
  sort?: string;
  page?: number;
  size?: number;
}

export interface HospitalSearchParams {
  q?: string;
  department?: string;
  emergency24x7?: boolean;
  icuAvailable?: boolean;
  latitude?: number;
  longitude?: number;
  maxDistance?: number;
  sort?: string;
  page?: number;
  size?: number;
}

export async function searchDoctors(params: DoctorSearchParams): Promise<PagedDoctorSearch> {
  const { data } = await apiClient.get<ApiEnvelope<PagedDoctorSearch>>('/search/doctors', { params });
  return data.data ?? { content: [], page: 0, size: 20, totalElements: 0, totalPages: 0 };
}

export async function searchHospitals(params: HospitalSearchParams): Promise<PagedHospitalSearch> {
  const { data } = await apiClient.get<ApiEnvelope<PagedHospitalSearch>>('/search/hospitals', { params });
  return data.data ?? { content: [], page: 0, size: 20, totalElements: 0, totalPages: 0 };
}

export async function unifiedSearch(params: {
  q?: string;
  type?: 'ALL' | 'DOCTOR' | 'HOSPITAL';
  latitude?: number;
  longitude?: number;
  maxDistance?: number;
  page?: number;
  size?: number;
}): Promise<UnifiedSearchResult> {
  const { data } = await apiClient.get<ApiEnvelope<UnifiedSearchResult>>('/search', { params });
  return data.data ?? { doctors: [], hospitals: [], doctorCount: 0, hospitalCount: 0 };
}
