import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import {
  collectLabSample,
  createLabOrder,
  createLabTest,
  createLabTestParameter,
  createLaboratory,
  enterLabResults,
  getLabOrder,
  listBranchLabTests,
  listEncounterLabReports,
  listLabOrders,
  listLabTestParameters,
  listLaboratories,
  listPendingLabWorklist,
  releaseLabReport,
  verifyLabResults,
} from '../api/labApi';

export const labKeys = {
  laboratories: (hospitalId: string, branchId: string) =>
    ['lab', 'laboratories', hospitalId, branchId] as const,
  tests: (hospitalId: string, branchId: string) => ['lab', 'tests', hospitalId, branchId] as const,
  parameters: (labTestId: string) => ['lab', 'parameters', labTestId] as const,
  worklist: (hospitalId: string, branchId: string) => ['lab', 'worklist', hospitalId, branchId] as const,
  orders: (hospitalId: string, branchId: string, page: number, status?: string) =>
    ['lab', 'orders', hospitalId, branchId, page, status ?? 'ALL'] as const,
  order: (labOrderId: string) => ['lab', 'orders', labOrderId] as const,
  encounterReports: (encounterId: string) => ['lab', 'encounters', encounterId, 'reports'] as const,
};

function isRetryableError(error: unknown): boolean {
  if (!isAxiosError(error)) return true;
  const status = error.response?.status;
  return status !== 401 && status !== 403 && status !== 404;
}

export function useLaboratories(hospitalId?: string, branchId?: string) {
  return useQuery({
    queryKey: labKeys.laboratories(hospitalId ?? '', branchId ?? ''),
    queryFn: () => listLaboratories(hospitalId!, branchId!),
    enabled: Boolean(hospitalId && branchId),
    retry: (_, error) => isRetryableError(error),
  });
}

export function useBranchLabTests(hospitalId?: string, branchId?: string) {
  return useQuery({
    queryKey: labKeys.tests(hospitalId ?? '', branchId ?? ''),
    queryFn: () => listBranchLabTests(hospitalId!, branchId!),
    enabled: Boolean(hospitalId && branchId),
    retry: (_, error) => isRetryableError(error),
  });
}

export function useLabTestParameters(labTestId?: string) {
  return useQuery({
    queryKey: labKeys.parameters(labTestId ?? ''),
    queryFn: () => listLabTestParameters(labTestId!),
    enabled: Boolean(labTestId),
    retry: (_, error) => isRetryableError(error),
  });
}

export function usePendingLabWorklist(hospitalId?: string, branchId?: string) {
  return useQuery({
    queryKey: labKeys.worklist(hospitalId ?? '', branchId ?? ''),
    queryFn: () => listPendingLabWorklist(hospitalId!, branchId!),
    enabled: Boolean(hospitalId && branchId),
    retry: (_, error) => isRetryableError(error),
    refetchInterval: 30_000,
  });
}

export function useLabOrders(
  hospitalId?: string,
  branchId?: string,
  page = 0,
  status?: string,
) {
  return useQuery({
    queryKey: labKeys.orders(hospitalId ?? '', branchId ?? '', page, status),
    queryFn: () => listLabOrders(hospitalId!, branchId!, page, 20, status),
    enabled: Boolean(hospitalId && branchId),
    retry: (_, error) => isRetryableError(error),
  });
}

export function useLabOrder(labOrderId?: string) {
  return useQuery({
    queryKey: labKeys.order(labOrderId ?? ''),
    queryFn: () => getLabOrder(labOrderId!),
    enabled: Boolean(labOrderId),
    retry: (_, error) => isRetryableError(error),
  });
}

export function useEncounterLabReports(encounterId: string) {
  return useQuery({
    queryKey: labKeys.encounterReports(encounterId),
    queryFn: () => listEncounterLabReports(encounterId),
    enabled: Boolean(encounterId),
    retry: (_, error) => isRetryableError(error),
  });
}

export function useLabMutations(hospitalId: string, branchId: string) {
  const qc = useQueryClient();

  const invalidateScope = () => {
    qc.invalidateQueries({ queryKey: ['lab', 'laboratories', hospitalId, branchId] });
    qc.invalidateQueries({ queryKey: ['lab', 'tests', hospitalId, branchId] });
    qc.invalidateQueries({ queryKey: ['lab', 'worklist', hospitalId, branchId] });
    qc.invalidateQueries({ queryKey: ['lab', 'orders', hospitalId, branchId] });
  };

  return {
    createLaboratory: useMutation({
      mutationFn: createLaboratory,
      onSuccess: invalidateScope,
    }),
    createTest: useMutation({
      mutationFn: createLabTest,
      onSuccess: invalidateScope,
    }),
    createParameter: useMutation({
      mutationFn: ({ labTestId, ...payload }: { labTestId: string; code: string; name: string; unit?: string; referenceRange?: string }) =>
        createLabTestParameter(labTestId, payload),
      onSuccess: (_, vars) => {
        qc.invalidateQueries({ queryKey: labKeys.parameters(vars.labTestId) });
      },
    }),
    receiveOrder: useMutation({
      mutationFn: createLabOrder,
      onSuccess: invalidateScope,
    }),
    collectSample: useMutation({
      mutationFn: ({ labOrderId, ...payload }: { labOrderId: string; specimenId?: string; notes?: string }) =>
        collectLabSample(labOrderId, payload),
      onSuccess: (order) => {
        invalidateScope();
        qc.invalidateQueries({ queryKey: labKeys.order(order.labOrderId) });
      },
    }),
    enterResults: useMutation({
      mutationFn: ({
        labOrderId,
        results,
      }: {
        labOrderId: string;
        results: Array<{ parameterId: string; valueText: string; valueNumeric?: number }>;
      }) => enterLabResults(labOrderId, results),
      onSuccess: (order) => {
        invalidateScope();
        qc.invalidateQueries({ queryKey: labKeys.order(order.labOrderId) });
      },
    }),
    verifyResults: useMutation({
      mutationFn: verifyLabResults,
      onSuccess: (order) => {
        invalidateScope();
        qc.invalidateQueries({ queryKey: labKeys.order(order.labOrderId) });
      },
    }),
    releaseReport: useMutation({
      mutationFn: ({ labOrderId, summaryText }: { labOrderId: string; summaryText?: string }) =>
        releaseLabReport(labOrderId, summaryText),
      onSuccess: (report) => {
        invalidateScope();
        qc.invalidateQueries({ queryKey: labKeys.encounterReports(report.encounterId) });
      },
    }),
  };
}
