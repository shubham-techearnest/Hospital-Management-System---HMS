import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  addAdminPartnerLocation,
  addAdminPartnerMembership,
  createAdminPartner,
  getAdminPartner,
  linkAdminPartnerHospital,
  listAdminPartnerLinks,
  listAdminPartnerMemberships,
  listAdminPartners,
  updateAdminPartner,
  updateAdminPartnerMembership,
} from '../api/adminPartnerApi';

export const adminPartnerKeys = {
  all: ['admin', 'partners'] as const,
  list: (orgType?: string) => ['admin', 'partners', 'list', orgType ?? 'ALL'] as const,
  detail: (id: string) => ['admin', 'partners', id] as const,
  links: (id: string) => ['admin', 'partners', id, 'links'] as const,
  memberships: (id: string) => ['admin', 'partners', id, 'memberships'] as const,
};

export function useAdminPartners(orgType?: string) {
  return useQuery({
    queryKey: adminPartnerKeys.list(orgType),
    queryFn: () => listAdminPartners(orgType),
  });
}

export function useAdminPartner(partnerOrgId: string) {
  return useQuery({
    queryKey: adminPartnerKeys.detail(partnerOrgId),
    queryFn: () => getAdminPartner(partnerOrgId),
    enabled: Boolean(partnerOrgId),
  });
}

export function useAdminPartnerLinks(partnerOrgId: string) {
  return useQuery({
    queryKey: adminPartnerKeys.links(partnerOrgId),
    queryFn: () => listAdminPartnerLinks(partnerOrgId),
    enabled: Boolean(partnerOrgId),
  });
}

export function useAdminPartnerMemberships(partnerOrgId: string) {
  return useQuery({
    queryKey: adminPartnerKeys.memberships(partnerOrgId),
    queryFn: () => listAdminPartnerMemberships(partnerOrgId),
    enabled: Boolean(partnerOrgId),
  });
}

export function useCreateAdminPartner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createAdminPartner,
    onSuccess: () => qc.invalidateQueries({ queryKey: adminPartnerKeys.all }),
  });
}

export function useUpdateAdminPartner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      partnerOrgId,
      ...payload
    }: {
      partnerOrgId: string;
      name?: string;
      registrationNumber?: string;
      status?: string;
    }) => updateAdminPartner(partnerOrgId, payload),
    onSuccess: (org) => {
      qc.invalidateQueries({ queryKey: adminPartnerKeys.all });
      qc.invalidateQueries({ queryKey: adminPartnerKeys.detail(org.partnerOrgId) });
    },
  });
}

export function useAddAdminPartnerLocation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      partnerOrgId,
      ...payload
    }: {
      partnerOrgId: string;
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
    }) => addAdminPartnerLocation(partnerOrgId, payload),
    onSuccess: (loc) => {
      qc.invalidateQueries({ queryKey: adminPartnerKeys.detail(loc.partnerOrgId) });
      qc.invalidateQueries({ queryKey: adminPartnerKeys.all });
    },
  });
}

export function useLinkAdminPartnerHospital() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      partnerOrgId,
      hospitalId,
      linkType,
    }: {
      partnerOrgId: string;
      hospitalId: string;
      linkType?: string;
    }) => linkAdminPartnerHospital(partnerOrgId, { hospitalId, linkType }),
    onSuccess: (link) => {
      qc.invalidateQueries({ queryKey: adminPartnerKeys.detail(link.partnerOrgId) });
      qc.invalidateQueries({ queryKey: adminPartnerKeys.links(link.partnerOrgId) });
      qc.invalidateQueries({ queryKey: adminPartnerKeys.all });
    },
  });
}

export function useAddAdminPartnerMembership() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      partnerOrgId,
      ...payload
    }: {
      partnerOrgId: string;
      userId: string;
      locationId?: string;
      jobTitle?: string;
      employmentStatus?: string;
    }) => addAdminPartnerMembership(partnerOrgId, payload),
    onSuccess: (m) => {
      qc.invalidateQueries({ queryKey: adminPartnerKeys.memberships(m.partnerOrgId) });
    },
  });
}

export function useUpdateAdminPartnerMembership() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      partnerOrgId,
      membershipId,
      ...payload
    }: {
      partnerOrgId: string;
      membershipId: string;
      locationId?: string;
      jobTitle?: string;
      employmentStatus?: string;
    }) => updateAdminPartnerMembership(partnerOrgId, membershipId, payload),
    onSuccess: (m) => {
      qc.invalidateQueries({ queryKey: adminPartnerKeys.memberships(m.partnerOrgId) });
    },
  });
}
