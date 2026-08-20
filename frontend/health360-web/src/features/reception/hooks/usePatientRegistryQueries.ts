import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getHospitalPatient,
  getRegistrationReceipt,
  linkExistingHospitalPatient,
  registerHospitalPatient,
  searchHospitalPatients,
  type RegisterHospitalPatientPayload,
} from '@/features/reception/api/patientRegistryApi';

export const patientRegistryKeys = {
  all: ['patientRegistry'] as const,
  search: (params: Record<string, string | number | undefined>) =>
    [...patientRegistryKeys.all, 'search', params] as const,
  patient: (id: string) => [...patientRegistryKeys.all, 'patient', id] as const,
  receipt: (id: string) => [...patientRegistryKeys.all, 'receipt', id] as const,
};

export function usePatientSearch(params: {
  uhid?: string;
  mobile?: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  enabled?: boolean;
}) {
  const { enabled = true, ...searchParams } = params;
  const hasQuery = Boolean(
    searchParams.uhid?.trim()
    || searchParams.mobile?.trim()
    || (searchParams.firstName?.trim() && searchParams.lastName?.trim() && searchParams.dateOfBirth),
  );

  return useQuery({
    queryKey: patientRegistryKeys.search(searchParams),
    queryFn: () => searchHospitalPatients(searchParams),
    enabled: enabled && hasQuery,
    retry: (_, error) => {
      const status = (error as { response?: { status?: number } })?.response?.status;
      return status !== 401 && status !== 403 && status !== 404;
    },
  });
}

export function useRegisterHospitalPatient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: RegisterHospitalPatientPayload) => registerHospitalPatient(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: patientRegistryKeys.all });
    },
  });
}

export function useLinkExistingPatient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (patientId: string) => linkExistingHospitalPatient(patientId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: patientRegistryKeys.all });
    },
  });
}

export function useHospitalPatient(patientId: string | undefined) {
  return useQuery({
    queryKey: patientRegistryKeys.patient(patientId ?? ''),
    queryFn: () => getHospitalPatient(patientId!),
    enabled: Boolean(patientId),
  });
}

export function useRegistrationReceipt(patientId: string | undefined) {
  return useQuery({
    queryKey: patientRegistryKeys.receipt(patientId ?? ''),
    queryFn: () => getRegistrationReceipt(patientId!),
    enabled: Boolean(patientId),
  });
}
