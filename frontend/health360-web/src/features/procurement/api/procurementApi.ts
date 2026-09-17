import { apiClient } from '@/shared/api/client';
import type { ApiEnvelope } from '@/features/auth/api/authApi';
import type { SpringPage } from '@/features/patient/api/patientExtendedApi';

export interface PurchaseRequestLine {
  id: string;
  inventoryItemId?: string;
  itemCode: string;
  itemName: string;
  quantity: number;
  unitOfMeasure: string;
  unitPrice: number;
  lineTotal: number;
}

export interface PurchaseRequest {
  id: string;
  hospitalId: string;
  branchId: string;
  requestNumber: string;
  status: string;
  title: string;
  notes?: string;
  totalAmount: number;
  requestedBy: string;
  submittedAt?: string;
  decidedAt?: string;
  decidedBy?: string;
  createdAt: string;
  lines: PurchaseRequestLine[];
}

export interface PurchaseOrderLine {
  id: string;
  inventoryItemId?: string;
  itemCode: string;
  itemName: string;
  quantityOrdered: number;
  quantityReceived: number;
  unitPrice: number;
  lineTotal: number;
}

export interface PurchaseOrder {
  id: string;
  hospitalId: string;
  branchId: string;
  purchaseRequestId: string;
  orderNumber: string;
  status: string;
  vendorName?: string;
  notes?: string;
  totalAmount: number;
  issuedAt: string;
  issuedBy?: string;
  createdAt: string;
  lines: PurchaseOrderLine[];
}

export interface GoodsReceiptLine {
  id: string;
  purchaseOrderLineId: string;
  inventoryItemId?: string;
  quantityReceived: number;
  lotNumber: string;
  expiryDate?: string;
  unitCost?: number;
}

export interface GoodsReceipt {
  id: string;
  hospitalId: string;
  branchId: string;
  purchaseOrderId: string;
  grnNumber: string;
  status: string;
  locationId: string;
  notes?: string;
  receivedAt: string;
  receivedBy?: string;
  createdAt: string;
  lines: GoodsReceiptLine[];
}

function unwrap<T>(envelope: ApiEnvelope<T>): T {
  if (!envelope.success || envelope.data === undefined) {
    throw new Error(envelope.message ?? 'Request failed');
  }
  return envelope.data;
}

export async function listPurchaseRequests(params: {
  hospitalId: string;
  branchId: string;
  status?: string;
  page?: number;
  size?: number;
}): Promise<SpringPage<PurchaseRequest>> {
  const { data } = await apiClient.get<ApiEnvelope<SpringPage<PurchaseRequest>>>(
    '/api/v1/procurement/purchase-requests',
    {
      params: {
        hospitalId: params.hospitalId,
        branchId: params.branchId,
        status: params.status,
        page: params.page ?? 0,
        size: params.size ?? 50,
      },
    },
  );
  return unwrap(data);
}

export async function createPurchaseRequest(payload: {
  hospitalId: string;
  branchId: string;
  title: string;
  notes?: string;
  lines: Array<{
    inventoryItemId?: string;
    itemCode: string;
    itemName: string;
    quantity: number;
    unitOfMeasure?: string;
    unitPrice?: number;
  }>;
}): Promise<PurchaseRequest> {
  const { data } = await apiClient.post<ApiEnvelope<PurchaseRequest>>(
    '/api/v1/procurement/purchase-requests',
    payload,
  );
  return unwrap(data);
}

export async function submitPurchaseRequest(requestId: string): Promise<PurchaseRequest> {
  const { data } = await apiClient.post<ApiEnvelope<PurchaseRequest>>(
    `/api/v1/procurement/purchase-requests/${requestId}/submit`,
  );
  return unwrap(data);
}

export async function approvePurchaseRequest(requestId: string, notes?: string): Promise<PurchaseRequest> {
  const { data } = await apiClient.post<ApiEnvelope<PurchaseRequest>>(
    `/api/v1/procurement/purchase-requests/${requestId}/approve`,
    { notes },
  );
  return unwrap(data);
}

export async function rejectPurchaseRequest(requestId: string, notes?: string): Promise<PurchaseRequest> {
  const { data } = await apiClient.post<ApiEnvelope<PurchaseRequest>>(
    `/api/v1/procurement/purchase-requests/${requestId}/reject`,
    { notes },
  );
  return unwrap(data);
}

export async function listPurchaseOrders(params: {
  hospitalId: string;
  branchId: string;
  page?: number;
  size?: number;
}): Promise<SpringPage<PurchaseOrder>> {
  const { data } = await apiClient.get<ApiEnvelope<SpringPage<PurchaseOrder>>>(
    '/api/v1/procurement/purchase-orders',
    {
      params: {
        hospitalId: params.hospitalId,
        branchId: params.branchId,
        page: params.page ?? 0,
        size: params.size ?? 50,
      },
    },
  );
  return unwrap(data);
}

export async function createPurchaseOrder(payload: {
  purchaseRequestId: string;
  vendorName?: string;
  notes?: string;
}): Promise<PurchaseOrder> {
  const { data } = await apiClient.post<ApiEnvelope<PurchaseOrder>>(
    '/api/v1/procurement/purchase-orders',
    payload,
  );
  return unwrap(data);
}

export async function listGoodsReceipts(params: {
  hospitalId: string;
  branchId: string;
  page?: number;
  size?: number;
}): Promise<SpringPage<GoodsReceipt>> {
  const { data } = await apiClient.get<ApiEnvelope<SpringPage<GoodsReceipt>>>(
    '/api/v1/procurement/goods-receipts',
    {
      params: {
        hospitalId: params.hospitalId,
        branchId: params.branchId,
        page: params.page ?? 0,
        size: params.size ?? 50,
      },
    },
  );
  return unwrap(data);
}

export async function postGoodsReceipt(payload: {
  purchaseOrderId: string;
  locationId: string;
  notes?: string;
  lines: Array<{
    purchaseOrderLineId: string;
    quantityReceived: number;
    lotNumber?: string;
    expiryDate?: string;
    unitCost?: number;
  }>;
}): Promise<GoodsReceipt> {
  const { data } = await apiClient.post<ApiEnvelope<GoodsReceipt>>(
    '/api/v1/procurement/goods-receipts',
    payload,
  );
  return unwrap(data);
}
