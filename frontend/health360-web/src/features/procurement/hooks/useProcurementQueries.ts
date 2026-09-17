import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  approvePurchaseRequest,
  createPurchaseOrder,
  createPurchaseRequest,
  listGoodsReceipts,
  listPurchaseOrders,
  listPurchaseRequests,
  postGoodsReceipt,
  rejectPurchaseRequest,
  submitPurchaseRequest,
} from '@/features/procurement/api/procurementApi';

export function usePurchaseRequests(hospitalId?: string, branchId?: string, status?: string) {
  return useQuery({
    queryKey: ['procurement', 'prs', hospitalId, branchId, status],
    queryFn: () =>
      listPurchaseRequests({
        hospitalId: hospitalId!,
        branchId: branchId!,
        status,
      }),
    enabled: Boolean(hospitalId && branchId),
  });
}

export function usePurchaseOrders(hospitalId?: string, branchId?: string) {
  return useQuery({
    queryKey: ['procurement', 'pos', hospitalId, branchId],
    queryFn: () =>
      listPurchaseOrders({
        hospitalId: hospitalId!,
        branchId: branchId!,
      }),
    enabled: Boolean(hospitalId && branchId),
  });
}

export function useGoodsReceipts(hospitalId?: string, branchId?: string) {
  return useQuery({
    queryKey: ['procurement', 'grns', hospitalId, branchId],
    queryFn: () =>
      listGoodsReceipts({
        hospitalId: hospitalId!,
        branchId: branchId!,
      }),
    enabled: Boolean(hospitalId && branchId),
  });
}

export function useCreatePurchaseRequest(hospitalId: string, branchId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createPurchaseRequest,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['procurement', 'prs', hospitalId, branchId] });
    },
  });
}

export function useSubmitPurchaseRequest(hospitalId: string, branchId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: submitPurchaseRequest,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['procurement', 'prs', hospitalId, branchId] });
    },
  });
}

export function useApprovePurchaseRequest(hospitalId: string, branchId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ requestId, notes }: { requestId: string; notes?: string }) =>
      approvePurchaseRequest(requestId, notes),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['procurement', 'prs', hospitalId, branchId] });
    },
  });
}

export function useRejectPurchaseRequest(hospitalId: string, branchId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ requestId, notes }: { requestId: string; notes?: string }) =>
      rejectPurchaseRequest(requestId, notes),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['procurement', 'prs', hospitalId, branchId] });
    },
  });
}

export function useCreatePurchaseOrder(hospitalId: string, branchId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createPurchaseOrder,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['procurement', 'prs', hospitalId, branchId] });
      void qc.invalidateQueries({ queryKey: ['procurement', 'pos', hospitalId, branchId] });
    },
  });
}

export function usePostGoodsReceipt(hospitalId: string, branchId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: postGoodsReceipt,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['procurement', 'pos', hospitalId, branchId] });
      void qc.invalidateQueries({ queryKey: ['procurement', 'grns', hospitalId, branchId] });
      void qc.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
}
