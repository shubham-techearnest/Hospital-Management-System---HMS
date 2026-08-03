import { useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { getPatientSummary } from '../api/patientSummaryApi';

export const patientSummaryKeys = {
  summary: (patientId: string, appointmentId: string) =>
    ['patient', 'summary', patientId, appointmentId] as const,
};

export function usePatientSummary(patientId: string, appointmentId: string, enabled = true) {
  return useQuery({
    queryKey: patientSummaryKeys.summary(patientId, appointmentId),
    queryFn: () => getPatientSummary(patientId, appointmentId),
    enabled: enabled && Boolean(patientId && appointmentId),
    retry: (_, error) => (error as AxiosError)?.response?.status !== 403,
  });
}
