import { useQuery } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { listEncounterImagingReports } from '../api/radiologyApi';

export const radiologyKeys = {
  encounterReports: (encounterId: string) => ['radiology', 'encounters', encounterId, 'reports'] as const,
};

function isAuthError(error: unknown): boolean {
  if (!isAxiosError(error)) return false;
  const status = error.response?.status;
  return status === 401 || status === 403;
}

export function useEncounterImagingReports(encounterId: string) {
  return useQuery({
    queryKey: radiologyKeys.encounterReports(encounterId),
    queryFn: () => listEncounterImagingReports(encounterId),
    enabled: Boolean(encounterId),
    retry: (_, error) => !isAuthError(error),
  });
}
