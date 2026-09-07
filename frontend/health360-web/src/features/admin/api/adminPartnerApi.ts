import { apiClient } from '@/shared/api/client';
import type { ApiEnvelope } from '@/features/auth/api/authApi';

export interface PartnerLocation {
  locationId: string;
  partnerOrgId: string;
  name: string;
  addressLine1: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  latitude: number;
  longitude: number;
  phone?: string;
  email?: string;
  primaryLocation: boolean;
}

export interface PartnerOrg {
  partnerOrgId: string;
  orgType: string;
  name: string;
  registrationNumber?: string;
  status: string;
  locations: PartnerLocation[];
  hospitalLinkCount: number;
}

export interface HospitalPartnerLink {
  linkId: string;
  hospitalId: string;
  partnerOrgId: string;
  linkType: string;
  status: string;
}

function unwrap<T>(envelope: ApiEnvelope<T>): T {
  if (!envelope.success || envelope.data === undefined) {
    throw new Error(envelope.message ?? 'Request failed');
  }
  return envelope.data;
}

export async function listAdminPartners(orgType?: string): Promise<PartnerOrg[]> {
  const { data } = await apiClient.get<ApiEnvelope<PartnerOrg[]>>('/admin/partners', {
    params: { orgType: orgType || undefined },
  });
  return unwrap(data) ?? [];
}

export async function getAdminPartner(partnerOrgId: string): Promise<PartnerOrg> {
  const { data } = await apiClient.get<ApiEnvelope<PartnerOrg>>(`/admin/partners/${partnerOrgId}`);
  return unwrap(data);
}

export async function createAdminPartner(payload: {
  orgType: string;
  name: string;
  registrationNumber?: string;
}): Promise<PartnerOrg> {
  const { data } = await apiClient.post<ApiEnvelope<PartnerOrg>>('/admin/partners', payload);
  return unwrap(data);
}

export async function updateAdminPartner(
  partnerOrgId: string,
  payload: { name?: string; registrationNumber?: string; status?: string },
): Promise<PartnerOrg> {
  const { data } = await apiClient.patch<ApiEnvelope<PartnerOrg>>(
    `/admin/partners/${partnerOrgId}`,
    payload,
  );
  return unwrap(data);
}

export async function addAdminPartnerLocation(
  partnerOrgId: string,
  payload: {
    name: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    pincode: string;
    country?: string;
    latitude: number;
    longitude: number;
    phone?: string;
    email?: string;
    primaryLocation?: boolean;
  },
): Promise<PartnerLocation> {
  const { data } = await apiClient.post<ApiEnvelope<PartnerLocation>>(
    `/admin/partners/${partnerOrgId}/locations`,
    payload,
  );
  return unwrap(data);
}

export async function linkAdminPartnerHospital(
  partnerOrgId: string,
  payload: { hospitalId: string; linkType?: string },
): Promise<HospitalPartnerLink> {
  const { data } = await apiClient.post<ApiEnvelope<HospitalPartnerLink>>(
    `/admin/partners/${partnerOrgId}/hospital-links`,
    payload,
  );
  return unwrap(data);
}

export async function listAdminPartnerLinks(partnerOrgId: string): Promise<HospitalPartnerLink[]> {
  const { data } = await apiClient.get<ApiEnvelope<HospitalPartnerLink[]>>(
    `/admin/partners/${partnerOrgId}/hospital-links`,
  );
  return unwrap(data) ?? [];
}

export interface PartnerMembership {
  membershipId: string;
  partnerOrgId: string;
  userId: string;
  userEmail?: string;
  userName?: string;
  locationId?: string;
  jobTitle?: string;
  employmentStatus: string;
  hiredAt?: string;
}

export async function listAdminPartnerMemberships(partnerOrgId: string): Promise<PartnerMembership[]> {
  const { data } = await apiClient.get<ApiEnvelope<PartnerMembership[]>>(
    `/admin/partners/${partnerOrgId}/memberships`,
  );
  return unwrap(data) ?? [];
}

export async function addAdminPartnerMembership(
  partnerOrgId: string,
  payload: { userId: string; locationId?: string; jobTitle?: string; employmentStatus?: string },
): Promise<PartnerMembership> {
  const { data } = await apiClient.post<ApiEnvelope<PartnerMembership>>(
    `/admin/partners/${partnerOrgId}/memberships`,
    payload,
  );
  return unwrap(data);
}

export async function updateAdminPartnerMembership(
  partnerOrgId: string,
  membershipId: string,
  payload: { locationId?: string; jobTitle?: string; employmentStatus?: string },
): Promise<PartnerMembership> {
  const { data } = await apiClient.patch<ApiEnvelope<PartnerMembership>>(
    `/admin/partners/${partnerOrgId}/memberships/${membershipId}`,
    payload,
  );
  return unwrap(data);
}
