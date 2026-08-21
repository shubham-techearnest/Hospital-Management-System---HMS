import { apiClient } from '@/shared/api/client';
import type { ApiEnvelope } from '@/features/auth/api/authApi';
import type { SpringPage } from '@/features/patient/api/patientExtendedApi';

export interface InvoiceLineItem {
  lineItemId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  sourceType?: string;
  sourceId?: string;
}

export interface Invoice {
  invoiceId: string;
  invoiceNumber: string;
  encounterId: string;
  patientId: string;
  hospitalId: string;
  branchId: string;
  status: string;
  currency: string;
  subtotalAmount: number;
  taxAmount: number;
  totalAmount: number;
  amountPaid: number;
  issuedAt?: string;
  paidAt?: string;
  notes?: string;
  lineItems: InvoiceLineItem[];
}

export interface Payment {
  paymentId: string;
  invoiceId: string;
  amount: number;
  status: string;
  gateway: string;
  paymentMethod: string;
  notes?: string;
  createdAt: string;
}

export type CreateInvoicePayload = {
  encounterId: string;
  taxAmount?: number;
  notes?: string;
  lineItems: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    sourceType?: string;
    sourceId?: string;
  }>;
};

export type RecordPaymentPayload = {
  amount: number;
  paymentMethod: string;
  notes?: string;
};

const EMPTY_PAGE = <T>(): SpringPage<T> => ({
  content: [],
  totalElements: 0,
  totalPages: 0,
  number: 0,
  size: 20,
});

function unwrap<T>(envelope: ApiEnvelope<T>): T {
  if (!envelope.success || envelope.data === undefined) {
    throw new Error(envelope.message ?? 'Request failed');
  }
  return envelope.data;
}

export async function createInvoice(payload: CreateInvoicePayload): Promise<Invoice> {
  const { data } = await apiClient.post<ApiEnvelope<Invoice>>('/billing/invoices', payload);
  return unwrap(data);
}

export async function listHospitalInvoices(
  hospitalId: string,
  branchId: string,
  page = 0,
  size = 20,
): Promise<SpringPage<Invoice>> {
  const { data } = await apiClient.get<ApiEnvelope<SpringPage<Invoice>>>('/billing/invoices', {
    params: { hospitalId, branchId, page, size },
  });
  return unwrap(data) ?? EMPTY_PAGE();
}

export async function listMyInvoices(page = 0, size = 20): Promise<SpringPage<Invoice>> {
  const { data } = await apiClient.get<ApiEnvelope<SpringPage<Invoice>>>('/billing/invoices/me', {
    params: { page, size },
  });
  return unwrap(data) ?? EMPTY_PAGE();
}

export async function getInvoice(invoiceId: string): Promise<Invoice> {
  const { data } = await apiClient.get<ApiEnvelope<Invoice>>(`/billing/invoices/${invoiceId}`);
  return unwrap(data);
}

export async function getInvoiceByEncounter(encounterId: string): Promise<Invoice> {
  const { data } = await apiClient.get<ApiEnvelope<Invoice>>(
    `/billing/encounters/${encounterId}/invoice`,
  );
  return unwrap(data);
}

export async function recordPayment(invoiceId: string, payload: RecordPaymentPayload): Promise<Payment> {
  const { data } = await apiClient.post<ApiEnvelope<Payment>>(
    `/billing/invoices/${invoiceId}/payments`,
    payload,
  );
  return unwrap(data);
}
