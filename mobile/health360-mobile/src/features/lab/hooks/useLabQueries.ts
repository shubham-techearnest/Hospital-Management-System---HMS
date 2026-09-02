import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { bookHospitalLab, bookPartnerLab, listEncounterLabReports, listMyLabOrders } from '../api/labApi';

export const labKeys = {
  myOrders: ['lab', 'me', 'orders'] as const,
  encounterReports: (encounterId: string) => ['lab', 'encounters', encounterId, 'reports'] as const,
};

function isAuthError(error: unknown): boolean {
  if (!isAxiosError(error)) return false;
  const status = error.response?.status;
  return status === 401 || status === 403;
}

export function useMyLabOrders() {
  return useQuery({
    queryKey: labKeys.myOrders,
    queryFn: listMyLabOrders,
    retry: (_, error) => !isAuthError(error),
  });
}

export function useBookHospitalLab() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: bookHospitalLab,
    onSuccess: () => qc.invalidateQueries({ queryKey: labKeys.myOrders }),
  });
}

export function useBookPartnerLab() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      clinicalOrderItemId,
      partnerOrgId,
      locationId,
    }: {
      clinicalOrderItemId: string;
      partnerOrgId: string;
      locationId: string;
    }) => bookPartnerLab(clinicalOrderItemId, partnerOrgId, locationId),
    onSuccess: () => qc.invalidateQueries({ queryKey: labKeys.myOrders }),
  });
}

export function useEncounterLabReports(encounterId: string) {
  return useQuery({
    queryKey: labKeys.encounterReports(encounterId),
    queryFn: () => listEncounterLabReports(encounterId),
    enabled: Boolean(encounterId),
    retry: (_, error) => !isAuthError(error),
  });
}
