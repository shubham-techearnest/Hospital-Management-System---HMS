import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import {
  createInvoice,
  getInvoice,
  getInvoiceByEncounter,
  listHospitalInvoices,
  listMyInvoices,
  recordPayment,
  type CreateInvoicePayload,
  type RecordPaymentPayload,
} from '../api/billingApi';

export const billingKeys = {
  hospital: (hospitalId: string, branchId: string, page: number) =>
    ['billing', 'invoices', hospitalId, branchId, page] as const,
  invoice: (id: string) => ['billing', 'invoices', id] as const,
  byEncounter: (encounterId: string) => ['billing', 'encounters', encounterId, 'invoice'] as const,
  me: (page: number) => ['billing', 'invoices', 'me', page] as const,
};

function isAuthError(error: unknown): boolean {
  if (!isAxiosError(error)) return false;
  const status = error.response?.status;
  return status === 401 || status === 403;
}

export function useHospitalInvoices(hospitalId?: string, branchId?: string, page = 0) {
  return useQuery({
    queryKey: billingKeys.hospital(hospitalId ?? '', branchId ?? '', page),
    queryFn: () => listHospitalInvoices(hospitalId!, branchId!, page),
    enabled: Boolean(hospitalId && branchId),
    retry: (_, error) => !isAuthError(error),
  });
}

export function useInvoice(invoiceId?: string) {
  return useQuery({
    queryKey: billingKeys.invoice(invoiceId ?? ''),
    queryFn: () => getInvoice(invoiceId!),
    enabled: Boolean(invoiceId),
    retry: (_, error) => !isAuthError(error),
  });
}

export function useInvoiceByEncounter(encounterId?: string) {
  return useQuery({
    queryKey: billingKeys.byEncounter(encounterId ?? ''),
    queryFn: () => getInvoiceByEncounter(encounterId!),
    enabled: Boolean(encounterId),
    retry: false,
  });
}

export function useMyInvoices(page = 0) {
  return useQuery({
    queryKey: billingKeys.me(page),
    queryFn: () => listMyInvoices(page),
    retry: (_, error) => !isAuthError(error),
  });
}

export function useBillingMutations(encounterId?: string) {
  const qc = useQueryClient();
  const invalidate = (invoiceId?: string, hospitalId?: string, branchId?: string) => {
    if (invoiceId) qc.invalidateQueries({ queryKey: billingKeys.invoice(invoiceId) });
    if (encounterId) qc.invalidateQueries({ queryKey: billingKeys.byEncounter(encounterId) });
    if (hospitalId && branchId) {
      qc.invalidateQueries({ queryKey: ['billing', 'invoices', hospitalId, branchId] });
    }
    qc.invalidateQueries({ queryKey: ['billing', 'invoices', 'me'] });
  };

  return {
    createInvoice: useMutation({
      mutationFn: (payload: CreateInvoicePayload) => createInvoice(payload),
      onSuccess: (invoice) => invalidate(invoice.invoiceId, invoice.hospitalId, invoice.branchId),
    }),
    recordPayment: useMutation({
      mutationFn: ({ invoiceId, payload }: { invoiceId: string; payload: RecordPaymentPayload }) =>
        recordPayment(invoiceId, payload),
      onSuccess: (payment) => invalidate(payment.invoiceId),
    }),
  };
}
