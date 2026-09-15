import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import {
  addAssetMaintenance,
  createAsset,
  listAssetCategories,
  listAssetMaintenance,
  listAssets,
  updateAsset,
  updateAssetStatus,
} from '../api/assetApi';

export const assetKeys = {
  categories: ['asset', 'categories'] as const,
  list: (
    hospitalId: string,
    branchId: string,
    page: number,
    status?: string,
    categoryId?: string,
    q?: string,
  ) => ['asset', 'list', hospitalId, branchId, page, status ?? 'ALL', categoryId ?? 'ALL', q ?? ''] as const,
  maintenance: (assetId: string) => ['asset', 'maintenance', assetId] as const,
};

function isRetryableError(error: unknown): boolean {
  if (!isAxiosError(error)) return true;
  const status = error.response?.status;
  return status !== 401 && status !== 403 && status !== 404;
}

export function useAssetCategories() {
  return useQuery({
    queryKey: assetKeys.categories,
    queryFn: listAssetCategories,
    retry: (_, error) => isRetryableError(error),
  });
}

export function useAssets(
  hospitalId?: string,
  branchId?: string,
  page = 0,
  status?: string,
  categoryId?: string,
  q?: string,
) {
  return useQuery({
    queryKey: assetKeys.list(hospitalId ?? '', branchId ?? '', page, status, categoryId, q),
    queryFn: () =>
      listAssets({
        hospitalId: hospitalId!,
        branchId: branchId!,
        page,
        status,
        categoryId,
        q,
      }),
    enabled: Boolean(hospitalId && branchId),
    retry: (_, error) => isRetryableError(error),
  });
}

export function useAssetMaintenance(assetId?: string) {
  return useQuery({
    queryKey: assetKeys.maintenance(assetId ?? ''),
    queryFn: () => listAssetMaintenance(assetId!),
    enabled: Boolean(assetId),
    retry: (_, error) => isRetryableError(error),
  });
}

export function useAssetMutations(hospitalId: string, branchId: string) {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['asset', 'list', hospitalId, branchId] });
  };

  return {
    create: useMutation({
      mutationFn: createAsset,
      onSuccess: invalidate,
    }),
    update: useMutation({
      mutationFn: ({ assetId, payload }: { assetId: string; payload: Parameters<typeof updateAsset>[1] }) =>
        updateAsset(assetId, payload),
      onSuccess: invalidate,
    }),
    updateStatus: useMutation({
      mutationFn: ({ assetId, status }: { assetId: string; status: string }) =>
        updateAssetStatus(assetId, status),
      onSuccess: (_data, vars) => {
        invalidate();
        qc.invalidateQueries({ queryKey: assetKeys.maintenance(vars.assetId) });
      },
    }),
    addMaintenance: useMutation({
      mutationFn: ({
        assetId,
        payload,
      }: {
        assetId: string;
        payload: Parameters<typeof addAssetMaintenance>[1];
      }) => addAssetMaintenance(assetId, payload),
      onSuccess: (_data, vars) => {
        invalidate();
        qc.invalidateQueries({ queryKey: assetKeys.maintenance(vars.assetId) });
      },
    }),
  };
}
