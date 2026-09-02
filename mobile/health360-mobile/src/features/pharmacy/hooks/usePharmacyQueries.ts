import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { listMyPharmacyRequests, sendPrescriptionToHospitalPharmacy, sendPrescriptionToPartnerPharmacy } from '../api/pharmacyApi';

export const pharmacyKeys = {
  myRequests: ['pharmacy', 'requests', 'me'] as const,
};

function isAuthError(error: unknown): boolean {
  if (!isAxiosError(error)) return false;
  const status = error.response?.status;
  return status === 401 || status === 403;
}

export function useMyPharmacyRequests() {
  return useQuery({
    queryKey: pharmacyKeys.myRequests,
    queryFn: listMyPharmacyRequests,
    retry: (_, error) => !isAuthError(error),
  });
}

export function useSendPrescriptionToHospital() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: sendPrescriptionToHospitalPharmacy,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: pharmacyKeys.myRequests });
    },
  });
}

export function useSendPrescriptionToPartner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      prescriptionId,
      partnerOrgId,
      locationId,
    }: {
      prescriptionId: string;
      partnerOrgId: string;
      locationId: string;
    }) => sendPrescriptionToPartnerPharmacy(prescriptionId, partnerOrgId, locationId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: pharmacyKeys.myRequests });
    },
  });
}
