import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import {
  createInvoice,
  getInvoiceByEncounter,
  listMyInvoices,
  recordPayment,
  type CreateInvoicePayload,
  type RecordPaymentPayload,
} from '../api/billingApi';

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

export function useBillingMutations(encounterId?: string) {
  const qc = useQueryClient();
  const invalidate = (invoiceId?: string) => {
    if (encounterId) {
      void qc.invalidateQueries({ queryKey: billingKeys.encounterInvoice(encounterId) });
    }
    void qc.invalidateQueries({ queryKey: ['billing', 'invoices', 'me'] });
    void qc.invalidateQueries({ queryKey: ['opd', 'queue'] });
    if (invoiceId) {
      void qc.invalidateQueries({ queryKey: ['billing', 'invoices', invoiceId] });
    }
  };

  return {
    createInvoice: useMutation({
      mutationFn: (payload: CreateInvoicePayload) => createInvoice(payload),
      onSuccess: (invoice) => invalidate(invoice.invoiceId),
    }),
    recordPayment: useMutation({
      mutationFn: ({ invoiceId, payload }: { invoiceId: string; payload: RecordPaymentPayload }) =>
        recordPayment(invoiceId, payload),
      onSuccess: (payment) => invalidate(payment.invoiceId),
    }),
  };
}
