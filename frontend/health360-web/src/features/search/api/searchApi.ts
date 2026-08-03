import { apiClient } from '@/shared/api/client';
import type { ApiEnvelope } from '@/features/auth/api/authApi';

export interface DoctorSearchResult {
  doctorId: string;
  name: string;
  specialization?: string;
  hospitalName?: string;
  branchName?: string;
  city?: string;
  gender?: string;
  yearsExperience?: number;
  languages: string[];
  consultationModes: string[];
  availableToday: boolean;
  averageRating?: number;
  reviewCount: number;
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
  page: number;
  size: number;
}

export interface SpecializationOption {
  id: string;
  code: string;
  name: string;
  category?: string;
}

export interface DoctorSearchParams {
  q?: string;
  specialization?: string;
  hospital?: string;
  city?: string;
  department?: string;
  minExperience?: number;
  language?: string;
  gender?: string;
  availableToday?: boolean;
  consultationMode?: string;
  minRating?: number;
  maxFee?: number;
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
  facility?: string;
  emergency24x7?: boolean;
  icuAvailable?: boolean;
  minRating?: number;
  latitude?: number;
  longitude?: number;
  maxDistance?: number;
  sort?: string;
  page?: number;
  size?: number;
}

export interface UnifiedSearchParams {
  q?: string;
  type?: 'ALL' | 'DOCTOR' | 'HOSPITAL';
  latitude?: number;
  longitude?: number;
  maxDistance?: number;
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

export async function unifiedSearch(params: UnifiedSearchParams): Promise<UnifiedSearchResult> {
  const { data } = await apiClient.get<ApiEnvelope<UnifiedSearchResult>>('/search', { params });
  return data.data ?? { doctors: [], hospitals: [], doctorCount: 0, hospitalCount: 0, page: 0, size: 20 };
}

export async function listSpecializations(): Promise<SpecializationOption[]> {
  const { data } = await apiClient.get<ApiEnvelope<SpecializationOption[]>>('/search/specializations');
  return data.data ?? [];
}
