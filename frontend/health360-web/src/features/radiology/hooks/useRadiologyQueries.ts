import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import {
  createImagingOrder,
  createModality,
  enterImagingReport,
  getImagingOrder,
  listEncounterImagingReports,
  listImagingOrders,
  listModalities,
  listPendingImagingWorklist,
  performImagingStudy,
  releaseImagingReport,
  scheduleImagingStudy,
  verifyImagingReport,
} from '../api/radiologyApi';

export const radiologyKeys = {
  modalities: (hospitalId: string, branchId: string) =>
    ['radiology', 'modalities', hospitalId, branchId] as const,
  worklist: (hospitalId: string, branchId: string) =>
    ['radiology', 'worklist', hospitalId, branchId] as const,
  orders: (hospitalId: string, branchId: string, page: number, status?: string) =>
    ['radiology', 'orders', hospitalId, branchId, page, status ?? 'ALL'] as const,
  order: (imagingOrderId: string) => ['radiology', 'orders', imagingOrderId] as const,
  encounterReports: (encounterId: string) =>
    ['radiology', 'encounters', encounterId, 'reports'] as const,
};

function isRetryableError(error: unknown): boolean {
  if (!isAxiosError(error)) return true;
  const status = error.response?.status;
  return status !== 401 && status !== 403 && status !== 404;
}

export function useModalities(hospitalId?: string, branchId?: string) {
  return useQuery({
    queryKey: radiologyKeys.modalities(hospitalId ?? '', branchId ?? ''),
    queryFn: () => listModalities(hospitalId!, branchId!),
    enabled: Boolean(hospitalId && branchId),
    retry: (_, error) => isRetryableError(error),
  });
}

export function usePendingImagingWorklist(hospitalId?: string, branchId?: string) {
  return useQuery({
    queryKey: radiologyKeys.worklist(hospitalId ?? '', branchId ?? ''),
    queryFn: () => listPendingImagingWorklist(hospitalId!, branchId!),
    enabled: Boolean(hospitalId && branchId),
    retry: (_, error) => isRetryableError(error),
    refetchInterval: 30_000,
  });
}

export function useImagingOrders(
  hospitalId?: string,
  branchId?: string,
  page = 0,
  status?: string,
) {
  return useQuery({
    queryKey: radiologyKeys.orders(hospitalId ?? '', branchId ?? '', page, status),
    queryFn: () => listImagingOrders(hospitalId!, branchId!, page, 20, status),
    enabled: Boolean(hospitalId && branchId),
    retry: (_, error) => isRetryableError(error),
  });
}

export function useImagingOrder(imagingOrderId?: string) {
  return useQuery({
    queryKey: radiologyKeys.order(imagingOrderId ?? ''),
    queryFn: () => getImagingOrder(imagingOrderId!),
    enabled: Boolean(imagingOrderId),
    retry: (_, error) => isRetryableError(error),
  });
}

export function useEncounterImagingReports(encounterId: string) {
  return useQuery({
    queryKey: radiologyKeys.encounterReports(encounterId),
    queryFn: () => listEncounterImagingReports(encounterId),
    enabled: Boolean(encounterId),
    retry: (_, error) => isRetryableError(error),
  });
}

export function useRadiologyMutations(hospitalId: string, branchId: string) {
  const qc = useQueryClient();

  const invalidateScope = () => {
    qc.invalidateQueries({ queryKey: ['radiology', 'modalities', hospitalId, branchId] });
    qc.invalidateQueries({ queryKey: ['radiology', 'worklist', hospitalId, branchId] });
    qc.invalidateQueries({ queryKey: ['radiology', 'orders', hospitalId, branchId] });
  };

  return {
    createModality: useMutation({
      mutationFn: createModality,
      onSuccess: invalidateScope,
    }),
    receiveOrder: useMutation({
      mutationFn: createImagingOrder,
      onSuccess: invalidateScope,
    }),
    scheduleStudy: useMutation({
      mutationFn: ({
        imagingOrderId,
        ...payload
      }: {
        imagingOrderId: string;
        scheduledAt?: string;
        notes?: string;
      }) => scheduleImagingStudy(imagingOrderId, payload),
      onSuccess: (order) => {
        invalidateScope();
        qc.invalidateQueries({ queryKey: radiologyKeys.order(order.imagingOrderId) });
      },
    }),
    performStudy: useMutation({
      mutationFn: ({ imagingOrderId, notes }: { imagingOrderId: string; notes?: string }) =>
        performImagingStudy(imagingOrderId, { notes }),
      onSuccess: (order) => {
        invalidateScope();
        qc.invalidateQueries({ queryKey: radiologyKeys.order(order.imagingOrderId) });
      },
    }),
    enterReport: useMutation({
      mutationFn: ({
        imagingOrderId,
        findingsText,
        impressionText,
      }: {
        imagingOrderId: string;
        findingsText?: string;
        impressionText?: string;
      }) => enterImagingReport(imagingOrderId, { findingsText, impressionText }),
      onSuccess: (order) => {
        invalidateScope();
        qc.invalidateQueries({ queryKey: radiologyKeys.order(order.imagingOrderId) });
      },
    }),
    verifyReport: useMutation({
      mutationFn: verifyImagingReport,
      onSuccess: (order) => {
        invalidateScope();
        qc.invalidateQueries({ queryKey: radiologyKeys.order(order.imagingOrderId) });
      },
    }),
    releaseReport: useMutation({
      mutationFn: ({ imagingOrderId, summaryText }: { imagingOrderId: string; summaryText?: string }) =>
        releaseImagingReport(imagingOrderId, summaryText),
      onSuccess: (report) => {
        invalidateScope();
        qc.invalidateQueries({ queryKey: radiologyKeys.encounterReports(report.encounterId) });
      },
    }),
  };
}
