import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createInventoryItem,
  listInventoryItems,
  listInventoryLocations,
  listStockBalances,
  receiveInventoryStock,
} from '../api/inventoryApi';

export const inventoryKeys = {
  items: (hospitalId: string, branchId: string) => ['inventory', 'items', hospitalId, branchId] as const,
  locations: (hospitalId: string, branchId: string) => ['inventory', 'locations', hospitalId, branchId] as const,
  balances: (hospitalId: string, branchId: string, lowStockOnly: boolean) =>
    ['inventory', 'balances', hospitalId, branchId, lowStockOnly] as const,
};

export function useInventoryItems(hospitalId?: string, branchId?: string) {
  return useQuery({
    queryKey: inventoryKeys.items(hospitalId ?? '', branchId ?? ''),
    queryFn: () => listInventoryItems({ hospitalId: hospitalId!, branchId: branchId! }),
    enabled: Boolean(hospitalId && branchId),
  });
}

export function useInventoryLocations(hospitalId?: string, branchId?: string) {
  return useQuery({
    queryKey: inventoryKeys.locations(hospitalId ?? '', branchId ?? ''),
    queryFn: () => listInventoryLocations(hospitalId!, branchId!),
    enabled: Boolean(hospitalId && branchId),
  });
}

export function useStockBalances(hospitalId?: string, branchId?: string, lowStockOnly = false) {
  return useQuery({
    queryKey: inventoryKeys.balances(hospitalId ?? '', branchId ?? '', lowStockOnly),
    queryFn: () => listStockBalances({ hospitalId: hospitalId!, branchId: branchId!, lowStockOnly }),
    enabled: Boolean(hospitalId && branchId),
  });
}

export function useCreateInventoryItem(hospitalId: string, branchId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createInventoryItem,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: inventoryKeys.items(hospitalId, branchId) });
    },
  });
}

export function useReceiveInventoryStock(hospitalId: string, branchId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: receiveInventoryStock,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: inventoryKeys.items(hospitalId, branchId) });
      void qc.invalidateQueries({ queryKey: ['inventory', 'balances', hospitalId, branchId] });
    },
  });
}
