import { useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { getPatientSummary } from '@/features/patient/api/patientSummaryApi';

export const patientSummaryKeys = {
  summary: (patientId: string, appointmentId?: string, encounterId?: string) =>
    ['patient', 'summary', patientId, appointmentId ?? '', encounterId ?? ''] as const,
};

export function usePatientSummary(
  patientId: string,
  options: { appointmentId?: string; encounterId?: string; enabled?: boolean } = {},
) {
  const appointmentId = options.appointmentId ?? '';
  const encounterId = options.encounterId ?? '';
  const hasContext = Boolean(appointmentId || encounterId);
  const enabled = (options.enabled ?? true) && Boolean(patientId) && hasContext;

  return useQuery({
    queryKey: patientSummaryKeys.summary(patientId, appointmentId || undefined, encounterId || undefined),
    queryFn: () =>
      getPatientSummary(patientId, {
        appointmentId: appointmentId || undefined,
        encounterId: encounterId || undefined,
      }),
    enabled,
    retry: (_, error) => (error as AxiosError)?.response?.status !== 403,
  });
}
