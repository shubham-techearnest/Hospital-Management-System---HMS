import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import {
  administerMedication,
  completeMedicationOrderItem,
  createMedicationOrder,
  createMedicine,
  getMedicationOrder,
  listEncounterAdministrations,
  listMedicationOrders,
  listMedicines,
  listPendingMedicationWorklist,
  planMedicationOrderItem,
  verifyMedicationOrder,
} from '../api/pharmacyApi';

export const pharmacyKeys = {
  medicines: (hospitalId: string, branchId: string) =>
    ['pharmacy', 'medicines', hospitalId, branchId] as const,
  worklist: (hospitalId: string, branchId: string) =>
    ['pharmacy', 'worklist', hospitalId, branchId] as const,
  orders: (hospitalId: string, branchId: string, page: number, status?: string) =>
    ['pharmacy', 'orders', hospitalId, branchId, page, status ?? 'ALL'] as const,
  order: (medicationOrderId: string) => ['pharmacy', 'orders', medicationOrderId] as const,
  encounterAdministrations: (encounterId: string) =>
    ['pharmacy', 'encounters', encounterId, 'administrations'] as const,
};

function isRetryableError(error: unknown): boolean {
  if (!isAxiosError(error)) return true;
  const status = error.response?.status;
  return status !== 401 && status !== 403 && status !== 404;
}

export function useMedicines(hospitalId?: string, branchId?: string) {
  return useQuery({
    queryKey: pharmacyKeys.medicines(hospitalId ?? '', branchId ?? ''),
    queryFn: () => listMedicines(hospitalId!, branchId!),
    enabled: Boolean(hospitalId && branchId),
    retry: (_, error) => isRetryableError(error),
  });
}

export function usePendingMedicationWorklist(hospitalId?: string, branchId?: string) {
  return useQuery({
    queryKey: pharmacyKeys.worklist(hospitalId ?? '', branchId ?? ''),
    queryFn: () => listPendingMedicationWorklist(hospitalId!, branchId!),
    enabled: Boolean(hospitalId && branchId),
    retry: (_, error) => isRetryableError(error),
    refetchInterval: 30_000,
  });
}

export function useMedicationOrders(
  hospitalId?: string,
  branchId?: string,
  page = 0,
  status?: string,
) {
  return useQuery({
    queryKey: pharmacyKeys.orders(hospitalId ?? '', branchId ?? '', page, status),
    queryFn: () => listMedicationOrders(hospitalId!, branchId!, page, 20, status),
    enabled: Boolean(hospitalId && branchId),
    retry: (_, error) => isRetryableError(error),
  });
}

export function useMedicationOrder(medicationOrderId?: string) {
  return useQuery({
    queryKey: pharmacyKeys.order(medicationOrderId ?? ''),
    queryFn: () => getMedicationOrder(medicationOrderId!),
    enabled: Boolean(medicationOrderId),
    retry: (_, error) => isRetryableError(error),
  });
}

export function useEncounterAdministrations(encounterId: string) {
  return useQuery({
    queryKey: pharmacyKeys.encounterAdministrations(encounterId),
    queryFn: () => listEncounterAdministrations(encounterId),
    enabled: Boolean(encounterId),
    retry: (_, error) => isRetryableError(error),
  });
}

export function usePharmacyMutations(hospitalId: string, branchId: string) {
  const qc = useQueryClient();

  const invalidateScope = () => {
    qc.invalidateQueries({ queryKey: ['pharmacy', 'medicines', hospitalId, branchId] });
    qc.invalidateQueries({ queryKey: ['pharmacy', 'worklist', hospitalId, branchId] });
    qc.invalidateQueries({ queryKey: ['pharmacy', 'orders', hospitalId, branchId] });
  };

  return {
    createMedicine: useMutation({
      mutationFn: createMedicine,
      onSuccess: invalidateScope,
    }),
    receiveOrder: useMutation({
      mutationFn: createMedicationOrder,
      onSuccess: invalidateScope,
    }),
    verifyOrder: useMutation({
      mutationFn: verifyMedicationOrder,
      onSuccess: (order) => {
        invalidateScope();
        qc.invalidateQueries({ queryKey: pharmacyKeys.order(order.medicationOrderId) });
      },
    }),
    planItem: useMutation({
      mutationFn: ({
        orderItemId,
        ...payload
      }: {
        orderItemId: string;
        doseText?: string;
        route?: string;
        frequency?: string;
        durationDays?: number;
        instructions?: string;
      }) => planMedicationOrderItem(orderItemId, payload),
      onSuccess: (order) => {
        invalidateScope();
        qc.invalidateQueries({ queryKey: pharmacyKeys.order(order.medicationOrderId) });
      },
    }),
    administer: useMutation({
      mutationFn: ({
        orderItemId,
        ...payload
      }: {
        orderItemId: string;
        doseGiven: string;
        route?: string;
        notes?: string;
      }) => administerMedication(orderItemId, payload),
      onSuccess: (admin) => {
        invalidateScope();
        qc.invalidateQueries({ queryKey: pharmacyKeys.encounterAdministrations(admin.encounterId) });
      },
    }),
    completeItem: useMutation({
      mutationFn: completeMedicationOrderItem,
      onSuccess: (order) => {
        invalidateScope();
        qc.invalidateQueries({ queryKey: pharmacyKeys.order(order.medicationOrderId) });
        qc.invalidateQueries({ queryKey: pharmacyKeys.encounterAdministrations(order.encounterId) });
      },
    }),
  };
}
