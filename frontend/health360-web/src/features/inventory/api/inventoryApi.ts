import { apiClient } from '@/shared/api/client';
import type { ApiEnvelope } from '@/features/auth/api/authApi';
import type { SpringPage } from '@/features/patient/api/patientExtendedApi';

export interface InventoryItem {
  id: string;
  hospitalId: string;
  branchId: string;
  code: string;
  name: string;
  category: string;
  unitOfMeasure: string;
  reorderLevel?: number;
  trackExpiry: boolean;
  active: boolean;
  quantityOnHand: number;
}

export interface InventoryLocation {
  id: string;
  hospitalId: string;
  branchId: string;
  code: string;
  name: string;
  locationType: string;
  departmentId?: string;
  active: boolean;
}

export interface StockBalance {
  id: string;
  itemId: string;
  itemCode: string;
  itemName: string;
  locationId: string;
  locationCode: string;
  locationName: string;
  lotNumber: string;
  expiryDate?: string;
  quantityOnHand: number;
  unitCost?: number;
  reorderLevel?: number;
  lowStock: boolean;
}

function unwrap<T>(envelope: ApiEnvelope<T>): T {
  if (!envelope.success || envelope.data === undefined) {
    throw new Error(envelope.message ?? 'Request failed');
  }
  return envelope.data;
}

export async function listInventoryItems(params: {
  hospitalId: string;
  branchId: string;
  category?: string;
  page?: number;
  size?: number;
}): Promise<SpringPage<InventoryItem>> {
  const { data } = await apiClient.get<ApiEnvelope<SpringPage<InventoryItem>>>('/api/v1/inventory/items', {
    params: {
      hospitalId: params.hospitalId,
      branchId: params.branchId,
      category: params.category,
      page: params.page ?? 0,
      size: params.size ?? 50,
    },
  });
  return unwrap(data);
}

export async function createInventoryItem(payload: {
  hospitalId: string;
  branchId: string;
  code: string;
  name: string;
  category?: string;
  unitOfMeasure?: string;
  reorderLevel?: number;
  trackExpiry?: boolean;
}): Promise<InventoryItem> {
  const { data } = await apiClient.post<ApiEnvelope<InventoryItem>>('/api/v1/inventory/items', payload);
  return unwrap(data);
}

export async function listInventoryLocations(hospitalId: string, branchId: string): Promise<InventoryLocation[]> {
  const { data } = await apiClient.get<ApiEnvelope<InventoryLocation[]>>('/api/v1/inventory/locations', {
    params: { hospitalId, branchId },
  });
  return unwrap(data);
}

export async function listStockBalances(params: {
  hospitalId: string;
  branchId: string;
  locationId?: string;
  lowStockOnly?: boolean;
  page?: number;
  size?: number;
}): Promise<SpringPage<StockBalance>> {
  const { data } = await apiClient.get<ApiEnvelope<SpringPage<StockBalance>>>('/api/v1/inventory/stock/balances', {
    params: {
      hospitalId: params.hospitalId,
      branchId: params.branchId,
      locationId: params.locationId,
      lowStockOnly: params.lowStockOnly ?? false,
      page: params.page ?? 0,
      size: params.size ?? 50,
    },
  });
  return unwrap(data);
}

export async function receiveInventoryStock(payload: {
  itemId: string;
  locationId: string;
  quantity: number;
  lotNumber?: string;
  expiryDate?: string;
  unitCost?: number;
  notes?: string;
}): Promise<StockBalance> {
  const { data } = await apiClient.post<ApiEnvelope<StockBalance>>('/api/v1/inventory/stock/receive', payload);
  return unwrap(data);
}
