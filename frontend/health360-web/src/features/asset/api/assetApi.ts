import { apiClient } from '@/shared/api/client';
import type { ApiEnvelope } from '@/features/auth/api/authApi';
import type { SpringPage } from '@/features/patient/api/patientExtendedApi';

export interface AssetCategory {
  categoryId: string;
  code: string;
  name: string;
  description?: string;
  active: boolean;
}

export interface HospitalAsset {
  assetId: string;
  hospitalId: string;
  branchId: string;
  categoryId: string;
  categoryCode?: string;
  categoryName?: string;
  departmentId?: string;
  name: string;
  assetTag: string;
  serialNumber?: string;
  manufacturer?: string;
  model?: string;
  purchaseDate?: string;
  warrantyExpiry?: string;
  locationLabel?: string;
  status: string;
  notes?: string;
  updatedAt?: string;
}

export interface AssetMaintenance {
  maintenanceId: string;
  assetId: string;
  maintenanceType: string;
  performedAt: string;
  performedBy?: string;
  notes?: string;
  nextDueAt?: string;
  costAmount?: number;
}

export const ASSET_STATUSES = ['AVAILABLE', 'IN_USE', 'MAINTENANCE', 'RETIRED', 'DISPOSED'] as const;
export const MAINTENANCE_TYPES = ['PREVENTIVE', 'CORRECTIVE', 'CALIBRATION', 'INSPECTION'] as const;

function unwrap<T>(envelope: ApiEnvelope<T>): T {
  if (!envelope.success || envelope.data === undefined) {
    throw new Error(envelope.message ?? 'Request failed');
  }
  return envelope.data;
}

export async function listAssetCategories(): Promise<AssetCategory[]> {
  const { data } = await apiClient.get<ApiEnvelope<AssetCategory[]>>('/api/v1/assets/categories');
  return unwrap(data);
}

export async function listAssets(params: {
  hospitalId: string;
  branchId: string;
  status?: string;
  categoryId?: string;
  q?: string;
  page?: number;
  size?: number;
}): Promise<SpringPage<HospitalAsset>> {
  const { data } = await apiClient.get<ApiEnvelope<SpringPage<HospitalAsset>>>('/api/v1/assets', {
    params: {
      hospitalId: params.hospitalId,
      branchId: params.branchId,
      status: params.status || undefined,
      categoryId: params.categoryId || undefined,
      q: params.q || undefined,
      page: params.page ?? 0,
      size: params.size ?? 20,
    },
  });
  return unwrap(data);
}

export async function getAsset(assetId: string): Promise<HospitalAsset> {
  const { data } = await apiClient.get<ApiEnvelope<HospitalAsset>>(`/api/v1/assets/${assetId}`);
  return unwrap(data);
}

export async function createAsset(payload: {
  hospitalId: string;
  branchId: string;
  categoryId: string;
  departmentId?: string;
  name: string;
  assetTag: string;
  serialNumber?: string;
  manufacturer?: string;
  model?: string;
  purchaseDate?: string;
  warrantyExpiry?: string;
  locationLabel?: string;
  notes?: string;
}): Promise<HospitalAsset> {
  const { data } = await apiClient.post<ApiEnvelope<HospitalAsset>>('/api/v1/assets', payload);
  return unwrap(data);
}

export async function updateAsset(
  assetId: string,
  payload: Partial<{
    categoryId: string;
    departmentId: string;
    name: string;
    assetTag: string;
    serialNumber: string;
    manufacturer: string;
    model: string;
    purchaseDate: string;
    warrantyExpiry: string;
    locationLabel: string;
    notes: string;
  }>,
): Promise<HospitalAsset> {
  const { data } = await apiClient.patch<ApiEnvelope<HospitalAsset>>(`/api/v1/assets/${assetId}`, payload);
  return unwrap(data);
}

export async function updateAssetStatus(assetId: string, status: string): Promise<HospitalAsset> {
  const { data } = await apiClient.post<ApiEnvelope<HospitalAsset>>(`/api/v1/assets/${assetId}/status`, {
    status,
  });
  return unwrap(data);
}

export async function listAssetMaintenance(assetId: string): Promise<AssetMaintenance[]> {
  const { data } = await apiClient.get<ApiEnvelope<AssetMaintenance[]>>(
    `/api/v1/assets/${assetId}/maintenance`,
  );
  return unwrap(data);
}

export async function addAssetMaintenance(
  assetId: string,
  payload: {
    maintenanceType: string;
    notes?: string;
    nextDueAt?: string;
    costAmount?: number;
  },
): Promise<AssetMaintenance> {
  const { data } = await apiClient.post<ApiEnvelope<AssetMaintenance>>(
    `/api/v1/assets/${assetId}/maintenance`,
    payload,
  );
  return unwrap(data);
}
