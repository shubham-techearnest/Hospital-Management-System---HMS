import { useQuery } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { getInvoiceByEncounter, listMyInvoices } from '../api/billingApi';

export const billingKeys = {
  myInvoices: (page: number) => ['billing', 'invoices', 'me', page] as const,
  encounterInvoice: (encounterId: string) => ['billing', 'encounters', encounterId, 'invoice'] as const,
};

function isAuthError(error: unknown): boolean {
  if (!isAxiosError(error)) return false;
  const status = error.response?.status;
  return status === 401 || status === 403;
}

export function useMyInvoices(page = 0, size = 20) {
  return useQuery({
    queryKey: billingKeys.myInvoices(page),
    queryFn: () => listMyInvoices(page, size),
    retry: (_, error) => !isAuthError(error),
  });
}

export function useEncounterInvoice(encounterId: string, enabled = true) {
  return useQuery({
    queryKey: billingKeys.encounterInvoice(encounterId),
    queryFn: async () => {
      try {
        return await getInvoiceByEncounter(encounterId);
      } catch (error) {
        if (isAxiosError(error) && error.response?.status === 404) return null;
        throw error;
      }
    },
    enabled: Boolean(encounterId) && enabled,
    retry: (_, error) => !isAuthError(error),
  });
}
