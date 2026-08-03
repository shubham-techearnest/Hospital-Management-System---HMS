import axios from 'axios';
import { API_BASE_URL } from '@/config';
import type { ApiEnvelope } from '@/features/auth/api/authApi';

export const publicApiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
});

export interface PublicDoctorProfile {
  id: string;
  name: string;
  title?: string;
  verified: boolean;
  specialization?: string;
  averageRating?: number;
  reviewCount: number;
  biography?: string;
  yearsExperience?: number;
  languages: string[];
  qualifications: Array<{ id: string; degree: string; institution: string; yearOfCompletion?: number }>;
  hospitals: Array<{
    hospitalId: string;
    hospitalName: string;
    branchName?: string;
    city?: string;
    consultationFees: Array<{ feeDisplay: string }>;
  }>;
  availabilityPreview: { availableToday: boolean; availableSlotsNext7Days: number };
}

export interface PublicHospitalProfile {
  id: string;
  name: string;
  hospitalType?: string;
  description?: string;
  averageRating?: number;
  reviewCount: number;
  emergencyInfo: {
    emergencyAvailable24x7: boolean;
    ambulanceAvailable: boolean;
    icuAvailable: boolean;
  };
  branches: Array<{
    id: string;
    name: string;
    addressLine1: string;
    city: string;
    state: string;
    pincode: string;
    latitude: number;
    longitude: number;
    phone: string;
    primary: boolean;
  }>;
  departments: Array<{ id: string; name: string; description?: string }>;
  featuredDoctors: Array<{
    doctorId: string;
    name: string;
    specialization?: string;
    averageRating?: number;
    reviewCount: number;
  }>;
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
  totalPages: number;
}

export async function fetchPublicDoctorProfile(doctorId: string): Promise<PublicDoctorProfile> {
  const { data } = await publicApiClient.get<ApiEnvelope<PublicDoctorProfile>>(`/doctors/${doctorId}/public`);
  if (!data.data) throw new Error('Doctor not found');
  return data.data;
}

export async function fetchDoctorReviews(doctorId: string, page = 0): Promise<PagedReviews> {
  const { data } = await publicApiClient.get<ApiEnvelope<PagedReviews>>(`/doctors/${doctorId}/reviews`, {
    params: { page, size: 10 },
  });
  return data.data ?? { content: [], page: 0, totalPages: 0 };
}

export async function fetchPublicHospitalProfile(hospitalId: string): Promise<PublicHospitalProfile> {
  const { data } = await publicApiClient.get<ApiEnvelope<PublicHospitalProfile>>(`/hospitals/${hospitalId}/public`);
  if (!data.data) throw new Error('Hospital not found');
  return data.data;
}

export async function fetchHospitalReviews(hospitalId: string, page = 0): Promise<PagedReviews> {
  const { data } = await publicApiClient.get<ApiEnvelope<PagedReviews>>(`/hospitals/${hospitalId}/reviews`, {
    params: { page, size: 10 },
  });
  return data.data ?? { content: [], page: 0, totalPages: 0 };
}
