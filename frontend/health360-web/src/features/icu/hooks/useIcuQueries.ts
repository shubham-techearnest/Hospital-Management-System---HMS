import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import {
  admitToIcu,
  assignIcuEquipment,
  createIcuBed,
  createIcuEquipment,
  createIcuUnit,
  dischargeFromIcu,
  addIcuMonitoringRecord,
  listIcuBeds,
  listIcuEquipment,
  listIcuStays,
  listIcuUnits,
  releaseIcuEquipment,
} from '../api/icuApi';

export const icuKeys = {
  units: (hospitalId: string, branchId: string) => ['icu', 'units', hospitalId, branchId] as const,
  beds: (hospitalId: string, branchId: string, status?: string) =>
    ['icu', 'beds', hospitalId, branchId, status ?? 'ALL'] as const,
  stays: (hospitalId: string, branchId: string, page: number, status?: string) =>
    ['icu', 'stays', hospitalId, branchId, page, status ?? 'ALL'] as const,
  equipment: (hospitalId: string, branchId: string) => ['icu', 'equipment', hospitalId, branchId] as const,
};

function isRetryableError(error: unknown): boolean {
  if (!isAxiosError(error)) return true;
  const status = error.response?.status;
  return status !== 401 && status !== 403 && status !== 404;
}

export function useIcuUnits(hospitalId?: string, branchId?: string) {
  return useQuery({
    queryKey: icuKeys.units(hospitalId ?? '', branchId ?? ''),
    queryFn: () => listIcuUnits(hospitalId!, branchId!),
    enabled: Boolean(hospitalId && branchId),
    retry: (_, error) => isRetryableError(error),
  });
}

export function useIcuBeds(hospitalId?: string, branchId?: string, status?: string) {
  return useQuery({
    queryKey: icuKeys.beds(hospitalId ?? '', branchId ?? '', status),
    queryFn: () => listIcuBeds(hospitalId!, branchId!, status),
    enabled: Boolean(hospitalId && branchId),
    retry: (_, error) => isRetryableError(error),
  });
}

export function useIcuStays(
  hospitalId?: string,
  branchId?: string,
  page = 0,
  status?: string,
) {
  return useQuery({
    queryKey: icuKeys.stays(hospitalId ?? '', branchId ?? '', page, status),
    queryFn: () => listIcuStays(hospitalId!, branchId!, page, 20, status),
    enabled: Boolean(hospitalId && branchId),
    retry: (_, error) => isRetryableError(error),
  });
}

export function useIcuEquipment(hospitalId?: string, branchId?: string) {
  return useQuery({
    queryKey: icuKeys.equipment(hospitalId ?? '', branchId ?? ''),
    queryFn: () => listIcuEquipment(hospitalId!, branchId!),
    enabled: Boolean(hospitalId && branchId),
    retry: (_, error) => isRetryableError(error),
  });
}

export function useIcuMutations(hospitalId: string, branchId: string) {
  const qc = useQueryClient();
  const invalidateAll = () => {
    qc.invalidateQueries({ queryKey: ['icu', 'units', hospitalId, branchId] });
    qc.invalidateQueries({ queryKey: ['icu', 'beds', hospitalId, branchId] });
    qc.invalidateQueries({ queryKey: ['icu', 'stays', hospitalId, branchId] });
    qc.invalidateQueries({ queryKey: ['icu', 'equipment', hospitalId, branchId] });
  };

  return {
    createUnit: useMutation({ mutationFn: createIcuUnit, onSuccess: invalidateAll }),
    createBed: useMutation({ mutationFn: createIcuBed, onSuccess: invalidateAll }),
    admit: useMutation({ mutationFn: admitToIcu, onSuccess: invalidateAll }),
    discharge: useMutation({
      mutationFn: ({ stayId, summaryText, followUpPlan }: {
        stayId: string;
        summaryText: string;
        followUpPlan?: string;
      }) => dischargeFromIcu(stayId, { summaryText, followUpPlan }),
      onSuccess: invalidateAll,
    }),
    createEquipment: useMutation({ mutationFn: createIcuEquipment, onSuccess: invalidateAll }),
    assignEquipment: useMutation({
      mutationFn: ({ equipmentId, stayId, notes }: {
        equipmentId: string;
        stayId: string;
        notes?: string;
      }) => assignIcuEquipment(equipmentId, { stayId, notes }),
      onSuccess: invalidateAll,
    }),
    releaseEquipment: useMutation({ mutationFn: releaseIcuEquipment, onSuccess: invalidateAll }),
    addMonitoring: useMutation({
      mutationFn: ({ stayId, recordType, payload, notes }: {
        stayId: string;
        recordType: string;
        payload?: Record<string, unknown>;
        notes?: string;
      }) => addIcuMonitoringRecord(stayId, { recordType, payload, notes }),
      onSuccess: invalidateAll,
    }),
  };
}
