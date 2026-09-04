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

export interface PaymentIntent {
  paymentId: string;
  invoiceId: string;
  amount: number;
  currency: string;
  status: string;
  gateway: string;
  gatewayOrderId: string;
  razorpayKeyId?: string;
  sandbox: boolean;
  description?: string;
}

export interface SaasPaymentIntent {
  saasInvoiceId: string;
  hospitalId: string;
  planId: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  status: string;
  paymentStatus: string;
  gatewayOrderId: string;
  razorpayKeyId?: string;
  sandbox: boolean;
  billingPeriodStart: string;
  billingPeriodEnd: string;
  createdAt?: string;
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

export async function createPaymentIntent(
  invoiceId: string,
  payload?: { amount?: number; idempotencyKey?: string },
): Promise<PaymentIntent> {
  const { data } = await apiClient.post<ApiEnvelope<PaymentIntent>>(
    `/billing/invoices/${invoiceId}/payment-intents`,
    payload ?? {},
  );
  return unwrap(data);
}

export async function confirmSandboxPayment(paymentId: string): Promise<Payment> {
  const { data } = await apiClient.post<ApiEnvelope<Payment>>(
    `/billing/payments/${paymentId}/confirm-sandbox`,
    {},
  );
  return unwrap(data);
}

export async function createSaasPaymentIntent(): Promise<SaasPaymentIntent> {
  const { data } = await apiClient.post<ApiEnvelope<SaasPaymentIntent>>(
    '/billing/saas/payment-intents',
  );
  return unwrap(data);
}

export async function confirmSaasSandboxPayment(saasInvoiceId: string): Promise<SaasPaymentIntent> {
  const { data } = await apiClient.post<ApiEnvelope<SaasPaymentIntent>>(
    `/billing/saas/${saasInvoiceId}/confirm-sandbox`,
  );
  return unwrap(data);
}

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

export async function loadRazorpayCheckout(): Promise<boolean> {
  if (window.Razorpay) return true;
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(Boolean(window.Razorpay));
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

/** Opens Razorpay Checkout when key is present; otherwise confirms via sandbox API. */
export async function payInvoiceOnline(invoiceId: string): Promise<'captured' | 'opened'> {
  const intent = await createPaymentIntent(invoiceId);
  if (intent.sandbox && !intent.razorpayKeyId) {
    await confirmSandboxPayment(intent.paymentId);
    return 'captured';
  }

  const loaded = await loadRazorpayCheckout();
  if (!loaded || !window.Razorpay || !intent.razorpayKeyId) {
    if (intent.sandbox) {
      await confirmSandboxPayment(intent.paymentId);
      return 'captured';
    }
    throw new Error('Payment checkout is unavailable. Configure Razorpay keys.');
  }

  return new Promise((resolve, reject) => {
    const rzp = new window.Razorpay!({
      key: intent.razorpayKeyId,
      amount: Math.round(Number(intent.amount) * 100),
      currency: intent.currency || 'INR',
      name: 'Health360',
      description: intent.description ?? 'Invoice payment',
      order_id: intent.gatewayOrderId,
      handler: () => resolve('opened'),
      modal: {
        ondismiss: () => reject(new Error('Payment cancelled')),
      },
    });
    rzp.open();
  });
}

export async function payHospitalSubscriptionOnline(): Promise<'captured' | 'opened'> {
  const intent = await createSaasPaymentIntent();
  if (intent.sandbox && !intent.razorpayKeyId) {
    await confirmSaasSandboxPayment(intent.saasInvoiceId);
    return 'captured';
  }

  const loaded = await loadRazorpayCheckout();
  if (!loaded || !window.Razorpay || !intent.razorpayKeyId) {
    if (intent.sandbox) {
      await confirmSaasSandboxPayment(intent.saasInvoiceId);
      return 'captured';
    }
    throw new Error('Payment checkout is unavailable. Configure Razorpay keys.');
  }

  return new Promise((resolve, reject) => {
    const rzp = new window.Razorpay!({
      key: intent.razorpayKeyId,
      amount: Math.round(Number(intent.amount) * 100),
      currency: intent.currency || 'INR',
      name: 'Health360',
      description: `Subscription ${intent.invoiceNumber}`,
      order_id: intent.gatewayOrderId,
      handler: () => resolve('opened'),
      modal: {
        ondismiss: () => reject(new Error('Payment cancelled')),
      },
    });
    rzp.open();
  });
}
