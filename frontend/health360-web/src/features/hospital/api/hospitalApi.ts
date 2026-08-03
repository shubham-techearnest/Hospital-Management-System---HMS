import { apiClient } from '@/shared/api/client';
import type { ApiEnvelope } from '@/features/auth/api/authApi';

export interface EmergencyInfo {
  emergencyAvailable24x7: boolean;
  emergencyPhone?: string;
  ambulanceAvailable: boolean;
  icuAvailable: boolean;
  icuBedCount?: number;
  icuType?: string;
}

export interface HospitalProfile {
  id: string;
  name: string;
  registrationNumber: string;
  hospitalType: string;
  establishedYear?: number;
  totalBedCount?: number;
  accreditation?: string;
  description?: string;
  emergencyInfo: EmergencyInfo;
  branchCount: number;
  departmentCount: number;
  doctorCount: number;
}

export interface Branch {
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
  workingHours: { dayOfWeek: string; openTime: string; closeTime: string; closed: boolean }[];
}

export interface Department {
  id: string;
  name: string;
  description?: string;
  floor?: string;
  headDoctorId?: string;
  active: boolean;
}

export interface HospitalDoctor {
  associationId: string;
  doctorId: string;
  doctorName: string;
  medicalRegistrationNumber?: string;
  specialization?: string;
  branchId?: string;
  branchName?: string;
  departmentId?: string;
  departmentName?: string;
  status: string;
}

export interface DoctorSearchResult {
  doctorId: string;
  doctorName: string;
  medicalRegistrationNumber?: string;
  primarySpecialization?: string;
  verificationStatus: string;
}

export const HOSPITAL_TYPES = ['GOVERNMENT', 'PRIVATE', 'TRUST', 'CLINIC'] as const;
export const ICU_TYPES = ['GENERAL', 'CRITICAL_CARE'] as const;

export async function getHospitalProfile() {
  const { data } = await apiClient.get<ApiEnvelope<HospitalProfile>>('/hospitals/me/profile');
  return data.data;
}

export async function createHospitalProfile(payload: {
  name: string;
  registrationNumber: string;
  hospitalType: string;
  establishedYear?: number;
  totalBedCount?: number;
  accreditation?: string;
  description?: string;
}) {
  const { data } = await apiClient.post<ApiEnvelope<HospitalProfile>>('/hospitals/me/profile', payload);
  return data.data;
}

export async function updateHospitalProfile(payload: {
  name: string;
  hospitalType: string;
  establishedYear?: number;
  totalBedCount?: number;
  accreditation?: string;
  description?: string;
}) {
  const { data } = await apiClient.put<ApiEnvelope<HospitalProfile>>('/hospitals/me/profile', payload);
  return data.data;
}

export async function updateEmergencyInfo(payload: EmergencyInfo) {
  const { data } = await apiClient.put<ApiEnvelope<HospitalProfile>>('/hospitals/me/profile/emergency-info', payload);
  return data.data;
}

export async function listBranches() {
  const { data } = await apiClient.get<ApiEnvelope<Branch[]>>('/hospitals/me/branches');
  return data.data;
}

export async function createBranch(payload: Omit<Branch, 'id' | 'workingHours'> & { workingHours?: Branch['workingHours'] }) {
  const { data } = await apiClient.post<ApiEnvelope<Branch>>('/hospitals/me/branches', payload);
  return data.data;
}

export async function updateBranch(id: string, payload: Omit<Branch, 'id'>) {
  const { data } = await apiClient.put<ApiEnvelope<Branch>>(`/hospitals/me/branches/${id}`, payload);
  return data.data;
}

export async function deleteBranch(id: string) {
  await apiClient.delete(`/hospitals/me/branches/${id}`);
}

export async function listDepartments() {
  const { data } = await apiClient.get<ApiEnvelope<Department[]>>('/hospitals/me/departments');
  return data.data;
}

export async function createDepartment(payload: Omit<Department, 'id'>) {
  const { data } = await apiClient.post<ApiEnvelope<Department>>('/hospitals/me/departments', payload);
  return data.data;
}

