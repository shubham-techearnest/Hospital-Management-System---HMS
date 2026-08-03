import axios from 'axios';
import type { ApiEnvelope } from '@/features/auth/api/authApi';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? '/api/v1';

export const publicApiClient = axios.create({
  baseURL: apiBaseUrl,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
});

export interface PublicQualification {
  id: string;
  degree: string;
  institution: string;
  yearOfCompletion?: number;
  country?: string;
}

export interface PublicAward {
  id: string;
  title: string;
  organization?: string;
  awardYear?: number;
}

export interface PublicMembership {
  id: string;
  organization: string;
  membershipId?: string;
  memberSince?: number;
}

export interface PublicFacility {
  id: string;
  branchId?: string;
  name: string;
  category: string;
  description?: string;
  available: boolean;
}

export interface PublicGalleryImage {
  id: string;
  caption?: string;
  displayOrder: number;
  fileSizeBytes: number;
  mimeType: string;
  imageUrl: string;
}

export interface PublicConsultationFee {
  id: string;
  consultationType: string;
  feeAmount: number;
  currency: string;
  durationMinutes?: number;
  feeDisplay: string;
}

export interface PublicDoctorHospital {
  hospitalId: string;
  hospitalName: string;
  branchId?: string;
  branchName?: string;
  city?: string;
  consultationFees: PublicConsultationFee[];
}

export interface PublicDoctorProfile {
  id: string;
  name: string;
  title?: string;
  verified: boolean;
  specialization?: string;
  averageRating?: number;
  reviewCount: number;
  gender?: string;
  biography?: string;
  profilePhotoUrl?: string;
  yearsExperience?: number;
  languages: string[];
  qualifications: PublicQualification[];
  awards: PublicAward[];
  memberships: PublicMembership[];
  hospitals: PublicDoctorHospital[];
  availabilityPreview: {
    availableToday: boolean;
    availableSlotsNext7Days: number;
  };
}

export interface PublicBranch {
  id: string;
  name: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  latitude: number;
  longitude: number;
  phone: string;
  email?: string;
  primary: boolean;
}

export interface PublicDepartment {
  id: string;
  name: string;
  description?: string;
  floor?: string;
}

export interface PublicHospitalDoctorSummary {
  doctorId: string;
  name: string;
  specialization?: string;
  department?: string;
  averageRating?: number;
  reviewCount: number;
  yearsExperience?: number;
}

export interface PublicHospitalProfile {
  id: string;
  name: string;
  hospitalType?: string;
  establishedYear?: number;
  totalBedCount?: number;
  accreditation?: string;
  description?: string;
  averageRating?: number;
  reviewCount: number;
  emergencyInfo: {
    emergencyAvailable24x7: boolean;
    emergencyPhone?: string;
    ambulanceAvailable: boolean;
    icuAvailable: boolean;
    icuBedCount?: number;
    icuType?: string;
  };
  branches: PublicBranch[];
  departments: PublicDepartment[];
  featuredDoctors: PublicHospitalDoctorSummary[];
  facilities: PublicFacility[];
  gallery: PublicGalleryImage[];
}

export interface Review {
  id: string;
  rating: number;
  comment?: string;
  reviewerName: string;
  createdAt: string;
}

export interface PagedReviews {
  content: Review[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface PagedHospitalDoctors {
  content: PublicHospitalDoctorSummary[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export async function fetchPublicDoctorProfile(doctorId: string): Promise<PublicDoctorProfile> {
  const { data } = await publicApiClient.get<ApiEnvelope<PublicDoctorProfile>>(`/doctors/${doctorId}/public`);
  if (!data.data) throw new Error('Doctor profile not found');
  return data.data;
}

export async function fetchDoctorReviews(doctorId: string, page = 0, size = 10): Promise<PagedReviews> {
  const { data } = await publicApiClient.get<ApiEnvelope<PagedReviews>>(`/doctors/${doctorId}/reviews`, {
    params: { page, size },
  });
  return data.data ?? { content: [], page: 0, size, totalElements: 0, totalPages: 0 };
}

export async function fetchPublicHospitalProfile(hospitalId: string): Promise<PublicHospitalProfile> {
  const { data } = await publicApiClient.get<ApiEnvelope<PublicHospitalProfile>>(`/hospitals/${hospitalId}/public`);
  if (!data.data) throw new Error('Hospital profile not found');
  return data.data;
}

export async function fetchHospitalReviews(hospitalId: string, page = 0, size = 10): Promise<PagedReviews> {
  const { data } = await publicApiClient.get<ApiEnvelope<PagedReviews>>(`/hospitals/${hospitalId}/reviews`, {
    params: { page, size },
  });
  return data.data ?? { content: [], page: 0, size, totalElements: 0, totalPages: 0 };
}

export async function fetchHospitalDoctors(
  hospitalId: string,
  params?: { departmentId?: string; specialization?: string; page?: number; size?: number },
): Promise<PagedHospitalDoctors> {
  const { data } = await publicApiClient.get<ApiEnvelope<PagedHospitalDoctors>>(`/hospitals/${hospitalId}/doctors`, {
    params,
  });
  return data.data ?? { content: [], page: 0, size: 20, totalElements: 0, totalPages: 0 };
}