export async function updateDepartment(id: string, payload: Partial<Omit<Department, 'id'>>) {
  const { data } = await apiClient.put<ApiEnvelope<Department>>(`/hospitals/me/departments/${id}`, payload);
  return data.data;
}

export async function deleteDepartment(id: string) {
  await apiClient.delete(`/hospitals/me/departments/${id}`);
}

export async function listHospitalDoctors() {
  const { data } = await apiClient.get<ApiEnvelope<HospitalDoctor[]>>('/hospitals/me/doctors');
  return data.data;
}

export async function searchDoctors(q: string) {
  const { data } = await apiClient.get<ApiEnvelope<DoctorSearchResult[]>>('/hospitals/me/doctors/search', { params: { q } });
  return data.data;
}

export async function associateDoctor(payload: { doctorId: string; branchId?: string; departmentId?: string }) {
  const { data } = await apiClient.post<ApiEnvelope<HospitalDoctor>>('/hospitals/me/doctors', payload);
  return data.data;
}

export async function removeHospitalDoctor(associationId: string) {
  await apiClient.delete(`/hospitals/me/doctors/${associationId}`);
}

export async function approveHospitalDoctorAssociation(associationId: string) {
  const { data } = await apiClient.post<ApiEnvelope<HospitalDoctor>>(
    `/hospitals/me/doctors/${associationId}/approve`,
  );
  return data.data;
}

export async function listHospitalCatalog() {
  const { data } = await apiClient.get<ApiEnvelope<HospitalProfile[]>>('/hospitals/catalog');
  return data.data;
}

export interface Facility {
  id: string;
  branchId?: string;
  name: string;
  category: string;
  description?: string;
  available: boolean;
}

export interface GalleryImage {
  id: string;
  caption?: string;
  displayOrder: number;
  fileSizeBytes: number;
  mimeType: string;
  imageUrl: string;
}

export const FACILITY_CATEGORIES = ['DIAGNOSTIC', 'SURGICAL', 'EMERGENCY', 'ICU', 'PHARMACY', 'PARKING', 'OTHER'] as const;

export async function listFacilities() {
  const { data } = await apiClient.get<ApiEnvelope<Facility[]>>('/hospitals/me/facilities');
  return data.data ?? [];
}

export async function createFacility(payload: {
  name: string;
  category: string;
  description?: string;
  branchId?: string;
  available?: boolean;
}) {
  const { data } = await apiClient.post<ApiEnvelope<Facility>>('/hospitals/me/facilities', payload);
  return data.data;
}

export async function updateFacility(id: string, payload: {
  name: string;
  category: string;
  description?: string;
  branchId?: string;
  available?: boolean;
}) {
  const { data } = await apiClient.put<ApiEnvelope<Facility>>(`/hospitals/me/facilities/${id}`, payload);
  return data.data;
}

export async function deleteFacility(id: string) {
  await apiClient.delete(`/hospitals/me/facilities/${id}`);
}

export async function listGalleryImages() {
  const { data } = await apiClient.get<ApiEnvelope<GalleryImage[]>>('/hospitals/me/gallery');
  return data.data ?? [];
}

export async function uploadGalleryImage(file: File, caption?: string, displayOrder?: number) {
  const form = new FormData();
  form.append('file', file);
  if (caption) form.append('caption', caption);
  if (displayOrder != null) form.append('displayOrder', String(displayOrder));
  const { data } = await apiClient.post<ApiEnvelope<GalleryImage>>('/hospitals/me/gallery', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.data;
}

export async function deleteGalleryImage(imageId: string) {
  await apiClient.delete(`/hospitals/me/gallery/${imageId}`);
}

export function galleryImageSrc(imageUrl: string) {
  const base = import.meta.env.VITE_API_BASE_URL ?? '/api/v1';
  if (imageUrl.startsWith('http')) return imageUrl;
  if (imageUrl.startsWith('/api/')) {
    const origin = base.replace(/\/api\/v1\/?$/, '');
    return `${origin}${imageUrl}`;
  }
  return `${base.replace(/\/$/, '')}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
}
